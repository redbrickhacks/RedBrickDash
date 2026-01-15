import React, { useState } from 'react';
import styled from 'styled-components';
import { NeoModal } from '../neo-ui/NeoModal';
import { NeoButton } from '../neo-ui/NeoButton';
import { neoColors } from '../neo-ui/theme';
import { AiOutlineUser } from 'react-icons/ai';
import { TeamServiceAPI } from '../../common/api';

interface SoloConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (teamId: string) => void;
  userId: string;
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  color: ${neoColors.status.warning};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const Message = styled.p`
  margin: 0;
  color: ${neoColors.textMuted};
  line-height: 1.5;
`;

const WarningBox = styled.div`
  background: ${neoColors.status.warning}15;
  border: 2px solid ${neoColors.status.warning};
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #856404;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;

  @media (max-width: 400px) {
    flex-direction: column;
    width: 100%;
  }
`;

const ErrorText = styled.p`
  color: ${neoColors.status.error};
  font-size: 0.875rem;
  margin: 0;
`;

export function SoloConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  userId,
}: SoloConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create a solo team (team with just the user as organizer)
      const { data, error: createError } = await TeamServiceAPI.createTeam(
        'Solo Submission',
        'Solo participant',
        userId
      );

      if (createError) {
        setError(createError.message);
        return;
      }

      if (data?.id) {
        onConfirm(data.id);
      } else {
        setError('Failed to create team');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeoModal isOpen={isOpen} onClose={onClose}>
      <Content>
        <IconWrapper>
          <AiOutlineUser />
        </IconWrapper>
        <Title>Submit as Solo Participant?</Title>
        <Message>
          You are not part of a team. You can either join a team first, or
          continue as a solo participant.
        </Message>
        <WarningBox>
          This cannot be changed later. Once you submit solo, you cannot join a
          team for this hackathon.
        </WarningBox>
        {error && <ErrorText>{error}</ErrorText>}
        <ButtonGroup>
          <NeoButton variant="secondary" onClick={onClose} disabled={isLoading}>
            Go to Team Page
          </NeoButton>
          <NeoButton
            variant="primary"
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            Yes, Submit Solo
          </NeoButton>
        </ButtonGroup>
      </Content>
    </NeoModal>
  );
}

export default SoloConfirmationModal;
