import React from 'react';
import styled from 'styled-components';
import { NeoBadge, neoColors, neoBorders } from '../neo-ui';

const STATUS_LABELS: Record<number, string> = {
  1: 'Not Applied',
  2: 'Registered',
  3: 'Finalist',
  4: 'Confirmed',
  5: 'Declined',
  6: 'Not Selected',
};

const STATUS_VARIANTS: Record<
  number,
  'info' | 'success' | 'warning' | 'error' | 'neutral'
> = {
  1: 'neutral',
  2: 'info',
  3: 'warning',
  4: 'success',
  5: 'error',
  6: 'neutral',
};

export interface Participant {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  application_status: number;
  team_id: string | null;
  team_name: string | null;
  created_at: string;
}

interface ParticipantTableProps {
  participants: Participant[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  isAllSelected: boolean;
}

export function ParticipantTable({
  participants,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  isAllSelected,
}: ParticipantTableProps) {
  return (
    <TableWrapper>
      <Table>
        <thead>
          <tr>
            <Th style={{ width: 40 }}>
              <Checkbox
                type="checkbox"
                checked={isAllSelected}
                onChange={onToggleSelectAll}
              />
            </Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th>Team</Th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <Tr key={p.user_id} $selected={selectedIds.has(p.user_id)}>
              <Td>
                <Checkbox
                  type="checkbox"
                  checked={selectedIds.has(p.user_id)}
                  onChange={() => onToggleSelect(p.user_id)}
                />
              </Td>
              <Td>
                {p.first_name} {p.last_name}
              </Td>
              <Td>{p.email}</Td>
              <Td>
                <NeoBadge variant={STATUS_VARIANTS[p.application_status]}>
                  {STATUS_LABELS[p.application_status] || 'Unknown'}
                </NeoBadge>
              </Td>
              <Td>{p.team_name || '—'}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
}

const TableWrapper = styled.div`
  overflow-x: auto;
  border: ${neoBorders.thick};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${neoColors.surface};
`;

const Th = styled.th`
  padding: 0.75rem 1rem;
  text-align: left;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${neoColors.text};
  background: ${neoColors.background};
  border-bottom: ${neoBorders.thick};
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: ${neoColors.text};
  border-bottom: 1px solid #eee;
`;

const Tr = styled.tr<{ $selected: boolean }>`
  background: ${({ $selected }) => ($selected ? '#fffde7' : 'transparent')};

  &:hover {
    background: ${({ $selected }) => ($selected ? '#fffde7' : '#f9f9f9')};
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;
