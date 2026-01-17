import React, { useState } from 'react';
import styled from 'styled-components';
import { NeoModal, NeoButton, neoColors, neoBorders } from '../neo-ui';

const STATUS_OPTIONS = [
  { value: 2, label: 'Registered' },
  { value: 3, label: 'Finalist' },
  { value: 4, label: 'Confirmed' },
  { value: 5, label: 'Declined' },
  { value: 6, label: 'Not Selected' },
];

interface BulkStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onConfirm: (newStatus: number) => Promise<void>;
}

export function BulkStatusModal({
  isOpen,
  onClose,
  selectedCount,
  onConfirm,
}: BulkStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(selectedStatus);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <NeoModal isOpen={isOpen} onClose={onClose} title="Update Status">
      <Content>
        <Message>
          Update status for <strong>{selectedCount}</strong> selected
          participant
          {selectedCount !== 1 ? 's' : ''}?
        </Message>

        <Label>New Status</Label>
        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(Number(e.target.value))}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <ButtonRow>
          <NeoButton variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </NeoButton>
          <NeoButton
            variant="primary"
            onClick={handleConfirm}
            loading={isLoading}
          >
            Update
          </NeoButton>
        </ButtonRow>
      </Content>
    </NeoModal>
  );
}

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Message = styled.p`
  font-size: 1rem;
  color: ${neoColors.text};
  margin: 0;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${neoColors.text};
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: ${neoColors.text};
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${neoColors.accent.blue};
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;
