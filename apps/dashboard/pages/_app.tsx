import { GlobalStyles2023, GlobalStyles2024 } from '@hibiscus/styles';
import { AppProps } from 'next/app';
import Head from 'next/head';
import './styles.css';
import '../components/events/event-list.global.css';
import { wrapper } from '../store/store';
import styled from 'styled-components';
import { HibiscusUserProvider } from '../hooks/use-hibiscus-user/use-hibiscus-user';
import PortalLayout from '../layouts/portal-layout';
import { useRouter } from 'next/router';
import { getWebTitle } from '@hibiscus/metadata';
import { Toaster } from 'react-hot-toast';
import { TeamProvider } from '../hooks/use-team/use-team';
import { SupabaseContextProvider } from '@hibiscus/hibiscus-supabase-context';
import Router from 'next/router';
import nProgress from 'nprogress';
import ThemelessLayout from '../layouts/themeless-layout';
import { GlobalStyle } from '@hacksc/sctw-ui-kit';
import { useEffect, useState } from 'react';

Router.events.on('routeChangeStart', (url) => {
  nProgress.start();
});
Router.events.on('routeChangeComplete', () => nProgress.done());
Router.events.on('routeChangeError', () => nProgress.done());

const MAINTENANCE_START = new Date('2026-01-16T02:30:00Z');
const MAINTENANCE_END = new Date('2026-01-16T03:00:00Z');
// Show banner 12 hours before maintenance starts
const BANNER_SHOW_FROM = new Date(
  MAINTENANCE_START.getTime() - 12 * 60 * 60 * 1000
);

const BannerWrapper = styled.div`
  background-color: #fef3c7;
  border-bottom: 2px solid #f59e0b;
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  color: #92400e;
  position: relative;
  z-index: 1000;
`;

const BannerTitle = styled.span`
  font-weight: 600;
  margin-right: 8px;
`;

function MaintenanceBanner() {
  const [visible, setVisible] = useState(false);
  const [isDuring, setIsDuring] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      setVisible(now >= BANNER_SHOW_FROM && now <= MAINTENANCE_END);
      setIsDuring(now >= MAINTENANCE_START && now <= MAINTENANCE_END);
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <BannerWrapper>
      <BannerTitle>
        {isDuring ? '🔧 Maintenance in Progress' : '🔧 Scheduled Maintenance'}
      </BannerTitle>
      {isDuring
        ? 'Email services (password reset, verification) are temporarily unavailable. Please try again after 08:30 IST.'
        : 'On Jan 16 from 08:00-08:30 IST, email services (password reset, verification) will be briefly unavailable.'}
    </BannerWrapper>
  );
}

const newLayoutRoutes = [
  '/events',
  '/leaderboard',
  '/sponsor-booth',
  '/participant-database',
  '/identity-portal/attendee-details',
  '/identity-portal/attendee-details-scan',
  '/identity-portal/attendee-event-scan',
  '/identity-portal/event-checkin',
  '/hacker-profile',
];

function CustomApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const createWebTitle = () => {
    switch (router.asPath) {
      case '/':
        return getWebTitle('Home');
      case '/apply-2023':
        return getWebTitle('Apply');
      case '/team':
        return getWebTitle('Your team');
      default:
        return getWebTitle('Home');
    }
  };

  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/img/favicon.ico" />
        <title>{createWebTitle()}</title>
      </Head>
      <Main>
        <MaintenanceBanner />
        <Toaster />
        <GlobalStyles2024 />
        <SupabaseContextProvider>
          <TeamProvider>
            <HibiscusUserProvider>
              {newLayoutRoutes.includes(router?.pathname) ? (
                <ThemelessLayout>
                  <Component {...pageProps} />
                </ThemelessLayout>
              ) : (
                <PortalLayout>
                  <Component {...pageProps} />
                </PortalLayout>
              )}
            </HibiscusUserProvider>
          </TeamProvider>
        </SupabaseContextProvider>
      </Main>
    </>
  );
}

export default wrapper.withRedux(CustomApp);

const Main = styled.main`
  position: absolute;
  width: 100%;
`;
