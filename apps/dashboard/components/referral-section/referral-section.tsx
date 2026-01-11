import { useState } from 'react';
import styled from 'styled-components';
import { FaGift, FaCheck, FaCopy } from 'react-icons/fa6';

interface ReferralSectionProps {
  referralCode: string;
  referralCount: number;
}

export function ReferralSection({
  referralCode,
  referralCount,
}: ReferralSectionProps) {
  const [copied, setCopied] = useState(false);

  const referralLink = `https://sso.redbrickhacks.co/signup?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Container>
      <IconWrapper>
        <FaGift size={28} />
      </IconWrapper>
      <Content>
        <Title>REFER & WIN</Title>
        <Description>
          Share your link and win Amazon gift cards! Top 25 referrers get INR
          1500 each. Referrals count once they complete their profile.
        </Description>
        <ReferralLinkBox>
          <ReferralLink>{referralLink}</ReferralLink>
          <CopyButton onClick={handleCopy} $copied={copied}>
            {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
            {copied ? 'COPIED!' : 'COPY'}
          </CopyButton>
        </ReferralLinkBox>
      </Content>
      <StatsBox>
        <StatsNumber>{referralCount}</StatsNumber>
        <StatsLabel>REFERRALS</StatsLabel>
      </StatsBox>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: 3px solid #000;
  box-shadow: 4px 4px 0px #000;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  color: #000;
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
  color: #000;
  margin: 0 0 0.25rem 0;
  letter-spacing: 0.05em;
`;

const Description = styled.p`
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.8);
  margin: 0 0 0.75rem 0;
`;

const ReferralLinkBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem;
  border: 2px solid #000;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ReferralLink = styled.code`
  flex: 1;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  color: #000;
  word-break: break-all;
  padding: 0.25rem;
`;

const CopyButton = styled.button<{ $copied: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: ${(props) => (props.$copied ? '#22c55e' : '#000')};
  color: #fff;
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: all 0.15s ease;
  white-space: nowrap;

  &:hover {
    background: ${(props) => (props.$copied ? '#16a34a' : '#333')};
  }
`;

const StatsBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
  background: rgba(0, 0, 0, 0.1);
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
    flex-direction: row;
    gap: 0.5rem;
  }
`;

const StatsNumber = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 2rem;
  font-weight: 700;
  color: #000;
  line-height: 1;
`;

const StatsLabel = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
  letter-spacing: 0.1em;
`;

export default ReferralSection;
