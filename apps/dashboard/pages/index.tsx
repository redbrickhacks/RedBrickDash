import useHibiscusUser from '../hooks/use-hibiscus-user/use-hibiscus-user';
import { ApplicationStatus, HibiscusRole } from '@hibiscus/types';
import HackerPortal from '../components/hacker-portal/hacker-portal';
import NeoHackerPortal from '../components/hacker-portal/neo-hacker-portal';
import { GetServerSideProps } from 'next';
import AppsClosedPlaceholder from '../components/hacker-portal/apps-closed-placeholder';
import { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/redux/hooks';
import { removeTabRoute } from '../store/menu-slice';
import { useRouter } from 'next/router';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';

const RSVP_PERIOD = 4 * 24 * 60 * 60 * 1000; // 4 days in milliseconds

interface ServerSideProps {
  appsOpen: boolean;
  waitlistOpen: boolean;
  hackerPortalOpen: boolean;
}

export function Index({ appsOpen, waitlistOpen }: ServerSideProps) {
  const dispatch = useAppDispatch();
  const { supabase } = useHibiscusSupabase();
  const { user } = useHibiscusUser();

  const [hackerPortalOpen, setHackerPortalOpen] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user != null) {
        const { data, error } = await supabase
          .getClient()
          .from('participants')
          .select('wristband_id')
          .eq('id', user.id);

        if (error != null) {
          console.log(error.message);
          return;
        }

        console.log(data);

        setHackerPortalOpen(
          data?.[0]?.wristband_id !== null &&
            data?.[0]?.wristband_id !== undefined
        );
      }
    };

    fetchData();
  }, [user]);

  const router = useRouter();

  const [rsvpFormOpen, setRsvpFormOpen] = useState<boolean | null>(true);

  useEffect(() => {
    if (!appsOpen) {
      dispatch(removeTabRoute('/apply-2023-x'));
    }
  }, [appsOpen, dispatch]);

  // useEffect(() => {
  //   if (user != null) {
  //     if (user.applicationStatusLastChanged !== undefined) {
  //       setRsvpFormOpen(
  //         new Date().valueOf() - user.applicationStatusLastChanged.valueOf() <=
  //           RSVP_PERIOD
  //       );
  //     } else {
  //       setRsvpFormOpen(true);
  //     }
  //   }
  // }, [user]);

  if (user == null || rsvpFormOpen === null) {
    return <>Loading</>;
  }

  const handleRSVP = async (choice: 'ACCEPT' | 'DECLINE') => {
    // ApplicationStatus enum maps to 1-indexed DB values:
    // 1=NOT_APPLIED, 2=REGISTERED, 3=FINALIST, 4=CONFIRMED, 5=DECLINED, 6=NOT_SELECTED
    const newStatusValue = choice === 'ACCEPT' ? 4 : 5;

    const { error } = await supabase
      .getClient()
      .from('user_profiles')
      .update({
        application_status: newStatusValue,
        attendance_confirmed: choice === 'ACCEPT',
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update RSVP:', error);
      return;
    }

    // Reload to reflect new status
    router.reload();
  };

  const Dashboard = () => {
    if (user.role === HibiscusRole.HACKER) {
      // Apps closed and user hasn't applied
      if (
        user.applicationStatus === ApplicationStatus.NOT_APPLIED &&
        !appsOpen &&
        !waitlistOpen
      ) {
        return <AppsClosedPlaceholder />;
      }

      // Use unified NeoHackerPortal for all hacker statuses
      return (
        <NeoHackerPortal
          user={{
            firstName: user.firstName,
            applicationStatus: user.applicationStatus,
            attendanceConfirmed: user.attendanceConfirmed ?? null,
            teamId: user.teamId,
            submissionStatus: user.submissionStatus,
            referralCode: user.referralCode,
            referralCount: user.referralCount,
          }}
          onRSVP={handleRSVP}
        />
      );
    } else if (user.role === HibiscusRole.SPONSOR) {
      router.push('/sponsor-booth');
      return <></>;
    } else if (user.role === HibiscusRole.JUDGE) {
      window.location.replace('https://podium.hacksc.com');
      return <></>;
    } else if (user.role === HibiscusRole.VOLUNTEER) {
      router.push('/identity-portal/attendee-event-scan');
      return <></>;
    }
  };

  return <Dashboard />;
}

export default Index;

export const getServerSideProps: GetServerSideProps = async () => {
  // Feature flags - set these to control app behavior
  // Previously used Vercel Edge Config, now hardcoded for self-hosted deployment
  const appsOpen = process.env.APPS_OPEN === 'true';
  const waitlistOpen = process.env.WAITLIST_OPEN === 'true';
  const hackerPortalOpen = process.env.HACKER_PORTAL_OPEN === 'true';

  return {
    props: {
      appsOpen,
      hackerPortalOpen,
      waitlistOpen,
    } as ServerSideProps,
  };
};
