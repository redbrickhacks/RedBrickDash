import styled from 'styled-components';
import { neoColors, neoBorders, neoShadows } from '../neo-ui';

export function SubmissionGuide() {
  return (
    <Container>
      <Content>
        <Header>
          <Title>Submissions Open Soon</Title>
          <Subtitle>
            While we get the submission portal ready, here's something more
            useful than a countdown timer.
          </Subtitle>
        </Header>

        <Section>
          <SectionTitle>The Winning Edge</SectionTitle>
          <Paragraph>
            It's not the fanciest tech that wins hackathons. It's the clearest
            problem.
          </Paragraph>
          <Paragraph>
            Teams that win have one thing in common: they can explain exactly{' '}
            <em>who</em> they're helping and <em>why it matters</em> in under 30
            seconds. Everything else flows from there.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>Before You Build</SectionTitle>

          <SubSection>
            <SubTitle>Start With a Person, Not a Category</SubTitle>
            <Paragraph>
              Your track might be "Climate Action" but your problem should be
              about someone real.
            </Paragraph>
            <ExampleBox>
              <BadExample>"We're tackling climate change"</BadExample>
              <GoodExample>
                "Farmers in coastal Tamil Nadu lose 20% of their harvest because
                they can't predict rainfall 3 days out"
              </GoodExample>
            </ExampleBox>
            <Paragraph>
              See the difference? The second one has a who, a where, and a cost.
            </Paragraph>
            <Callout>
              Can you name one real person who has the problem you're solving?
              What's their day like? What frustrates them? If you can't answer
              this, you're not ready to build yet.
            </Callout>
          </SubSection>

          <SubSection>
            <SubTitle>Ask "Why" Until It Hurts</SubTitle>
            <Paragraph>Most teams stop at the surface. Don't.</Paragraph>
            <WhyChain>
              <WhyItem>
                <WhyLabel>Surface:</WhyLabel>
                "Students struggle with online learning"
              </WhyItem>
              <WhyItem>
                <WhyLabel>Why?</WhyLabel>
                They get distracted at home
              </WhyItem>
              <WhyItem>
                <WhyLabel>Why?</WhyLabel>
                No one's watching
              </WhyItem>
              <WhyItem>
                <WhyLabel>Why does that matter?</WhyLabel>
                Teachers can't tell who's lost
              </WhyItem>
              <WhyItem>
                <WhyLabel>Why?</WhyLabel>
                Current tools only track attendance, not attention
              </WhyItem>
              <WhyItem $final>
                <WhyLabel>Real problem:</WhyLabel>
                Teachers need real-time signals for who's engaged and who's
                zoning out
              </WhyItem>
            </WhyChain>
            <Paragraph>
              That's something you can build. "Students struggle online" isn't.
            </Paragraph>
          </SubSection>

          <SubSection>
            <SubTitle>Check If It's Real</SubTitle>
            <Paragraph>Before you commit your weekend:</Paragraph>
            <CheckList>
              <li>
                Have you talked to even <em>one</em> person who has this
                problem?
              </li>
              <li>
                How do they deal with it today? (If they're not trying to solve
                it, maybe it's not that painful)
              </li>
              <li>Would they actually use what you're building?</li>
            </CheckList>
            <Paragraph>
              The best hacks come from problems you've seen up close. Second
              best: problems you've validated by talking to people who have
              them.
            </Paragraph>
          </SubSection>
        </Section>

        <Section>
          <SectionTitle>Stuck? Try These</SectionTitle>
          <TrackGrid>
            <TrackCard $color={neoColors.accent.green}>
              <TrackName>Climate Action</TrackName>
              <TrackQuestions>
                <li>
                  Who in your neighbourhood feels the effects of climate change{' '}
                  <em>today</em>? (Not 2050. Today.)
                </li>
                <li>
                  What climate info would save someone money, time, or health if
                  they had it?
                </li>
                <li>
                  Who makes decisions that affect emissions but lacks the right
                  data?
                </li>
              </TrackQuestions>
            </TrackCard>

            <TrackCard $color={neoColors.accent.blue}>
              <TrackName>Quality Education</TrackName>
              <TrackQuestions>
                <li>
                  Think of a student who's falling behind. What's actually
                  blocking them?
                </li>
                <li>What do teachers spend hours on that isn't teaching?</li>
                <li>
                  Where does the system assume everyone has resources they
                  don't?
                </li>
              </TrackQuestions>
            </TrackCard>

            <TrackCard $color={neoColors.accent.yellow}>
              <TrackName>Sustainable Cities</TrackName>
              <TrackQuestions>
                <li>
                  What's broken about how people move, eat, or live in your
                  city?
                </li>
                <li>
                  Who's invisible in urban planning? (Street vendors, gig
                  workers, elderly)
                </li>
                <li>What works at 10am but fails at 10pm?</li>
              </TrackQuestions>
            </TrackCard>
          </TrackGrid>
        </Section>

        <Section>
          <SectionTitle>What You'll Submit</SectionTitle>
          <Paragraph>Start thinking about these now:</Paragraph>

          <SubmissionTable>
            <thead>
              <tr>
                <th>Deliverable</th>
                <th>What Judges Look For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Proposal</strong>
                </td>
                <td>
                  Clear problem, specific beneficiary, and why your solution
                  fits. Skip the jargon.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Video Pitch</strong>
                  <br />
                  <small>90 seconds</small>
                </td>
                <td>
                  ~45s demo showing it works, ~45s pitch on why it matters.
                  Don't spend 80 seconds on tech and 10 on the problem.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Devpost Page</strong>
                </td>
                <td>
                  Written report + video demo. Evidence you understood the
                  problem before you started building.
                </td>
              </tr>
            </tbody>
          </SubmissionTable>
        </Section>

        <Section>
          <SectionTitle>Gut Check</SectionTitle>
          <Paragraph>Before you submit, ask yourself:</Paragraph>
          <CheckList>
            <li>
              Could a stranger understand my problem statement in one read?
            </li>
            <li>
              Have I named specific people who benefit, not just "users" or
              "society"?
            </li>
            <li>Can I explain what happens if this problem is never solved?</li>
            <li>
              Does my solution actually fit this problem, or did I pick a
              problem to fit my solution?
            </li>
          </CheckList>
          <Paragraph>
            Nail these and you're ahead of most submissions. Seriously.
          </Paragraph>
        </Section>

        <Footer>
          <FooterText>
            Use this time to talk to people, sharpen your problem, and build
            something that matters. We'll let you know when submissions open.
          </FooterText>
        </Footer>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100%;
  background: ${neoColors.background};
  padding: 2rem 1rem;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const Content = styled.div`
  max-width: 720px;
  margin: 0 auto;
`;

const Header = styled.header`
  margin-bottom: 2.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${neoColors.text};
  margin: 0 0 0.75rem 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${neoColors.textMuted};
  margin: 0;
  line-height: 1.5;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${neoColors.text};
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: ${neoBorders.standard};
`;

const SubSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SubTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${neoColors.text};
  margin: 0 0 0.75rem 0;
`;

const Paragraph = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${neoColors.text};
  margin: 0 0 1rem 0;

  em {
    font-style: italic;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ExampleBox = styled.div`
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BadExample = styled.div`
  padding: 0.75rem 1rem;
  background: #fee;
  border-left: 4px solid ${neoColors.accent.red};
  font-size: 0.95rem;
  color: ${neoColors.text};

  &::before {
    content: '✗ ';
    color: ${neoColors.accent.red};
    font-weight: 700;
  }
`;

const GoodExample = styled.div`
  padding: 0.75rem 1rem;
  background: #efe;
  border-left: 4px solid ${neoColors.accent.green};
  font-size: 0.95rem;
  color: ${neoColors.text};

  &::before {
    content: '✓ ';
    color: ${neoColors.accent.green};
    font-weight: 700;
  }
`;

const Callout = styled.div`
  padding: 1rem;
  background: ${neoColors.accent.yellow};
  border: ${neoBorders.standard};
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 1rem 0;
`;

const WhyChain = styled.div`
  margin: 1rem 0;
  padding-left: 1rem;
  border-left: 3px solid ${neoColors.textLight};
`;

const WhyItem = styled.div<{ $final?: boolean }>`
  padding: 0.5rem 0;
  font-size: 0.95rem;
  color: ${(props) => (props.$final ? neoColors.text : neoColors.textMuted)};
  font-weight: ${(props) => (props.$final ? '600' : '400')};

  ${(props) =>
    props.$final &&
    `
    background: #efe;
    margin: 0.5rem 0 0 -1rem;
    padding: 0.75rem 1rem;
    border-left: 3px solid ${neoColors.accent.green};
  `}
`;

const WhyLabel = styled.span`
  font-weight: 600;
  color: ${neoColors.text};
  margin-right: 0.5rem;
`;

const CheckList = styled.ul`
  margin: 0.5rem 0 1rem 0;
  padding-left: 1.5rem;

  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;

    em {
      font-style: italic;
    }
  }
`;

const TrackGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const TrackCard = styled.div<{ $color: string }>`
  background: ${neoColors.surface};
  border: ${neoBorders.standard};
  box-shadow: ${(props) => neoShadows.colored(props.$color)};
  padding: 1rem;
`;

const TrackName = styled.h4`
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: ${neoColors.text};
`;

const TrackQuestions = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.85rem;
  line-height: 1.5;

  li {
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }

    em {
      font-style: italic;
    }
  }
`;

const SubmissionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  font-size: 0.95rem;

  th,
  td {
    border: ${neoBorders.standard};
    padding: 0.75rem;
    text-align: left;
  }

  th {
    background: ${neoColors.text};
    color: ${neoColors.surface};
    font-weight: 700;
  }

  td {
    background: ${neoColors.surface};
  }

  small {
    color: ${neoColors.textMuted};
    font-size: 0.8rem;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding-top: 1.5rem;
  border-top: ${neoBorders.standard};
`;

const FooterText = styled.p`
  font-size: 1rem;
  color: ${neoColors.textMuted};
  line-height: 1.6;
  margin: 0;
`;
