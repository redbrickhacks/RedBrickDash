import React from 'react';
import styled from 'styled-components';
import { neoColors, neoBorders, neoShadows } from '../neo-ui';

interface StatCardProps {
  label: string;
  value: number;
  accent?: string;
}

export function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <Card $accent={accent}>
      <Value>{value.toLocaleString()}</Value>
      <Label>{label}</Label>
    </Card>
  );
}

const Card = styled.div<{ $accent?: string }>`
  background: ${neoColors.surface};
  border: ${neoBorders.thick};
  box-shadow: ${({ $accent }) =>
    $accent ? neoShadows.colored($accent) : neoShadows.medium};
  padding: 1.5rem;
  min-width: 140px;
`;

const Value = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${neoColors.text};
  line-height: 1;
  margin-bottom: 0.5rem;
`;

const Label = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${neoColors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;
