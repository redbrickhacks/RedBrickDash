import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaTrash } from 'react-icons/fa6';
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
  isOwnCollection?: boolean;
  onDeleteStamp?: (stampId: string) => void;
}

const Strip = styled.div`
  display: flex;
  gap: 4px;
`;

const Slot = styled.div<{ $filled: boolean }>`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $filled }) =>
    $filled ? neoColors.surface : neoColors.background};
  border: ${neoBorders.standard};
  box-shadow: ${({ $filled }) =>
    $filled ? neoShadows.small : 'inset 1px 1px 2px rgba(0,0,0,0.08)'};
  font-size: 1rem;
  cursor: ${({ $filled }) => ($filled ? 'pointer' : 'default')};
  transition: transform 0.1s ease, box-shadow 0.1s ease;
  position: relative;

  &:hover {
    ${({ $filled }) =>
      $filled &&
      `
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 #000;
    `}
  }
`;

const TooltipWrapper = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding-bottom: 6px;
  z-index: 100;
`;

const Tooltip = styled.div`
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  box-shadow: ${neoShadows.small};
  padding: 0.375rem 0.5rem;
  min-width: 120px;
  max-width: 160px;
  white-space: nowrap;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #000;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: ${neoColors.textMuted};
  font-size: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;

  &:hover {
    color: ${neoColors.status.error};
    background: #fff0f0;
  }
`;

const TooltipTitle = styled.div`
  font-weight: 700;
  font-size: 0.75rem;
  margin-bottom: 2px;
`;

const TooltipFrom = styled.div`
  font-size: 0.625rem;
  color: ${neoColors.textMuted};
`;

const TooltipMessage = styled.div`
  font-size: 0.625rem;
  font-style: italic;
  margin-top: 2px;
  color: ${neoColors.text};
`;

const TooltipDate = styled.div`
  font-size: 0.5rem;
  color: ${neoColors.textLight};
  margin-top: 2px;
`;

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

interface StampSlotProps {
  stamp: Stamp | null;
  canDelete?: boolean;
  onDelete?: () => void;
}

function StampSlot({ stamp, canDelete, onDelete }: StampSlotProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!stamp) {
    return <Slot $filled={false} />;
  }

  const giverName = stamp.is_system_gift
    ? 'RedBrick Hacks'
    : stamp.giver
    ? `${stamp.giver.first_name} ${stamp.giver.last_name}`
    : 'Someone';

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <Slot
      $filled={true}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {stamp.stamp_type.emoji}
      {showTooltip && (
        <TooltipWrapper
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Tooltip>
            {canDelete && (
              <DeleteButton onClick={handleDelete} title="Remove stamp">
                <FaTrash />
              </DeleteButton>
            )}
            <TooltipTitle>
              {stamp.stamp_type.emoji} {stamp.stamp_type.name}
            </TooltipTitle>
            <TooltipFrom>From: {giverName}</TooltipFrom>
            {stamp.message && (
              <TooltipMessage>"{stamp.message}"</TooltipMessage>
            )}
            <TooltipDate>{formatDate(stamp.created_at)}</TooltipDate>
          </Tooltip>
        </TooltipWrapper>
      )}
    </Slot>
  );
}

export function StampTable({
  stamps,
  ownerName,
  showEmptyHint = false,
  isOwnCollection = false,
  onDeleteStamp,
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
      <Strip>
        {slots.map((stamp, index) => (
          <StampSlot
            key={index}
            stamp={stamp}
            canDelete={isOwnCollection && !!onDeleteStamp}
            onDelete={
              stamp && onDeleteStamp ? () => onDeleteStamp(stamp.id) : undefined
            }
          />
        ))}
      </Strip>
      {isEmpty && showEmptyHint && (
        <EmptyHint>No stamps yet. Be the first to send one!</EmptyHint>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const TableLabel = styled.div`
  font-size: 0.625rem;
  font-weight: 600;
  color: ${neoColors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EmptyHint = styled.div`
  font-size: 0.625rem;
  color: ${neoColors.textLight};
  margin-top: 2px;
`;

export default StampTable;
