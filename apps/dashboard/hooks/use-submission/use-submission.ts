import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Track {
  id: number;
  name: string;
  sdg_number: number;
}

export interface SubmissionTeam {
  teamId: string;
  name: string;
  projectTitle: string | null;
  trackId: number | null;
  track: Track | null;
  isHardware: boolean;
  submissionStatus: number;
  finalSubmittedAt: string | null;
}

export interface SubmissionStatus {
  hasTeam: boolean;
  team: SubmissionTeam | null;
  canSubmit: boolean;
}

export interface ProjectDetails {
  projectTitle: string;
  trackId: number;
  isHardware: boolean;
}

export function useSubmission() {
  const [status, setStatus] = useState<SubmissionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await axios.get('/api/submit/status');
      setStatus(data);
    } catch (e) {
      console.error('[useSubmission] Fetch error:', e);
      setError('Failed to load submission status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const saveProjectDetails = useCallback(
    async (details: ProjectDetails): Promise<boolean> => {
      try {
        setIsSaving(true);
        setError(null);
        const { data } = await axios.put('/api/submit/project', details);

        // Update local state with new team data
        if (status && data.team) {
          setStatus({
            ...status,
            team: {
              ...status.team,
              teamId: data.team.team_id,
              projectTitle: data.team.project_title,
              trackId: data.team.track_id,
              isHardware: data.team.is_hardware,
              submissionStatus: data.team.submission_status,
              finalSubmittedAt: data.team.final_submitted_at,
            },
          });
        }

        return true;
      } catch (e: any) {
        console.error('[useSubmission] Save error:', e);
        setError(e.response?.data?.message || 'Failed to save project details');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [status]
  );

  // Computed values
  const hasTeam = status?.hasTeam ?? false;
  const canSubmit = status?.canSubmit ?? false;
  const isSubmitted = (status?.team?.submissionStatus ?? 1) >= 2;

  const isFormComplete =
    hasTeam &&
    status?.team?.projectTitle &&
    status?.team?.trackId !== null &&
    status?.team?.trackId !== undefined;

  return {
    // State
    status,
    isLoading,
    isSaving,
    error,

    // Actions
    fetchStatus,
    saveProjectDetails,

    // Computed
    hasTeam,
    canSubmit,
    isSubmitted,
    isFormComplete,
  };
}

export default useSubmission;
