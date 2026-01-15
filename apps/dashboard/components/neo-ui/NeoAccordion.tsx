import React, { useId } from 'react';
import styled from 'styled-components';
import { neoColors, neoBorders, neoShadows, neoTransition } from './theme';
import { useLocalStorage } from '../../hooks/use-local-storage';

interface NeoAccordionProps {
  /** Unique identifier for localStorage persistence */
  id: string;
  /** Header text displayed in the accordion trigger */
  title: string;
  /** Content to show when expanded */
  children: React.ReactNode;
  /** Initial open state (default: false) */
  defaultOpen?: boolean;
  /** Whether to persist open/closed state in localStorage (default: true) */
  persistState?: boolean;
  /** Optional accent color for the left border when open */
  accent?: string;
}

const Container = styled.div`
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  box-shadow: ${neoShadows.small};
`;

const Header = styled.button<{ $isOpen: boolean; $accent?: string }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: ${neoColors.surface};
  border: none;
  cursor: pointer;
  text-align: left;
  transition: ${neoTransition};
  border-left: 3px solid
    ${({ $isOpen, $accent }) => ($isOpen && $accent ? $accent : 'transparent')};

  &:hover {
    background: ${neoColors.background};
  }

  &:focus-visible {
    outline: 2px solid ${neoColors.accent.blue};
    outline-offset: -2px;
  }
`;

const Title = styled.span`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${neoColors.text};
`;

const Chevron = styled.span<{ $isOpen: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-right: 2px solid ${neoColors.text};
  border-bottom: 2px solid ${neoColors.text};
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(45deg)' : 'rotate(-45deg)')};
  transition: transform 0.15s ease;
  margin-left: 1rem;
  flex-shrink: 0;
`;

const ContentWrapper = styled.div<{ $isOpen: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  transition: grid-template-rows 0.2s ease;
`;

const ContentInner = styled.div`
  overflow: hidden;
`;

const Content = styled.div`
  padding: 0 1.25rem 1.25rem 1.25rem;
  border-top: 1px solid ${neoColors.textLight}33;
`;

export function NeoAccordion({
  id,
  title,
  children,
  defaultOpen = false,
  persistState = true,
  accent,
}: NeoAccordionProps) {
  const storageKey = `accordion:${id}`;
  const contentId = useId();

  // Use localStorage for persistence, or local state if persistence disabled
  const [isOpenStored, setIsOpenStored] = useLocalStorage(
    storageKey,
    defaultOpen
  );

  const [isOpenLocal, setIsOpenLocal] = React.useState(defaultOpen);

  const isOpen = persistState ? isOpenStored : isOpenLocal;
  const setIsOpen = persistState ? setIsOpenStored : setIsOpenLocal;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Container>
      <Header
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        $isOpen={isOpen}
        $accent={accent}
      >
        <Title>{title}</Title>
        <Chevron $isOpen={isOpen} />
      </Header>
      <ContentWrapper $isOpen={isOpen}>
        <ContentInner>
          <Content id={contentId}>{children}</Content>
        </ContentInner>
      </ContentWrapper>
    </Container>
  );
}

export default NeoAccordion;
