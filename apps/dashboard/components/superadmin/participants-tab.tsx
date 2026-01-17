import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { ParticipantFilters } from './participant-filters';
import { ParticipantTable, Participant } from './participant-table';
import { BulkStatusModal } from './bulk-status-modal';
import { NeoButton, neoColors, neoBorders } from '../neo-ui';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function ParticipantsTab() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const fetchParticipants = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(pagination.page));
      params.set('limit', String(pagination.limit));
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/superadmin/participants?${params}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPagination((p) => ({ ...p, page: 1 }));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPagination((p) => ({ ...p, page: 1 }));
  }, [statusFilter]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === participants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(participants.map((p) => p.user_id)));
    }
  };

  const handleBulkUpdate = async (newStatus: number) => {
    const res = await fetch('/api/superadmin/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds: Array.from(selectedIds),
        newStatus,
      }),
    });

    if (res.ok) {
      setSelectedIds(new Set());
      fetchParticipants();
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to update');
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    window.open(`/api/superadmin/participants/export?${params}`, '_blank');
  };

  return (
    <Container>
      <TopBar>
        <ParticipantFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        <NeoButton variant="secondary" size="sm" onClick={handleExport}>
          Export CSV
        </NeoButton>
      </TopBar>

      {selectedIds.size > 0 && (
        <BulkBar>
          <span>
            <strong>{selectedIds.size}</strong> selected
          </span>
          <NeoButton
            variant="primary"
            size="sm"
            onClick={() => setIsBulkModalOpen(true)}
          >
            Update Status
          </NeoButton>
        </BulkBar>
      )}

      {isLoading ? (
        <LoadingText>Loading participants...</LoadingText>
      ) : (
        <>
          <ParticipantTable
            participants={participants}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            isAllSelected={
              participants.length > 0 &&
              selectedIds.size === participants.length
            }
          />

          <PaginationBar>
            <PaginationInfo>
              Showing {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total}
            </PaginationInfo>
            <PaginationButtons>
              <NeoButton
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page - 1 }))
                }
              >
                Previous
              </NeoButton>
              <PageNumber>
                Page {pagination.page} of {pagination.totalPages}
              </PageNumber>
              <NeoButton
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((p) => ({ ...p, page: p.page + 1 }))
                }
              >
                Next
              </NeoButton>
            </PaginationButtons>
          </PaginationBar>
        </>
      )}

      <BulkStatusModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedCount={selectedIds.size}
        onConfirm={handleBulkUpdate}
      />
    </Container>
  );
}

const Container = styled.div``;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
`;

const BulkBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: ${neoColors.accent.yellow};
  border: ${neoBorders.standard};
  margin-bottom: 1rem;
`;

const LoadingText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  font-weight: 500;
`;

const PaginationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const PaginationInfo = styled.span`
  font-size: 0.875rem;
  color: ${neoColors.textMuted};
`;

const PaginationButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PageNumber = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${neoColors.text};
`;
