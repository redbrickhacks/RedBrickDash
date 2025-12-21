import React from 'react';
import styled from 'styled-components';
import { NeoModal } from './NeoModal';
import { NeoButton } from './NeoButton';
import { neoColors } from './theme';
import { AiOutlineWarning } from 'react-icons/ai';

interface NeoConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const variantColors = {
  danger: neoColors.status.error,
  warning: neoColors.status.warning,
  info: neoColors.accent.blue,
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
`;

const IconWrapper = styled.div<{ $color: string }>`
  font-size: 2.5rem;
  color: ${({ $color }) => $color};
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;

  @media (max-width: 400px) {
    flex-direction: column;
    width: 100%;
  }
`;

export function NeoConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: NeoConfirmDialogProps) {
  const color = variantColors[variant];

  return (
    <NeoModal isOpen={isOpen} onClose={onCancel}>
      <Content>
        <IconWrapper $color={color}>
          <AiOutlineWarning />
        </IconWrapper>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <ButtonGroup>
          <NeoButton
            variant="danger"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </NeoButton>
          <NeoButton
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </NeoButton>
        </ButtonGroup>
      </Content>
    </NeoModal>
  );
}

export default NeoConfirmDialog;
