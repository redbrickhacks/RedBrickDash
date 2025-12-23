import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  NeoModal,
  NeoButton,
  neoColors,
  neoBorders,
  neoShadows,
} from '../neo-ui';
import type { StampType, Stamp } from './StampTable';

interface StampPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onGiveStamp: (
    stampTypeId: number,
    replaceSlotPosition?: number
  ) => Promise<void>;
  recipientName: string;
  recipientStamps?: Stamp[];
  currentUserId?: string;
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

const StampOption = styled.button<{ $selected: boolean; $disabled?: boolean }>`
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: ${({ $selected, $disabled }) =>
    $disabled
      ? neoColors.background
      : $selected
      ? neoColors.accent.yellow
      : neoColors.surface};
  border: ${({ $selected }) =>
    $selected ? neoBorders.thick : neoBorders.standard};
  box-shadow: ${({ $selected, $disabled }) =>
    $disabled ? 'none' : $selected ? neoShadows.medium : neoShadows.small};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.1s ease;
  padding: 8px;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  &:hover {
    ${({ $disabled }) =>
      !$disabled &&
      `
      transform: translate(1px, 1px);
      box-shadow: 2px 2px 0 #000;
    `}
  }

  &:active {
    ${({ $disabled }) =>
      !$disabled &&
      `
      transform: translate(2px, 2px);
      box-shadow: none;
    `}
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

const SwapSection = styled.div`
  margin: 1rem 0;
`;

const SwapTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const SwapDescription = styled.p`
  font-size: 0.875rem;
  color: ${neoColors.textMuted};
  margin: 0 0 0.75rem 0;
`;

const SwapGrid = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const SwapSlot = styled.button<{ $selected: boolean }>`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $selected }) =>
    $selected ? neoColors.accent.red : neoColors.surface};
  border: ${({ $selected }) =>
    $selected ? neoBorders.thick : neoBorders.standard};
  box-shadow: ${({ $selected }) =>
    $selected ? neoShadows.medium : neoShadows.small};
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.1s ease;

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 2px 2px 0 #000;
  }
`;

const SwapSlotLabel = styled.div`
  font-size: 0.625rem;
  color: ${neoColors.textMuted};
  text-align: center;
  margin-top: 2px;
`;

const SwapSlotContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CollectionFullMessage = styled.div`
  text-align: center;
  padding: 1.5rem 1rem;
  background: ${neoColors.background};
  border: ${neoBorders.standard};
  margin: 1rem 0;
`;

const CollectionFullTitle = styled.div`
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const CollectionFullDesc = styled.p`
  font-size: 0.875rem;
  color: ${neoColors.textMuted};
  margin: 0;
`;

export function StampPicker({
  isOpen,
  onClose,
  onGiveStamp,
  recipientName,
  recipientStamps = [],
  currentUserId,
}: StampPickerProps) {
  const [stampTypes, setStampTypes] = useState<StampType[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<StampType | null>(null);
  const [selectedSwapSlot, setSelectedSwapSlot] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCollectionFull = recipientStamps.length >= 9;
  const recipientStampTypeIds = new Set(
    recipientStamps.map((s) => s.stamp_type.id)
  );

  // Stamps the current user gave (can be swapped)
  const userGivenStamps = recipientStamps.filter(
    (s) => s.giver?.user_id === currentUserId
  );
  const canSwap = userGivenStamps.length > 0;

  useEffect(() => {
    if (isOpen) {
      fetchStampTypes();
      setSelectedStamp(null);
      setSelectedSwapSlot(null);
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

  function handleStampSelect(stamp: StampType) {
    // Don't allow selecting stamps the recipient already has
    if (recipientStampTypeIds.has(stamp.id)) {
      return;
    }
    setSelectedStamp(stamp);
    setSelectedSwapSlot(null);
  }

  async function handleGive() {
    if (!selectedStamp) return;

    // If collection is full, must have selected a swap slot
    if (isCollectionFull && selectedSwapSlot === null) {
      setError('Please select a stamp to replace');
      return;
    }

    setSending(true);
    setError(null);
    try {
      await onGiveStamp(
        selectedStamp.id,
        isCollectionFull ? selectedSwapSlot : undefined
      );
      setSelectedStamp(null);
      setSelectedSwapSlot(null);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to give stamp');
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    setSelectedStamp(null);
    setSelectedSwapSlot(null);
    setError(null);
    onClose();
  }

  const needsSwap = isCollectionFull && selectedStamp !== null && canSwap;
  const collectionFullNoSwap = isCollectionFull && !canSwap;

  return (
    <NeoModal
      isOpen={isOpen}
      onClose={handleClose}
      title={needsSwap ? 'Choose Stamp to Replace' : 'Give a Stamp'}
    >
      {!needsSwap && (
        <Description>Pick a stamp to give to {recipientName}</Description>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingMessage>Loading stamps...</LoadingMessage>
      ) : collectionFullNoSwap ? (
        <>
          <CollectionFullMessage>
            <CollectionFullTitle>
              {recipientName}'s collection is full
            </CollectionFullTitle>
            <CollectionFullDesc>
              Let them know you'd like to send a stamp so they can make room.
            </CollectionFullDesc>
          </CollectionFullMessage>
          <Actions>
            <NeoButton onClick={handleClose}>Got it</NeoButton>
          </Actions>
        </>
      ) : needsSwap ? (
        <>
          <SelectedInfo>
            <SelectedEmoji>{selectedStamp.emoji}</SelectedEmoji>
            <SelectedDetails>
              <SelectedName>{selectedStamp.name}</SelectedName>
              <SelectedDesc>{selectedStamp.description}</SelectedDesc>
            </SelectedDetails>
          </SelectedInfo>

          <SwapSection>
            <SwapTitle>Replace one of your stamps</SwapTitle>
            <SwapDescription>
              Choose which of your stamps to replace. This can't be undone.
            </SwapDescription>
            <SwapGrid>
              {userGivenStamps.map((stamp) => (
                <SwapSlotContainer key={stamp.id}>
                  <SwapSlot
                    $selected={selectedSwapSlot === stamp.slot_position}
                    onClick={() => setSelectedSwapSlot(stamp.slot_position)}
                    type="button"
                    title={`${stamp.stamp_type.name}: ${stamp.stamp_type.description}`}
                  >
                    {stamp.stamp_type.emoji}
                  </SwapSlot>
                  <SwapSlotLabel>{stamp.stamp_type.name}</SwapSlotLabel>
                </SwapSlotContainer>
              ))}
            </SwapGrid>
          </SwapSection>

          <Actions>
            <NeoButton
              variant="secondary"
              onClick={() => {
                setSelectedStamp(null);
                setSelectedSwapSlot(null);
              }}
            >
              Back
            </NeoButton>
            <NeoButton
              variant="danger"
              onClick={handleGive}
              disabled={selectedSwapSlot === null || sending}
            >
              {sending ? 'Replacing...' : 'Replace Stamp'}
            </NeoButton>
          </Actions>
        </>
      ) : (
        <>
          <StampGrid>
            {stampTypes.map((stamp) => {
              const alreadyHas = recipientStampTypeIds.has(stamp.id);
              return (
                <StampOption
                  key={stamp.id}
                  $selected={selectedStamp?.id === stamp.id}
                  $disabled={alreadyHas}
                  onClick={() => handleStampSelect(stamp)}
                  type="button"
                  title={
                    alreadyHas
                      ? `${recipientName} already has this stamp`
                      : stamp.description
                  }
                >
                  <StampEmoji>{stamp.emoji}</StampEmoji>
                  <StampName>{stamp.name}</StampName>
                </StampOption>
              );
            })}
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
