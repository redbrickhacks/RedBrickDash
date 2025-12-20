import styled from 'styled-components';
import { FaCheck, FaCircle } from 'react-icons/fa6';
import { ApplicationStatus } from '@hibiscus/types';

interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface ProgressTrackerProps {
  applicationStatus: ApplicationStatus;
  isDiscordVerified: boolean;
  hasTeam: boolean;
  hasSubmitted: boolean;
}

function getStepsForNotApplied(): ProgressStep[] {
  return [
    {
      id: 'github',
      label: 'Create GitHub account',
      completed: false,
      current: false,
    },
    {
      id: 'devpost',
      label: 'Create Devpost account',
      completed: false,
      current: false,
    },
    {
      id: 'discord',
      label: 'Join Discord server',
      completed: false,
      current: false,
    },
    {
      id: 'profile',
      label: 'Complete your profile',
      completed: false,
      current: true,
    },
  ];
}

function getStepsForRegistered(
  isDiscordVerified: boolean,
  hasTeam: boolean,
  hasSubmitted: boolean
): ProgressStep[] {
  const discordComplete = isDiscordVerified;
  const teamComplete = hasTeam;
  const submissionComplete = hasSubmitted;

  // Determine current step (first incomplete step)
  let currentStep = 'discord';
  if (discordComplete && !teamComplete) currentStep = 'team';
  else if (discordComplete && teamComplete && !submissionComplete)
    currentStep = 'submit';
  else if (submissionComplete) currentStep = 'done';

  return [
    {
      id: 'profile',
      label: 'Profile complete',
      completed: true,
      current: false,
    },
    {
      id: 'discord',
      label: 'Discord verified',
      completed: discordComplete,
      current: currentStep === 'discord',
    },
    {
      id: 'team',
      label: 'Team ready / Going solo',
      completed: teamComplete,
      current: currentStep === 'team',
    },
    {
      id: 'submit',
      label: 'Project submitted',
      completed: submissionComplete,
      current: currentStep === 'submit',
    },
  ];
}

export function ProgressTracker({
  applicationStatus,
  isDiscordVerified,
  hasTeam,
  hasSubmitted,
}: ProgressTrackerProps) {
  // Only show progress for NOT_APPLIED and REGISTERED users
  if (
    applicationStatus !== ApplicationStatus.NOT_APPLIED &&
    applicationStatus !== ApplicationStatus.REGISTERED
  ) {
    return null;
  }

  const steps =
    applicationStatus === ApplicationStatus.NOT_APPLIED
      ? getStepsForNotApplied()
      : getStepsForRegistered(isDiscordVerified, hasTeam, hasSubmitted);

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <Container>
      <Header>
        <Title>YOUR PROGRESS</Title>
        <ProgressBadge>
          {completedCount}/{steps.length}
        </ProgressBadge>
      </Header>

      <ProgressBarContainer>
        <ProgressBarFill style={{ width: `${progressPercent}%` }} />
      </ProgressBarContainer>

      <StepsList>
        {steps.map((step) => (
          <StepItem
            key={step.id}
            $completed={step.completed}
            $current={step.current}
          >
            <StepIcon $completed={step.completed} $current={step.current}>
              {step.completed ? <FaCheck size={12} /> : <FaCircle size={8} />}
            </StepIcon>
            <StepLabel $completed={step.completed} $current={step.current}>
              {step.label}
            </StepLabel>
            {step.current && <CurrentBadge>NEXT</CurrentBadge>}
          </StepItem>
        ))}
      </StepsList>
    </Container>
  );
}

const Container = styled.div`
  background: #fff;
  border: 3px solid #000;
  padding: 1.25rem;
  box-shadow: 6px 6px 0px #000;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: #000;
  margin: 0;
  letter-spacing: 0.05em;
`;

const ProgressBadge = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  background: #000;
  color: #fff;
  padding: 0.25rem 0.5rem;
`;

const ProgressBarContainer = styled.div`
  height: 8px;
  background: #e0e0e0;
  border: 2px solid #000;
  margin-bottom: 1rem;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: #ff6347;
  transition: width 0.3s ease;
`;

const StepsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StepItem = styled.li<{ $completed: boolean; $current: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  opacity: ${(props) => (props.$completed ? 1 : props.$current ? 1 : 0.5)};
`;

const StepIcon = styled.span<{ $completed: boolean; $current: boolean }>`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid
    ${(props) =>
      props.$completed ? '#22c55e' : props.$current ? '#ff6347' : '#ccc'};
  background: ${(props) => (props.$completed ? '#22c55e' : 'transparent')};
  color: ${(props) =>
    props.$completed ? '#fff' : props.$current ? '#ff6347' : '#ccc'};
`;

const StepLabel = styled.span<{ $completed: boolean; $current: boolean }>`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: ${(props) => (props.$current ? 700 : 400)};
  color: ${(props) => (props.$completed ? '#22c55e' : '#000')};
  text-decoration: ${(props) => (props.$completed ? 'line-through' : 'none')};
  flex: 1;
`;

const CurrentBadge = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  background: #ff6347;
  color: #fff;
  padding: 0.125rem 0.375rem;
  letter-spacing: 0.05em;
`;

export default ProgressTracker;
