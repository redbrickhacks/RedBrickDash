import styled from 'styled-components';
import { NeoCard } from '../neo-ui/NeoCard';
import { neoBorders, neoColors } from '../neo-ui/theme';

export const PageContainer = styled.div`
  max-width: 1050px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

export const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

export const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  text-transform: uppercase;
`;

export const PageSubtitle = styled.p`
  margin: 0.25rem 0 0;
  color: ${neoColors.textMuted};
  font-weight: 500;
  max-width: 55ch;
`;

export const CountdownChip = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  padding: 0.75rem 0.9rem;
  min-width: 220px;
`;

export const CountdownValue = styled.div`
  font-size: 1.05rem;
  font-weight: 900;
  margin-top: 0.15rem;
`;

export const CountdownHint = styled.div`
  font-size: 0.8rem;
  color: ${neoColors.textMuted};
  margin-top: 0.15rem;
`;

export const HeroBanner = styled(NeoCard).attrs({
  accent: neoColors.accent.yellow,
})`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const HeroMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const MetaItem = styled.div`
  background: ${neoColors.background};
  border: ${neoBorders.standard};
  padding: 0.75rem;
`;

export const MetaLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
  margin-bottom: 0.25rem;
`;

export const MetaValue = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.25;
`;

export const TwoColumn = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Card = styled(NeoCard)<{ accent?: string }>`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

export const FullWidthCard = styled(Card)`
  width: 100%;
`;

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
`;

export const CardSubtitle = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: ${neoColors.textMuted};
`;

export const SmallMuted = styled.div`
  font-size: 0.85rem;
  color: ${neoColors.textMuted};
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  border-top: ${neoBorders.standard};
`;

export const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const StatusBadge = styled.div<{
  $tone:
    | 'NOT_STARTED'
    | 'DRAFT'
    | 'SUBMITTED'
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED';
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border: ${neoBorders.standard};
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.75rem;
  background: ${({ $tone }) => {
    switch ($tone) {
      case 'APPROVED':
        return `${neoColors.status.success}22`;
      case 'REJECTED':
        return `${neoColors.status.error}22`;
      case 'UNDER_REVIEW':
        return `${neoColors.accent.yellow}55`;
      case 'SUBMITTED':
        return `${neoColors.accent.blue}22`;
      default:
        return `${neoColors.background}`;
    }
  }};
`;

export const EmbedShell = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  overflow: hidden;
`;

export const EmbedFrame = styled.iframe`
  width: 100%;
  height: 320px;
  border: 0;
  background: ${neoColors.background};
`;

export const OtpInline = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.background};
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

export const OtpInlineLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 900;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
`;

export const OtpInlineValue = styled.div`
  font-weight: 900;
  font-size: 1.6rem;
  letter-spacing: 0.08em;
  line-height: 1.1;
`;

export const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const MemberRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: ${neoBorders.standard};
  background: ${neoColors.background};
`;

export const MemberName = styled.div`
  font-weight: 900;
`;

export const MemberStatus = styled.div<{ $status: 'YES' | 'NO' | 'PENDING' }>`
  border: ${neoBorders.standard};
  font-weight: 900;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: ${({ $status }) =>
    $status === 'YES'
      ? `${neoColors.status.success}22`
      : $status === 'NO'
      ? `${neoColors.status.error}22`
      : `${neoColors.accent.yellow}55`};
`;

export const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const ThemeOption = styled.button<{ $selected: boolean }>`
  border: ${neoBorders.standard};
  background: ${({ $selected }) =>
    $selected ? `${neoColors.accent.yellow}55` : neoColors.background};
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${neoColors.accent.yellow}55;
  }
`;

export const ThemeSwatch = styled.div`
  width: 18px;
  height: 18px;
  border: ${neoBorders.standard};
  flex: 0 0 auto;
`;

export const ThemeName = styled.div`
  font-weight: 900;
  line-height: 1.2;
`;
