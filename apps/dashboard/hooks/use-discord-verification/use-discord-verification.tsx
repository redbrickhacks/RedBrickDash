import { useState, useEffect } from 'react';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import useHibiscusUser from '../use-hibiscus-user/use-hibiscus-user';

interface DiscordVerificationState {
  isVerified: boolean;
  discordUsername: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to check if the current user has verified their Discord account.
 * Uses RLS-protected query - users can only see their own discord_profiles entry.
 */
export function useDiscordVerification(): DiscordVerificationState {
  const { user } = useHibiscusUser();
  const { supabase } = useHibiscusSupabase();
  const [state, setState] = useState<DiscordVerificationState>({
    isVerified: false,
    discordUsername: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function checkVerification() {
      if (!user?.id) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // RLS policy ensures user can only see their own discord_profiles entry
        const { data, error } = await supabase
          .getClient()
          .from('discord_profiles')
          .select('discord_username')
          .eq('user_profile_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking Discord verification:', error);
          setState({
            isVerified: false,
            discordUsername: null,
            isLoading: false,
            error: 'Failed to check Discord status',
          });
          return;
        }

        setState({
          isVerified: data !== null,
          discordUsername: data?.discord_username || null,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Unexpected error checking Discord verification:', err);
        setState({
          isVerified: false,
          discordUsername: null,
          isLoading: false,
          error: 'Unexpected error',
        });
      }
    }

    checkVerification();
  }, [user?.id, supabase]);

  return state;
}

export default useDiscordVerification;
