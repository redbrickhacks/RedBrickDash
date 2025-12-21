import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHouse, FaUsers, FaCloudArrowUp, FaUser } from 'react-icons/fa6';
import { neoColors, neoBorders } from './theme';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: FaHouse },
  { path: '/team', label: 'Team', icon: FaUsers },
  { path: '/submit', label: 'Submit', icon: FaCloudArrowUp },
  { path: '/apply', label: 'Profile', icon: FaUser },
];

function isActiveRoute(itemPath: string, currentPath: string): boolean {
  if (itemPath === '/') return currentPath === '/';
  return currentPath.startsWith(itemPath);
}

export function NeoBottomNav() {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <BottomNavWrapper>
      <Nav aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const active = isActiveRoute(item.path, currentPath);
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path} passHref legacyBehavior>
              <NavItem
                $active={active}
                aria-current={active ? 'page' : undefined}
              >
                <Icon />
                <span>{item.label}</span>
              </NavItem>
            </Link>
          );
        })}
      </Nav>
    </BottomNavWrapper>
  );
}

export default NeoBottomNav;

const BottomNavWrapper = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: ${neoColors.surface};
  border-top: ${neoBorders.thick};
  box-shadow: 0 -4px 0 ${neoColors.text};
  z-index: 100;
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  padding: 0 0.5rem;
`;

const NavItem = styled.a<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  color: ${({ $active }) =>
    $active ? neoColors.accent.blue : neoColors.textMuted};
  font-size: 0.65rem;
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.02em;

  svg {
    font-size: 1.25rem;
  }
`;
