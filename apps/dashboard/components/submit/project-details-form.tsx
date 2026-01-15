import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { NeoInput } from '../neo-ui/NeoInput';
import { NeoButton } from '../neo-ui/NeoButton';
import { NeoCard } from '../neo-ui/NeoCard';
import {
  neoColors,
  neoBorders,
  neoShadows,
  neoTransition,
} from '../neo-ui/theme';
import {
  SubmissionTeam,
  ProjectDetails,
} from '../../hooks/use-submission/use-submission';
import { FaCheck } from 'react-icons/fa6';

interface ProjectDetailsFormProps {
  team: SubmissionTeam;
  onSave: (details: ProjectDetails) => Promise<boolean>;
  isSaving: boolean;
  disabled?: boolean;
}

const TRACKS = [
  { id: 1, name: 'Quality Education', sdg: 4 },
  { id: 2, name: 'Sustainable Cities and Communities', sdg: 11 },
  { id: 3, name: 'Climate Action', sdg: 13 },
];

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
`;

const SavedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${neoColors.status.success}20;
  color: ${neoColors.status.success};
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid ${neoColors.status.success};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${neoColors.text};
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  transition: ${neoTransition};
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: ${neoShadows.small};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem 1rem;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  transition: ${neoTransition};

  &:hover {
    background: ${neoColors.background};
  }

  input {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;

const CheckboxText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CheckboxLabel = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
`;

const CheckboxHint = styled.span`
  font-size: 0.8rem;
  color: ${neoColors.textMuted};
`;

const HardwareInfoBox = styled.div`
  margin-top: 0.75rem;
  padding: 1rem;
  background: ${neoColors.accent.blue}10;
  border: ${neoBorders.standard};
  font-size: 0.85rem;
  line-height: 1.5;

  ul {
    margin: 0.5rem 0;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.25rem;
  }

  a {
    color: ${neoColors.accent.blue};
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const HardwareInfoTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const CharCount = styled.span<{ $over: boolean }>`
  font-size: 0.75rem;
  color: ${({ $over }) =>
    $over ? neoColors.status.error : neoColors.textMuted};
  text-align: right;
`;

export function ProjectDetailsForm({
  team,
  onSave,
  isSaving,
  disabled = false,
}: ProjectDetailsFormProps) {
  const [projectTitle, setProjectTitle] = useState(team.projectTitle || '');
  const [trackId, setTrackId] = useState<number | ''>(team.trackId || '');
  const [isHardware, setIsHardware] = useState(team.isHardware || false);
  const [hasChanges, setHasChanges] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Track changes
  useEffect(() => {
    const changed =
      projectTitle !== (team.projectTitle || '') ||
      trackId !== (team.trackId || '') ||
      isHardware !== (team.isHardware || false);
    setHasChanges(changed);
    if (changed) {
      setJustSaved(false);
    }
  }, [projectTitle, trackId, isHardware, team]);

  const handleSave = async () => {
    if (!projectTitle.trim() || !trackId) return;

    const success = await onSave({
      projectTitle: projectTitle.trim(),
      trackId: trackId as number,
      isHardware,
    });

    if (success) {
      setHasChanges(false);
      setJustSaved(true);
      // Clear "just saved" indicator after a few seconds
      setTimeout(() => setJustSaved(false), 3000);
    }
  };

  const isFormValid = projectTitle.trim().length > 0 && trackId !== '';
  const isOverLimit = projectTitle.length > 100;

  return (
    <NeoCard>
      <FormContainer>
        <Header>
          <Title>Project Details</Title>
          {justSaved && (
            <SavedBadge>
              <FaCheck /> Saved
            </SavedBadge>
          )}
        </Header>

        <FormGroup>
          <NeoInput
            label="Project Title *"
            placeholder="Enter your project name"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            disabled={disabled}
            error={
              isOverLimit ? 'Title must be 100 characters or less' : undefined
            }
          />
          <CharCount $over={isOverLimit}>{projectTitle.length}/100</CharCount>
        </FormGroup>

        <FormGroup>
          <Label>Theme/Track *</Label>
          <Select
            value={trackId}
            onChange={(e) => setTrackId(Number(e.target.value) || '')}
            disabled={disabled}
          >
            <option value="">Select a track...</option>
            {TRACKS.map((track) => (
              <option key={track.id} value={track.id}>
                SDG {track.sdg}: {track.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <CheckboxContainer>
            <input
              type="checkbox"
              checked={isHardware}
              onChange={(e) => setIsHardware(e.target.checked)}
              disabled={disabled}
            />
            <CheckboxText>
              <CheckboxLabel>Hardware Project</CheckboxLabel>
              <CheckboxHint>
                Check this if your project includes physical hardware components
              </CheckboxHint>
            </CheckboxText>
          </CheckboxContainer>
          {isHardware && (
            <HardwareInfoBox>
              <HardwareInfoTitle>Hardware Track Info</HardwareInfoTitle>
              <ul>
                <li>
                  Access to a 4,500 sq ft makerspace with 3D printers, laser
                  cutting, soldering stations, and more
                </li>
                <li>₹15,000 budget per finalist for project components</li>
                <li>
                  Standard hardware kit available (Arduino, ESP32, basic
                  sensors, etc.)
                </li>
              </ul>
              <div>
                Copy the{' '}
                <a
                  href="https://rbh.fyi/bom-template"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Bill of Materials template
                </a>{' '}
                and submit a public link on the form below. A part of our
                inventory and the hardware kit are listed on the{' '}
                <a
                  href="https://redbrickhacks.co/#equipment"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  equipment page
                </a>
                .
              </div>
            </HardwareInfoBox>
          )}
        </FormGroup>

        <ButtonRow>
          <NeoButton
            variant="primary"
            onClick={handleSave}
            loading={isSaving}
            disabled={disabled || !hasChanges || !isFormValid || isOverLimit}
          >
            {hasChanges ? 'Save Changes' : 'Saved'}
          </NeoButton>
        </ButtonRow>
      </FormContainer>
    </NeoCard>
  );
}

export default ProjectDetailsForm;
