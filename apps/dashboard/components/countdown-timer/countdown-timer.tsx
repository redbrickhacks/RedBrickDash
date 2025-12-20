import { useState, useEffect } from 'react';
import styled from 'styled-components';

interface CountdownTimerProps {
  deadline: Date;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calculateTimeLeft(deadline: Date): TimeLeft {
  const now = new Date().getTime();
  const target = deadline.getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    isExpired: false,
  };
}

export function CountdownTimer({ deadline, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(deadline)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(deadline);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.isExpired) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <Container $expired>
        <ExpiredText>SUBMISSIONS CLOSED</ExpiredText>
      </Container>
    );
  }

  return (
    <Container>
      <Label>TIME REMAINING</Label>
      <TimerGrid>
        <TimeBlock>
          <TimeValue>{String(timeLeft.days).padStart(2, '0')}</TimeValue>
          <TimeLabel>DAYS</TimeLabel>
        </TimeBlock>
        <Separator>:</Separator>
        <TimeBlock>
          <TimeValue>{String(timeLeft.hours).padStart(2, '0')}</TimeValue>
          <TimeLabel>HRS</TimeLabel>
        </TimeBlock>
        <Separator>:</Separator>
        <TimeBlock>
          <TimeValue>{String(timeLeft.minutes).padStart(2, '0')}</TimeValue>
          <TimeLabel>MIN</TimeLabel>
        </TimeBlock>
        <Separator>:</Separator>
        <TimeBlock>
          <TimeValue>{String(timeLeft.seconds).padStart(2, '0')}</TimeValue>
          <TimeLabel>SEC</TimeLabel>
        </TimeBlock>
      </TimerGrid>
    </Container>
  );
}

const Container = styled.div<{ $expired?: boolean }>`
  background: ${(props) => (props.$expired ? '#1a1a1a' : '#000')};
  border: 3px solid #000;
  padding: 1rem 1.5rem;
  display: inline-block;
  box-shadow: 4px 4px 0px #000;
`;

const Label = styled.div`
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ff6347;
  margin-bottom: 0.5rem;
  letter-spacing: 0.1em;
`;

const TimerGrid = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const TimeBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TimeValue = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 1.75rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const TimeLabel = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  font-weight: 400;
  color: #888;
  letter-spacing: 0.05em;
`;

const Separator = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff6347;
  margin-bottom: 0.75rem;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const ExpiredText = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #ff6347;
  letter-spacing: 0.1em;
`;

export default CountdownTimer;
