import Script from 'next/script';
import { useEffect } from 'react';
import styled from 'styled-components';

export interface HackformTally {
  tallyUrl: string;
}

const TallyContainer = styled.div`
  width: 100%;
  min-height: 400px;
  height: calc(100vh - 200px);
  max-height: 800px;

  @media (max-width: 768px) {
    height: calc(100vh - 150px);
    min-height: 300px;
  }

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export function HackformTally(props: HackformTally) {
  useEffect(() => {
    try {
      // @ts-expect-error Tally is loaded in the linked script
      Tally.loadEmbeds();
    } catch {
      console.log();
    }
  }, []);

  return (
    <TallyContainer>
      <iframe
        data-tally-src={props.tallyUrl}
        loading="lazy"
        width="100%"
        height="100%"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Application Form"
      ></iframe>

      <Script
        id="tally-js"
        src="https://tally.so/widgets/embed.js"
        onLoad={() => {
          // @ts-expect-error Tally is loaded in the linked script
          Tally.loadEmbeds();
        }}
      />
    </TallyContainer>
  );
}
