import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHouse, FaUsers, FaCloudArrowUp, FaUser } from 'react-icons/fa6';
import { neoColors, neoBorders, neoTransition } from './theme';

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

export function NeoSidebar() {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <SidebarWrapper>
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
    </SidebarWrapper>
  );
}

export default NeoSidebar;

const SidebarWrapper = styled.aside`
  width: 200px;
  min-width: 200px;
  background: ${neoColors.surface};
  border-right: ${neoBorders.standard};
  height: calc(100vh - 70px);
  position: sticky;
  top: 70px;
  display: flex;
  flex-direction: column;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 1rem 0;
`;

const NavItem = styled.a<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  font-size: 0.95rem;
  background: ${({ $active }) =>
    $active ? neoColors.accent.yellow : 'transparent'};
  border-left: 4px solid
    ${({ $active }) => ($active ? neoColors.text : 'transparent')};
  color: ${neoColors.text};
  text-decoration: none;
  transition: ${neoTransition};
  cursor: pointer;

  &:hover {
    background: ${({ $active }) =>
      $active ? neoColors.accent.yellow : neoColors.background};
  }

  svg {
    font-size: 1.1rem;
    flex-shrink: 0;
  }
`;
