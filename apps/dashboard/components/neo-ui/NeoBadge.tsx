import React from 'react';
import styled from 'styled-components';
import { neoColors } from './theme';

interface NeoBadgeProps {
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  children: React.ReactNode;
}

const variantColors = {
  info: {
    bg: '#E3F2FD',
    text: neoColors.accent.blue,
    border: neoColors.accent.blue,
  },
  success: {
    bg: '#E8F5E9',
    text: neoColors.status.success,
    border: neoColors.status.success,
  },
  warning: {
    bg: '#FFF8E1',
    text: '#F57C00',
    border: '#F57C00',
  },
  error: {
    bg: '#FFEBEE',
    text: neoColors.status.error,
    border: neoColors.status.error,
  },
  neutral: {
    bg: '#F5F5F5',
    text: neoColors.textMuted,
    border: neoColors.textMuted,
  },
};

const StyledBadge = styled.span<{
  $bg: string;
  $text: string;
  $border: string;
}>`
  display: inline-block;
  background: ${({ $bg }) => $bg};
  color: ${({ $text }) => $text};
  border: 2px solid ${({ $border }) => $border};
  padding: 0.35rem 0.75rem;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export function NeoBadge({ variant = 'neutral', children }: NeoBadgeProps) {
  const colors = variantColors[variant];

  return (
    <StyledBadge $bg={colors.bg} $text={colors.text} $border={colors.border}>
      {children}
    </StyledBadge>
  );
}

export default NeoBadge;
