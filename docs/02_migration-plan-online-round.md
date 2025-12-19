# Migration Plan: Online Round Hackathon Format

This document outlines the complete migration plan to transform Hibiscus from a traditional hackathon format to an online round + national finals format for Red Brick Quacks.

## Implementation Status

| Phase   | Description                | Status  |
| ------- | -------------------------- | ------- |
| Phase 1 | Database Migrations        | ✅ Done |
| Phase 2 | TypeScript Type Updates    | ✅ Done |
| Phase 3 | Tally Webhook Update       | ✅ Done |
| Phase 4 | Hacker Portal Updates      | ✅ Done |
| Phase 5 | Discord Bot Integration    | ✅ Done |
| Phase 6 | Admin Tools for Organizers | ✅ Done |

---

## Context for AI Assistant

You are implementing changes to the Hibiscus hackathon platform. This is a Next.js monorepo with:

- **Frontend**: `apps/dashboard` (Next.js)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Styling**: styled-components, Tailwind CSS
- **State**: Redux, React hooks

**Important files to understand before starting:**

- `libs/types/src/lib/application-status.ts` - Application status enum
- `libs/types/src/lib/supabase.gen.ts` - Database types (auto-generated)
- `apps/dashboard/pages/index.tsx` - Main portal routing logic
- `apps/dashboard/pages/api/tally/webhook-supabase.ts` - Tally form webhook
- `apps/dashboard/pages/team/index.tsx` - Existing team management
- `apps/dashboard/components/hacker-portal/hacker-portal.tsx` - Hacker portal UI

---

## New User Flow

```
REGISTRATION PHASE
├── User creates account on portal
├── User fills Tally application form
├── Tally webhook sets application_status = REGISTERED (auto-accept)
└── User joins Discord, bot grants "Hacker" role

ONLINE ROUND (until Jan 14, 2026)
├── User finds teammates via Discord
├── User creates team OR receives/accepts invite on portal
├── Team works on project
├── Any team member can submit/update:
│   ├── Devpost URL
│   ├── Pitch video URL (YouTube)
│   ├── Track selection (SDG4, SDG11, SDG13)
│   └── Hardware track flag (boolean)
└── Unlimited updates allowed until deadline

REVIEW PHASE (Jan 14-17, 2026)
├── Organizers review team submissions
└── Mark teams as FINALIST or NOT_SELECTED

RESULTS + RSVP (Jan 17+)
├── Team members of FINALIST teams see RSVP modal
├── Each member confirms or declines individually
├── On confirm → Discord bot grants "Finalist" role
└── Waitlist managed manually (outside portal)

NATIONAL FINALS (in-person)
└── Day-of check-in (existing flow, no changes needed)
```

---

## Phase 1: Database Migrations

### 1.1 Create `tracks` Table

```sql
-- Migration: 001_create_tracks_table.sql

CREATE TABLE IF NOT EXISTS tracks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sdg_number INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO tracks (name, sdg_number, description) VALUES
  ('Quality Education', 4, 'SDG 4 - Ensure inclusive and equitable quality education'),
  ('Sustainable Cities & Communities', 11, 'SDG 11 - Make cities inclusive, safe, resilient and sustainable'),
  ('Climate Action', 13, 'SDG 13 - Take urgent action to combat climate change');

-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read tracks
CREATE POLICY "Tracks are viewable by authenticated users"
  ON tracks FOR SELECT
  TO authenticated
  USING (true);
```

### 1.2 Create `submission_status` Table

```sql
-- Migration: 002_create_submission_status_table.sql

CREATE TABLE IF NOT EXISTS submission_status (
  id SERIAL PRIMARY KEY,
  status TEXT NOT NULL UNIQUE
);

-- Seed data
INSERT INTO submission_status (id, status) VALUES
  (1, 'NOT_SUBMITTED'),
  (2, 'SUBMITTED'),
  (3, 'FINALIST'),
  (4, 'NOT_SELECTED');

-- Enable RLS
ALTER TABLE submission_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submission status is viewable by authenticated users"
  ON submission_status FOR SELECT
  TO authenticated
  USING (true);
```

### 1.3 Update `application_status` Table

```sql
-- Migration: 003_update_application_status.sql

-- First, check current values
-- Expected current: 1=NOT_APPLIED, 2=STARTED, 3=IN_REVIEW, 4=NOT_ADMITTED, 5=ADMITTED

-- Update existing statuses to new meanings
UPDATE application_status SET status = 'NOT_APPLIED' WHERE id = 1;
UPDATE application_status SET status = 'REGISTERED' WHERE id = 2;
UPDATE application_status SET status = 'FINALIST' WHERE id = 3;
UPDATE application_status SET status = 'CONFIRMED' WHERE id = 4;
UPDATE application_status SET status = 'DECLINED' WHERE id = 5;

-- Add new status
INSERT INTO application_status (id, status) VALUES (6, 'NOT_SELECTED')
  ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- Note: If users have existing statuses that conflict, you may need to
-- migrate them first. Check with: SELECT DISTINCT application_status FROM user_profiles;
```

### 1.4 Add Submission Fields to `teams` Table

```sql
-- Migration: 004_add_team_submission_fields.sql

-- Add track reference
ALTER TABLE teams ADD COLUMN IF NOT EXISTS track_id INTEGER REFERENCES tracks(id);

-- Add hardware track flag
ALTER TABLE teams ADD COLUMN IF NOT EXISTS is_hardware BOOLEAN DEFAULT FALSE;

-- Add submission URLs
ALTER TABLE teams ADD COLUMN IF NOT EXISTS devpost_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS pitch_video_url TEXT;

-- Add submission timestamp
ALTER TABLE teams ADD COLUMN IF NOT EXISTS final_submitted_at TIMESTAMPTZ;

-- Add submission status (defaults to NOT_SUBMITTED = 1)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS submission_status INTEGER DEFAULT 1 REFERENCES submission_status(id);

-- Create index for querying by submission status
CREATE INDEX IF NOT EXISTS idx_teams_submission_status ON teams(submission_status);
```

### 1.5 Update RLS Policies for Teams

```sql
-- Migration: 005_update_teams_rls.sql

-- Allow team members to update submission fields
CREATE POLICY "Team members can update submission"
  ON teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.team_id = teams.team_id
      AND user_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.team_id = teams.team_id
      AND user_profiles.user_id = auth.uid()
    )
  );

-- Allow authenticated users to read all teams (for invite system)
CREATE POLICY "Teams are viewable by authenticated users"
  ON teams FOR SELECT
  TO authenticated
  USING (true);
```

---

## Phase 2: TypeScript Type Updates

### 2.1 Update Application Status Enum

**File:** `libs/types/src/lib/application-status.ts`

```typescript
export enum ApplicationStatus {
  NOT_APPLIED = 'NOT_APPLIED',
  REGISTERED = 'REGISTERED', // Was: STARTED/IN_REVIEW
  FINALIST = 'FINALIST', // Was: (new)
  CONFIRMED = 'CONFIRMED', // Was: (handled by attendance_confirmed)
  DECLINED = 'DECLINED', // Was: (handled by attendance_confirmed)
  NOT_SELECTED = 'NOT_SELECTED', // Was: NOT_ADMITTED
}
```

### 2.2 Create Submission Status Enum

**File:** `libs/types/src/lib/submission-status.ts` (NEW FILE)

```typescript
export enum SubmissionStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
  FINALIST = 'FINALIST',
  NOT_SELECTED = 'NOT_SELECTED',
}
```

### 2.3 Create Track Type

**File:** `libs/types/src/lib/track.ts` (NEW FILE)

```typescript
export interface Track {
  id: number;
  name: string;
  sdgNumber: number;
  description: string;
}

export enum TrackId {
  QUALITY_EDUCATION = 1,
  SUSTAINABLE_CITIES = 2,
  CLIMATE_ACTION = 3,
}
```

### 2.4 Update Types Index

**File:** `libs/types/src/index.ts`

Add exports:

```typescript
export * from './lib/submission-status';
export * from './lib/track';
```

### 2.5 Regenerate Supabase Types

Run the following command to regenerate types from database:

```bash
npx supabase gen types typescript --project-id <your-project-id> > libs/types/src/lib/supabase.gen.ts
```

---

## Phase 3: Tally Webhook Update

### 3.1 Update Webhook Handler

**File:** `apps/dashboard/pages/api/tally/webhook-supabase.ts`

Find the section where `application_status` is updated and change:

```typescript
// OLD:
// .update({ application_status: 3 })  // 3 was IN_REVIEW

// NEW:
.update({ application_status: 2 })  // 2 is now REGISTERED
```

Full context - locate this code block and update:

```typescript
const { error: updateError } = await supabase
  .from('user_profiles')
  .update({ application_status: 2 }) // REGISTERED (auto-accept)
  .eq('user_id', odHibiscusUserId);
```

---

## Phase 4: Hacker Portal Updates

### 4.1 Update Portal Routing Logic

**File:** `apps/dashboard/pages/index.tsx`

Update the Dashboard component to handle new statuses:

```typescript
const Dashboard = () => {
  if (user.role === HibiscusRole.HACKER) {
    // Not applied - show apply button
    if (user.applicationStatus === ApplicationStatus.NOT_APPLIED) {
      return <ApplyPlaceholder appsOpen={appsOpen} />;
    }

    // Registered - show online round portal (team + submission)
    if (user.applicationStatus === ApplicationStatus.REGISTERED) {
      return <OnlineRoundPortal />;
    }

    // Finalist awaiting RSVP
    if (user.applicationStatus === ApplicationStatus.FINALIST) {
      return <FinalistRSVP />;
    }

    // Confirmed for nationals
    if (user.applicationStatus === ApplicationStatus.CONFIRMED) {
      return <ConfirmedPlaceholder />;
    }

    // Declined spot
    if (user.applicationStatus === ApplicationStatus.DECLINED) {
      return <DeclinedPlaceholder />;
    }

    // Not selected
    if (user.applicationStatus === ApplicationStatus.NOT_SELECTED) {
      return <NotSelectedPlaceholder />;
    }
  }
  // ... rest of role handling
};
```

### 4.2 Create Online Round Portal Component

**File:** `apps/dashboard/components/online-round-portal/online-round-portal.tsx` (NEW FILE)

This is the main component for registered hackers during online round.

```typescript
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import TeamSection from './team-section';
import SubmissionSection from './submission-section';
import InstructionsSection from './instructions-section';

export function OnlineRoundPortal() {
  const { user } = useHibiscusUser();
  const { supabase } = useHibiscusSupabase();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      if (user?.teamId) {
        const { data, error } = await supabase
          .getClient()
          .from('teams')
          .select('*, tracks(*)')
          .eq('team_id', user.teamId)
          .single();

        if (!error) {
          setTeam(data);
        }
      }
      setLoading(false);
    }
    fetchTeam();
  }, [user?.teamId]);

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <WelcomeHeader>
        <h1>Welcome, {user.firstName}!</h1>
        <p>Online Round - Submit by January 14, 2026</p>
      </WelcomeHeader>

      <InstructionsSection />

      <TeamSection team={team} userId={user.id} />

      {team && <SubmissionSection team={team} onUpdate={setTeam} />}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 0;
`;

const WelcomeHeader = styled.div`
  h1 {
    color: #ff6347;
    margin: 0;
  }
  p {
    color: #888;
  }
`;

export default OnlineRoundPortal;
```

### 4.3 Create Team Section Component

**File:** `apps/dashboard/components/online-round-portal/team-section.tsx` (NEW FILE)

```typescript
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import { Button } from '@hibiscus/ui-kit-2023';
import Link from 'next/link';

interface TeamSectionProps {
  team: any;
  userId: string;
}

export function TeamSection({ team, userId }: TeamSectionProps) {
  const { supabase } = useHibiscusSupabase();
  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (team) {
        // Fetch team members
        const { data: members } = await supabase
          .getClient()
          .from('user_profiles')
          .select('user_id, first_name, last_name, email')
          .eq('team_id', team.team_id);

        setTeamMembers(members || []);
      } else {
        // Fetch pending invites for this user
        const { data: invites } = await supabase
          .getClient()
          .from('invitations')
          .select('*, teams(*)')
          .eq('invited_id', userId);

        setPendingInvites(invites || []);
      }
    }
    fetchData();
  }, [team, userId]);

  if (!team) {
    return (
      <NoTeamContainer>
        <h2>You're not in a team yet</h2>
        <p>Create a team or accept an invite to submit your project.</p>

        <ButtonGroup>
          <Link href="/team">
            <Button color="black">Create Team</Button>
          </Link>
        </ButtonGroup>

        {pendingInvites.length > 0 && (
          <InvitesSection>
            <h3>Pending Invites</h3>
            {pendingInvites.map((invite) => (
              <InviteCard key={invite.id}>
                <span>{invite.teams.name}</span>
                <Link href={`/team/invite/accept?id=${invite.id}`}>
                  <Button color="yellow">Accept</Button>
                </Link>
              </InviteCard>
            ))}
          </InvitesSection>
        )}
      </NoTeamContainer>
    );
  }

  return (
    <TeamContainer>
      <h2>Team: {team.name}</h2>
      <MembersList>
        {teamMembers.map((member) => (
          <MemberCard key={member.user_id}>
            <span>
              {member.first_name} {member.last_name}
            </span>
            <span className="email">{member.email}</span>
            {member.user_id === team.organizer_id && (
              <span className="badge">Organizer</span>
            )}
          </MemberCard>
        ))}
      </MembersList>

      <Link href="/team">
        <Button color="black">Manage Team</Button>
      </Link>
    </TeamContainer>
  );
}

// Styled components...
const NoTeamContainer = styled.div`
  background: #f5f5f5;
  border: 2px dashed #ccc;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
`;

const TeamContainer = styled.div`
  background: white;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
`;

const InvitesSection = styled.div`
  margin-top: 2rem;
  text-align: left;
`;

const InviteCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const MembersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
`;

const MemberCard = styled.div`
  background: #f9f9f9;
  padding: 0.75rem 1rem;
  border-radius: 8px;

  .email {
    color: #888;
    font-size: 0.875rem;
    margin-left: 0.5rem;
  }

  .badge {
    background: #ff6347;
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    margin-left: 0.5rem;
  }
`;

export default TeamSection;
```

### 4.4 Create Submission Section Component

**File:** `apps/dashboard/components/online-round-portal/submission-section.tsx` (NEW FILE)

```typescript
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import { Button } from '@hibiscus/ui-kit-2023';
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

export function SubmissionSection({ team, onUpdate }: SubmissionSectionProps) {
  const { supabase } = useHibiscusSupabase();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
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

    // URL validation
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
        {isSubmitted && (
          <StatusBadge>
            ✓ Submitted on{' '}
            {new Date(team.final_submitted_at).toLocaleDateString()}
          </StatusBadge>
        )}
      </Header>

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

        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Saving...' : isSubmitted ? 'Update Submission' : 'Submit'}
        </SubmitButton>
      </Form>

      <Deadline>Deadline: January 14, 2026 at 11:59 PM</Deadline>
    </Container>
  );
}

// Styled components
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
```

### 4.5 Create Instructions Section Component

**File:** `apps/dashboard/components/online-round-portal/instructions-section.tsx` (NEW FILE)

```typescript
import styled from 'styled-components';

export function InstructionsSection() {
  return (
    <Container>
      <h2>How to Participate</h2>

      <Steps>
        <Step>
          <StepNumber>1</StepNumber>
          <StepContent>
            <h3>Form Your Team</h3>
            <p>
              Find teammates on Discord or work solo. Create your team on the
              portal.
            </p>
          </StepContent>
        </Step>

        <Step>
          <StepNumber>2</StepNumber>
          <StepContent>
            <h3>Choose Your Track</h3>
            <p>
              Select from SDG 4 (Education), SDG 11 (Cities), or SDG 13
              (Climate). Hardware projects can compete in any track + hardware
              category.
            </p>
          </StepContent>
        </Step>

        <Step>
          <StepNumber>3</StepNumber>
          <StepContent>
            <h3>Build Your Project</h3>
            <p>
              Create your MVP and submit it on Devpost. Record a pitch video
              explaining your solution.
            </p>
          </StepContent>
        </Step>

        <Step>
          <StepNumber>4</StepNumber>
          <StepContent>
            <h3>Submit Before Deadline</h3>
            <p>
              Submit your Devpost link and pitch video by January 14, 2026. You
              can update your submission anytime before the deadline.
            </p>
          </StepContent>
        </Step>
      </Steps>

      <TrackInfo>
        <h3>Tracks</h3>
        <TrackList>
          <TrackItem color="#4CAF50">
            <strong>SDG 4: Quality Education</strong>
            <p>
              Solutions that improve access to education and learning outcomes
            </p>
          </TrackItem>
          <TrackItem color="#2196F3">
            <strong>SDG 11: Sustainable Cities</strong>
            <p>
              Solutions for inclusive, safe, and resilient urban environments
            </p>
          </TrackItem>
          <TrackItem color="#FF9800">
            <strong>SDG 13: Climate Action</strong>
            <p>Solutions to combat climate change and its impacts</p>
          </TrackItem>
          <TrackItem color="#9C27B0">
            <strong>Hardware Track</strong>
            <p>
              Projects with physical hardware components (can be combined with
              any SDG track)
            </p>
          </TrackItem>
        </TrackList>
      </TrackInfo>
    </Container>
  );
}

const Container = styled.div`
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 1px solid #ffcdd2;
  border-radius: 12px;
  padding: 1.5rem;
`;

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
`;

const Step = styled.div`
  display: flex;
  gap: 1rem;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  background: #ff6347;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  p {
    margin: 0;
    color: #666;
    font-size: 0.875rem;
  }
`;

const TrackInfo = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ffcdd2;

  h3 {
    margin: 0 0 1rem 0;
  }
`;

const TrackList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const TrackItem = styled.div<{ color: string }>`
  padding: 1rem;
  border-left: 4px solid ${(props) => props.color};
  background: white;
  border-radius: 0 8px 8px 0;

  strong {
    color: ${(props) => props.color};
  }

  p {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
    color: #666;
  }
`;

export default InstructionsSection;
```

### 4.6 Create Finalist RSVP Component

**File:** `apps/dashboard/components/online-round-portal/finalist-rsvp.tsx` (NEW FILE)

```typescript
import { useState } from 'react';
import styled from 'styled-components';
import { Modal } from '@hibiscus/ui';
import { Button } from '@hibiscus/ui-kit-2023';
import { useHibiscusSupabase } from '@hibiscus/hibiscus-supabase-context';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { toast } from 'react-hot-toast';

export function FinalistRSVP() {
  const [modalOpen, setModalOpen] = useState(false);
  const [choice, setChoice] = useState<'ACCEPT' | 'DECLINE' | null>(null);
  const { user, updateUser } = useHibiscusUser();
  const { supabase } = useHibiscusSupabase();

  const handleConfirm = async () => {
    const newStatus = choice === 'ACCEPT' ? 4 : 5; // CONFIRMED or DECLINED

    const { error } = await supabase
      .getClient()
      .from('user_profiles')
      .update({ application_status: newStatus })
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    if (choice === 'ACCEPT') {
      toast.success(
        'Congratulations! You are confirmed for the National Finals!'
      );
      updateUser({ applicationStatus: 'CONFIRMED' });
    } else {
      toast.success('Your response has been recorded.');
      updateUser({ applicationStatus: 'DECLINED' });
    }

    setModalOpen(false);
  };

  return (
    <Container>
      <Celebration>🎉</Celebration>
      <h1>Congratulations, {user.firstName}!</h1>
      <p>
        Your team has been selected as a Finalist for the Red Brick Quacks
        National Finals!
      </p>

      <Details>
        <h3>Event Details</h3>
        <p>
          <strong>Date:</strong> [TBD]
        </p>
        <p>
          <strong>Location:</strong> [TBD]
        </p>
        <p>
          <strong>RSVP Deadline:</strong> [TBD]
        </p>
      </Details>

      <ButtonGroup>
        <Button
          color="red"
          onClick={() => {
            setChoice('DECLINE');
            setModalOpen(true);
          }}
        >
          Decline Spot
        </Button>
        <Button
          color="black"
          onClick={() => {
            setChoice('ACCEPT');
            setModalOpen(true);
          }}
        >
          Confirm My Spot
        </Button>
      </ButtonGroup>

      <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)}>
        <ConfirmModal>
          {choice === 'ACCEPT' ? (
            <>
              <h2>Confirm Your Spot</h2>
              <p>
                By confirming, you commit to attending the National Finals in
                person.
              </p>
              <p>Please ensure you can make it before confirming.</p>
            </>
          ) : (
            <>
              <h2>Decline Your Spot</h2>
              <p>Are you sure? This action cannot be undone.</p>
              <p>Your spot will be offered to a team on the waitlist.</p>
            </>
          )}

          <ModalButtons>
            <Button color="grey" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              color={choice === 'ACCEPT' ? 'black' : 'red'}
              onClick={handleConfirm}
            >
              {choice === 'ACCEPT' ? 'Confirm' : 'Decline'}
            </Button>
          </ModalButtons>
        </ConfirmModal>
      </Modal>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  padding: 2rem;

  h1 {
    color: #ff6347;
  }
`;

const Celebration = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Details = styled.div`
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 2rem 0;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;

  h3 {
    margin-top: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const ConfirmModal = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

export default FinalistRSVP;
```

### 4.7 Create Not Selected Placeholder

**File:** `apps/dashboard/components/online-round-portal/not-selected-placeholder.tsx` (NEW FILE)

```typescript
import styled from 'styled-components';

export function NotSelectedPlaceholder() {
  return (
    <Container>
      <h1>Thank You for Participating</h1>
      <p>
        Unfortunately, your team was not selected for the National Finals this
        time.
      </p>
      <p>
        We appreciate your hard work and encourage you to keep building! Stay
        connected on Discord for future opportunities.
      </p>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  padding: 2rem;

  h1 {
    color: #666;
  }

  p {
    color: #888;
    max-width: 500px;
    margin: 1rem auto;
  }
`;

export default NotSelectedPlaceholder;
```

---

## Phase 5: Discord Bot Integration

### 5.1 Update Bot Database Layer

See `/Users/vieuler/Documents/wd/rbh/compare/RedBrickBot/discord-bot-new.md` for the full Discord bot migration plan.

Key changes:

1. Replace Firebase with Supabase
2. Query `discord_profiles` and `user_profiles` tables
3. Check `application_status = 2` (REGISTERED) for "Hacker" role
4. Check `application_status = 4` (CONFIRMED) for "Finalist" role

### 5.2 Environment Variables for Discord

Add to `.env`:

```bash
# Discord Bot
DISCORD_BOT_TOKEN=<bot-token>
DISCORD_HACKER_ROLE_ID=<role-id>
DISCORD_FINALIST_ROLE_ID=<role-id>
DISCORD_VERIFICATION_CHANNEL_ID=<channel-id>
```

### 5.3 Update User Profile on Discord Verification

When bot verifies a user:

1. Query `user_profiles` by email to find user
2. Insert/update `discord_profiles` with Discord username
3. Grant "Hacker" role

When user RSVPs (confirms spot):

1. Check `application_status = 4` (CONFIRMED)
2. Grant "Finalist" role

---

## Phase 6: Admin Tools for Organizers

### 6.1 Script to Update Team Status

**File:** `tools/scripts/set-team-submission-status.ts` (NEW FILE)

```typescript
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Team IDs to mark as finalists
const FINALIST_TEAM_IDS = [
  // Add team IDs here
];

// Team IDs to mark as not selected
const NOT_SELECTED_TEAM_IDS = [
  // Add team IDs here
];

async function setTeamStatus(teamIds: string[], status: number) {
  // Update teams
  const { error: teamError } = await supabase
    .from('teams')
    .update({ submission_status: status })
    .in('team_id', teamIds);

  if (teamError) {
    console.error('Error updating teams:', teamError);
    return;
  }

  // Update all team members' application status
  const userStatus = status === 3 ? 3 : 6; // FINALIST or NOT_SELECTED

  const { error: userError } = await supabase
    .from('user_profiles')
    .update({ application_status: userStatus })
    .in('team_id', teamIds);

  if (userError) {
    console.error('Error updating users:', userError);
    return;
  }

  console.log(`Updated ${teamIds.length} teams to status ${status}`);
}

async function main() {
  await setTeamStatus(FINALIST_TEAM_IDS, 3); // FINALIST
  await setTeamStatus(NOT_SELECTED_TEAM_IDS, 4); // NOT_SELECTED
}

main();
```

### 6.2 Script to Export Submissions

**File:** `tools/scripts/export-submissions.ts` (NEW FILE)

```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function exportSubmissions() {
  const { data: teams, error } = await supabase
    .from('teams')
    .select(
      `
      *,
      tracks(*),
      user_profiles(first_name, last_name, email)
    `
    )
    .eq('submission_status', 2) // SUBMITTED
    .order('final_submitted_at');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Format for CSV
  const csv = [
    'Team Name,Track,Hardware,Devpost URL,Pitch Video,Submitted At,Members',
    ...teams.map((team) =>
      [
        team.name,
        team.tracks?.name || '',
        team.is_hardware ? 'Yes' : 'No',
        team.devpost_url,
        team.pitch_video_url,
        team.final_submitted_at,
        team.user_profiles
          .map((u) => `${u.first_name} ${u.last_name}`)
          .join('; '),
      ].join(',')
    ),
  ].join('\n');

  fs.writeFileSync('submissions-export.csv', csv);
  console.log(`Exported ${teams.length} submissions to submissions-export.csv`);
}

exportSubmissions();
```

---

## Implementation Order

Execute phases in this order:

1. **Phase 1: Database Migrations** (1.1 → 1.5)

   - Run SQL migrations in Supabase
   - Verify tables created correctly

2. **Phase 2: TypeScript Types** (2.1 → 2.5)

   - Update enum files
   - Create new type files
   - Regenerate Supabase types

3. **Phase 3: Tally Webhook** (3.1)

   - Update status value
   - Test with Tally form submission

4. **Phase 4: Portal Components** (4.1 → 4.7)

   - Create new components
   - Update routing logic
   - Test full flow

5. **Phase 5: Discord Bot** (5.1 → 5.3)

   - Update bot database layer
   - Add role granting logic
   - Test verification flow

6. **Phase 6: Admin Tools** (6.1 → 6.2)
   - Create scripts
   - Test with sample data

---

## Testing Checklist

### Registration Flow

- [ ] User can create account
- [ ] User can fill Tally form
- [ ] Webhook sets status to REGISTERED
- [ ] Portal shows Online Round view

### Team Management

- [ ] User without team sees "Create Team" prompt
- [ ] User can create team
- [ ] User can invite others
- [ ] Invitee can accept invite
- [ ] Team members listed correctly

### Submission Flow

- [ ] Team can select track
- [ ] Team can toggle hardware flag
- [ ] Team can enter Devpost URL
- [ ] Team can enter pitch video URL
- [ ] Submission saves correctly
- [ ] Submission can be updated
- [ ] Timestamp updates on each save

### Results Flow

- [ ] Script can mark teams as FINALIST
- [ ] Script can mark teams as NOT_SELECTED
- [ ] Team members' status updates accordingly
- [ ] Finalists see RSVP modal
- [ ] Non-selected see appropriate message

### RSVP Flow

- [ ] Finalist can confirm spot
- [ ] Finalist can decline spot
- [ ] Status updates correctly
- [ ] Confirmed users see confirmation page

### Discord Integration

- [ ] Bot can verify users by email
- [ ] Bot grants "Hacker" role on verification
- [ ] Bot grants "Finalist" role on RSVP confirmation

---

## Rollback Plan

If issues arise:

1. **Database**: Keep backup of current `application_status` values before migration
2. **Code**: All changes are additive; old components can coexist
3. **Feature flag**: Add `ONLINE_ROUND_ENABLED` env var to toggle between flows

---

## Notes for Implementation

1. **Do not modify** existing team invite/accept/reject pages - they should continue to work
2. **Preserve** existing RLS policies - only add new ones
3. **Test** each phase before moving to next
4. **Backup** database before running migrations
5. **Coordinate** Discord bot deployment with portal deployment
