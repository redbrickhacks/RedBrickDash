import React from 'react';
import styled, { css } from 'styled-components';
import { neoColors, neoBorders, neoShadows, neoPadding } from './theme';

interface NeoCardProps {
  accent?: string;
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

const paddingStyles = {
  sm: css`
    padding: ${neoPadding.sm};
  `,
  md: css`
    padding: ${neoPadding.md};
  `,
  lg: css`
    padding: ${neoPadding.lg};
  `,
};

const StyledCard = styled.div<{
  $accent?: string;
  $padding: 'sm' | 'md' | 'lg';
}>`
  background: ${neoColors.surface};
  border: ${neoBorders.thick};
  box-shadow: ${({ $accent }) =>
    $accent ? neoShadows.colored($accent) : neoShadows.medium};

  ${({ $padding }) => paddingStyles[$padding]}
`;

export function NeoCard({
  accent,
  padding = 'md',
  children,
  className,
}: NeoCardProps) {
  return (
    <StyledCard $accent={accent} $padding={padding} className={className}>
      {children}
    </StyledCard>
  );
}

export default NeoCard;
