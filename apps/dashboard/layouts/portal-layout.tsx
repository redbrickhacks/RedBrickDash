import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import useHibiscusUser from '../hooks/use-hibiscus-user/use-hibiscus-user';
import {
  NeoTopBar,
  NeoSidebar,
  NeoBottomNav,
  neoColors,
} from '../components/neo-ui';

export type PortalLayoutProps = React.PropsWithChildren;

function PortalLayout({ children }: PortalLayoutProps) {
  const { user } = useHibiscusUser();
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery({ query: '(max-width: 600px)' });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (user == null) {
    return null;
  }

  // Prevent hydration mismatch by not rendering responsive components until mounted
  if (!mounted) {
    return (
      <LayoutWrapper>
        <NeoTopBar userTag={user.tag} role={user.role} />
        <MainContent>
          <ContentArea $hasMobileNav={false}>{children}</ContentArea>
        </MainContent>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <NeoTopBar userTag={user.tag} role={user.role} />
      <MainContent>
        {!isMobile && <NeoSidebar />}
        <ContentArea $hasMobileNav={isMobile}>{children}</ContentArea>
      </MainContent>
      {isMobile && <NeoBottomNav />}
    </LayoutWrapper>
  );
}

export default PortalLayout;

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: ${neoColors.background};
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  min-height: 0; /* Allow flex child to shrink below content size */
`;

const ContentArea = styled.div<{ $hasMobileNav: boolean }>`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  padding-bottom: ${({ $hasMobileNav }) => ($hasMobileNav ? '80px' : '2rem')};

  @media (max-width: 600px) {
    padding: 1rem;
    padding-bottom: 80px;
  }
`;
