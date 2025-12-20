import styled from 'styled-components';
import { FaDiscord, FaCheck } from 'react-icons/fa6';
import { getEnv } from '@hibiscus/env';

interface DiscordSectionProps {
  isVerified: boolean;
  discordUsername: string | null;
  isLoading: boolean;
}

export function DiscordSection({
  isVerified,
  discordUsername,
  isLoading,
}: DiscordSectionProps) {
  const discordInviteUrl = getEnv().Hibiscus.Discord.InviteUrl;

  if (isLoading) {
    return (
      <Container $verified={false}>
        <IconWrapper $verified={false}>
          <FaDiscord size={28} />
        </IconWrapper>
        <Content>
          <Title>DISCORD</Title>
          <Description>Checking verification status...</Description>
        </Content>
      </Container>
    );
  }

  if (isVerified) {
    return (
      <Container $verified={true}>
        <IconWrapper $verified={true}>
          <FaCheck size={24} />
        </IconWrapper>
        <Content>
          <Title>DISCORD CONNECTED</Title>
          <Description>
            Verified as <Username>@{discordUsername || 'Unknown'}</Username>
          </Description>
        </Content>
        <VerifiedBadge>VERIFIED</VerifiedBadge>
      </Container>
    );
  }

  return (
    <Container $verified={false}>
      <IconWrapper $verified={false}>
        <FaDiscord size={28} />
      </IconWrapper>
      <Content>
        <Title>JOIN OUR DISCORD</Title>
        <Description>
          Connect with other hackers, get support, and stay updated
        </Description>
      </Content>
      <JoinButton
        href={discordInviteUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        JOIN SERVER
      </JoinButton>
    </Container>
  );
}

const Container = styled.div<{ $verified: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: ${(props) => (props.$verified ? '#22c55e' : '#5865F2')};
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;

  @media (max-width: 480px) {
    flex-wrap: wrap;
  }
`;

const IconWrapper = styled.div<{ $verified: boolean }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  flex-shrink: 0;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h3`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 0.25rem 0;
  letter-spacing: 0.05em;
`;

const Description = styled.p`
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
`;

const Username = styled.span`
  font-weight: 700;
  color: #fff;
`;

const JoinButton = styled.a`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #fff;
  color: #5865f2;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: none;
  border: 2px solid #000;
  letter-spacing: 0.05em;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  white-space: nowrap;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 2px 2px 0px #000;
  }

  &:active {
    transform: translate(0, 0);
    box-shadow: none;
  }
`;

const VerifiedBadge = styled.span`
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  white-space: nowrap;
`;

export default DiscordSection;
