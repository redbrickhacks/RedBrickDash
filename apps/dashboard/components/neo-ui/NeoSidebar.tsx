import React, { useMemo } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HibiscusRole, HibiscusUser } from '@hibiscus/types';
import {
  FaHouse,
  FaUsers,
  FaCloudArrowUp,
  FaUser,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa6';
import { neoColors, neoBorders, neoTransition } from './theme';

const CONTACT = {
  email: 'redbrickhacks@ashoka.edu.in',
  phone: '+91 90500 14105',
  phoneHours: '10:00 AM–6:00 PM IST',
};

const NAV_ITEMS = (user: HibiscusUser) =>
  user.role === HibiscusRole.FINALIST
    ? [
        { path: '/finalist', label: 'Home', icon: FaHouse },
        { path: '/team', label: 'Team', icon: FaUsers },
        { path: '/submit', label: 'Submit', icon: FaCloudArrowUp },
        { path: '/apply', label: 'Profile', icon: FaUser },
      ]
    : [
        { path: '/', label: 'Home', icon: FaHouse },
        { path: '/team', label: 'Team', icon: FaUsers },
        { path: '/submit', label: 'Submit', icon: FaCloudArrowUp },
        { path: '/apply', label: 'Profile', icon: FaUser },
      ];

function isActiveRoute(itemPath: string, currentPath: string): boolean {
  if (itemPath === '/') return currentPath === '/';
  return currentPath.startsWith(itemPath);
}

export interface NeoSidebarProps {
  user: HibiscusUser;
}

export function NeoSidebar({ user }: NeoSidebarProps) {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = useMemo(() => NAV_ITEMS(user), [user]);

  return (
    <SidebarWrapper>
      <Nav aria-label="Main navigation">
        {navItems.map((item) => {
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
      <ContactSection>
        <ContactLabel>Need help?</ContactLabel>
        <ContactLink href={`mailto:${CONTACT.email}`}>
          <FaEnvelope />
          <span>{CONTACT.email}</span>
        </ContactLink>
        <ContactLink href={`tel:${CONTACT.phone.replace(/\s/g, '')}`}>
          <FaPhone />
          <span>{CONTACT.phone}</span>
        </ContactLink>
        {CONTACT.phoneHours ? (
          <ContactNote>
            This phone number is managed by a full-time student. Please call
            between {CONTACT.phoneHours}.
          </ContactNote>
        ) : null}
      </ContactSection>
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

const ContactSection = styled.div`
  margin-top: auto;
  padding: 1.25rem 1.5rem;
  border-top: ${neoBorders.standard};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ContactLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${neoColors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const ContactLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: ${neoColors.text};
  text-decoration: none;
  transition: ${neoTransition};

  &:hover {
    color: ${neoColors.accent.blue};
  }

  svg {
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  span {
    word-break: break-all;
  }
`;

const ContactNote = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  line-height: 1.25;
  color: ${neoColors.textMuted};
`;
