import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import useHibiscusUser from '../../hooks/use-hibiscus-user/use-hibiscus-user';
import { HibiscusRole } from '@hibiscus/types';
import {
  NeoButton,
  NeoCard,
  NeoInput,
  NeoBadge,
  neoColors,
  neoBorders,
  neoShadows,
} from '../../components/neo-ui';
import type {
  SubmissionForJudging,
  JudgingNotes,
} from '../api/judge/submissions';

type Pass1Decision = 'yes' | 'no' | 'maybe';
type Pass2Decision = 'yes' | 'no' | 'waitlist';
type FilterStatus = 'all' | 'yes' | 'no' | 'maybe' | 'waitlist' | 'unreviewed';
type HardwareFilter = 'all' | 'hardware' | 'software';
type SortField = 'teamName' | 'pass1Avg' | 'pass2Avg';

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

export default function JudgePortal() {
  const { user } = useHibiscusUser();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<SubmissionForJudging[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [savingTeamId, setSavingTeamId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [pass1Filter, setPass1Filter] = useState<FilterStatus>('all');
  const [pass2Filter, setPass2Filter] = useState<FilterStatus>('all');
  const [trackFilter, setTrackFilter] = useState<number | 'all'>('all');
  const [hardwareFilter, setHardwareFilter] = useState<HardwareFilter>('all');
  const [sortField, setSortField] = useState<SortField>('teamName');
  const [sortAsc, setSortAsc] = useState(true);

  // Local edits for expanded row
  const [localScores, setLocalScores] = useState<Record<string, number | null>>(
    {}
  );
  const [localDecision, setLocalDecision] = useState<
    Pass1Decision | Pass2Decision | null
  >(null);
  const [localNotes, setLocalNotes] = useState('');
  const [activePass, setActivePass] = useState<1 | 2>(1);

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

  // When expanding a row, load its current values
  const handleExpand = (teamId: string) => {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
      return;
    }

    const sub = submissions.find((s) => s.teamId === teamId);
    if (!sub) return;

    setExpandedTeamId(teamId);
    setActivePass(1);

    // Load pass 1 scores
    const notes = sub.judgingNotes;
    setLocalScores({
      problem: notes?.pass_1_problem ?? null,
      solution: notes?.pass_1_solution ?? null,
      implementation: notes?.pass_1_implementation ?? null,
      roadmap: notes?.pass_1_roadmap ?? null,
    });
    setLocalDecision(notes?.pass_1 ?? null);
    setLocalNotes(notes?.pass_1_notes ?? '');
  };

  // Switch between pass 1 and pass 2
  const handleSwitchPass = (pass: 1 | 2) => {
    if (!expandedTeamId) return;

    const sub = submissions.find((s) => s.teamId === expandedTeamId);
    if (!sub) return;

    // Can't switch to pass 2 if pass 1 isn't complete
    if (pass === 2 && !sub.judgingNotes?.pass_1) return;

    setActivePass(pass);
    const notes = sub.judgingNotes;

    if (pass === 1) {
      setLocalScores({
        problem: notes?.pass_1_problem ?? null,
        solution: notes?.pass_1_solution ?? null,
        implementation: notes?.pass_1_implementation ?? null,
        roadmap: notes?.pass_1_roadmap ?? null,
      });
      setLocalDecision(notes?.pass_1 ?? null);
      setLocalNotes(notes?.pass_1_notes ?? '');
    } else {
      setLocalScores({
        problem: notes?.pass_2_problem ?? null,
        solution: notes?.pass_2_solution ?? null,
        implementation: notes?.pass_2_implementation ?? null,
        roadmap: notes?.pass_2_roadmap ?? null,
      });
      setLocalDecision(notes?.pass_2 ?? null);
      setLocalNotes(notes?.pass_2_notes ?? '');
    }
  };

  // Save scores
  const handleSave = async () => {
    if (!expandedTeamId) return;

    setSavingTeamId(expandedTeamId);

    const prefix = activePass === 1 ? 'pass_1' : 'pass_2';
    const payload: Record<string, unknown> = {
      [`${prefix}_problem`]: localScores.problem,
      [`${prefix}_solution`]: localScores.solution,
      [`${prefix}_implementation`]: localScores.implementation,
      [`${prefix}_roadmap`]: localScores.roadmap,
      [`${prefix}_notes`]: localNotes || null,
      [prefix]: localDecision,
    };

    try {
      const res = await fetch(`/api/judge/notes/${expandedTeamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to save');
      }

      // Refresh data
      await fetchSubmissions();
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save notes');
    } finally {
      setSavingTeamId(null);
    }
  };

  // Filter and sort
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
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
        result = result.filter((s) => !s.judgingNotes?.pass_1);
      } else {
        result = result.filter((s) => s.judgingNotes?.pass_1 === pass1Filter);
      }
    }

    // Pass 2 filter
    if (pass2Filter !== 'all') {
      if (pass2Filter === 'unreviewed') {
        result = result.filter((s) => !s.judgingNotes?.pass_2);
      } else {
        result = result.filter((s) => s.judgingNotes?.pass_2 === pass2Filter);
      }
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
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [
    submissions,
    searchQuery,
    pass1Filter,
    pass2Filter,
    trackFilter,
    hardwareFilter,
    sortField,
    sortAsc,
  ]);

  // Stats
  const stats = useMemo(() => {
    const total = submissions.length;
    const p1Reviewed = submissions.filter((s) => s.judgingNotes?.pass_1).length;
    const p1Yes = submissions.filter(
      (s) => s.judgingNotes?.pass_1 === 'yes'
    ).length;
    const p2Reviewed = submissions.filter((s) => s.judgingNotes?.pass_2).length;
    return { total, p1Reviewed, p1Yes, p2Reviewed };
  }, [submissions]);

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
    <PageContainer>
      <Header>
        <Title>JUDGE PORTAL</Title>
        <StatsRow>
          <StatBadge>Total: {stats.total}</StatBadge>
          <StatBadge>
            P1 Reviewed: {stats.p1Reviewed}/{stats.total}
          </StatBadge>
          <StatBadge>P1 Yes: {stats.p1Yes}</StatBadge>
          <StatBadge>P2 Reviewed: {stats.p2Reviewed}</StatBadge>
        </StatsRow>
      </Header>

      <FiltersRow>
        <SearchWrapper>
          <NeoInput
            placeholder="Search team or project..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery((e.target as HTMLInputElement).value)
            }
          />
        </SearchWrapper>

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
            <option value="4">SDG 4 - Education</option>
            <option value="11">SDG 11 - Cities</option>
            <option value="13">SDG 13 - Climate</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Type:</FilterLabel>
          <Select
            value={hardwareFilter}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'all' || val === 'hardware' || val === 'software') {
                setHardwareFilter(val);
              }
            }}
          >
            <option value="all">All</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>P1:</FilterLabel>
          <Select
            value={pass1Filter}
            onChange={(e) => setPass1Filter(e.target.value as FilterStatus)}
          >
            <option value="all">All</option>
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
            onChange={(e) => setPass2Filter(e.target.value as FilterStatus)}
          >
            <option value="all">All</option>
            <option value="unreviewed">Unreviewed</option>
            <option value="yes">Yes</option>
            <option value="waitlist">Waitlist</option>
            <option value="no">No</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Sort:</FilterLabel>
          <Select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
          >
            <option value="teamName">Team Name</option>
            <option value="pass1Avg">P1 Average</option>
            <option value="pass2Avg">P2 Average</option>
          </Select>
          <SortButton onClick={() => setSortAsc(!sortAsc)}>
            {sortAsc ? '↑' : '↓'}
          </SortButton>
        </FilterGroup>
      </FiltersRow>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th style={{ width: '40px' }}></Th>
              <Th>Team</Th>
              <Th>Project</Th>
              <Th>Track</Th>
              <Th>P1 Avg</Th>
              <Th>P1 Decision</Th>
              <Th>P2 Avg</Th>
              <Th>P2 Decision</Th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.map((sub) => (
              <React.Fragment key={sub.teamId}>
                <TableRow
                  onClick={() => handleExpand(sub.teamId)}
                  $expanded={expandedTeamId === sub.teamId}
                >
                  <Td>{expandedTeamId === sub.teamId ? '▼' : '▶'}</Td>
                  <Td>{sub.teamName}</Td>
                  <Td>{sub.projectTitle || '-'}</Td>
                  <Td>
                    {sub.track ? (
                      <TrackBadge $sdg={sub.track.sdgNumber}>
                        SDG {sub.track.sdgNumber}
                      </TrackBadge>
                    ) : (
                      '-'
                    )}
                  </Td>
                  <Td>
                    {sub.pass1Avg !== null ? sub.pass1Avg.toFixed(1) : '-'}
                  </Td>
                  <Td>
                    <DecisionBadge $decision={sub.judgingNotes?.pass_1 ?? null}>
                      {sub.judgingNotes?.pass_1 ?? '-'}
                    </DecisionBadge>
                  </Td>
                  <Td>
                    {sub.pass2Avg !== null ? sub.pass2Avg.toFixed(1) : '-'}
                  </Td>
                  <Td>
                    <DecisionBadge $decision={sub.judgingNotes?.pass_2 ?? null}>
                      {sub.judgingNotes?.pass_2 ?? '-'}
                    </DecisionBadge>
                  </Td>
                </TableRow>

                {expandedTeamId === sub.teamId && (
                  <ExpandedRow>
                    <ExpandedCell colSpan={8}>
                      <ExpandedContent>
                        <LinksSection>
                          <SectionTitle>Submission Links</SectionTitle>
                          <LinksGrid>
                            {sub.submission?.githubUrl && (
                              <LinkButton
                                href={sub.submission.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                GitHub
                              </LinkButton>
                            )}
                            {sub.submission?.youtubeUrl && (
                              <LinkButton
                                href={sub.submission.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Video
                              </LinkButton>
                            )}
                            {sub.submission?.liveUrl && (
                              <LinkButton
                                href={sub.submission.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Demo
                              </LinkButton>
                            )}
                            {sub.submission?.pdfUrl && (
                              <LinkButton
                                href={sub.submission.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                PDF
                              </LinkButton>
                            )}
                            {sub.submission?.hwBomUrl && (
                              <LinkButton
                                href={sub.submission.hwBomUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                BOM
                              </LinkButton>
                            )}
                          </LinksGrid>
                          {sub.isHardware && (
                            <HardwareBadge>HARDWARE PROJECT</HardwareBadge>
                          )}
                        </LinksSection>

                        <ScoringSection>
                          <PassTabs>
                            <PassTab
                              $active={activePass === 1}
                              onClick={() => handleSwitchPass(1)}
                            >
                              Pass 1
                            </PassTab>
                            {sub.judgingNotes?.pass_1 && (
                              <PassTab
                                $active={activePass === 2}
                                onClick={() => handleSwitchPass(2)}
                              >
                                Pass 2
                              </PassTab>
                            )}
                          </PassTabs>

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
                              onChange={(e) =>
                                setLocalNotes(
                                  (e.target as HTMLTextAreaElement).value
                                )
                              }
                              placeholder="Please include your name (e.g., [Abhinav] Great demo video...)"
                            />
                          </NotesWrapper>

                          <ActionButtons>
                            <NeoButton
                              variant="primary"
                              onClick={handleSave}
                              loading={savingTeamId === sub.teamId}
                            >
                              Save
                            </NeoButton>
                            <NeoButton
                              variant="secondary"
                              onClick={() => setExpandedTeamId(null)}
                            >
                              Close
                            </NeoButton>
                          </ActionButtons>
                        </ScoringSection>
                      </ExpandedContent>
                    </ExpandedCell>
                  </ExpandedRow>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>

        {filteredSubmissions.length === 0 && (
          <EmptyState>No submissions match your filters</EmptyState>
        )}
      </TableContainer>
    </PageContainer>
  );
}

// Styled components
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  background: ${neoColors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  color: ${neoColors.text};
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const StatBadge = styled.span`
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.85rem;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  align-items: flex-end;
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 200px;
  max-width: 300px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.span`
  font-weight: 600;
  font-size: 0.85rem;
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: ${neoShadows.small};
  }
`;

const SortButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  cursor: pointer;
  font-weight: 700;

  &:hover {
    background: ${neoColors.background};
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${neoColors.surface};
  border: ${neoBorders.thick};
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  border-bottom: ${neoBorders.standard};
  background: ${neoColors.background};
`;

const Td = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
`;

const TableRow = styled.tr<{ $expanded: boolean }>`
  cursor: pointer;
  background: ${({ $expanded }) =>
    $expanded ? neoColors.background : neoColors.surface};

  &:hover {
    background: ${neoColors.background};
  }
`;

const ExpandedRow = styled.tr`
  background: ${neoColors.background};
`;

const ExpandedCell = styled.td`
  padding: 0 !important;
`;

const ExpandedContent = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  border-top: ${neoBorders.standard};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const LinksSection = styled.div``;

const SectionTitle = styled.h4`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  text-transform: uppercase;
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

const HardwareBadge = styled.div`
  margin-top: 1rem;
  padding: 0.5rem;
  background: ${neoColors.accent.yellow};
  border: ${neoBorders.standard};
  font-weight: 700;
  font-size: 0.75rem;
  text-align: center;
`;

const ScoringSection = styled.div``;

const PassTabs = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 1rem;
`;

const PassTab = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: ${neoBorders.standard};
  background: ${({ $active }) =>
    $active ? neoColors.accent.blue : neoColors.surface};
  color: ${({ $active }) => ($active ? '#fff' : neoColors.text)};
  font-weight: 700;
  cursor: pointer;
  margin-right: -2px;

  &:first-child {
    border-right: none;
  }
`;

const ScoresGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
`;

const DecisionLabel = styled.span`
  font-weight: 700;
`;

const DecisionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const TrackBadge = styled.span<{ $sdg: number }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid;
  background: ${({ $sdg }) => {
    switch ($sdg) {
      case 4:
        return '#FFF3E0';
      case 11:
        return '#E8F5E9';
      case 13:
        return '#E3F2FD';
      default:
        return '#F5F5F5';
    }
  }};
  border-color: ${({ $sdg }) => {
    switch ($sdg) {
      case 4:
        return '#E65100';
      case 11:
        return '#2E7D32';
      case 13:
        return '#1565C0';
      default:
        return '#666';
    }
  }};
  color: ${({ $sdg }) => {
    switch ($sdg) {
      case 4:
        return '#E65100';
      case 11:
        return '#2E7D32';
      case 13:
        return '#1565C0';
      default:
        return '#666';
    }
  }};
`;

const DecisionBadge = styled.span<{ $decision: string | null }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${({ $decision }) => {
    switch ($decision) {
      case 'yes':
        return '#E8F5E9';
      case 'maybe':
      case 'waitlist':
        return '#FFF8E1';
      case 'no':
        return '#FFEBEE';
      default:
        return '#F5F5F5';
    }
  }};
  border: 2px solid
    ${({ $decision }) => {
      switch ($decision) {
        case 'yes':
          return neoColors.status.success;
        case 'maybe':
        case 'waitlist':
          return '#F57C00';
        case 'no':
          return neoColors.status.error;
        default:
          return '#ccc';
      }
    }};
  color: ${({ $decision }) => {
    switch ($decision) {
      case 'yes':
        return neoColors.status.success;
      case 'maybe':
      case 'waitlist':
        return '#F57C00';
      case 'no':
        return neoColors.status.error;
      default:
        return '#999';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${neoColors.textMuted};
  font-size: 1rem;
`;
