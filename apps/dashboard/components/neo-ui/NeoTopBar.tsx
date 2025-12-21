import React from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { HibiscusRole } from '@hibiscus/types';
import { logout } from '@hibiscus/sso-client';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import { neoColors, neoBorders, neoTransition } from './theme';

interface NeoTopBarProps {
  userTag: string;
  role: HibiscusRole;
}

export function NeoTopBar({ userTag, role }: NeoTopBarProps) {
  return (
    <TopBarWrapper>
      <LogoLink href="/">
        <Image
          src="/hacksc-logo2.svg"
          alt="RedBrick Hacks"
          width={160}
          height={80}
          priority
        />
      </LogoLink>

      <UserSection>
        <UserTag>{userTag}</UserTag>
        <RoleBadge>{role}</RoleBadge>
        <LogoutButton onClick={logout} aria-label="Log out">
          <FaArrowRightFromBracket />
        </LogoutButton>
      </UserSection>
    </TopBarWrapper>
  );
}

export default NeoTopBar;

const TopBarWrapper = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${neoColors.surface};
  border-bottom: ${neoBorders.thick};
  padding: 0.75rem 2rem;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 50;

  @media (max-width: 600px) {
    padding: 0.75rem 1rem;
  }
`;

const LogoLink = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 600px) {
    gap: 0.5rem;
  }
`;

const UserTag = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${neoColors.text};

  @media (max-width: 600px) {
    display: none;
  }
`;

const RoleBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${neoColors.accent.red};

  @media (max-width: 600px) {
    display: none;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: ${neoBorders.standard};
  cursor: pointer;
  color: ${neoColors.text};
  transition: ${neoTransition};

  &:hover {
    background: ${neoColors.background};
  }

  &:active {
    transform: translate(1px, 1px);
  }

  svg {
    font-size: 1rem;
  }
`;
