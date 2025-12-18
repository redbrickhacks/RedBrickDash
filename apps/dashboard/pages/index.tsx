import styled from 'styled-components';
import useHibiscusUser from '../hooks/use-hibiscus-user/use-hibiscus-user';
import { ApplicationStatus, HibiscusRole } from '@hibiscus/types';
import HackerPortal from '../components/hacker-portal/hacker-portal';
import IdentityPortal from '../components/identity-portal/identity-portal';
import SponsorPortal from '../components/sponsor-portal/sponsor-portal';
import { GetServerSideProps } from 'next';
import AppsClosedPlaceholder from '../components/hacker-portal/apps-closed-placeholder';
import { isHackerPostAppStatus } from '../common/utils';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch } from '../hooks/redux/hooks';
import { removeTabRoute } from '../store/menu-slice';
import RSVPClosedPlaceholder from '../components/hacker-portal/rsvp-closed-placeholder';
// import { get } from '@vercel/edge-config'; // Disabled - Vercel-specific feature
import { useRouter } from 'next/router';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import {
  OnlineRoundPortal,
  FinalistRSVP,
  NotSelectedPlaceholder,
} from '../components/online-round-portal';
import ConfirmedPlaceholder from '../components/hacker-portal/confirmed-placeholder';
import DeclinedPlaceholder from '../components/hacker-portal/declined-placeholder';

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

  const Dashboard = () => {
    if (user.role === HibiscusRole.HACKER) {
      // Not applied - show apply button or apps closed
      if (user.applicationStatus === ApplicationStatus.NOT_APPLIED) {
        if (!appsOpen && !waitlistOpen) {
          return <AppsClosedPlaceholder />;
        }
        return (
          <HackerPortal isEventOpen={hackerPortalOpen} appsOpen={appsOpen} />
        );
      }

      // Registered - show online round portal (team + submission)
      if (user.applicationStatus === ApplicationStatus.REGISTERED) {
        return <OnlineRoundPortal />;
      }

      // Finalist awaiting RSVP
      if (user.applicationStatus === ApplicationStatus.FINALIST) {
        return <FinalistRSVP />;
      }

      // Confirmed for nationals
      if (user.applicationStatus === ApplicationStatus.CONFIRMED) {
        return <ConfirmedPlaceholder />;
      }

      // Declined spot
      if (user.applicationStatus === ApplicationStatus.DECLINED) {
        return <DeclinedPlaceholder />;
      }

      // Not selected
      if (user.applicationStatus === ApplicationStatus.NOT_SELECTED) {
        return <NotSelectedPlaceholder />;
      }

      // Fallback to legacy hacker portal for any other status
      return (
        <HackerPortal isEventOpen={hackerPortalOpen} appsOpen={appsOpen} />
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

  return (
    <Wrapper>
      <LayoutContainer>
        <Dashboard />
      </LayoutContainer>
    </Wrapper>
  );
}

export default Index;

const Wrapper = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const LayoutContainer = styled.div`
  width: 80%;
  display: flex;
  flex-direction: column;
`;

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
