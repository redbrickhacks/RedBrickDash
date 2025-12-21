import styled from 'styled-components';
import { ApplicationStatus } from '@hibiscus/types';
import Link from 'next/link';
import {
  FaClipboardCheck,
  FaTrophy,
  FaCheck,
  FaRocket,
  FaXmark,
  FaHeartCrack,
  FaGithub,
  FaDiscord,
  FaUsers,
  FaCloudArrowUp,
} from 'react-icons/fa6';
import { getEnv } from '@hibiscus/env';
import { CountdownTimer } from '../countdown-timer/countdown-timer';
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

type NextStepType = 'discord' | 'team' | 'submit' | 'done';

function getNextStep(
  isDiscordVerified: boolean,
  hasTeam: boolean,
  hasSubmitted: boolean
): NextStepType {
  if (!isDiscordVerified) return 'discord';
  if (!hasTeam) return 'team';
  if (!hasSubmitted) return 'submit';
  return 'done';
}

export function NeoHackerPortal({ user, onRSVP }: NeoHackerPortalProps) {
  const discordVerification = useDiscordVerification();
  const discordUrl = getEnv().Hibiscus.Discord.InviteUrl || '#';

  const deadlineStr = getEnv().Hibiscus.Submission?.Deadline;
  const submissionDeadline = deadlineStr
    ? new Date(deadlineStr)
    : new Date('2025-01-10T23:59:59Z');
  const isDeadlinePassed = new Date() > submissionDeadline;

  const hasTeam = !!user.teamId;
  const hasSubmitted = (user.submissionStatus ?? 1) >= 2;
  const nextStep = getNextStep(
    discordVerification.isVerified,
    hasTeam,
    hasSubmitted
  );

  // NOT_APPLIED: Simple onboarding view
  if (user.applicationStatus === ApplicationStatus.NOT_APPLIED) {
    return (
      <PortalContainer>
        <WelcomeBanner>
          <WelcomeText>
            <span className="hey">Welcome to</span>
            <span className="name">RedBrick Hacks III</span>
          </WelcomeText>
          <WelcomeSubtext>
            Complete your profile to join the online round and compete for a
            spot at the national finals.
          </WelcomeSubtext>
        </WelcomeBanner>

        <ActionCard $accent="#FF5C5C">
          <ActionIconWrapper $bg="#FFE8E8">
            <FaClipboardCheck />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>Complete Your Profile</ActionTitle>
            <ActionDescription>
              Fill out your details to register. It only takes about 5 minutes.
            </ActionDescription>
          </ActionContent>
          <Link href="/apply" passHref legacyBehavior>
            <ActionButton $color="#FF5C5C">Get Started</ActionButton>
          </Link>
        </ActionCard>

        <PrerequisitesCard>
          <PrerequisitesTitle>What you&apos;ll need</PrerequisitesTitle>
          <PrerequisitesList>
            <PrerequisiteItem>
              <PrerequisiteIcon>
                <FaGithub />
              </PrerequisiteIcon>
              <PrerequisiteText>
                <strong>GitHub account</strong>
                <span>For code submissions and collaboration</span>
              </PrerequisiteText>
            </PrerequisiteItem>
            <PrerequisiteItem>
              <PrerequisiteIcon $color="#003E54">
                <DevpostIcon />
              </PrerequisiteIcon>
              <PrerequisiteText>
                <strong>Devpost account</strong>
                <span>For project showcase and submissions</span>
              </PrerequisiteText>
            </PrerequisiteItem>
            <PrerequisiteItem>
              <PrerequisiteIcon $color="#5865F2">
                <FaDiscord />
              </PrerequisiteIcon>
              <PrerequisiteText>
                <strong>Discord</strong>
                <span>For community support and announcements</span>
              </PrerequisiteText>
            </PrerequisiteItem>
          </PrerequisitesList>
        </PrerequisitesCard>
      </PortalContainer>
    );
  }

  // REGISTERED: Mission Control view
  if (user.applicationStatus === ApplicationStatus.REGISTERED) {
    return (
      <PortalContainer>
        <WelcomeBanner>
          <WelcomeContent>
            <WelcomeText>
              <span className="hey">You&apos;re in,</span>
              <span className="name">{user.firstName}!</span>
            </WelcomeText>
            <WelcomeSubtext>
              {isDeadlinePassed
                ? hasSubmitted
                  ? 'The online round has ended. Results will be announced soon!'
                  : 'The submission deadline has passed. Stay tuned for announcements.'
                : 'Welcome to the Online Round. Build something amazing and submit before the deadline.'}
            </WelcomeSubtext>
          </WelcomeContent>
          {!isDeadlinePassed && (
            <CountdownWrapper>
              <CountdownTimer deadline={submissionDeadline} />
            </CountdownWrapper>
          )}
        </WelcomeBanner>

        {/* Dynamic Next Step Card */}
        {nextStep === 'discord' && (
          <NextStepCard $accent="#5865F2">
            <NextStepLabel>YOUR NEXT STEP</NextStepLabel>
            <NextStepContent>
              <ActionIconWrapper $bg="#E8EAFF">
                <FaDiscord />
              </ActionIconWrapper>
              <ActionContent>
                <ActionTitle>Join Our Discord</ActionTitle>
                <ActionDescription>
                  Connect with other hackers, find teammates, and get support
                  from mentors.
                </ActionDescription>
              </ActionContent>
              <ActionButton
                as="a"
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                $color="#5865F2"
              >
                Join Server
              </ActionButton>
            </NextStepContent>
          </NextStepCard>
        )}

        {nextStep === 'team' && (
          <NextStepCard $accent="#FF9F1C">
            <NextStepLabel>YOUR NEXT STEP</NextStepLabel>
            <NextStepContent>
              <ActionIconWrapper $bg="#FFF3E0">
                <FaUsers />
              </ActionIconWrapper>
              <ActionContent>
                <ActionTitle>Set Up Your Team</ActionTitle>
                <ActionDescription>
                  Teams of up to 4 can compete together. Find teammates in
                  #team-finding on Discord!
                </ActionDescription>
              </ActionContent>
              <ActionButtonGroup>
                <Link href="/team" passHref legacyBehavior>
                  <ActionButton $color="#FF9F1C">Create Team</ActionButton>
                </Link>
              </ActionButtonGroup>
            </NextStepContent>
            <SkipLink>
              <Link href="/submit">
                Prefer to work alone? Skip to submission →
              </Link>
            </SkipLink>
          </NextStepCard>
        )}

        {nextStep === 'submit' && (
          <NextStepCard $accent="#00D4C8">
            <NextStepLabel>YOUR NEXT STEP</NextStepLabel>
            <NextStepContent>
              <ActionIconWrapper $bg="#E0FAF8">
                <FaCloudArrowUp />
              </ActionIconWrapper>
              <ActionContent>
                <ActionTitle>Submit Your Project</ActionTitle>
                <ActionDescription>
                  {hasTeam
                    ? 'Your team is ready! Submit your project before the deadline.'
                    : 'Ready to submit? You can always add teammates later.'}
                </ActionDescription>
              </ActionContent>
              <Link href="/submit" passHref legacyBehavior>
                <ActionButton $color="#00D4C8">Submit Project</ActionButton>
              </Link>
            </NextStepContent>
          </NextStepCard>
        )}

        {nextStep === 'done' && (
          <NextStepCard $accent="#22c55e">
            <NextStepLabel>ALL SET!</NextStepLabel>
            <NextStepContent>
              <ActionIconWrapper $bg="#E8F5E9">
                <FaCheck />
              </ActionIconWrapper>
              <ActionContent>
                <ActionTitle>You&apos;re All Set!</ActionTitle>
                <ActionDescription>
                  Your submission is in. You can update it anytime before the
                  deadline.
                </ActionDescription>
              </ActionContent>
              <Link href="/submit" passHref legacyBehavior>
                <ActionButton $color="#22c55e">Edit Submission</ActionButton>
              </Link>
            </NextStepContent>
          </NextStepCard>
        )}

        {/* Coming Up Section */}
        {nextStep !== 'done' && (
          <ComingUpCard>
            <ComingUpTitle>COMING UP</ComingUpTitle>
            <ComingUpList>
              {nextStep === 'discord' && (
                <>
                  <ComingUpItem $done={false}>Set up your team</ComingUpItem>
                  <ComingUpItem $done={false}>Submit your project</ComingUpItem>
                </>
              )}
              {nextStep === 'team' && (
                <ComingUpItem $done={false}>Submit your project</ComingUpItem>
              )}
            </ComingUpList>
          </ComingUpCard>
        )}

        {/* Team Section */}
        <TeamStatusCard>
          <TeamStatusHeader>
            <TeamStatusTitle>YOUR TEAM</TeamStatusTitle>
            {hasTeam ? (
              <TeamBadge $hasTeam>TEAM READY</TeamBadge>
            ) : (
              <TeamBadge $hasTeam={false}>NO TEAM YET</TeamBadge>
            )}
          </TeamStatusHeader>
          <TeamStatusContent>
            {hasTeam ? (
              <p>
                You&apos;re part of a team.{' '}
                <Link href="/team">Manage your team →</Link>
              </p>
            ) : (
              <p>
                Going solo works too!{' '}
                <Link href="/team">Create or join a team →</Link>
              </p>
            )}
          </TeamStatusContent>
        </TeamStatusCard>

        <TracksSection />

        <DiscordSection
          isVerified={discordVerification.isVerified}
          discordUsername={discordVerification.discordUsername}
          isLoading={discordVerification.isLoading}
        />
      </PortalContainer>
    );
  }

  // FINALIST: RSVP decision view
  if (user.applicationStatus === ApplicationStatus.FINALIST) {
    return (
      <PortalContainer>
        <WelcomeBanner $celebratory>
          <WelcomeText>
            <span className="trophy">🏆</span>
            <span className="name">Congratulations, {user.firstName}!</span>
          </WelcomeText>
          <WelcomeSubtext>
            Your project stood out among hundreds of submissions. You&apos;ve
            been selected for the <strong>National Finals</strong>!
          </WelcomeSubtext>
        </WelcomeBanner>

        <EventDetailsCard>
          <EventDetailsTitle>NATIONAL FINALS</EventDetailsTitle>
          <EventDetailsPlaceholder>
            Event details coming soon. Stay tuned!
          </EventDetailsPlaceholder>
        </EventDetailsCard>

        <ActionCard $accent="#FFD700">
          <ActionIconWrapper $bg="#FFF9E0">
            <FaTrophy />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>Confirm Your Spot</ActionTitle>
            <ActionDescription>
              Please let us know if you can attend the national finals.
            </ActionDescription>
          </ActionContent>
          <RSVPButtonGroup>
            <SecondaryButton
              as="button"
              type="button"
              onClick={() => onRSVP?.('DECLINE')}
            >
              Can&apos;t Make It
            </SecondaryButton>
            <ActionButton
              as="button"
              type="button"
              $color="#2D6A4F"
              onClick={() => onRSVP?.('ACCEPT')}
            >
              Count Me In!
            </ActionButton>
          </RSVPButtonGroup>
        </ActionCard>
      </PortalContainer>
    );
  }

  // CONFIRMED: Prep view
  if (user.applicationStatus === ApplicationStatus.CONFIRMED) {
    return (
      <PortalContainer>
        <WelcomeBanner $celebratory>
          <WelcomeText>
            <span className="check">✅</span>
            <span className="name">See you at the finals!</span>
          </WelcomeText>
          <WelcomeSubtext>
            Your spot is confirmed. We can&apos;t wait to see what you build!
          </WelcomeSubtext>
        </WelcomeBanner>

        <EventDetailsCard>
          <EventDetailsTitle>PREPARE FOR THE FINALS</EventDetailsTitle>
          <EventDetailsPlaceholder>
            Event details and preparation checklist coming soon.
          </EventDetailsPlaceholder>
        </EventDetailsCard>

        {hasTeam && (
          <TeamStatusCard>
            <TeamStatusHeader>
              <TeamStatusTitle>YOUR TEAM</TeamStatusTitle>
            </TeamStatusHeader>
            <TeamStatusContent>
              <p>
                <Link href="/team">View your team →</Link>
              </p>
            </TeamStatusContent>
          </TeamStatusCard>
        )}

        <DiscordSection
          isVerified={discordVerification.isVerified}
          discordUsername={discordVerification.discordUsername}
          isLoading={discordVerification.isLoading}
        />
      </PortalContainer>
    );
  }

  // DECLINED: Graceful exit
  if (user.applicationStatus === ApplicationStatus.DECLINED) {
    return (
      <PortalContainer>
        <ActionCard $accent="#6C757D">
          <ActionIconWrapper $bg="#F5F5F5">
            <FaXmark />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>We&apos;ll miss you at the finals</ActionTitle>
            <ActionDescription>
              Thanks for participating in the online round. Your project was
              impressive! We hope to see you at future events.
            </ActionDescription>
          </ActionContent>
        </ActionCard>

        <StayConnectedCard>
          <StayConnectedTitle>Stay Connected</StayConnectedTitle>
          <StayConnectedText>
            Changed your mind? Spots may still be available.
          </StayConnectedText>
          <StayConnectedLinks>
            <ActionButton
              as="a"
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              $color="#5865F2"
            >
              Join Discord
            </ActionButton>
            <ActionButton
              as="a"
              href="mailto:redbrickhacks@ashoka.edu.in"
              $color="#666"
            >
              Contact Us
            </ActionButton>
          </StayConnectedLinks>
        </StayConnectedCard>
      </PortalContainer>
    );
  }

  // NOT_SELECTED: Soft landing
  if (user.applicationStatus === ApplicationStatus.NOT_SELECTED) {
    return (
      <PortalContainer>
        <ActionCard $accent="#9D0208">
          <ActionIconWrapper $bg="#FFEBEE">
            <FaHeartCrack />
          </ActionIconWrapper>
          <ActionContent>
            <ActionTitle>Thanks for participating</ActionTitle>
            <ActionDescription>
              The online round was incredibly competitive this year. While you
              weren&apos;t selected for the finals, your submission showed real
              promise.
            </ActionDescription>
          </ActionContent>
        </ActionCard>

        <StayConnectedCard>
          <StayConnectedTitle>Keep Building</StayConnectedTitle>
          <StayConnectedText>
            Continue developing your project and join us for future events!
          </StayConnectedText>
          <StayConnectedLinks>
            <ActionButton
              as="a"
              href={discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              $color="#5865F2"
            >
              Join Discord
            </ActionButton>
          </StayConnectedLinks>
        </StayConnectedCard>
      </PortalContainer>
    );
  }

  // Fallback
  return (
    <PortalContainer>
      <WelcomeBanner>
        <WelcomeText>
          <span className="name">Welcome, {user.firstName}</span>
        </WelcomeText>
      </WelcomeBanner>
    </PortalContainer>
  );
}

export default NeoHackerPortal;

// Simple Devpost icon
function DevpostIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M6.002 1.61L0 12.004L6.002 22.39h11.996L24 12.004L17.998 1.61H6.002zm1.593 4.084h3.947c3.605 0 6.276 1.695 6.276 6.31c0 4.436-3.21 6.302-6.456 6.302H7.595V5.694zm2.517 2.449v7.714h1.241c2.646 0 3.862-1.55 3.862-3.861c.009-2.569-1.096-3.853-3.767-3.853h-1.336z" />
    </svg>
  );
}

// Styled Components

const PortalContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const WelcomeBanner = styled.div<{ $celebratory?: boolean }>`
  background: ${(p) => (p.$celebratory ? '#FFF9E0' : '#fffdf7')};
  border: 3px solid #000;
  box-shadow: 6px 6px 0 #000;
  padding: 2rem;
  position: relative;
  overflow: hidden;

  ${(p) =>
    !p.$celebratory &&
    `
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
  `}
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
`;

const WelcomeText = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;

  .hey {
    color: #666;
    font-weight: 400;
  }

  .name {
    color: #ff5c5c;
  }

  .trophy,
  .check {
    font-size: 1.5rem;
  }

  @media (max-width: 600px) {
    font-size: 1.5rem;
  }
`;

const WelcomeSubtext = styled.p`
  font-size: 1.1rem;
  color: #444;
  margin: 0;
  line-height: 1.6;
  position: relative;
  z-index: 1;

  strong {
    color: #000;
  }
`;

const CountdownWrapper = styled.div`
  margin-top: 1.5rem;
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

const SecondaryButton = styled.button`
  background: #fff;
  color: #666;
  border: 2px solid #000;
  box-shadow: 3px 3px 0 #000;
  padding: 0.75rem 1.5rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.1s ease;
  white-space: nowrap;
  font-family: inherit;

  &:hover {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #000;
    background: #f5f5f5;
  }

  &:active {
    transform: translate(3px, 3px);
    box-shadow: none;
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 600px) {
    width: 100%;
    flex-direction: column;
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

const PrerequisitesCard = styled.div`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 1.5rem;
`;

const PrerequisitesTitle = styled.h3`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem 0;
  color: #666;
`;

const PrerequisitesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PrerequisiteItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PrerequisiteIcon = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(p) => p.$color || '#333'};
  color: #fff;
  font-size: 1.25rem;
  flex-shrink: 0;
`;

const PrerequisiteText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;

  strong {
    font-weight: 600;
    color: #000;
  }

  span {
    font-size: 0.875rem;
    color: #666;
  }
`;

const NextStepCard = styled.div<{ $accent: string }>`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 6px 6px 0 ${(p) => p.$accent};
  padding: 1.5rem;
`;

const NextStepLabel = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #666;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px dashed #ddd;
`;

const NextStepContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }
`;

const SkipLink = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.875rem;
  color: #666;

  a {
    color: #666;
    text-decoration: underline;

    &:hover {
      color: #333;
    }
  }
`;

const ComingUpCard = styled.div`
  background: #fafafa;
  border: 2px dashed #ccc;
  padding: 1rem 1.25rem;
`;

const ComingUpTitle = styled.h4`
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #999;
  margin: 0 0 0.75rem 0;
`;

const ComingUpList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ComingUpItem = styled.li<{ $done: boolean }>`
  font-size: 0.875rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '○';
    font-size: 0.625rem;
  }
`;

const TeamStatusCard = styled.div`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 1.25rem;
`;

const TeamStatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const TeamStatusTitle = styled.h3`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
`;

const TeamBadge = styled.span<{ $hasTeam: boolean }>`
  font-family: 'Space Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  background: ${(p) => (p.$hasTeam ? '#22c55e' : '#f59e0b')};
  color: #fff;
  letter-spacing: 0.05em;
`;

const TeamStatusContent = styled.div`
  p {
    margin: 0;
    color: #555;
    font-size: 0.9rem;

    a {
      color: #0077b6;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const EventDetailsCard = styled.div`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #ffd700;
  padding: 1.5rem;
`;

const EventDetailsTitle = styled.h3`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem 0;
`;

const EventDetailsPlaceholder = styled.p`
  margin: 0;
  color: #666;
  font-style: italic;
`;

const StayConnectedCard = styled.div`
  background: #fff;
  border: 3px solid #000;
  box-shadow: 4px 4px 0 #000;
  padding: 1.5rem;
`;

const StayConnectedTitle = styled.h3`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
`;

const StayConnectedText = styled.p`
  margin: 0 0 1rem 0;
  color: #555;
`;

const StayConnectedLinks = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;
