import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { HibiscusRole } from '@hibiscus/types';
import {
  NeoButton,
  NeoInput,
  neoColors,
  neoBorders,
  neoShadows,
} from '../../components/neo-ui';
import type {
  SubmissionForJudging,
  ReviewerScore,
  PassAggregate,
} from '../api/judge/submissions';

type Pass1Decision = 'yes' | 'no' | 'maybe';
type Pass2Decision = 'yes' | 'no' | 'waitlist';
type FinalDecision = 'finalist' | 'waitlist' | 'not_selected';
type FilterStatus =
  | 'all'
  | 'yes'
  | 'no'
  | 'maybe'
  | 'waitlist'
  | 'unreviewed'
  | 'needs_reviews';
type FinalFilterStatus =
  | 'all'
  | 'finalist'
  | 'waitlist'
  | 'not_selected'
  | 'unreviewed';
type ActivePass = 1 | 2 | 'final';
type HardwareFilter = 'all' | 'hardware' | 'software';
type SortField =
  | 'teamName'
  | 'pass1Avg'
  | 'pass2Avg'
  | 'p1ReviewCount'
  | 'p2ReviewCount';

// Decision color mapping
type DecisionColorType = 'success' | 'warning' | 'error' | 'neutral';
const DECISION_COLORS: Record<
  DecisionColorType,
  { bg: string; border: string }
> = {
  success: { bg: '#E8F5E9', border: neoColors.status.success },
  warning: { bg: '#FFF8E1', border: '#F57C00' },
  error: { bg: '#FFEBEE', border: neoColors.status.error },
  neutral: { bg: '#F5F5F5', border: '#ccc' },
};

const getDecisionColorType = (decision: string | null): DecisionColorType => {
  switch (decision) {
    case 'yes':
    case 'finalist':
      return 'success';
    case 'maybe':
    case 'waitlist':
      return 'warning';
    case 'no':
    case 'not_selected':
      return 'error';
    default:
      return 'neutral';
  }
};

const getDecisionColors = (decision: string | null) =>
  DECISION_COLORS[getDecisionColorType(decision)];

const CRITERIA = ['problem', 'solution', 'implementation', 'roadmap'] as const;
type Criterion = (typeof CRITERIA)[number];

const CRITERIA_LABELS: Record<Criterion, string> = {
  problem: 'Problem Understanding',
  solution: 'Solution Clarity',
  implementation: 'Implementation',
  roadmap: 'Roadmap',
};

const CRITERIA_HINTS: Record<Criterion, string> = {
  problem: "Specific people, how they cope, why it's hard, SDG connection",
  solution: 'Understandable in 3 min, clear user, why this approach',
  implementation: "What works/doesn't, success metrics, real commits",
  roadmap: 'Specific finals plans, room to grow, momentum',
};

// SDG track color mapping
const SDG_COLORS: Record<number, { bg: string; border: string }> = {
  4: { bg: '#FFF3E0', border: '#E65100' },
  11: { bg: '#E8F5E9', border: '#2E7D32' },
  13: { bg: '#E3F2FD', border: '#1565C0' },
};
const DEFAULT_SDG_COLOR = { bg: '#F5F5F5', border: '#666' };

const getSDGColor = (sdg: number) => SDG_COLORS[sdg] ?? DEFAULT_SDG_COLOR;

// Reviewer caps
const PASS_1_MAX_REVIEWERS = 4;
const PASS_2_MAX_REVIEWERS = 3;

export default function JudgePortal() {
  const { user } = useHibiscusUser();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<SubmissionForJudging[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [savingScore, setSavingScore] = useState(false);
  const [savingFinalDecision, setSavingFinalDecision] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const saveSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile view state
  const [isMobileDetailView, setIsMobileDetailView] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [pass1Filter, setPass1Filter] = useState<FilterStatus>('all');
  const [pass2Filter, setPass2Filter] = useState<FilterStatus>('all');
  const [finalFilter, setFinalFilter] = useState<FinalFilterStatus>('all');
  const [trackFilter, setTrackFilter] = useState<number | 'all'>('all');
  const [hardwareFilter, setHardwareFilter] = useState<HardwareFilter>('all');
  const [sortField, setSortField] = useState<SortField>('teamName');
  const [sortAsc, setSortAsc] = useState(true);
  // Quick filters
  const [myUnreviewedP1, setMyUnreviewedP1] = useState(false);
  const [myUnreviewedP2, setMyUnreviewedP2] = useState(false);

  // Local edits for scoring
  const [localScores, setLocalScores] = useState<Record<string, number | null>>(
    {}
  );
  const [localDecision, setLocalDecision] = useState<
    Pass1Decision | Pass2Decision | FinalDecision | null
  >(null);
  const [localNotes, setLocalNotes] = useState('');
  const [activePass, setActivePass] = useState<ActivePass>(1);

  // Auth check
  useEffect(() => {
    if (
      user &&
      user.role !== HibiscusRole.SUPERADMIN &&
      user.role !== HibiscusRole.JUDGE
    ) {
      router.push('/');
    }
  }, [user, router]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveSuccessTimeoutRef.current) {
        clearTimeout(saveSuccessTimeoutRef.current);
      }
    };
  }, []);

  // Helper to show save success toast
  const showSaveSuccess = useCallback((message: string) => {
    if (saveSuccessTimeoutRef.current) {
      clearTimeout(saveSuccessTimeoutRef.current);
    }
    setSaveSuccess(message);
    saveSuccessTimeoutRef.current = setTimeout(() => {
      setSaveSuccess(null);
    }, 2500);
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/judge/submissions');
      if (!res.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await res.json();
      setSubmissions(data.submissions);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      user &&
      (user.role === HibiscusRole.SUPERADMIN ||
        user.role === HibiscusRole.JUDGE)
    ) {
      fetchSubmissions();
    }
  }, [user, fetchSubmissions]);

  // Get current submission
  const selectedSubmission = useMemo(
    () => submissions.find((s) => s.teamId === selectedTeamId) || null,
    [submissions, selectedTeamId]
  );

  // Check for unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    if (!selectedSubmission) return false;

    if (activePass === 'final') {
      return localDecision !== selectedSubmission.finalDecision;
    }

    const myScore =
      activePass === 1
        ? selectedSubmission.myPass1Score
        : selectedSubmission.myPass2Score;

    if (!myScore) {
      // No existing score - any local data is unsaved
      return (
        Object.values(localScores).some((v) => v !== null) ||
        localDecision !== null ||
        localNotes !== ''
      );
    }

    const scoresChanged = CRITERIA.some(
      (c) => localScores[c] !== myScore[c as keyof ReviewerScore]
    );
    const decisionChanged = localDecision !== myScore.decision;
    const notesChanged = localNotes !== (myScore.notes || '');

    return scoresChanged || decisionChanged || notesChanged;
  }, [selectedSubmission, activePass, localScores, localDecision, localNotes]);

  // Load scores for selected team
  const loadScoresForPass = useCallback(
    (sub: SubmissionForJudging, pass: ActivePass) => {
      if (pass === 'final') {
        setLocalScores({});
        setLocalDecision(sub.finalDecision as FinalDecision | null);
        setLocalNotes('');
        return;
      }

      const myScore = pass === 1 ? sub.myPass1Score : sub.myPass2Score;
      if (myScore) {
        setLocalScores({
          problem: myScore.problem,
          solution: myScore.solution,
          implementation: myScore.implementation,
          roadmap: myScore.roadmap,
        });
        setLocalDecision(
          myScore.decision as Pass1Decision | Pass2Decision | null
        );
        setLocalNotes(myScore.notes || '');
      } else {
        setLocalScores({
          problem: null,
          solution: null,
          implementation: null,
          roadmap: null,
        });
        setLocalDecision(null);
        setLocalNotes('');
      }
    },
    []
  );

  // Handle team selection
  const handleSelectTeam = useCallback(
    (teamId: string) => {
      if (selectedTeamId === teamId) return;

      if (selectedTeamId && hasUnsavedChanges()) {
        if (!confirm('You have unsaved changes. Discard them?')) {
          return;
        }
      }

      const sub = submissions.find((s) => s.teamId === teamId);
      if (!sub) return;

      setSelectedTeamId(teamId);
      setActivePass(1);
      loadScoresForPass(sub, 1);
      setIsMobileDetailView(true);
    },
    [selectedTeamId, submissions, hasUnsavedChanges, loadScoresForPass]
  );

  // Handle pass switch
  const handleSwitchPass = useCallback(
    (pass: ActivePass) => {
      if (!selectedSubmission) return;

      // Check if can switch to pass 2 (needs at least one P1 review with decision)
      if (pass === 2 && selectedSubmission.pass1.aggregate.reviewCount === 0) {
        return;
      }
      // Check if can switch to final (needs at least one P2 review with decision)
      if (
        pass === 'final' &&
        selectedSubmission.pass2.aggregate.reviewCount === 0
      ) {
        return;
      }

      if (hasUnsavedChanges()) {
        if (!confirm('You have unsaved changes. Discard them?')) {
          return;
        }
      }

      setActivePass(pass);
      loadScoresForPass(selectedSubmission, pass);
    },
    [selectedSubmission, hasUnsavedChanges, loadScoresForPass]
  );

  // Save score
  const handleSaveScore = useCallback(async () => {
    if (!selectedTeamId || activePass === 'final') return;

    setSavingScore(true);
    try {
      const res = await fetch(`/api/judge/scores/${selectedTeamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pass: activePass,
          problem: localScores.problem,
          solution: localScores.solution,
          implementation: localScores.implementation,
          roadmap: localScores.roadmap,
          decision: localDecision,
          notes: localNotes || null,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        alert(data.message || 'Cannot add more reviewers to this pass.');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to save score');
      }

      await fetchSubmissions();
      showSaveSuccess('Score saved');
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save score');
    } finally {
      setSavingScore(false);
    }
  }, [
    selectedTeamId,
    activePass,
    localScores,
    localDecision,
    localNotes,
    fetchSubmissions,
    showSaveSuccess,
  ]);

  // Save final decision
  const handleSaveFinalDecision = useCallback(async () => {
    if (!selectedTeamId || activePass !== 'final') return;

    setSavingFinalDecision(true);
    try {
      const res = await fetch(`/api/judge/notes/${selectedTeamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final_decision: localDecision,
        }),
      });

      if (res.status === 409) {
        const data = await res.json();
        alert(data.message || 'Conflict detected. Please refresh.');
        await fetchSubmissions();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to save final decision');
      }

      await fetchSubmissions();
      showSaveSuccess('Final decision saved');
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save final decision');
    } finally {
      setSavingFinalDecision(false);
    }
  }, [
    selectedTeamId,
    activePass,
    localDecision,
    fetchSubmissions,
    showSaveSuccess,
  ]);

  // Handle back button on mobile
  const handleBackToList = useCallback(() => {
    if (hasUnsavedChanges()) {
      if (!confirm('You have unsaved changes. Discard them?')) {
        return;
      }
    }
    setIsMobileDetailView(false);
  }, [hasUnsavedChanges]);

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Search filter
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.teamName.toLowerCase().includes(q) ||
          (s.projectTitle?.toLowerCase().includes(q) ?? false)
      );
    }

    // Track filter
    if (trackFilter !== 'all') {
      result = result.filter((s) => s.track?.sdgNumber === trackFilter);
    }

    // Hardware filter
    if (hardwareFilter !== 'all') {
      result = result.filter((s) =>
        hardwareFilter === 'hardware' ? s.isHardware : !s.isHardware
      );
    }

    // Pass 1 filter
    if (pass1Filter !== 'all') {
      if (pass1Filter === 'unreviewed') {
        result = result.filter((s) => s.pass1.aggregate.reviewCount === 0);
      } else if (pass1Filter === 'needs_reviews') {
        result = result.filter(
          (s) => s.pass1.aggregate.reviewCount < PASS_1_MAX_REVIEWERS
        );
      } else {
        result = result.filter(
          (s) => s.pass1.aggregate.consensus === pass1Filter
        );
      }
    }

    // Pass 2 filter
    if (pass2Filter !== 'all') {
      if (pass2Filter === 'unreviewed') {
        result = result.filter((s) => s.pass2.aggregate.reviewCount === 0);
      } else if (pass2Filter === 'needs_reviews') {
        result = result.filter(
          (s) => s.pass2.aggregate.reviewCount < PASS_2_MAX_REVIEWERS
        );
      } else {
        result = result.filter(
          (s) => s.pass2.aggregate.consensus === pass2Filter
        );
      }
    }

    // Final decision filter
    if (finalFilter !== 'all') {
      if (finalFilter === 'unreviewed') {
        result = result.filter((s) => !s.finalDecision);
      } else {
        result = result.filter((s) => s.finalDecision === finalFilter);
      }
    }

    // My Unreviewed quick filters
    if (myUnreviewedP1) {
      result = result.filter((s) => s.myPass1Score === null);
    }
    if (myUnreviewedP2) {
      result = result.filter((s) => s.myPass2Score === null);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'teamName':
          cmp = a.teamName.localeCompare(b.teamName);
          break;
        case 'pass1Avg':
          cmp = (a.pass1Avg ?? -1) - (b.pass1Avg ?? -1);
          break;
        case 'pass2Avg':
          cmp = (a.pass2Avg ?? -1) - (b.pass2Avg ?? -1);
          break;
        case 'p1ReviewCount':
          cmp = a.pass1.aggregate.reviewCount - b.pass1.aggregate.reviewCount;
          break;
        case 'p2ReviewCount':
          cmp = a.pass2.aggregate.reviewCount - b.pass2.aggregate.reviewCount;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [
    submissions,
    debouncedSearchQuery,
    pass1Filter,
    pass2Filter,
    finalFilter,
    trackFilter,
    hardwareFilter,
    sortField,
    sortAsc,
    myUnreviewedP1,
    myUnreviewedP2,
  ]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      // Ignore if typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (!filteredSubmissions.length) return;

      const currentIndex = filteredSubmissions.findIndex(
        (s) => s.teamId === selectedTeamId
      );

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const nextIndex = Math.min(
          currentIndex + 1,
          filteredSubmissions.length - 1
        );
        if (nextIndex !== currentIndex) {
          handleSelectTeam(filteredSubmissions[nextIndex].teamId);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const prevIndex = Math.max(currentIndex - 1, 0);
        if (prevIndex !== currentIndex) {
          handleSelectTeam(filteredSubmissions[prevIndex].teamId);
        }
      }
    },
    [filteredSubmissions, selectedTeamId, handleSelectTeam]
  );

  // Stats
  const stats = useMemo(() => {
    const total = submissions.length;
    const p1Reviewed = submissions.filter(
      (s) => s.pass1.aggregate.reviewCount > 0
    ).length;
    const p1Complete = submissions.filter(
      (s) => s.pass1.aggregate.reviewCount >= PASS_1_MAX_REVIEWERS
    ).length;
    const p2Reviewed = submissions.filter(
      (s) => s.pass2.aggregate.reviewCount > 0
    ).length;
    const finalists = submissions.filter(
      (s) => s.finalDecision === 'finalist'
    ).length;
    return { total, p1Reviewed, p1Complete, p2Reviewed, finalists };
  }, [submissions]);

  // Auto-select first team if none selected
  useEffect(() => {
    if (!selectedTeamId && filteredSubmissions.length > 0 && !loading) {
      handleSelectTeam(filteredSubmissions[0].teamId);
      setIsMobileDetailView(false); // Don't auto-navigate on mobile
    }
  }, [filteredSubmissions, selectedTeamId, loading, handleSelectTeam]);

  if (!user) {
    return <PageContainer>Loading...</PageContainer>;
  }

  if (
    user.role !== HibiscusRole.SUPERADMIN &&
    user.role !== HibiscusRole.JUDGE
  ) {
    return <PageContainer>Access denied</PageContainer>;
  }

  if (loading) {
    return <PageContainer>Loading submissions...</PageContainer>;
  }

  if (error) {
    return <PageContainer>Error: {error}</PageContainer>;
  }

  return (
    <PageContainer onKeyDown={handleKeyDown} tabIndex={0}>
      <Header>
        <Title>JUDGE PORTAL</Title>
        <StatsRow>
          <StatBadge>Total: {stats.total}</StatBadge>
          <StatBadge>
            P1: {stats.p1Reviewed}/{stats.total} ({stats.p1Complete} complete)
          </StatBadge>
          <StatBadge>P2: {stats.p2Reviewed}</StatBadge>
          <StatBadge>Finalists: {stats.finalists}</StatBadge>
        </StatsRow>
      </Header>

      <SplitContainer>
        {/* Team List Panel */}
        <ListPanel $showOnMobile={!isMobileDetailView}>
          <FiltersSection>
            <SearchWrapper>
              <NeoInput
                placeholder="Search team or project..."
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
              />
            </SearchWrapper>

            <QuickFilterRow>
              <QuickFilterButton
                $active={myUnreviewedP1}
                onClick={() => setMyUnreviewedP1(!myUnreviewedP1)}
              >
                My Unreviewed P1
              </QuickFilterButton>
              <QuickFilterButton
                $active={myUnreviewedP2}
                onClick={() => setMyUnreviewedP2(!myUnreviewedP2)}
              >
                My Unreviewed P2
              </QuickFilterButton>
            </QuickFilterRow>

            <FilterRow>
              <FilterGroup>
                <FilterLabel>Track:</FilterLabel>
                <Select
                  value={trackFilter}
                  onChange={(e) =>
                    setTrackFilter(
                      e.target.value === 'all' ? 'all' : Number(e.target.value)
                    )
                  }
                >
                  <option value="all">All</option>
                  <option value="4">SDG 4</option>
                  <option value="11">SDG 11</option>
                  <option value="13">SDG 13</option>
                </Select>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Type:</FilterLabel>
                <Select
                  value={hardwareFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (
                      val === 'all' ||
                      val === 'hardware' ||
                      val === 'software'
                    ) {
                      setHardwareFilter(val);
                    }
                  }}
                >
                  <option value="all">All</option>
                  <option value="hardware">HW</option>
                  <option value="software">SW</option>
                </Select>
              </FilterGroup>
            </FilterRow>

            <FilterRow>
              <FilterGroup>
                <FilterLabel>P1:</FilterLabel>
                <Select
                  value={pass1Filter}
                  onChange={(e) =>
                    setPass1Filter(e.target.value as FilterStatus)
                  }
                >
                  <option value="all">All</option>
                  <option value="needs_reviews">Needs Reviews</option>
                  <option value="unreviewed">Unreviewed</option>
                  <option value="yes">Yes</option>
                  <option value="maybe">Maybe</option>
                  <option value="no">No</option>
                </Select>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>P2:</FilterLabel>
                <Select
                  value={pass2Filter}
                  onChange={(e) =>
                    setPass2Filter(e.target.value as FilterStatus)
                  }
                >
                  <option value="all">All</option>
                  <option value="needs_reviews">Needs Reviews</option>
                  <option value="unreviewed">Unreviewed</option>
                  <option value="yes">Yes</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="no">No</option>
                </Select>
              </FilterGroup>

              <FilterGroup>
                <FilterLabel>Final:</FilterLabel>
                <Select
                  value={finalFilter}
                  onChange={(e) =>
                    setFinalFilter(e.target.value as FinalFilterStatus)
                  }
                >
                  <option value="all">All</option>
                  <option value="unreviewed">Unreviewed</option>
                  <option value="finalist">Finalist</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="not_selected">Not Selected</option>
                </Select>
              </FilterGroup>
            </FilterRow>

            <FilterRow>
              <FilterGroup>
                <FilterLabel>Sort:</FilterLabel>
                <Select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                >
                  <option value="teamName">Name</option>
                  <option value="pass1Avg">P1 Avg</option>
                  <option value="pass2Avg">P2 Avg</option>
                  <option value="p1ReviewCount">P1 Reviews</option>
                  <option value="p2ReviewCount">P2 Reviews</option>
                </Select>
                <SortButton onClick={() => setSortAsc(!sortAsc)}>
                  {sortAsc ? '↑' : '↓'}
                </SortButton>
              </FilterGroup>
            </FilterRow>
          </FiltersSection>

          <TeamList>
            {filteredSubmissions.length === 0 ? (
              <EmptyState>No submissions match your filters</EmptyState>
            ) : (
              filteredSubmissions.map((sub) => (
                <TeamListItem
                  key={sub.teamId}
                  $selected={selectedTeamId === sub.teamId}
                  onClick={() => handleSelectTeam(sub.teamId)}
                >
                  <TeamInfo>
                    <TeamName>{sub.teamName}</TeamName>
                    <TeamMeta>
                      {sub.track && (
                        <TrackBadge $sdg={sub.track.sdgNumber}>
                          SDG {sub.track.sdgNumber}
                        </TrackBadge>
                      )}
                      {sub.isHardware && <HWBadge>HW</HWBadge>}
                    </TeamMeta>
                  </TeamInfo>
                  <ScoreSummary>
                    <PassSummary>
                      <PassLabel>P1</PassLabel>
                      <ReviewCount
                        $complete={
                          sub.pass1.aggregate.reviewCount >=
                          PASS_1_MAX_REVIEWERS
                        }
                      >
                        {sub.pass1.aggregate.reviewCount}/{PASS_1_MAX_REVIEWERS}
                      </ReviewCount>
                      {sub.pass1Avg !== null && (
                        <AvgScore>{sub.pass1Avg.toFixed(1)}</AvgScore>
                      )}
                      <ConsensusBadge $decision={sub.pass1.aggregate.consensus}>
                        {sub.pass1.aggregate.consensus || '-'}
                      </ConsensusBadge>
                    </PassSummary>
                    <PassSummary>
                      <PassLabel>P2</PassLabel>
                      <ReviewCount
                        $complete={
                          sub.pass2.aggregate.reviewCount >=
                          PASS_2_MAX_REVIEWERS
                        }
                      >
                        {sub.pass2.aggregate.reviewCount}/{PASS_2_MAX_REVIEWERS}
                      </ReviewCount>
                      {sub.pass2Avg !== null && (
                        <AvgScore>{sub.pass2Avg.toFixed(1)}</AvgScore>
                      )}
                      <ConsensusBadge $decision={sub.pass2.aggregate.consensus}>
                        {sub.pass2.aggregate.consensus || '-'}
                      </ConsensusBadge>
                    </PassSummary>
                  </ScoreSummary>
                </TeamListItem>
              ))
            )}
          </TeamList>

          <ListFooter>
            Showing {filteredSubmissions.length} of {submissions.length} teams
          </ListFooter>
        </ListPanel>

        {/* Detail Panel */}
        <DetailPanel $showOnMobile={isMobileDetailView}>
          {selectedSubmission ? (
            <>
              <DetailHeader>
                <BackButton onClick={handleBackToList}>← Back</BackButton>
                <DetailTitle>
                  {selectedSubmission.teamName}
                  {selectedSubmission.projectTitle && (
                    <ProjectTitle>
                      {' '}
                      - {selectedSubmission.projectTitle}
                    </ProjectTitle>
                  )}
                </DetailTitle>
                <DetailMeta>
                  {selectedSubmission.track && (
                    <TrackBadge $sdg={selectedSubmission.track.sdgNumber}>
                      SDG {selectedSubmission.track.sdgNumber} -{' '}
                      {selectedSubmission.track.name}
                    </TrackBadge>
                  )}
                  {selectedSubmission.isHardware && (
                    <HardwareBadge>HARDWARE PROJECT</HardwareBadge>
                  )}
                </DetailMeta>
              </DetailHeader>

              <LinksSection>
                <SectionTitle>Submission Links</SectionTitle>
                <LinksGrid>
                  {selectedSubmission.submission?.githubUrl && (
                    <LinkButton
                      href={selectedSubmission.submission.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </LinkButton>
                  )}
                  {selectedSubmission.submission?.youtubeUrl && (
                    <LinkButton
                      href={selectedSubmission.submission.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Video
                    </LinkButton>
                  )}
                  {selectedSubmission.submission?.liveUrl && (
                    <LinkButton
                      href={selectedSubmission.submission.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Demo
                    </LinkButton>
                  )}
                  {selectedSubmission.submission?.pdfUrl && (
                    <LinkButton
                      href={selectedSubmission.submission.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      PDF
                    </LinkButton>
                  )}
                  {selectedSubmission.submission?.hwBomUrl && (
                    <LinkButton
                      href={selectedSubmission.submission.hwBomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      BOM
                    </LinkButton>
                  )}
                </LinksGrid>
              </LinksSection>

              <PassTabs>
                <PassTab
                  $active={activePass === 1}
                  onClick={() => handleSwitchPass(1)}
                >
                  Pass 1 ({selectedSubmission.pass1.aggregate.reviewCount}/
                  {PASS_1_MAX_REVIEWERS})
                </PassTab>
                <PassTab
                  $active={activePass === 2}
                  $disabled={
                    selectedSubmission.pass1.aggregate.reviewCount === 0
                  }
                  onClick={() => handleSwitchPass(2)}
                >
                  Pass 2 ({selectedSubmission.pass2.aggregate.reviewCount}/
                  {PASS_2_MAX_REVIEWERS})
                </PassTab>
                <PassTab
                  $active={activePass === 'final'}
                  $disabled={
                    selectedSubmission.pass2.aggregate.reviewCount === 0
                  }
                  onClick={() => handleSwitchPass('final')}
                >
                  Final
                </PassTab>
              </PassTabs>

              <ScoringContent>
                {activePass !== 'final' && (
                  <>
                    {/* Your Review Form - Primary action, shown first */}
                    <YourScoresSection>
                      <SectionTitle>Your Review</SectionTitle>
                      {(activePass === 1
                        ? selectedSubmission.pass1.aggregate.reviewCount >=
                          PASS_1_MAX_REVIEWERS
                        : selectedSubmission.pass2.aggregate.reviewCount >=
                          PASS_2_MAX_REVIEWERS) &&
                      !(activePass === 1
                        ? selectedSubmission.myPass1Score
                        : selectedSubmission.myPass2Score) ? (
                        <CapReached>
                          This pass has reached its maximum reviewer count (
                          {activePass === 1
                            ? PASS_1_MAX_REVIEWERS
                            : PASS_2_MAX_REVIEWERS}
                          ).
                        </CapReached>
                      ) : (
                        <>
                          <ScoresGrid>
                            {CRITERIA.map((criterion) => (
                              <ScoreRow key={criterion}>
                                <ScoreLabel>
                                  <strong>{CRITERIA_LABELS[criterion]}</strong>
                                  <ScoreHint>
                                    {CRITERIA_HINTS[criterion]}
                                  </ScoreHint>
                                </ScoreLabel>
                                <ScoreButtons>
                                  {[1, 2, 3, 4, 5].map((score) => (
                                    <ScoreButton
                                      key={score}
                                      $selected={
                                        localScores[criterion] === score
                                      }
                                      onClick={() =>
                                        setLocalScores((prev) => ({
                                          ...prev,
                                          [criterion]: score,
                                        }))
                                      }
                                    >
                                      {score}
                                    </ScoreButton>
                                  ))}
                                </ScoreButtons>
                              </ScoreRow>
                            ))}
                          </ScoresGrid>

                          <DecisionRow>
                            <DecisionLabel>Decision:</DecisionLabel>
                            <DecisionButtons>
                              {activePass === 1 ? (
                                <>
                                  <DecisionBtn
                                    $variant="yes"
                                    $selected={localDecision === 'yes'}
                                    onClick={() => setLocalDecision('yes')}
                                  >
                                    Yes
                                  </DecisionBtn>
                                  <DecisionBtn
                                    $variant="maybe"
                                    $selected={localDecision === 'maybe'}
                                    onClick={() => setLocalDecision('maybe')}
                                  >
                                    Maybe
                                  </DecisionBtn>
                                  <DecisionBtn
                                    $variant="no"
                                    $selected={localDecision === 'no'}
                                    onClick={() => setLocalDecision('no')}
                                  >
                                    No
                                  </DecisionBtn>
                                </>
                              ) : (
                                <>
                                  <DecisionBtn
                                    $variant="yes"
                                    $selected={localDecision === 'yes'}
                                    onClick={() => setLocalDecision('yes')}
                                  >
                                    Yes
                                  </DecisionBtn>
                                  <DecisionBtn
                                    $variant="maybe"
                                    $selected={localDecision === 'waitlist'}
                                    onClick={() => setLocalDecision('waitlist')}
                                  >
                                    Waitlist
                                  </DecisionBtn>
                                  <DecisionBtn
                                    $variant="no"
                                    $selected={localDecision === 'no'}
                                    onClick={() => setLocalDecision('no')}
                                  >
                                    No
                                  </DecisionBtn>
                                </>
                              )}
                            </DecisionButtons>
                          </DecisionRow>

                          <NotesWrapper>
                            <NeoInput
                              label="Notes"
                              multiline
                              value={localNotes}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setLocalNotes(e.target.value)
                              }
                              placeholder="Add your notes here..."
                            />
                          </NotesWrapper>
                        </>
                      )}
                    </YourScoresSection>

                    {/* Other Reviewers' Scores - Reference info, shown after */}
                    <ReviewersSection>
                      <SectionTitle>
                        Other Reviews (
                        {activePass === 1
                          ? selectedSubmission.pass1.aggregate.reviewCount
                          : selectedSubmission.pass2.aggregate.reviewCount}
                        /
                        {activePass === 1
                          ? PASS_1_MAX_REVIEWERS
                          : PASS_2_MAX_REVIEWERS}
                        )
                      </SectionTitle>
                      <ReviewersList>
                        {(activePass === 1
                          ? selectedSubmission.pass1.scores
                          : selectedSubmission.pass2.scores
                        )
                          .filter((score) => score.judgeId !== user?.userId)
                          .map((score, idx) => (
                            <ReviewerCard
                              key={score.judgeId || idx}
                              $isMe={false}
                            >
                              <ReviewerName>
                                {score.judgeName || 'Unknown'}
                              </ReviewerName>
                              <ReviewerScores>
                                <ScorePill>P: {score.problem ?? '-'}</ScorePill>
                                <ScorePill>
                                  S: {score.solution ?? '-'}
                                </ScorePill>
                                <ScorePill>
                                  I: {score.implementation ?? '-'}
                                </ScorePill>
                                <ScorePill>R: {score.roadmap ?? '-'}</ScorePill>
                                <ScorePill $highlight>
                                  Avg: {score.avgScore?.toFixed(1) ?? '-'}
                                </ScorePill>
                              </ReviewerScores>
                              <ReviewerDecision $decision={score.decision}>
                                {score.decision || 'No decision'}
                              </ReviewerDecision>
                              {score.notes && (
                                <ReviewerNotes>{score.notes}</ReviewerNotes>
                              )}
                            </ReviewerCard>
                          ))}
                        {(activePass === 1
                          ? selectedSubmission.pass1.scores
                          : selectedSubmission.pass2.scores
                        ).filter((score) => score.judgeId !== user?.userId)
                          .length === 0 && (
                          <EmptyReviews>No other reviews yet</EmptyReviews>
                        )}
                      </ReviewersList>

                      {/* Aggregate */}
                      {(activePass === 1
                        ? selectedSubmission.pass1
                        : selectedSubmission.pass2
                      ).aggregate.reviewCount > 0 && (
                        <AggregateSection>
                          <AggregateTitle>Aggregate</AggregateTitle>
                          <AggregateScores>
                            <ScorePill>
                              P:{' '}
                              {(activePass === 1
                                ? selectedSubmission.pass1
                                : selectedSubmission.pass2
                              ).aggregate.avgProblem?.toFixed(1) ?? '-'}
                            </ScorePill>
                            <ScorePill>
                              S:{' '}
                              {(activePass === 1
                                ? selectedSubmission.pass1
                                : selectedSubmission.pass2
                              ).aggregate.avgSolution?.toFixed(1) ?? '-'}
                            </ScorePill>
                            <ScorePill>
                              I:{' '}
                              {(activePass === 1
                                ? selectedSubmission.pass1
                                : selectedSubmission.pass2
                              ).aggregate.avgImplementation?.toFixed(1) ?? '-'}
                            </ScorePill>
                            <ScorePill>
                              R:{' '}
                              {(activePass === 1
                                ? selectedSubmission.pass1
                                : selectedSubmission.pass2
                              ).aggregate.avgRoadmap?.toFixed(1) ?? '-'}
                            </ScorePill>
                            <ScorePill $highlight>
                              Total:{' '}
                              {(activePass === 1
                                ? selectedSubmission.pass1
                                : selectedSubmission.pass2
                              ).aggregate.avgTotal?.toFixed(1) ?? '-'}
                            </ScorePill>
                          </AggregateScores>
                          <ConsensusDisplay>
                            <ConsensusLabel>Consensus:</ConsensusLabel>
                            <ConsensusBadge
                              $decision={
                                (activePass === 1
                                  ? selectedSubmission.pass1
                                  : selectedSubmission.pass2
                                ).aggregate.consensus
                              }
                              $large
                            >
                              {(activePass === 1
                                ? selectedSubmission.pass1
                                : selectedSubmission.pass2
                              ).aggregate.consensus || 'N/A'}
                            </ConsensusBadge>
                            <VoteBreakdown>
                              {Object.entries(
                                (activePass === 1
                                  ? selectedSubmission.pass1
                                  : selectedSubmission.pass2
                                ).aggregate.decisions
                              ).map(([decision, count]) => (
                                <VoteCount key={decision} $decision={decision}>
                                  {decision}: {count}
                                </VoteCount>
                              ))}
                            </VoteBreakdown>
                          </ConsensusDisplay>
                        </AggregateSection>
                      )}
                    </ReviewersSection>
                  </>
                )}

                {activePass === 'final' && (
                  <FinalDecisionSection>
                    <SectionTitle>Final Decision</SectionTitle>

                    <PreviousNotesSection>
                      <PreviousNotesTitle>Review Summary</PreviousNotesTitle>
                      <ReviewSummaryGrid>
                        <ReviewSummaryCard>
                          <ReviewSummaryTitle>Pass 1</ReviewSummaryTitle>
                          <ReviewSummaryScore>
                            Avg:{' '}
                            {selectedSubmission.pass1Avg?.toFixed(1) ?? '-'}
                          </ReviewSummaryScore>
                          <ConsensusBadge
                            $decision={
                              selectedSubmission.pass1.aggregate.consensus
                            }
                          >
                            {selectedSubmission.pass1.aggregate.consensus ||
                              'N/A'}
                          </ConsensusBadge>
                        </ReviewSummaryCard>
                        <ReviewSummaryCard>
                          <ReviewSummaryTitle>Pass 2</ReviewSummaryTitle>
                          <ReviewSummaryScore>
                            Avg:{' '}
                            {selectedSubmission.pass2Avg?.toFixed(1) ?? '-'}
                          </ReviewSummaryScore>
                          <ConsensusBadge
                            $decision={
                              selectedSubmission.pass2.aggregate.consensus
                            }
                          >
                            {selectedSubmission.pass2.aggregate.consensus ||
                              'N/A'}
                          </ConsensusBadge>
                        </ReviewSummaryCard>
                      </ReviewSummaryGrid>
                    </PreviousNotesSection>

                    <DecisionRow>
                      <DecisionLabel>Final Decision:</DecisionLabel>
                      <DecisionButtons>
                        <FinalDecisionBtn
                          $variant="finalist"
                          $selected={localDecision === 'finalist'}
                          onClick={() => setLocalDecision('finalist')}
                        >
                          Finalist
                        </FinalDecisionBtn>
                        <FinalDecisionBtn
                          $variant="waitlist"
                          $selected={localDecision === 'waitlist'}
                          onClick={() => setLocalDecision('waitlist')}
                        >
                          Waitlist
                        </FinalDecisionBtn>
                        <FinalDecisionBtn
                          $variant="not_selected"
                          $selected={localDecision === 'not_selected'}
                          onClick={() => setLocalDecision('not_selected')}
                        >
                          Not Selected
                        </FinalDecisionBtn>
                      </DecisionButtons>
                    </DecisionRow>
                  </FinalDecisionSection>
                )}

                {/* Sticky Save Bar - only show if user can save */}
                {(activePass === 'final' ||
                  !(
                    (activePass === 1
                      ? selectedSubmission.pass1.aggregate.reviewCount >=
                        PASS_1_MAX_REVIEWERS
                      : selectedSubmission.pass2.aggregate.reviewCount >=
                        PASS_2_MAX_REVIEWERS) &&
                    !(activePass === 1
                      ? selectedSubmission.myPass1Score
                      : selectedSubmission.myPass2Score)
                  )) && (
                  <StickyActionBar>
                    <NeoButton
                      variant="primary"
                      onClick={
                        activePass === 'final'
                          ? handleSaveFinalDecision
                          : handleSaveScore
                      }
                      loading={
                        activePass === 'final'
                          ? savingFinalDecision
                          : savingScore
                      }
                    >
                      {activePass === 'final'
                        ? 'Save Final Decision'
                        : 'Save Score'}
                    </NeoButton>
                    {saveSuccess && (
                      <SuccessToast>✓ {saveSuccess}</SuccessToast>
                    )}
                  </StickyActionBar>
                )}
              </ScoringContent>
            </>
          ) : (
            <EmptyDetail>Select a team to view details</EmptyDetail>
          )}
        </DetailPanel>
      </SplitContainer>
    </PageContainer>
  );
}

// Styled components
const PageContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem;
  background: ${neoColors.background};
  min-height: 100vh;
  outline: none;

  @media (min-width: 900px) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 900;
  margin: 0 0 0.5rem 0;
  color: ${neoColors.text};

  @media (min-width: 900px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;

const StatsRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const StatBadge = styled.span`
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  padding: 0.25rem 0.5rem;
  font-weight: 600;
  font-size: 0.75rem;

  @media (min-width: 900px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
`;

const SplitContainer = styled.div`
  display: flex;
  gap: 1rem;
  height: calc(100vh - 150px);

  @media (max-width: 899px) {
    height: calc(100vh - 120px);
  }
`;

const ListPanel = styled.div<{ $showOnMobile: boolean }>`
  width: 400px;
  min-width: 350px;
  display: flex;
  flex-direction: column;
  background: ${neoColors.surface};
  border: ${neoBorders.thick};
  overflow: hidden;

  @media (max-width: 899px) {
    display: ${({ $showOnMobile }) => ($showOnMobile ? 'flex' : 'none')};
    width: 100%;
    min-width: unset;
  }
`;

const FiltersSection = styled.div`
  padding: 0.75rem;
  border-bottom: ${neoBorders.standard};
  background: ${neoColors.background};
`;

const SearchWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const QuickFilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const QuickFilterButton = styled.button<{ $active: boolean }>`
  padding: 0.375rem 0.75rem;
  border: ${neoBorders.standard};
  background: ${({ $active }) =>
    $active ? neoColors.accent.blue : neoColors.surface};
  color: ${({ $active }) => ($active ? '#fff' : neoColors.text)};
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ $active }) =>
      $active ? neoColors.accent.blue : neoColors.background};
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const FilterLabel = styled.span`
  font-weight: 600;
  font-size: 0.75rem;
`;

const Select = styled.select`
  padding: 0.25rem 0.5rem;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  font-family: inherit;
  font-size: 0.75rem;
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: ${neoShadows.small};
  }
`;

const SortButton = styled.button`
  padding: 0.25rem 0.5rem;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  cursor: pointer;
  font-weight: 700;

  &:hover {
    background: ${neoColors.background};
  }
`;

const TeamList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const TeamListItem = styled.div<{ $selected: boolean }>`
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  background: ${({ $selected }) =>
    $selected ? neoColors.accent.blue + '20' : neoColors.surface};
  border-left: 3px solid
    ${({ $selected }) => ($selected ? neoColors.accent.blue : 'transparent')};

  &:hover {
    background: ${({ $selected }) =>
      $selected ? neoColors.accent.blue + '20' : neoColors.background};
  }
`;

const TeamInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const TeamName = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
`;

const TeamMeta = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const TrackBadge = styled.span<{ $sdg: number }>`
  display: inline-block;
  padding: 0.125rem 0.375rem;
  font-size: 0.65rem;
  font-weight: 700;
  border: 2px solid;
  background: ${({ $sdg }) => getSDGColor($sdg).bg};
  border-color: ${({ $sdg }) => getSDGColor($sdg).border};
  color: ${({ $sdg }) => getSDGColor($sdg).border};
`;

const HWBadge = styled.span`
  display: inline-block;
  padding: 0.125rem 0.375rem;
  font-size: 0.65rem;
  font-weight: 700;
  background: ${neoColors.accent.yellow};
  border: 2px solid #000;
`;

const ScoreSummary = styled.div`
  display: flex;
  gap: 1rem;
`;

const PassSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
`;

const PassLabel = styled.span`
  font-weight: 700;
  color: ${neoColors.textMuted};
`;

const ReviewCount = styled.span<{ $complete: boolean }>`
  font-weight: 600;
  color: ${({ $complete }) =>
    $complete ? neoColors.status.success : neoColors.textMuted};
`;

const AvgScore = styled.span`
  font-weight: 700;
`;

const ConsensusBadge = styled.span<{
  $decision: string | null;
  $large?: boolean;
}>`
  display: inline-block;
  padding: ${({ $large }) =>
    $large ? '0.25rem 0.75rem' : '0.125rem 0.375rem'};
  font-size: ${({ $large }) => ($large ? '0.85rem' : '0.65rem')};
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ $decision }) => getDecisionColors($decision).bg};
  border: 2px solid ${({ $decision }) => getDecisionColors($decision).border};
  color: ${({ $decision }) =>
    $decision ? getDecisionColors($decision).border : '#999'};
`;

const ListFooter = styled.div`
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  color: ${neoColors.textMuted};
  border-top: ${neoBorders.standard};
  background: ${neoColors.background};
`;

const DetailPanel = styled.div<{ $showOnMobile: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${neoColors.surface};
  border: ${neoBorders.thick};
  overflow-y: auto;

  @media (max-width: 899px) {
    display: ${({ $showOnMobile }) => ($showOnMobile ? 'flex' : 'none')};
  }
`;

const DetailHeader = styled.div`
  padding: 1rem;
  border-bottom: ${neoBorders.standard};
  background: ${neoColors.background};
`;

const BackButton = styled.button`
  display: none;
  padding: 0.25rem 0.5rem;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;

  @media (max-width: 899px) {
    display: inline-block;
  }
`;

const DetailTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 900;
  margin: 0 0 0.5rem 0;
`;

const ProjectTitle = styled.span`
  font-weight: 400;
  color: ${neoColors.textMuted};
`;

const DetailMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const HardwareBadge = styled.div`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: ${neoColors.accent.yellow};
  border: ${neoBorders.standard};
  font-weight: 700;
  font-size: 0.75rem;
`;

const LinksSection = styled.div`
  padding: 1rem;
  border-bottom: ${neoBorders.standard};
`;

const SectionTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
`;

const LinksGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const LinkButton = styled.a`
  display: inline-block;
  padding: 0.5rem 1rem;
  background: ${neoColors.accent.blue};
  color: #fff;
  border: ${neoBorders.standard};
  text-decoration: none;
  font-weight: 600;
  font-size: 0.8rem;

  &:hover {
    transform: translate(1px, 1px);
    box-shadow: 1px 1px 0 #000;
  }
`;

const PassTabs = styled.div`
  display: flex;
  border-bottom: ${neoBorders.standard};
`;

const PassTab = styled.button<{ $active: boolean; $disabled?: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-bottom: 3px solid
    ${({ $active }) => ($active ? neoColors.accent.blue : 'transparent')};
  background: ${({ $active }) =>
    $active ? neoColors.surface : neoColors.background};
  color: ${({ $disabled }) =>
    $disabled ? neoColors.textMuted : neoColors.text};
  font-weight: 700;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background: ${neoColors.surface};
  }
`;

const ScoringContent = styled.div`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
`;

const ReviewersSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ReviewersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ReviewerCard = styled.div<{ $isMe: boolean }>`
  padding: 0.75rem;
  background: ${({ $isMe }) =>
    $isMe ? neoColors.accent.blue + '10' : neoColors.background};
  border: ${neoBorders.standard};
  border-left: 3px solid
    ${({ $isMe }) => ($isMe ? neoColors.accent.blue : 'transparent')};
`;

const ReviewerName = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const ReviewerScores = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

const ScorePill = styled.span<{ $highlight?: boolean }>`
  padding: 0.25rem 0.5rem;
  background: ${({ $highlight }) =>
    $highlight ? neoColors.accent.yellow : '#eee'};
  border: 1px solid #ccc;
  font-size: 0.75rem;
  font-weight: ${({ $highlight }) => ($highlight ? 700 : 400)};
`;

const ReviewerDecision = styled.div<{ $decision: string | null }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ $decision }) => getDecisionColors($decision).bg};
  border: 2px solid ${({ $decision }) => getDecisionColors($decision).border};
  color: ${({ $decision }) =>
    $decision ? getDecisionColors($decision).border : '#999'};
`;

const ReviewerNotes = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${neoColors.textMuted};
  font-style: italic;
`;

const EmptyReviews = styled.div`
  padding: 1rem;
  text-align: center;
  color: ${neoColors.textMuted};
  font-style: italic;
`;

const AggregateSection = styled.div`
  padding: 0.75rem;
  background: ${neoColors.background};
  border: ${neoBorders.standard};
`;

const AggregateTitle = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const AggregateScores = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
`;

const ConsensusDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ConsensusLabel = styled.span`
  font-weight: 700;
  font-size: 0.85rem;
`;

const VoteBreakdown = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const VoteCount = styled.span<{ $decision: string }>`
  font-size: 0.75rem;
  color: ${({ $decision }) => getDecisionColors($decision).border};
`;

const YourScoresSection = styled.div`
  padding: 1rem;
  background: ${neoColors.background};
  border: ${neoBorders.standard};
`;

const CapReached = styled.div`
  padding: 1rem;
  text-align: center;
  color: ${neoColors.status.error};
  font-weight: 600;
`;

const ScoresGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ScoreRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const ScoreLabel = styled.div`
  flex: 1;
`;

const ScoreHint = styled.div`
  font-size: 0.75rem;
  color: ${neoColors.textMuted};
  margin-top: 0.25rem;
`;

const ScoreButtons = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ScoreButton = styled.button<{ $selected: boolean }>`
  width: 36px;
  height: 36px;
  border: ${neoBorders.standard};
  background: ${({ $selected }) =>
    $selected ? neoColors.accent.blue : neoColors.surface};
  color: ${({ $selected }) => ($selected ? '#fff' : neoColors.text)};
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: ${({ $selected }) =>
      $selected ? neoColors.accent.blue : neoColors.background};
  }
`;

const DecisionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const DecisionLabel = styled.span`
  font-weight: 700;
`;

const DecisionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const DecisionBtn = styled.button<{
  $variant: 'yes' | 'maybe' | 'no';
  $selected: boolean;
}>`
  padding: 0.5rem 1.25rem;
  border: ${neoBorders.standard};
  font-weight: 700;
  cursor: pointer;
  background: ${({ $variant, $selected }) => {
    if (!$selected) return neoColors.surface;
    switch ($variant) {
      case 'yes':
        return neoColors.status.success;
      case 'maybe':
        return neoColors.status.warning;
      case 'no':
        return neoColors.status.error;
    }
  }};
  color: ${({ $selected }) => ($selected ? '#fff' : neoColors.text)};

  &:hover {
    opacity: 0.9;
  }
`;

const NotesWrapper = styled.div`
  margin-bottom: 1rem;
`;

const StickyActionBar = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem;
  background: ${neoColors.surface};
  border-top: ${neoBorders.thick};
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem -1rem -1rem -1rem;
  z-index: 10;
`;

const SuccessToast = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: ${neoColors.status.success};
  color: #fff;
  font-weight: 600;
  font-size: 0.85rem;
  border: ${neoBorders.standard};
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const FinalDecisionSection = styled.div``;

const PreviousNotesSection = styled.div`
  margin-bottom: 1.5rem;
`;

const PreviousNotesTitle = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
`;

const ReviewSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const ReviewSummaryCard = styled.div`
  padding: 1rem;
  background: ${neoColors.background};
  border: ${neoBorders.standard};
  text-align: center;
`;

const ReviewSummaryTitle = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
`;

const ReviewSummaryScore = styled.div`
  font-size: 1.25rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
`;

const FinalDecisionBtn = styled.button<{
  $variant: 'finalist' | 'waitlist' | 'not_selected';
  $selected: boolean;
}>`
  padding: 0.75rem 1.5rem;
  border: ${neoBorders.standard};
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  background: ${({ $variant, $selected }) =>
    $selected ? getDecisionColors($variant).border : neoColors.surface};
  color: ${({ $selected }) => ($selected ? '#fff' : neoColors.text)};

  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${neoColors.textMuted};
`;

const EmptyDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${neoColors.textMuted};
  font-size: 1rem;
`;
