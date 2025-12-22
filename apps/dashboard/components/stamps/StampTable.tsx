import React, { useState } from 'react';
import styled from 'styled-components';
import { neoColors, neoBorders, neoShadows } from '../neo-ui/theme';

export interface StampType {
  id: number;
  name: string;
  emoji: string;
  description: string;
}

export interface StampGiver {
  user_id: string;
  first_name: string;
  last_name: string;
}

export interface Stamp {
  id: string;
  slot_position: number;
  is_system_gift: boolean;
  message: string | null;
  created_at: string;
  stamp_type: StampType;
  giver: StampGiver | null;
}

interface StampTableProps {
  stamps: Stamp[];
  ownerName?: string;
  showEmptyHint?: boolean;
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 240px;
`;

const Slot = styled.div<{ $filled: boolean }>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $filled }) =>
    $filled ? neoColors.surface : neoColors.background};
  border: ${neoBorders.standard};
  box-shadow: ${({ $filled }) =>
    $filled ? neoShadows.small : 'inset 1px 1px 3px rgba(0,0,0,0.1)'};
  font-size: 2rem;
  cursor: ${({ $filled }) => ($filled ? 'pointer' : 'default')};
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  position: relative;

  &:hover {
    ${({ $filled }) =>
      $filled &&
      `
      transform: translate(1px, 1px);
      box-shadow: 2px 2px 0 #000;
    `}
  }
`;

const EmptySlotIcon = styled.span`
  color: #ddd;
  font-size: 1.5rem;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  box-shadow: ${neoShadows.small};
  padding: 0.5rem 0.75rem;
  min-width: 160px;
  z-index: 100;
  pointer-events: none;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #000;
  }
`;

const TooltipTitle = styled.div`
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 4px;
`;

const TooltipFrom = styled.div`
  font-size: 0.75rem;
  color: ${neoColors.textMuted};
`;

const TooltipMessage = styled.div`
  font-size: 0.75rem;
  font-style: italic;
  margin-top: 4px;
  color: ${neoColors.text};
`;

const TooltipDate = styled.div`
  font-size: 0.625rem;
  color: ${neoColors.textLight};
  margin-top: 4px;
`;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

function StampSlot({ stamp }: { stamp: Stamp | null }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!stamp) {
    return (
      <Slot $filled={false}>
        <EmptySlotIcon>+</EmptySlotIcon>
      </Slot>
    );
  }

  const giverName = stamp.is_system_gift
    ? 'RedBrick Hacks'
    : stamp.giver
    ? `${stamp.giver.first_name} ${stamp.giver.last_name}`
    : 'Someone';

  return (
    <Slot
      $filled={true}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {stamp.stamp_type.emoji}
      {showTooltip && (
        <Tooltip>
          <TooltipTitle>
            {stamp.stamp_type.emoji} {stamp.stamp_type.name}
          </TooltipTitle>
          <TooltipFrom>From: {giverName}</TooltipFrom>
          {stamp.message && <TooltipMessage>"{stamp.message}"</TooltipMessage>}
          <TooltipDate>{formatDate(stamp.created_at)}</TooltipDate>
        </Tooltip>
      )}
    </Slot>
  );
}

export function StampTable({
  stamps,
  ownerName,
  showEmptyHint = false,
}: StampTableProps) {
  // Create a 9-slot array, mapping stamps to their positions
  const slots: (Stamp | null)[] = Array(9).fill(null);
  stamps.forEach((stamp) => {
    if (stamp.slot_position >= 0 && stamp.slot_position < 9) {
      slots[stamp.slot_position] = stamp;
    }
  });

  const isEmpty = stamps.length === 0;

  return (
    <Container>
      <Header>
        <TableLabel>
          {ownerName ? `${ownerName}'s collection` : 'Stamps'}
        </TableLabel>
      </Header>
      <Grid>
        {slots.map((stamp, index) => (
          <StampSlot key={index} stamp={stamp} />
        ))}
      </Grid>
      {isEmpty && showEmptyHint && (
        <EmptyHint>No stamps yet. Be the first to send one!</EmptyHint>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TableLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${neoColors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmptyHint = styled.div`
  font-size: 0.75rem;
  color: ${neoColors.textLight};
  margin-top: 4px;
`;

export default StampTable;
