import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { neoColors, neoBorders, neoShadows, neoTransition } from './theme';

type BaseInputProps = {
  label?: string;
  error?: string;
  multiline?: boolean;
};

type InputProps = BaseInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'multiline'>;

type TextareaProps = BaseInputProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'multiline'>;

type NeoInputProps = InputProps | TextareaProps;

const inputStyles = css`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  transition: ${neoTransition};
  box-sizing: border-box;

  &:focus {
    outline: none;
    box-shadow: ${neoShadows.small};
  }

  &::placeholder {
    color: ${neoColors.textMuted};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const errorStyles = css`
  border-color: ${neoColors.status.error};

  &:focus {
    box-shadow: 3px 3px 0 ${neoColors.status.error};
  }
`;

const StyledInput = styled.input<{ $hasError: boolean }>`
  ${inputStyles}
  ${({ $hasError }) => $hasError && errorStyles}
`;

const StyledTextarea = styled.textarea<{ $hasError: boolean }>`
  ${inputStyles}
  ${({ $hasError }) => $hasError && errorStyles}
  min-height: 100px;
  resize: vertical;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${neoColors.text};
`;

const ErrorText = styled.span`
  color: ${neoColors.status.error};
  font-size: 0.85rem;
  font-weight: 500;
`;

export function NeoInput({
  label,
  error,
  multiline = false,
  ...props
}: NeoInputProps) {
  const hasError = Boolean(error);

  return (
    <Container>
      {label && <Label>{label}</Label>}
      {multiline ? (
        <StyledTextarea
          $hasError={hasError}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <StyledInput
          $hasError={hasError}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
}

export default NeoInput;
