import React, { useState } from 'react';
import styled from 'styled-components';
import { NeoButton, NeoInput, neoColors, neoBorders } from '../neo-ui';

const TEMPLATE_OPTIONS = [
  { value: 'finalist_selected', label: 'Finalist Selected' },
  { value: 'not_selected', label: 'Not Selected' },
  { value: 'rsvp_reminder', label: 'RSVP Reminder' },
  { value: 'custom', label: 'Custom Message' },
];

const STATUS_OPTIONS = [
  { value: 2, label: 'Registered' },
  { value: 3, label: 'Finalist' },
  { value: 4, label: 'Confirmed' },
  { value: 5, label: 'Declined' },
  { value: 6, label: 'Not Selected' },
];

const DEFAULT_SUBJECTS: Record<string, string> = {
  finalist_selected: "Congratulations! You're a RedBrick Hacks III Finalist!",
  not_selected: 'Thank you for participating in RedBrick Hacks III',
  rsvp_reminder: 'Action Required: Confirm your RedBrick Hacks III Finals spot',
  custom: '',
};

interface EmailJobFormProps {
  onSubmit: (job: {
    template: string;
    subject: string;
    customBody?: string;
    targetStatus: number[];
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function EmailJobForm({ onSubmit, isSubmitting }: EmailJobFormProps) {
  const [template, setTemplate] = useState('finalist_selected');
  const [subject, setSubject] = useState(DEFAULT_SUBJECTS['finalist_selected']);
  const [customBody, setCustomBody] = useState('');
  const [targetStatus, setTargetStatus] = useState<number[]>([2]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const handleTemplateChange = (newTemplate: string) => {
    setTemplate(newTemplate);
    setSubject(DEFAULT_SUBJECTS[newTemplate] || '');
  };

  const handleStatusToggle = (status: number) => {
    setTargetStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handlePreview = async () => {
    try {
      const res = await fetch('/api/superadmin/email/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, customBody }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html);
      }
    } catch (err) {
      console.error('Failed to preview:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetStatus.length === 0) {
      alert('Please select at least one target status');
      return;
    }
    await onSubmit({
      template,
      subject,
      customBody: template === 'custom' ? customBody : undefined,
      targetStatus,
    });
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Template</Label>
          <Select
            value={template}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            {TEMPLATE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Subject</Label>
          <NeoInput
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject..."
          />
        </FormGroup>

        {template === 'custom' && (
          <FormGroup>
            <Label>Message Body</Label>
            <TextArea
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
              placeholder="Enter your custom message..."
              rows={5}
            />
          </FormGroup>
        )}

        <FormGroup>
          <Label>Target Status</Label>
          <CheckboxGroup>
            {STATUS_OPTIONS.map((opt) => (
              <CheckboxLabel key={opt.value}>
                <Checkbox
                  type="checkbox"
                  checked={targetStatus.includes(opt.value)}
                  onChange={() => handleStatusToggle(opt.value)}
                />
                {opt.label}
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
        </FormGroup>

        <ButtonRow>
          <NeoButton
            type="button"
            variant="secondary"
            onClick={handlePreview}
            disabled={isSubmitting}
          >
            Preview
          </NeoButton>
          <NeoButton
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={targetStatus.length === 0}
          >
            Create Job
          </NeoButton>
        </ButtonRow>
      </Form>

      {previewHtml && (
        <PreviewSection>
          <PreviewHeader>
            <Label>Preview</Label>
            <CloseButton onClick={() => setPreviewHtml(null)}>
              Close
            </CloseButton>
          </PreviewHeader>
          <PreviewFrame
            srcDoc={previewHtml}
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        </PreviewSection>
      )}
    </Container>
  );
}

const Container = styled.div``;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 500px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  color: ${neoColors.text};
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${neoColors.accent.blue};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${neoColors.text};
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const PreviewSection = styled.div`
  margin-top: 2rem;
  border: ${neoBorders.thick};
  background: ${neoColors.surface};
`;

const PreviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: ${neoBorders.standard};
  background: ${neoColors.background};
`;

const CloseButton = styled.button`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${neoColors.textMuted};
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: ${neoColors.text};
  }
`;

const PreviewFrame = styled.iframe`
  width: 100%;
  height: 500px;
  border: none;
`;
