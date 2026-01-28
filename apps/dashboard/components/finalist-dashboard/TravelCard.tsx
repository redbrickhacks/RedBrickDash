import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { neoBorders, neoColors } from '../neo-ui/theme';
import {
  CardTitle,
  FullWidthCard,
  OtpInlineLabel,
  OtpInlineValue,
  SmallMuted,
} from './common';

export interface TravelCardProps {
  venueName?: string;
  venueLine?: string;
}

export function TravelCard(props: TravelCardProps) {
  const [myGateOtp, setMyGateOtp] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/finalist/mygate-otp');
        if (!res.ok) return;
        const body = (await res.json()) as {
          data?: { myGateOtp?: number | null };
        };
        const value = body?.data?.myGateOtp;
        setMyGateOtp(value == null ? null : String(value));
      } catch {
        // ignore
      }
    };
    run();
  }, []);

  const venueName = props.venueName ?? 'Ashoka University';
  const venueLine =
    props.venueLine ??
    'Plot No. 2, Rajiv Gandhi Education City, Kundli, Sonipat, Haryana 131028';

  return (
    <FullWidthCard accent={neoColors.accent.blue}>
      <TravelGrid>
        <TravelLeft>
          <CardTitle>Travelling to Ashoka University</CardTitle>

          <div>
            <SectionLabel>STEP 1: Reaching Azadpur</SectionLabel>
            <RouteGrid>
              <RouteBox>
                <RouteTitle>From NDLS (New Delhi Railway Station)</RouteTitle>
                <List>
                  <li>
                    Take the <b>Yellow Line</b> (towards <b>Samaypur Badli</b>).
                  </li>
                  <li>
                    Get off at <b>Azadpur</b>.
                  </li>
                  <li>Follow signs for the main exit + shuttle pickup.</li>
                </List>
              </RouteBox>

              <RouteBox>
                <RouteTitle>From IGI Airport (T3)</RouteTitle>
                <List>
                  <li>
                    Take the <b>Airport Express</b> to <b>New Delhi</b>.
                  </li>
                  <li>
                    Switch to the <b>Yellow Line</b> towards{' '}
                    <b>Samaypur Badli</b>.
                  </li>
                  <li>
                    Get off at <b>Azadpur</b>.
                  </li>
                </List>
              </RouteBox>
            </RouteGrid>
          </div>

          <div>
            <SectionLabel>STEP 2: From Azadpur → Ashoka</SectionLabel>
            <List>
              <li>
                Board the <b>Ashoka University shuttle</b> (Force Traveller).
              </li>
              <li>
                On arrival, go to the <b>Gate No. 1</b>.
              </li>
              <li>
                Show your <b>MyGate OTP</b> at the gate and enter campus.
              </li>
              <li>Head to the help desk for your badge + Wi‑Fi.</li>
            </List>
          </div>

          <div>
            <SectionLabel>Alternative: Cab</SectionLabel>
            <List>
              <li>
                Book an Uber/Ola to <b>Ashoka University (Gate No. 1)</b>.
              </li>
              <li>
                At the gate, show your <b>MyGate OTP</b> to enter campus.
              </li>
            </List>
          </div>
        </TravelLeft>

        <RightStack>
          <MapWrap>
            <MapFrame
              title="Ashoka University map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.0985%2C28.9390%2C77.1165%2C28.9495&layer=mapnik&marker=28.9442%2C77.1075"
            />
            <MapOverlay>
              <MapOverlayButton
                type="button"
                onClick={() =>
                  window.open(
                    'https://www.google.com/maps/search/?api=1&query=Ashoka%20University%2C%20Sonipat',
                    '_blank'
                  )
                }
              >
                Open in Google Maps
              </MapOverlayButton>
            </MapOverlay>
          </MapWrap>

          <RightBottomRow>
            <SubCard aria-label="Venue">
              <OtpInlineLabel>Venue</OtpInlineLabel>
              <OtpInlineValue style={{ fontSize: '1.25rem', letterSpacing: 0 }}>
                {venueName}
              </OtpInlineValue>
              <SmallMuted>{venueLine}</SmallMuted>
            </SubCard>

            <SubCard aria-label="MyGate OTP">
              <div>
                <OtpInlineLabel>MyGate OTP</OtpInlineLabel>
                <OtpInlineValue>{myGateOtp ?? '*****'}</OtpInlineValue>
                {myGateOtp == null ? (
                  <SmallMuted>
                    Will be updated closer to the hackathon date.
                  </SmallMuted>
                ) : null}
              </div>
            </SubCard>
          </RightBottomRow>
        </RightStack>
      </TravelGrid>
    </FullWidthCard>
  );
}

const TravelGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1rem;
  align-items: stretch;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TravelLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
`;

const RightStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
`;

const RightBottomRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const List = styled.ul`
  padding-left: 0rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0;
  margin-top: 0.5rem;

  li {
    line-height: 1.2;
    font-size: 0.9rem;
  }
`;

const SectionLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 900;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
`;

const RouteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  padding-top: 0.5rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const RouteBox = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.background};
  padding: 0.75rem;
`;

const RouteTitle = styled.div`
  font-weight: 900;
  margin-bottom: 0.35rem;
  line-height: 1.2;
  font-size: 1.1rem;
`;

const SubCard = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.background};
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 140px;
`;

const MapWrap = styled.div`
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  flex: 1 1 auto;
  min-height: 320px;
`;

const MapFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
  background: ${neoColors.background};
`;

const MapOverlay = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const MapOverlayButton = styled.button`
  border: ${neoBorders.standard};
  background: ${neoColors.surface};
  font-weight: 900;
  padding: 0.45rem 0.65rem;
  cursor: pointer;
  box-shadow: 3px 3px 0 #000;

  &:hover {
    background: ${neoColors.background};
  }

  &:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 #000;
  }
`;

export default TravelCard;
