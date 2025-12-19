import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import { toast } from 'react-hot-toast';

interface Track {
  id: number;
  name: string;
  sdg_number: number;
}

interface SubmissionSectionProps {
  team: any;
  onUpdate: (team: any) => void;
}

// Submission deadline: January 14, 2026 11:59 PM PST (UTC-8)
const SUBMISSION_DEADLINE = new Date('2026-01-15T07:59:00Z');

export function SubmissionSection({ team, onUpdate }: SubmissionSectionProps) {
  const { supabase } = useHibiscusSupabase();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const isPastDeadline = new Date() > SUBMISSION_DEADLINE;

  const [formData, setFormData] = useState({
    trackId: team.track_id || '',
    isHardware: team.is_hardware || false,
    devpostUrl: team.devpost_url || '',
    pitchVideoUrl: team.pitch_video_url || '',
  });

  useEffect(() => {
    async function fetchTracks() {
      const { data } = await supabase
        .getClient()
        .from('tracks')
        .select('*')
        .order('id');

      setTracks(data || []);
    }
    fetchTracks();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPastDeadline) {
      toast.error('Submission deadline has passed');
      return;
    }

    setLoading(true);

    if (!formData.trackId) {
      toast.error('Please select a track');
      setLoading(false);
      return;
    }
    if (!formData.devpostUrl) {
      toast.error('Please enter your Devpost URL');
      setLoading(false);
      return;
    }
    if (!formData.pitchVideoUrl) {
      toast.error('Please enter your pitch video URL');
      setLoading(false);
      return;
    }

    try {
      new URL(formData.devpostUrl);
      new URL(formData.pitchVideoUrl);
    } catch {
      toast.error('Please enter valid URLs');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .getClient()
      .from('teams')
      .update({
        track_id: formData.trackId,
        is_hardware: formData.isHardware,
        devpost_url: formData.devpostUrl,
        pitch_video_url: formData.pitchVideoUrl,
        final_submitted_at: new Date().toISOString(),
        submission_status: 2, // SUBMITTED
      })
      .eq('team_id', team.team_id)
      .select('*, tracks(*)')
      .single();

    if (error) {
      toast.error('Failed to save submission');
      console.error(error);
    } else {
      toast.success('Submission saved!');
      onUpdate(data);
    }

    setLoading(false);
  };

  const isSubmitted = team.submission_status === 2;

  return (
    <Container>
      <Header>
        <h2>Final Submission</h2>
        {isPastDeadline ? (
          <ClosedBadge>Submissions Closed</ClosedBadge>
        ) : isSubmitted ? (
          <StatusBadge>
            Submitted on{' '}
            {new Date(team.final_submitted_at).toLocaleDateString()}
          </StatusBadge>
        ) : null}
      </Header>

      {isPastDeadline && !isSubmitted && (
        <ClosedMessage>
          The submission deadline has passed. No new submissions are being
          accepted.
        </ClosedMessage>
      )}

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <label>Track *</label>
          <Select
            value={formData.trackId}
            onChange={(e) =>
              setFormData({ ...formData, trackId: Number(e.target.value) })
            }
          >
            <option value="">Select a track...</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                SDG {track.sdg_number}: {track.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={formData.isHardware}
              onChange={(e) =>
                setFormData({ ...formData, isHardware: e.target.checked })
              }
            />
            This is a Hardware project
          </CheckboxLabel>
          <HelpText>
            Check this if your project includes physical hardware components
          </HelpText>
        </FormGroup>

        <FormGroup>
          <label>Devpost URL *</label>
          <Input
            type="url"
            placeholder="https://devpost.com/software/your-project"
            value={formData.devpostUrl}
            onChange={(e) =>
              setFormData({ ...formData, devpostUrl: e.target.value })
            }
          />
        </FormGroup>

        <FormGroup>
          <label>Pitch Video URL *</label>
          <Input
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={formData.pitchVideoUrl}
            onChange={(e) =>
              setFormData({ ...formData, pitchVideoUrl: e.target.value })
            }
          />
          <HelpText>YouTube link (unlisted or public)</HelpText>
        </FormGroup>

        <SubmitButton type="submit" disabled={loading || isPastDeadline}>
          {isPastDeadline
            ? 'Submissions Closed'
            : loading
            ? 'Saving...'
            : isSubmitted
            ? 'Update Submission'
            : 'Submit'}
        </SubmitButton>
      </Form>

      <Deadline>Deadline: January 14, 2026 at 11:59 PM</Deadline>
    </Container>
  );
}

const Container = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h2 {
    margin: 0;
    color: #ff6347;
  }
`;

const StatusBadge = styled.span`
  background: #d4edda;
  color: #155724;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
`;

const ClosedBadge = styled.span`
  background: #f8d7da;
  color: #721c24;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
`;

const ClosedMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
  }
`;

const HelpText = styled.span`
  color: #888;
  font-size: 0.875rem;
`;

const SubmitButton = styled.button`
  background: #ff6347;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: #e55a3d;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Deadline = styled.p`
  text-align: center;
  color: #888;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

export default SubmissionSection;
