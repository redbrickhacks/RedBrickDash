import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  NeoModal,
  NeoButton,
  neoColors,
  neoBorders,
  neoShadows,
} from '../neo-ui';
import type { StampType } from './StampTable';

interface StampPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onGiveStamp: (stampTypeId: number) => Promise<void>;
  recipientName: string;
}

const StampGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin: 1rem 0;

  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const StampOption = styled.button<{ $selected: boolean }>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: ${({ $selected }) =>
    $selected ? neoColors.accent.yellow : neoColors.surface};
  border: ${({ $selected }) =>
    $selected ? neoBorders.thick : neoBorders.standard};
  box-shadow: ${({ $selected }) =>
    $selected ? neoShadows.medium : neoShadows.small};
  cursor: pointer;
  transition: all 0.1s ease;
  padding: 8px;

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0 #000;
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: none;
  }
`;

const StampEmoji = styled.span`
  font-size: 1.75rem;
`;

const StampName = styled.span`
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
  text-align: center;
  line-height: 1.1;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${neoColors.textMuted};
  margin: 0 0 1rem 0;
`;

const SelectedInfo = styled.div`
  background: ${neoColors.background};
  border: ${neoBorders.standard};
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SelectedEmoji = styled.span`
  font-size: 2rem;
`;

const SelectedDetails = styled.div`
  flex: 1;
`;

const SelectedName = styled.div`
  font-weight: 700;
`;

const SelectedDesc = styled.div`
  font-size: 0.75rem;
  color: ${neoColors.textMuted};
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${neoColors.textMuted};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: ${neoColors.status.error};
  background: #fff0f0;
  border: ${neoBorders.standard};
  margin-bottom: 1rem;
`;

export function StampPicker({
  isOpen,
  onClose,
  onGiveStamp,
  recipientName,
}: StampPickerProps) {
  const [stampTypes, setStampTypes] = useState<StampType[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<StampType | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStampTypes();
    }
  }, [isOpen]);

  async function fetchStampTypes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stamps/types');
      if (!res.ok) throw new Error('Failed to load stamps');
      const data = await res.json();
      // Filter out system-only stamps
      const available = data.filter(
        (s: StampType & { is_system_only?: boolean }) => !s.is_system_only
      );
      setStampTypes(available);
    } catch (e) {
      setError('Failed to load stamps. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGive() {
    if (!selectedStamp) return;

    setSending(true);
    setError(null);
    try {
      await onGiveStamp(selectedStamp.id);
      setSelectedStamp(null);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to give stamp');
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setSelectedStamp(null);
    setError(null);
    onClose();
  }

  return (
    <NeoModal isOpen={isOpen} onClose={handleClose} title="Give a Stamp">
      <Description>Pick a stamp to give to {recipientName}</Description>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingMessage>Loading stamps...</LoadingMessage>
      ) : (
        <>
          <StampGrid>
            {stampTypes.map((stamp) => (
              <StampOption
                key={stamp.id}
                $selected={selectedStamp?.id === stamp.id}
                onClick={() => setSelectedStamp(stamp)}
                type="button"
              >
                <StampEmoji>{stamp.emoji}</StampEmoji>
                <StampName>{stamp.name}</StampName>
              </StampOption>
            ))}
          </StampGrid>

          {selectedStamp && (
            <SelectedInfo>
              <SelectedEmoji>{selectedStamp.emoji}</SelectedEmoji>
              <SelectedDetails>
                <SelectedName>{selectedStamp.name}</SelectedName>
                <SelectedDesc>{selectedStamp.description}</SelectedDesc>
              </SelectedDetails>
            </SelectedInfo>
          )}

          <Actions>
            <NeoButton variant="secondary" onClick={handleClose}>
              Cancel
            </NeoButton>
            <NeoButton
              onClick={handleGive}
              disabled={!selectedStamp || sending}
            >
              {sending ? 'Giving...' : 'Give Stamp'}
            </NeoButton>
          </Actions>
        </>
      )}
    </NeoModal>
  );
}

export default StampPicker;
