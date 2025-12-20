import styled from 'styled-components';
import { useState } from 'react';
import { ApplicationStatus } from '@hibiscus/types';
import Link from 'next/link';
import {
  FaClipboardCheck,
  FaTrophy,
  FaComments,
  FaCheck,
  FaRocket,
  FaXmark,
  FaHeartBroken,
} from 'react-icons/fa6';
import { getEnv } from '@hibiscus/env';

interface NeoHackerPortalProps {
  user: {
    firstName: string;
    applicationStatus: ApplicationStatus;
    attendanceConfirmed: boolean | null;
  };
  onRSVP?: (choice: 'ACCEPT' | 'DECLINE') => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  action?: {
    label: string;
    href: string;
  };
}

function getSteps(user: NeoHackerPortalProps['user']): Step[] {
  const { applicationStatus } = user;

  const isRegistered =
    applicationStatus === ApplicationStatus.REGISTERED ||
    applicationStatus === ApplicationStatus.FINALIST ||
    applicationStatus === ApplicationStatus.CONFIRMED ||
    applicationStatus === ApplicationStatus.DECLINED ||
    applicationStatus === ApplicationStatus.NOT_SELECTED;

  const isFinalist = applicationStatus === ApplicationStatus.FINALIST;
  const isConfirmed = applicationStatus === ApplicationStatus.CONFIRMED;
  const isDeclined = applicationStatus === ApplicationStatus.DECLINED;
  const isNotSelected = applicationStatus === ApplicationStatus.NOT_SELECTED;

  const discordUrl = getEnv().Hibiscus.Discord.InviteUrl || '#';

  return [
    {
      id: 1,
      title: 'Create Account',
      description: 'Sign up for RedBrick Hacks III',
      status: 'completed',
    },
    {
      id: 2,
      title: 'Complete Profile',
      description: 'Tell us about yourself to join the online round',
      status: isRegistered ? 'completed' : 'current',
      action: !isRegistered
        ? { label: 'Complete Profile', href: '/apply' }
        : undefined,
    },
    {
      id: 3,
      title: 'Online Round',
      description: 'Participate in the online hackathon (open until Jan 10)',
      status: isRegistered ? 'current' : 'upcoming',
    },
    {
      id: 4,
      title: 'Finalist Selection',
      description: 'Top performers will be invited to national finals',
      status:
        isFinalist || isConfirmed || isDeclined || isNotSelected
          ? 'completed'
          : isRegistered
          ? 'upcoming'
          : 'locked',
    },
    {
      id: 5,
      title: 'RSVP to Finals',
      description: 'Confirm your spot at the national finals',
      status: isNotSelected
        ? 'locked'
        : isConfirmed || isDeclined
        ? 'completed'
        : isFinalist
        ? 'current'
        : 'upcoming',
    },
    {
      id: 6,
      title: 'Join Discord Server',
      description: 'Connect with other hackers and get updates',
      status: isRegistered ? 'current' : 'upcoming',
      action: isRegistered
        ? { label: 'Join Discord', href: discordUrl }
        : undefined,
    },
    {
      id: 7,
      title: 'Form or Join a Team',
      description: 'Team up with other participants (up to 4 members)',
      status: isRegistered ? 'current' : 'upcoming',
      action: isRegistered
        ? { label: 'Manage Team', href: '/team' }
        : undefined,
    },
  ];
}

function getStatusConfig(status: ApplicationStatus) {
  switch (status) {
    case ApplicationStatus.NOT_APPLIED:
      return { label: 'Not Registered', color: '#A0A0A0', bg: '#F0F0F0' };
    case ApplicationStatus.REGISTERED:
      return { label: 'Registered', color: '#0077B6', bg: '#90E0EF' };
    case ApplicationStatus.FINALIST:
      return { label: 'Finalist', color: '#B8860B', bg: '#FFE566' };
    case ApplicationStatus.CONFIRMED:
      return { label: 'Confirmed', color: '#2D6A4F', bg: '#95D5B2' };
    case ApplicationStatus.DECLINED:
      return { label: 'Declined', color: '#6C757D', bg: '#DEE2E6' };
    case ApplicationStatus.NOT_SELECTED:
      return { label: 'Not Selected', color: '#9D0208', bg: '#FFCCD5' };
    default:
      return { label: 'Unknown', color: '#666', bg: '#EEE' };
  }
}

export function NeoHackerPortal({ user, onRSVP }: NeoHackerPortalProps) {
  const [showAllSteps, setShowAllSteps] = useState(false);
  const steps = getSteps(user);
  const statusConfig = getStatusConfig(user.applicationStatus);
  const discordUrl = getEnv().Hibiscus.Discord.InviteUrl || '#';

  const currentStepIndex = steps.findIndex((s) => s.status === 'current');
  const visibleSteps = showAllSteps
    ? steps
    : steps.slice(0, Math.max(currentStepIndex + 2, 4));

  return (
    <PortalContainer>
      {/* Welcome Banner */}
      <WelcomeBanner>
        <WelcomeText>
          <span className="hey">Hey there,</span>
          <span className="name">{user.firstName}!</span>
        </WelcomeText>
        <WelcomeSubtext>
          Welcome to <strong>RedBrick Hacks III</strong>. Let&apos;s get you
          ready to build something amazing.
        </WelcomeSubtext>
      </WelcomeBanner>

      {/* Status Card */}
      <StatusCard>
        <StatusLabel>Registration Status</StatusLabel>
        <StatusBadge $color={statusConfig.color} $bg={statusConfig.bg}>
          {statusConfig.label}
        </StatusBadge>
      </StatusCard>

      {/* Action Card - Show based on current status */}
      {user.applicationStatus === ApplicationStatus.NOT_APPLIED && (
        <ActionCard $accent="#FF5C5C">
          <ActionIconWrapper $bg="#FFE8E8">
            <FaClipboardCheck />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>Complete Your Profile</ActionTitle>
            <ActionDescription>
              Fill out your profile to join the online round. It only takes a
              few minutes!
            </ActionDescription>
          </ActionContent>
          <Link href="/apply" passHref>
            <ActionButton $color="#FF5C5C">Complete Profile</ActionButton>
          </Link>
        </ActionCard>
      )}

      {user.applicationStatus === ApplicationStatus.REGISTERED && (
        <ActionCard $accent="#00D4C8">
          <ActionIconWrapper $bg="#E0FAF8">
            <FaRocket />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>You&apos;re in the online round!</ActionTitle>
            <ActionDescription>
              Welcome aboard! Join our Discord to connect with other hackers and
              start forming teams.
            </ActionDescription>
          </ActionContent>
          <ActionButton
            as="a"
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            $color="#00D4C8"
          >
            Join Discord
          </ActionButton>
        </ActionCard>
      )}

      {user.applicationStatus === ApplicationStatus.FINALIST && (
        <ActionCard $accent="#FFD700">
          <ActionIconWrapper $bg="#FFF9E0">
            <FaTrophy />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>Congratulations, Finalist!</ActionTitle>
            <ActionDescription>
              You&apos;ve been selected for the national finals! Please confirm
              your attendance.
            </ActionDescription>
          </ActionContent>
          <RSVPButtonGroup>
            <ActionButton
              as="button"
              type="button"
              $color="#dc3545"
              onClick={() => onRSVP?.('DECLINE')}
            >
              Decline
            </ActionButton>
            <ActionButton
              as="button"
              type="button"
              $color="#2D6A4F"
              onClick={() => onRSVP?.('ACCEPT')}
            >
              Confirm Spot
            </ActionButton>
          </RSVPButtonGroup>
        </ActionCard>
      )}

      {user.applicationStatus === ApplicationStatus.CONFIRMED && (
        <ActionCard $accent="#95D5B2">
          <ActionIconWrapper $bg="#E8F5E9">
            <FaCheck />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>See you at the finals!</ActionTitle>
            <ActionDescription>
              Your spot is confirmed. We can&apos;t wait to see what you build!
              Stay tuned for event details.
            </ActionDescription>
          </ActionContent>
          <ActionButton
            as="a"
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            $color="#2D6A4F"
          >
            Join Discord
          </ActionButton>
        </ActionCard>
      )}

      {user.applicationStatus === ApplicationStatus.DECLINED && (
        <ActionCard $accent="#6C757D">
          <ActionIconWrapper $bg="#F5F5F5">
            <FaXmark />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>Spot Declined</ActionTitle>
            <ActionDescription>
              You&apos;ve declined your spot at the national finals. We hope to
              see you at future events!
            </ActionDescription>
          </ActionContent>
        </ActionCard>
      )}

      {user.applicationStatus === ApplicationStatus.NOT_SELECTED && (
        <ActionCard $accent="#9D0208">
          <ActionIconWrapper $bg="#FFEBEE">
            <FaHeartBroken />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>Thank you for participating</ActionTitle>
            <ActionDescription>
              Unfortunately, you weren&apos;t selected for the national finals
              this time. We appreciate your participation in the online round!
            </ActionDescription>
          </ActionContent>
        </ActionCard>
      )}

      {/* Steps Tracker */}
      <StepsSection>
        <SectionHeader>
          <SectionTitle>Your Journey</SectionTitle>
          <StepCounter>
            {steps.filter((s) => s.status === 'completed').length} /{' '}
            {steps.length} completed
          </StepCounter>
        </SectionHeader>

        <StepsList>
          {visibleSteps.map((step, index) => (
            <StepItem key={step.id} $status={step.status}>
              <StepNumber $status={step.status}>
                {step.status === 'completed' ? <FaCheck size={14} /> : step.id}
              </StepNumber>
              <StepContent>
                <StepTitle $status={step.status}>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
                {step.action && step.status === 'current' && (
                  <Link href={step.action.href} passHref>
                    <StepAction>{step.action.label}</StepAction>
                  </Link>
                )}
              </StepContent>
              {index < visibleSteps.length - 1 && (
                <StepConnector $status={step.status} />
              )}
            </StepItem>
          ))}
        </StepsList>

        {!showAllSteps && steps.length > visibleSteps.length && (
          <SeeMoreButton onClick={() => setShowAllSteps(true)}>
            See all steps ({steps.length - visibleSteps.length} more)
          </SeeMoreButton>
        )}

        {showAllSteps && (
          <SeeMoreButton onClick={() => setShowAllSteps(false)}>
            Show less
          </SeeMoreButton>
        )}
      </StepsSection>

      {/* Discord CTA */}
      <DiscordCard>
        <DiscordIconWrapper>
          <FaComments />
        </DiscordIconWrapper>
        <DiscordContent>
          <DiscordTitle>Join the Community</DiscordTitle>
          <DiscordDescription>
            Connect with fellow hackers, get help, and stay updated on all
            things RedBrick Hacks III.
          </DiscordDescription>
        </DiscordContent>
        <DiscordButton
          href={discordUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Join Discord
        </DiscordButton>
      </DiscordCard>
    </PortalContainer>
  );
}

export default NeoHackerPortal;

// Styled Components - Neobrutalist Design System

const PortalContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    sans-serif;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const WelcomeBanner = styled.div`
  background: #fffdf7;
  border: 3px solid #000;
  box-shadow: 6px 6px 0 #000;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: #ffe566;
    transform: translate(30%, -30%) rotate(45deg);
  }
`;

const WelcomeText = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  .hey {
    color: #666;
    font-weight: 400;
  }

  .name {
    color: #ff5c5c;
  }

  @media (max-width: 600px) {
    font-size: 1.75rem;
  }
`;

const WelcomeSubtext = styled.p`
  font-size: 1.1rem;
  color: #444;
  margin: 0;
  line-height: 1.6;

  strong {
    color: #000;
  }
`;

const StatusCard = styled.div`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StatusLabel = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatusBadge = styled.span<{ $color: string; $bg: string }>`
  background: ${(p) => p.$bg};
  color: ${(p) => p.$color};
  border: 2px solid ${(p) => p.$color};
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ActionCard = styled.div<{ $accent: string }>`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 ${(p) => p.$accent};
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ActionIconWrapper = styled.div<{ $bg: string }>`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$bg};
  border: 2px solid #000;
  flex-shrink: 0;
  font-size: 1.5rem;
  color: #333;
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const ActionDescription = styled.p`
  margin: 0;
  color: #555;
  line-height: 1.5;
`;

const ActionButton = styled.a<{ $color: string }>`
  background: ${(p) => p.$color};
  color: #fff;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 #000;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.1s ease;
  white-space: nowrap;
  font-family: inherit;

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #000;
  }

  &:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }
`;

const RSVPButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 600px) {
    width: 100%;
    flex-direction: column;
  }
`;

const StepsSection = styled.div`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 1.5rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px dashed #ccc;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const StepCounter = styled.span`
  font-size: 0.85rem;
  color: #666;
  background: #f5f5f5;
  padding: 0.25rem 0.75rem;
  border: 1px solid #ddd;
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const StepItem = styled.div<{ $status: string }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
  padding-bottom: 1.5rem;
  opacity: ${(p) => (p.$status === 'locked' ? 0.5 : 1)};
`;

const StepNumber = styled.div<{ $status: string }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
  border: 2px solid #000;
  background: ${(p) =>
    p.$status === 'completed'
      ? '#95D5B2'
      : p.$status === 'current'
      ? '#FFE566'
      : '#fff'};
  color: #000;
`;

const StepContent = styled.div`
  flex: 1;
  padding-top: 0.25rem;
`;

const StepTitle = styled.h4<{ $status: string }>`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: ${(p) =>
    p.$status === 'completed' ? 'line-through' : 'none'};
  color: ${(p) => (p.$status === 'completed' ? '#666' : '#000')};
`;

const StepDescription = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
`;

const StepAction = styled.span`
  display: inline-block;
  margin-top: 0.5rem;
  color: #ff5c5c;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    color: #cc4a4a;
  }
`;

const StepConnector = styled.div<{ $status: string }>`
  position: absolute;
  left: 17px;
  top: 40px;
  width: 2px;
  height: calc(100% - 44px);
  background: ${(p) => (p.$status === 'completed' ? '#95D5B2' : '#ddd')};
`;

const SeeMoreButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: #f5f5f5;
  border: 2px dashed #ccc;
  font-family: inherit;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #eee;
    border-color: #999;
    color: #333;
  }
`;

const DiscordCard = styled.div`
  background: #5865f2;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  color: #fff;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }
`;

const DiscordIconWrapper = styled.div`
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  font-size: 1.5rem;
`;

const DiscordContent = styled.div`
  flex: 1;
`;

const DiscordTitle = styled.h3`
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const DiscordDescription = styled.p`
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
`;

const DiscordButton = styled.a`
  background: #fff;
  color: #5865f2;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 #000;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.1s ease;
  white-space: nowrap;

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #000;
  }

  &:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }
`;
