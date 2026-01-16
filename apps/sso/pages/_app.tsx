import 'reflect-metadata';
import { AppProps } from 'next/app';
import './styles.css';
import Head from 'next/head';
import { GlobalStylesSCTW } from '@hibiscus/styles';
import { SupabaseContextProvider } from '@hibiscus/hibiscus-supabase-context';
import styled from 'styled-components';
import { useEffect, useState } from 'react';

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

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/static/favicon.ico" />
      </Head>
      <main className="app">
        <GlobalStylesSCTW />
        <MaintenanceBanner />
        <SupabaseContextProvider>
          <Component {...pageProps} />
        </SupabaseContextProvider>
      </main>
    </>
  );
}

export default CustomApp;
