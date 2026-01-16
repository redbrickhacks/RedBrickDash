import React from 'react';
import styled from 'styled-components';
import { NeoInput, neoColors, neoBorders } from '../neo-ui';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: '1', label: 'Not Applied' },
  { value: '2', label: 'Registered' },
  { value: '3', label: 'Finalist' },
  { value: '4', label: 'Confirmed' },
  { value: '5', label: 'Declined' },
  { value: '6', label: 'Not Selected' },
];

interface ParticipantFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function ParticipantFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ParticipantFiltersProps) {
  return (
    <Container>
      <SearchWrapper>
        <NeoInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or email..."
        />
      </SearchWrapper>
      <SelectWrapper>
        <Select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </SelectWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 400px;
`;

const SelectWrapper = styled.div`
  min-width: 160px;
`;

const Select = styled.select`
  width: 100%;
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
