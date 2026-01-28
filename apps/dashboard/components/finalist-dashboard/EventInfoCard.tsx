import React from 'react';
import styled from 'styled-components';
import { neoColors } from '../neo-ui/theme';
import { HeroBanner, HeroMeta, MetaItem, MetaLabel, MetaValue } from './common';

export interface EventInfoCardProps {
  date: string;
  checkIn: string;
  kickoff: string;
  venueName: string;
  venueLine: string;
}

export function EventInfoCard(props: EventInfoCardProps) {
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
          <MetaLabel>Venue</MetaLabel>
          <MetaValue>
            {props.venueName}
            <br />
            <VenueLine>{props.venueLine}</VenueLine>
          </MetaValue>
        </MetaItem>
      </HeroMeta>
    </HeroBanner>
  );
}

const VenueLine = styled.span`
  color: ${neoColors.textMuted};
`;

export default EventInfoCard;
