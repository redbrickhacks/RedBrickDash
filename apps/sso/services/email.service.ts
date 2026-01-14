import { Resend } from 'resend';

interface WelcomeEmailParams {
  toEmail: string;
  firstName: string;
  referralCode: string;
  discordInviteUrl?: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

export class EmailService {
  private resend: Resend;
  private readonly fromEmail = 'RedBrick Hacks <hello@redbrickhacks.co>';

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendWelcomeEmail(params: WelcomeEmailParams): Promise<EmailResult> {
    const { toEmail, firstName, referralCode, discordInviteUrl } = params;

    const html = this.buildWelcomeEmailHtml({
      firstName,
      referralCode,
      discordInviteUrl,
    });

    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: toEmail,
        subject: 'Welcome to RedBrick Hacks III!',
        html,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  private buildWelcomeEmailHtml(params: {
    firstName: string;
    referralCode: string;
    discordInviteUrl?: string;
  }): string {
    const { firstName, referralCode, discordInviteUrl } = params;

    const referralLink = `https://sso.redbrickhacks.co/signup?ref=${referralCode}`;
    const previewText = `Welcome to RedBrick Hacks III! Here's how to get started.`;

    return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>RedBrick Hacks III</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @font-face {
      font-family: 'Open Sans';
      font-style: normal;
      font-weight: 400;
      src: url('https://redbrickhacks.co/assets/fonts/Open_Sans/static/OpenSans-Regular.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Open Sans';
      font-style: normal;
      font-weight: 600;
      src: url('https://redbrickhacks.co/assets/fonts/Open_Sans/static/OpenSans-SemiBold.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Open Sans';
      font-style: normal;
      font-weight: 700;
      src: url('https://redbrickhacks.co/assets/fonts/Open_Sans/static/OpenSans-Bold.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Zilla Slab';
      font-style: normal;
      font-weight: 500;
      src: url('https://redbrickhacks.co/assets/fonts/Zilla_Slab/ZillaSlab-Medium.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Zilla Slab';
      font-style: normal;
      font-weight: 600;
      src: url('https://redbrickhacks.co/assets/fonts/Zilla_Slab/ZillaSlab-SemiBold.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Zilla Slab';
      font-style: normal;
      font-weight: 700;
      src: url('https://redbrickhacks.co/assets/fonts/Zilla_Slab/ZillaSlab-Bold.ttf') format('truetype');
    }
  </style>
</head>

<body
  style="margin: 0; padding: 0; background-color: #FAF7F2; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">

  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 48px 24px;">

        <!-- Email Container -->
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0"
          style="max-width: 560px; width: 100%;">

          <!-- Logo / Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <a href="https://redbrickhacks.co" target="_blank"
                style="text-decoration: none; font-family: 'Zilla Slab', Georgia, serif; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.01em;">
                RedBrick Hacks III
              </a>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color: #ffffff; border: 3px solid #1a1a1a;">

                <!-- Brick Top Bar -->
                <tr>
                  <td style="background-color: #a70e13; height: 6px;"></td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 36px;">

                    <!-- Subject/Headline -->
                    <h2
                      style="margin: 0 0 24px 0; font-family: 'Zilla Slab', Georgia, serif; font-size: 24px; font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; color: #1a1a1a; text-transform: uppercase;">
                      Welcome!
                    </h2>

                    <!-- Greeting -->
                    <p
                      style="margin: 0 0 20px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                      Hi ${firstName},
                    </p>

                    <!-- Welcome Message -->
                    <p
                      style="margin: 0 0 20px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                      Thanks for signing up for <strong>RedBrick Hacks III</strong>! We're excited to have you join us for Ashoka University's flagship hackathon.
                    </p>

                    <!-- Next Steps Section -->
                    <h3
                      style="margin: 28px 0 16px 0; font-family: 'Zilla Slab', Georgia, serif; font-size: 18px; font-weight: 700; color: #1a1a1a; text-transform: uppercase;">
                      Next Steps
                    </h3>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 20px;">
                      <tr>
                        <td style="padding: 8px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65; color: #1a1a1a;">
                          <strong>1.</strong> Complete your profile at <a href="https://portal.redbrickhacks.co/apply" style="color: #a70e13; text-decoration: underline;">portal.redbrickhacks.co</a>
                        </td>
                      </tr>
                      ${
                        discordInviteUrl
                          ? `<tr>
                        <td style="padding: 8px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65; color: #1a1a1a;">
                          <strong>2.</strong> Join our Discord community for updates and networking (link available on your dashboard after completing your profile)                        </td>
                      </tr>`
                          : ''
                      }
                      <tr>
                        <td style="padding: 8px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.65; color: #1a1a1a;">
                          <strong>${
                            discordInviteUrl ? '3' : '2'
                          }.</strong> Submit before <strong>January 16, 2026 at 11:59 PM IST</strong>
                        </td>
                      </tr>
                    </table>

                    <!-- Team Section -->
                    <h3
                      style="margin: 28px 0 16px 0; font-family: 'Zilla Slab', Georgia, serif; font-size: 18px; font-weight: 700; color: #1a1a1a; text-transform: uppercase;">
                      Form Your Team
                    </h3>

                    <p
                      style="margin: 0 0 20px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                      Planning to hack with friends? Make sure they sign up before the deadline so you can invite them to your team. Teams can have up to 4 members, and you can create or join a team from the portal.
                    </p>

                    <!-- Referral Section -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                      style="margin: 28px 0; background-color: #FFF8E7; border: 2px solid #1a1a1a; padding: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3
                            style="margin: 0 0 12px 0; font-family: 'Zilla Slab', Georgia, serif; font-size: 18px; font-weight: 700; color: #1a1a1a; text-transform: uppercase;">
                            Share & Earn Rewards
                          </h3>
                          <p
                            style="margin: 0 0 16px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                            Invite your friends and win Amazon gift cards! Top 25 referrers get <strong>INR 1500</strong> each.
                          </p>
                          <p
                            style="margin: 0 0 16px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                            Your referral link:
                          </p>
                          <p
                            style="margin: 0 0 16px 0; font-family: monospace; font-size: 13px; background-color: #ffffff; border: 1px solid #1a1a1a; padding: 12px; word-break: break-all;">
                            ${referralLink}
                          </p>
                          <p
                            style="margin: 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 400; line-height: 1.65; color: #6B6B6B;">
                            <a href="https://redbrickhacks.co/referral-policy.pdf" style="color: #1a1a1a; text-decoration: underline;">View referral policy</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Sign Off -->
                    <p
                      style="margin: 32px 0 0 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                      Good luck and happy hacking!<br>
                      <strong style="font-weight: 600;">The RedBrick Hacks Team</strong>
                    </p>

                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 36px 0 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">

                <!-- Event Info -->
                <tr>
                  <td style="padding-bottom: 20px; border-bottom: 1px solid #e0dcd5;">
                    <p
                      style="margin: 0; font-family: 'Zilla Slab', Georgia, serif; font-size: 14px; font-weight: 600; letter-spacing: 0.02em; color: #1a1a1a;">
                      Ashoka University's Flagship Hackathon
                    </p>
                    <p
                      style="margin: 4px 0 0 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 400; color: #6B6B6B;">
                      Online Round Submissions Deadline: Jan 16, 2026 &nbsp;·&nbsp; Digital Makerspace, Ashoka
                      University
                    </p>
                  </td>
                </tr>

                <!-- Links Row -->
                <tr>
                  <td style="padding: 20px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <!-- Website Links -->
                        <td
                          style="font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px;">
                          <a href="https://redbrickhacks.co"
                            style="color: #1a1a1a; text-decoration: none; font-weight: 600;">Website</a>
                          <span style="color: #c4c0b8;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                          <a href="https://portal.redbrickhacks.co"
                            style="color: #1a1a1a; text-decoration: none; font-weight: 600;">Portal</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Legal -->
                <tr>
                  <td style="padding-top: 20px; border-top: 1px solid #e0dcd5;">
                    <p
                      style="margin: 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 400; line-height: 1.6; color: #999999;">
                      You're receiving this because you signed up for RedBrick Hacks III.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>

</html>`;
  }
}
