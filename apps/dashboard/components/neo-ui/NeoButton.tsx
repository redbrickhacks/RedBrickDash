import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { neoColors, neoBorders, neoShadows, neoTransition } from './theme';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const variantStyles = {
  primary: css`
    background: ${neoColors.accent.blue};
    color: #fff;
  `,
  secondary: css`
    background: ${neoColors.surface};
    color: ${neoColors.text};
  `,
  danger: css`
    background: ${neoColors.accent.red};
    color: #fff;
  `,
  ghost: css`
    background: transparent;
    color: ${neoColors.text};
    box-shadow: none;

    &:hover:not(:disabled) {
      background: ${neoColors.background};
      transform: none;
      box-shadow: none;
    }

    &:active:not(:disabled) {
      transform: none;
      box-shadow: none;
    }
  `,
};

const sizeStyles = {
  sm: css`
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  `,
  md: css`
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  `,
  lg: css`
    padding: 1rem 2rem;
    font-size: 1rem;
  `,
};

const StyledButton = styled.button<{
  $variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  $size: 'sm' | 'md' | 'lg';
  $loading: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: ${neoBorders.standard};
  box-shadow: ${neoShadows.small};
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: ${neoTransition};
  white-space: nowrap;
  font-family: inherit;

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $size }) => sizeStyles[$size]}

  &:hover:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #000;
  }

  &:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $loading }) =>
    $loading &&
    css`
      pointer-events: none;
      opacity: 0.7;
    `}
`;

const Spinner = styled.span`
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

export function NeoButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}: NeoButtonProps) {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $loading={loading}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </StyledButton>
  );
}

export default NeoButton;
