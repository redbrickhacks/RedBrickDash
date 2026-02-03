import React from 'react';
import styled from 'styled-components';
import { neoColors } from '../neo-ui/theme';
import { HeroBanner, HeroMeta, MetaItem, MetaLabel, MetaValue } from './common';

export interface EventInfoCardProps {
  date: string;
  checkIn: string;
  kickoff: string;
}

export function EventInfoCard(props: EventInfoCardProps) {
  const hackerPacketUrl = process.env.NEXT_PUBLIC_HACKER_PACKET_URL;

  return (
    <HeroBanner>
      <HeroMeta>
        <MetaItem>
          <MetaLabel>Date</MetaLabel>
          <MetaValue>{props.date}</MetaValue>
        </MetaItem>
        <MetaItem>
          <MetaLabel>Check-in</MetaLabel>
          <MetaValue>{props.checkIn}</MetaValue>
        </MetaItem>
        <MetaItem>
          <MetaLabel>Kickoff</MetaLabel>
          <MetaValue>{props.kickoff}</MetaValue>
        </MetaItem>
        <MetaItem>
          <MetaLabel>Hacker handbook</MetaLabel>
          <MetaValue>
            {hackerPacketUrl ? (
              <HandbookLink
                href={hackerPacketUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open
              </HandbookLink>
            ) : (
              <VenueLine>Coming soon</VenueLine>
            )}
          </MetaValue>
        </MetaItem>
      </HeroMeta>
    </HeroBanner>
  );
}

const VenueLine = styled.span`
  color: ${neoColors.textMuted};
`;

const HandbookLink = styled.a`
  color: ${neoColors.accent.blue};
  font-weight: 900;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;

  &:hover {
    opacity: 0.85;
  }
`;

export default EventInfoCard;
