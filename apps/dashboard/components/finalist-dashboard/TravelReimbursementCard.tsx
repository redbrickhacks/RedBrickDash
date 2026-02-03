import React from 'react';
import { neoColors } from '../neo-ui/theme';
import {
  Card,
  CardHeader,
  CardTitle,
  EmbedFrame,
  EmbedShell,
  SmallMuted,
  StatusBadge,
  StatusRow,
} from './common';

export type TravelReimbursementStatus =
  | 'NOT_STARTED'
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface TravelReimbursementCardProps {
  status: TravelReimbursementStatus;
  lastUpdated: string;
  tallyUrl: string;
}

export function TravelReimbursementCard(props: TravelReimbursementCardProps) {
  return (
    <Card accent={neoColors.accent.green}>
      <CardHeader>
        <CardTitle>Travel reimbursement</CardTitle>
      </CardHeader>

      <StatusRow>
        <StatusBadge $tone={props.status}>
          {humanizeStatus(props.status)}
        </StatusBadge>
        <SmallMuted>Last Updated: {props.lastUpdated}</SmallMuted>
      </StatusRow>

      <SmallMuted>{statusMessage(props.status)}</SmallMuted>

      {['NOT_STARTED', 'DRAFT'].includes(props.status) ? (
        <EmbedShell>
          <EmbedFrame
            title="Travel reimbursement form"
            loading="lazy"
            src={props.tallyUrl}
          />
        </EmbedShell>
      ) : null}
    </Card>
  );
}

function humanizeStatus(status: TravelReimbursementStatus) {
  switch (status) {
    case 'NOT_STARTED':
      return 'Not started';
    case 'DRAFT':
      return 'Draft';
    case 'SUBMITTED':
      return 'Submitted';
    case 'UNDER_REVIEW':
      return 'Under review';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
  }
}

function statusMessage(status: TravelReimbursementStatus) {
  if (status === 'UNDER_REVIEW') {
    return 'We received your form. Ops is verifying receipts — expect an update soon.';
  }
  if (status === 'APPROVED') {
    return 'Approved. Payout will be processed shortly.';
  }
  if (status === 'REJECTED') {
    return 'Needs changes. Please re-submit with corrected details.';
  }
  return 'Submit the form to start your reimbursement request.';
}

export default TravelReimbursementCard;
