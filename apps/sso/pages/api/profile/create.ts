import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { getEnv } from '@hibiscus/env';
import { NextApiHandler } from 'next';
import { container } from 'tsyringe';
import { EmailService } from '../../../services/email.service';

/**
 * Creates a user profile server-side.
 * All elevated operations (referral lookup, profile insert) happen here.
 *
 * POST /api/profile/create
 * Body: { firstname, lastname, referralCode?, accessToken }
 * Response: { success: boolean, error?: string }
 */
const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store');

  const { firstname, lastname, referralCode, accessToken } = req.body;

  // Validate required fields
  if (!firstname || !lastname) {
    res
      .status(400)
      .json({ success: false, error: 'firstname and lastname are required' });
    return;
  }

  if (!accessToken) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  try {
    // Create a service key client for elevated operations
    const serviceClient = container.resolve(HibiscusSupabaseClient);
    serviceClient.setOptions({ useServiceKey: true });

    // First, verify the user's session and get their user ID
    const { data: authData, error: authError } = await serviceClient
      .getClient()
      .auth.getUser(accessToken);

    if (authError || !authData.user) {
      res.status(401).json({ success: false, error: 'Invalid session' });
      return;
    }

    const user = authData.user;

    // Check if profile already exists (idempotent - handles retries/double-submits)
    const { data: existingProfile } = await serviceClient
      .getClient()
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      res.status(200).json({ success: true });
      return;
    }

    // Generate referral code for this user
    const newReferralCode = generateReferralCode();

    // Look up referrer if code provided
    let referredBy: string | null = null;
    if (referralCode && typeof referralCode === 'string') {
      const code = referralCode.toUpperCase().trim();
      // Validate format: 6-char alphanumeric
      if (/^[A-Z0-9]{6}$/.test(code)) {
        const { data: referrer } = await serviceClient
          .getClient()
          .from('user_profiles')
          .select('user_id')
          .eq('referral_code', code)
          .single();

        if (referrer) {
          // Prevent self-referral
          if (referrer.user_id !== user.id) {
            referredBy = referrer.user_id;
          }
        }
      }
    }

    // Insert the profile with retry logic for referral code collisions
    const MAX_RETRIES = 5;
    let insertError = null;
    let finalReferralCode = newReferralCode;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const codeToUse =
        attempt === 0 ? newReferralCode : generateReferralCode();

      const { error } = await serviceClient
        .getClient()
        .from('user_profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          first_name: firstname,
          last_name: lastname,
          referral_code: codeToUse,
          referred_by: referredBy,
        });

      if (!error) {
        insertError = null;
        finalReferralCode = codeToUse;
        break; // Success
      }

      // Check if it's a unique violation on referral_code (code 23505)
      if (error.code === '23505' && error.message?.includes('referral_code')) {
        console.warn(
          `Referral code collision on attempt ${attempt + 1}, retrying...`
        );
        insertError = error;
        continue; // Retry with new code
      }

      // Different error, don't retry
      insertError = error;
      break;
    }

    if (insertError) {
      console.error('Failed to create user profile:', insertError);
      res
        .status(500)
        .json({ success: false, error: 'Failed to create profile' });
      return;
    }

    // Send welcome email (fire-and-forget, don't block signup)
    if (process.env.NODE_ENV === 'production') {
      const resendApiKey = getEnv().Hibiscus.Resend?.apiKey;
      if (resendApiKey && user.email) {
        const emailService = new EmailService(resendApiKey);
        emailService
          .sendWelcomeEmail({
            toEmail: user.email,
            firstName: firstname,
            referralCode: finalReferralCode,
            discordInviteUrl: getEnv().Hibiscus.Discord?.InviteUrl,
          })
          .then((result) => {
            if (!result.success) {
              console.error('Failed to send welcome email:', result.error);
            }
          })
          .catch((err) => {
            console.error('Failed to send welcome email:', err);
          });
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Profile creation error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

/**
 * Generates a 6-character uppercase alphanumeric referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default handler;
