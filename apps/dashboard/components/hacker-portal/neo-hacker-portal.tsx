import styled from 'styled-components';
import { ApplicationStatus } from '@hibiscus/types';
import Link from 'next/link';
import {
  FaClipboardCheck,
  FaTrophy,
  FaCheck,
  FaRocket,
  FaXmark,
  FaHeartBroken,
} from 'react-icons/fa6';
import { getEnv } from '@hibiscus/env';
import { CountdownTimer } from '../countdown-timer/countdown-timer';
import { ProgressTracker } from '../progress-tracker/progress-tracker';
import { TracksSection } from '../tracks-section/tracks-section';
import { DiscordSection } from '../discord-section/discord-section';
import { useDiscordVerification } from '../../hooks/use-discord-verification/use-discord-verification';

interface NeoHackerPortalProps {
  user: {
    firstName: string;
    applicationStatus: ApplicationStatus;
    attendanceConfirmed: boolean | null;
    teamId?: string | null;
    submissionStatus?: number;
  };
  onRSVP?: (choice: 'ACCEPT' | 'DECLINE') => void;
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
  const statusConfig = getStatusConfig(user.applicationStatus);
  const discordVerification = useDiscordVerification();
  const discordUrl = getEnv().Hibiscus.Discord.InviteUrl || '#';

  // Get submission deadline from env or default to Jan 10, 2025
  const deadlineStr = getEnv().Hibiscus.Submission?.Deadline;
  const submissionDeadline = deadlineStr
    ? new Date(deadlineStr)
    : new Date('2025-01-10T23:59:59Z');

  const hasTeam = !!user.teamId;
  const hasSubmitted = (user.submissionStatus ?? 1) >= 2;
  const showCountdown = user.applicationStatus === ApplicationStatus.REGISTERED;
  const showProgressTracker =
    user.applicationStatus === ApplicationStatus.NOT_APPLIED ||
    user.applicationStatus === ApplicationStatus.REGISTERED;
  const showTracks =
    user.applicationStatus === ApplicationStatus.NOT_APPLIED ||
    user.applicationStatus === ApplicationStatus.REGISTERED;

  return (
    <PortalContainer>
      {/* Welcome Banner */}
      <WelcomeBanner>
        <WelcomeContent>
          <WelcomeText>
            <span className="hey">Hey there,</span>
            <span className="name">{user.firstName}!</span>
          </WelcomeText>
          <WelcomeSubtext>
            Welcome to <strong>RedBrick Hacks III</strong>. Let&apos;s get you
            ready to build something amazing.
          </WelcomeSubtext>
        </WelcomeContent>
        {showCountdown && (
          <CountdownWrapper>
            <CountdownTimer deadline={submissionDeadline} />
          </CountdownWrapper>
        )}
      </WelcomeBanner>

      {/* Status Card */}
      <StatusCard>
        <StatusLabel>Registration Status</StatusLabel>
        <StatusBadge $color={statusConfig.color} $bg={statusConfig.bg}>
          {statusConfig.label}
        </StatusBadge>
      </StatusCard>

      {/* Progress Tracker */}
      {showProgressTracker && (
        <ProgressTracker
          applicationStatus={user.applicationStatus}
          isDiscordVerified={discordVerification.isVerified}
          hasTeam={hasTeam}
          hasSubmitted={hasSubmitted}
        />
      )}

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
              {hasSubmitted
                ? 'Your submission is in! You can update it anytime before the deadline.'
                : hasTeam
                ? 'Your team is ready. Submit your project before the deadline!'
                : 'Create a team or go solo, then submit your project.'}
            </ActionDescription>
          </ActionContent>
          <ActionButtonGroup>
            {!hasTeam && (
              <Link href="/team" passHref>
                <ActionButton $color="#666">Manage Team</ActionButton>
              </Link>
            )}
            <Link href="/submit" passHref>
              <ActionButton $color="#00D4C8">
                {hasSubmitted ? 'Update Submission' : 'Submit Project'}
              </ActionButton>
            </Link>
          </ActionButtonGroup>
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

      {/* Tracks Section */}
      {showTracks && <TracksSection />}

      {/* Discord Section */}
      <DiscordSection
        isVerified={discordVerification.isVerified}
        discordUsername={discordVerification.discordUsername}
        isLoading={discordVerification.isLoading}
      />
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

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
`;

const CountdownWrapper = styled.div`
  margin-top: 1.5rem;
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 600px) {
    width: 100%;
    flex-direction: column;
  }
`;
