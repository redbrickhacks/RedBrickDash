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
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = `https://sso.redbrickhacks.co/signup?ref=${referralCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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
          Share your code and win Amazon gift cards! Top 25 referrers get INR
          1500 each. Referrals count once they complete their profile.
        </Description>
        <CopyRow>
          <CopyItem>
            <CopyLabel>YOUR CODE</CopyLabel>
            <CodeBox onClick={handleCopyCode} $copied={copiedCode}>
              <CodeText>{referralCode}</CodeText>
              <CopyIcon>
                {copiedCode ? <FaCheck size={12} /> : <FaCopy size={12} />}
              </CopyIcon>
            </CodeBox>
          </CopyItem>
          <CopyItem $grow>
            <CopyLabel>OR SHARE LINK</CopyLabel>
            <LinkBox onClick={handleCopyLink} $copied={copiedLink}>
              <LinkText>{referralLink}</LinkText>
              <CopyIcon>
                {copiedLink ? <FaCheck size={12} /> : <FaCopy size={12} />}
              </CopyIcon>
            </LinkBox>
          </CopyItem>
        </CopyRow>
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

const CopyRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CopyItem = styled.div<{ $grow?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  ${(props) => props.$grow && 'flex: 1; min-width: 0;'}
`;

const CopyLabel = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.6);
  letter-spacing: 0.1em;
`;

const CodeBox = styled.button<{ $copied: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${(props) => (props.$copied ? '#22c55e' : '#000')};
  border: 2px solid #000;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${(props) => (props.$copied ? '#16a34a' : '#333')};
  }
`;

const CodeText = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.1em;
`;

const LinkBox = styled.button<{ $copied: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: ${(props) =>
    props.$copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.9)'};
  border: 2px solid ${(props) => (props.$copied ? '#22c55e' : '#000')};
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;

  &:hover {
    background: ${(props) =>
      props.$copied ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255, 255, 255, 1)'};
  }
`;

const LinkText = styled.code`
  flex: 1;
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  color: #000;
  word-break: break-all;
`;

const CopyIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  flex-shrink: 0;
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
