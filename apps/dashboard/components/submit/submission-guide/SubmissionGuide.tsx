import React from 'react';
import styled from 'styled-components';
import { NeoAccordion, neoColors, neoBorders } from '../../neo-ui';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const GuideHeader = styled.div`
  margin-bottom: 0.5rem;
`;

const GuideTitle = styled.h2`
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: ${neoColors.textMuted};
  margin: 0;
  letter-spacing: 0.05em;
`;

// Content typography
const Paragraph = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${neoColors.text};
  margin: 0 0 1rem 0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Quote = styled.blockquote`
  font-size: 1rem;
  font-weight: 600;
  color: ${neoColors.text};
  margin: 0 0 1rem 0;
  padding: 0.75rem 1rem;
  background: ${neoColors.accent.yellow}33;
  border-left: 3px solid ${neoColors.accent.yellow};
`;

const SubTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: ${neoColors.text};
  margin: 1.5rem 0 0.75rem 0;

  &:first-child {
    margin-top: 0;
  }
`;

const List = styled.ul`
  margin: 0 0 1rem 0;
  padding-left: 1.25rem;

  li {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 0.35rem;
    color: ${neoColors.text};

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const Emphasis = styled.em`
  font-style: italic;
  color: ${neoColors.textMuted};
  display: block;
  margin-top: 0.5rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${neoColors.textLight}33;
  margin: 1.25rem 0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.9rem;

  th,
  td {
    border: ${neoBorders.standard};
    padding: 0.6rem 0.75rem;
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
`;

const ExampleBlock = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: ${neoColors.background};
  border: ${neoBorders.standard};
`;

const ExampleTitle = styled.h5`
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
  color: ${neoColors.text};
`;

const GoodExample = styled.div`
  padding: 0.5rem 0.75rem;
  background: #efe;
  border-left: 3px solid ${neoColors.accent.green};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const BadExample = styled.div`
  padding: 0.5rem 0.75rem;
  background: #fee;
  border-left: 3px solid ${neoColors.accent.red};
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const CheckList = styled.ul`
  margin: 0.5rem 0 1rem 0;
  padding-left: 0;
  list-style: none;

  li {
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 0.35rem;
    padding-left: 1.5rem;
    position: relative;

    &::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: ${neoColors.accent.green};
      font-weight: 700;
    }
  }
`;

const TrackSection = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TrackName = styled.h5`
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: ${neoColors.accent.blue};
`;

const Link = styled.a`
  color: ${neoColors.accent.blue};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;

export function SubmissionGuide() {
  return (
    <Container>
      <GuideHeader>
        <GuideTitle>Submission Guide</GuideTitle>
      </GuideHeader>

      {/* Section 1: What Judges Look For */}
      <NeoAccordion
        id="judging-criteria"
        title="What Judges Look For"
        defaultOpen
      >
        <Paragraph>Every judge is ultimately asking one question:</Paragraph>

        <Quote>
          "Does this team understand a real problem well enough to build
          something meaningful about it?"
        </Quote>

        <Paragraph>
          We look at your submission through four lenses. You don't need to be
          perfect in all of them—but be honest about where you are.
        </Paragraph>

        <Divider />

        <SubTitle>Problem Understanding</SubTitle>
        <Paragraph>
          We want to see that you've spent time with the problem, not just the
          solution.
        </Paragraph>
        <List>
          <li>Name specific people who have this problem</li>
          <li>Explain how those people currently deal with it</li>
          <li>Show why the problem is genuinely hard</li>
          <li>Connect to the SDG theme naturally, not as an afterthought</li>
        </List>
        <Emphasis>
          Ask yourself: "If I removed all the technology, would my problem
          statement still be compelling?"
        </Emphasis>

        <Divider />

        <SubTitle>Solution Clarity</SubTitle>
        <Paragraph>
          We want to understand what you built in under three minutes.
        </Paragraph>
        <List>
          <li>Can be explained to someone outside your field</li>
          <li>Make technical choices that fit the problem</li>
          <li>Consider who would actually use this and how</li>
          <li>Know what else exists and why this approach is different</li>
        </List>
        <Emphasis>
          Ask yourself: "Could someone outside tech understand what this does
          and why it matters?"
        </Emphasis>

        <Divider />

        <SubTitle>Honest Implementation</SubTitle>
        <Paragraph>
          We want evidence you built something real, and self-awareness about
          its current state.
        </Paragraph>
        <List>
          <li>Have a working prototype (rough edges are fine)</li>
          <li>Are clear about what works and what doesn't yet</li>
          <li>Define their own success metrics</li>
          <li>Show authentic development through commit history</li>
        </List>
        <Emphasis>
          Ask yourself: "If I showed this to someone with the problem, would
          they find it useful today?"
        </Emphasis>

        <Divider />

        <SubTitle>Realistic Roadmap</SubTitle>
        <Paragraph>We want to see you know what's next.</Paragraph>
        <List>
          <li>Have clear, specific next steps</li>
          <li>Know the hard parts still ahead</li>
          <li>
            Leave meaningful work for the finals (we're selecting for potential)
          </li>
          <li>Are realistic about time and resources</li>
        </List>
        <Emphasis>
          Ask yourself: "If we make finals, do we know exactly what we're
          building in those 48 hours?"
        </Emphasis>

        <Divider />

        <SubTitle>A note on AI</SubTitle>
        <Paragraph>We're not anti-AI. We're anti-dishonesty.</Paragraph>
        <Paragraph>
          Using ChatGPT to debug code? Fine—professionals do this. Using it to
          generate your entire proposal? That's a problem, because we can't
          evaluate <em>your</em> thinking.
        </Paragraph>
        <Paragraph>
          The standard: If a judge asked you to explain any part of your
          submission, could you do it confidently?
        </Paragraph>
        <Paragraph>Declare what you used. Honesty builds trust.</Paragraph>

        <Divider />

        <SubTitle>What we're NOT looking for</SubTitle>
        <List>
          <li>
            <strong>Polished presentations</strong> — Substance beats style
          </li>
          <li>
            <strong>Complexity for its own sake</strong> — Simple solutions to
            real problems win
          </li>
          <li>
            <strong>Completed projects</strong> — We're selecting for finals,
            not finished products
          </li>
          <li>
            <strong>Perfect code</strong> — Working code with rough edges beats
            beautiful code that doesn't work
          </li>
        </List>
      </NeoAccordion>

      {/* Section 2: Writing Your Report */}
      <NeoAccordion id="report-guide" title="Writing Your Report">
        <Paragraph>
          Your report tells the story of your thinking. Here's a structure that
          works:
        </Paragraph>

        <Divider />

        <SubTitle>Section 1: The Problem</SubTitle>
        <List>
          <li>
            Who specifically has this problem? (Not "users" or "society"—name
            the people)
          </li>
          <li>What's their current situation? How do they cope today?</li>
          <li>
            Why is this problem significant? Back it up with data or research
          </li>
          <li>How does this connect to your chosen SDG theme?</li>
        </List>
        <Emphasis>
          Common mistake: Jumping straight to the solution. Spend real time
          here.
        </Emphasis>

        <Divider />

        <SubTitle>Section 2: Your Solution</SubTitle>
        <List>
          <li>What did you build? Explain it simply</li>
          <li>How does it work? Walk through the key features</li>
          <li>Why this approach? What alternatives did you consider?</li>
          <li>What does the user experience look like?</li>
        </List>
        <Emphasis>
          Include screenshots or diagrams. Show, don't just tell.
        </Emphasis>

        <Divider />

        <SubTitle>Section 3: Implementation & Honesty</SubTitle>
        <List>
          <li>What's working right now?</li>
          <li>What's not working yet? (Honesty is valued)</li>
          <li>How would YOU measure success? Define your own rubric</li>
          <li>What technical decisions did you make and why?</li>
        </List>
        <Emphasis>
          Judges respect self-awareness. "This works, this doesn't yet" beats
          overselling.
        </Emphasis>

        <Divider />

        <SubTitle>Section 4: What's Next</SubTitle>
        <List>
          <li>What would you build in the finals? Be specific</li>
          <li>What are the hard problems you still need to solve?</li>
          <li>What resources would you need?</li>
          <li>Where do you see this going beyond the hackathon?</li>
        </List>

        <Divider />

        <SubTitle>Format notes</SubTitle>
        <List>
          <li>2-4 pages is ideal. Quality over quantity</li>
          <li>PDF format</li>
          <li>Include visuals—screenshots, diagrams, flowcharts</li>
          <li>Cite sources if you reference research or data</li>
        </List>
      </NeoAccordion>

      {/* Section 3: Recording Your Demo Video */}
      <NeoAccordion id="video-guide" title="Recording Your Demo Video">
        <Paragraph>You have 90 seconds. Here's how to use them well:</Paragraph>

        <SubTitle>Suggested structure</SubTitle>
        <Table>
          <thead>
            <tr>
              <th>Time</th>
              <th>What to show</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0:00 - 0:15</td>
              <td>
                <strong>The problem.</strong> Who has it? Why does it matter?
              </td>
            </tr>
            <tr>
              <td>0:15 - 1:10</td>
              <td>
                <strong>The demo.</strong> Show your solution working. Not
                slides—the actual thing.
              </td>
            </tr>
            <tr>
              <td>1:10 - 1:30</td>
              <td>
                <strong>The impact.</strong> Who benefits? What's next?
              </td>
            </tr>
          </tbody>
        </Table>

        <Divider />

        <SubTitle>What works</SubTitle>
        <List>
          <li>Show the product working, even if it's rough</li>
          <li>Speak naturally—you don't need a script</li>
          <li>Phone recordings are completely fine</li>
          <li>Clear audio matters more than video quality</li>
          <li>Demonstrate the core user flow</li>
        </List>

        <Divider />

        <SubTitle>What doesn't work</SubTitle>
        <List>
          <li>Reading slides for 90 seconds</li>
          <li>Spending 60 seconds on the problem and 30 on a rushed demo</li>
          <li>Showing code instead of the working product</li>
          <li>Over-produced videos with no substance</li>
        </List>

        <Divider />

        <SubTitle>Technical tips</SubTitle>
        <List>
          <li>Upload to YouTube (unlisted is fine)</li>
          <li>Landscape orientation preferred</li>
          <li>Keep it under 90 seconds—judges have many to watch</li>
          <li>Test your audio before recording</li>
        </List>

        <Divider />

        <SubTitle>The golden rule</SubTitle>
        <Paragraph>
          If someone watched your video with the sound off, they should still
          see your product doing something real.
        </Paragraph>
      </NeoAccordion>

      {/* Section 4: Your Code Repository */}
      <NeoAccordion id="repo-guide" title="Your Code Repository">
        <Paragraph>
          Your repository is proof of work. Here's what judges look for:
        </Paragraph>

        <SubTitle>README essentials</SubTitle>
        <Paragraph>A good README answers these in 30 seconds:</Paragraph>
        <List>
          <li>What does this project do? (One sentence)</li>
          <li>How do I run it locally?</li>
          <li>What's the tech stack?</li>
          <li>Who built this?</li>
        </List>
        <Paragraph>
          Bonus points: screenshots, GIFs, or a quick demo link.
        </Paragraph>

        <Divider />

        <SubTitle>Commit history matters</SubTitle>
        <Paragraph>
          Judges may look at your commit history. It tells a story:
        </Paragraph>
        <List>
          <li>Authentic, incremental commits show real development</li>
          <li>One giant commit at the deadline raises questions</li>
          <li>Messy commits are fine—they show you were building</li>
        </List>
        <Emphasis>
          This isn't about Git hygiene. It's about authenticity.
        </Emphasis>

        <Divider />

        <SubTitle>Access requirements</SubTitle>
        <List>
          <li>
            Repository must be public during judging (you can make it private
            after)
          </li>
          <li>GitHub, GitLab, Bitbucket—all accepted</li>
          <li>Include any setup instructions needed to run your code</li>
        </List>

        <Divider />

        <SubTitle>For hardware projects</SubTitle>
        <Paragraph>Include in your repo:</Paragraph>
        <List>
          <li>CAD files, 3D models, or hand sketches</li>
          <li>Circuit schematics or PCB designs</li>
          <li>Bill of materials with realistic costs</li>
          <li>Assembly instructions or build notes</li>
        </List>

        <Divider />

        <SubTitle>What we don't care about</SubTitle>
        <List>
          <li>Code style or formatting</li>
          <li>Whether you used tabs or spaces</li>
          <li>Perfect architecture</li>
        </List>
        <Paragraph>We care that it works and that you built it.</Paragraph>
      </NeoAccordion>

      {/* Section 5: Track-Specific Tips */}
      <NeoAccordion id="track-tips" title="Track-Specific Tips">
        <Paragraph>
          Each track has its own nuances. Here's what resonates:
        </Paragraph>

        <Divider />

        <TrackSection>
          <TrackName>Climate Action (SDG 13)</TrackName>
          <Paragraph>Strong submissions:</Paragraph>
          <List>
            <li>
              Focus on local, tangible impact—not abstract "saving the planet"
            </li>
            <li>
              Identify who feels climate effects <em>today</em> in their context
            </li>
            <li>Use real data about climate challenges in India</li>
            <li>Consider both mitigation and adaptation approaches</li>
          </List>
          <Paragraph>Questions to explore:</Paragraph>
          <List>
            <li>
              Who in your community is already affected by climate change?
            </li>
            <li>
              What climate information would help someone make better decisions?
            </li>
            <li>
              Where do current solutions fail the people who need them most?
            </li>
          </List>
        </TrackSection>

        <Divider />

        <TrackSection>
          <TrackName>Quality Education (SDG 4)</TrackName>
          <Paragraph>Strong submissions:</Paragraph>
          <List>
            <li>
              Focus on specific learner segments (not "students" generally)
            </li>
            <li>
              Understand the teacher's perspective, not just the learner's
            </li>
            <li>Consider accessibility and resource constraints</li>
            <li>Address real barriers to learning, not assumed ones</li>
          </List>
          <Paragraph>Questions to explore:</Paragraph>
          <List>
            <li>
              What does a struggling student in your context actually struggle
              with?
            </li>
            <li>What do teachers spend hours doing that isn't teaching?</li>
            <li>Where does the system assume resources people don't have?</li>
          </List>
        </TrackSection>

        <Divider />

        <TrackSection>
          <TrackName>Sustainable Cities (SDG 11)</TrackName>
          <Paragraph>Strong submissions:</Paragraph>
          <List>
            <li>Show understanding of local urban context</li>
            <li>Consider the invisible people in urban planning</li>
            <li>Think about infrastructure constraints</li>
            <li>Address problems that affect daily life</li>
          </List>
          <Paragraph>Questions to explore:</Paragraph>
          <List>
            <li>
              What's broken about how people move, eat, or live in your city?
            </li>
            <li>Who gets overlooked in city planning decisions?</li>
            <li>What works at 10am but fails at 10pm?</li>
          </List>
        </TrackSection>

        <Divider />

        <TrackSection>
          <TrackName>Hardware Track (All SDGs)</TrackName>
          <Paragraph>Additional considerations:</Paragraph>
          <List>
            <li>Include CAD models, sketches, or simulation outputs</li>
            <li>Document your bill of materials with realistic costs</li>
            <li>Consider manufacturing feasibility</li>
            <li>
              Think about 3D printing time—finals are 48 hours with few
              iterations
            </li>
          </List>
          <Emphasis>
            Your report should include enough detail that someone could
            understand how to build what you're proposing.
          </Emphasis>
        </TrackSection>
      </NeoAccordion>

      {/* Section 6: Sample Submissions */}
      <NeoAccordion id="sample-submissions" title="Sample Submissions">
        <Paragraph>
          Here are examples to calibrate your expectations. These aren't
          templates to copy—they're illustrations of the depth and clarity we're
          looking for.
        </Paragraph>

        <Divider />

        <ExampleBlock>
          <ExampleTitle>
            Software Example: "Paani" — Water Quality Alert System
          </ExampleTitle>

          <SubTitle>The Problem</SubTitle>
          <Paragraph>
            In peri-urban communities around Chennai, 2.3 million residents rely
            on groundwater from private borewells. Unlike municipal supply, this
            water is never tested. Contamination from industrial runoff and
            agricultural chemicals goes undetected until people get sick.
          </Paragraph>
          <Paragraph>
            We spoke with residents in Ambattur who described a pattern:
            mysterious stomach ailments that come and go, never traced to water
            because "the water looks fine." Mrs. Lakshmi, who runs a small
            provisions store, told us her family boils all drinking water—but
            still uses untested borewell water for cooking rice, washing
            vegetables, and bathing.
          </Paragraph>
          <Paragraph>
            The gap isn't awareness. It's access. Lab water testing costs
            ₹500-2000 and takes a week. For a daily-wage household, that's
            impractical.
          </Paragraph>

          <SubTitle>Our Solution</SubTitle>
          <Paragraph>
            Paani is a community-based water quality monitoring system with two
            components:
          </Paragraph>
          <List>
            <li>
              <strong>Low-cost test kit (₹50):</strong> A paper-based
              colorimetric strip that tests for the three most common
              groundwater contaminants in Tamil Nadu: nitrates, fluoride, and
              bacterial coliforms. Users photograph the strip with their phone.
            </li>
            <li>
              <strong>Mobile app:</strong> Image recognition determines
              contamination levels from the strip photo. Results are stored with
              GPS location, building a crowdsourced contamination map for the
              area.
            </li>
          </List>
          <Paragraph>
            The insight: Individual test results have limited value. But
            aggregated data reveals patterns—which borewells are safe, which
            areas have chronic contamination, where the municipal corporation
            should prioritize intervention.
          </Paragraph>

          <SubTitle>Current Implementation</SubTitle>
          <Paragraph>
            <strong>Working:</strong>
          </Paragraph>
          <List>
            <li>
              Image recognition model trained on 200 test strip images (87%
              accuracy)
            </li>
            <li>Basic Android app with camera capture and result display</li>
            <li>Location tagging and local storage</li>
          </List>
          <Paragraph>
            <strong>Not yet working:</strong>
          </Paragraph>
          <List>
            <li>Community map visualization (designed, not built)</li>
            <li>Alert system for contamination spikes</li>
            <li>Multi-language support (currently English only)</li>
          </List>

          <SubTitle>Our Success Metric</SubTitle>
          <Paragraph>
            We'd measure success by: (1) number of households with first-ever
            water quality data, (2) contamination incidents detected before
            illness, (3) municipal interventions triggered by our data.
          </Paragraph>
          <Paragraph>
            Current status: We've tested with 12 households in Ambattur. 4
            discovered nitrate levels above safe limits.
          </Paragraph>

          <SubTitle>Roadmap for Finals</SubTitle>
          <Paragraph>In 48 hours, we would:</Paragraph>
          <List>
            <li>Build the community map visualization</li>
            <li>Add Tamil language support</li>
            <li>
              Partner with a local clinic to correlate our data with waterborne
              illness reports
            </li>
            <li>Test with 50 additional households</li>
          </List>

          <SubTitle>AI Declaration</SubTitle>
          <Paragraph>
            We used GitHub Copilot for boilerplate code in the React Native app.
            The image recognition model was trained by us using TensorFlow—the
            architecture was informed by a Claude conversation about
            colorimetric analysis approaches, but all training and tuning was
            done manually.
          </Paragraph>
        </ExampleBlock>

        <Paragraph>
          <strong>What makes this strong:</strong>
        </Paragraph>
        <CheckList>
          <li>
            Specific beneficiary (peri-urban Chennai residents using borewells)
          </li>
          <li>Real research (they talked to actual residents)</li>
          <li>Honest about what works and doesn't</li>
          <li>Self-defined success metrics</li>
          <li>Specific finals roadmap</li>
          <li>Transparent about AI use</li>
        </CheckList>

        <Divider />

        <SubTitle>Hardware Example</SubTitle>
        <Paragraph>
          For a detailed hardware proposal example, see our{' '}
          <Link
            href="https://docs.google.com/document/d/1o9x0ZPfD278vCQmPz5lI7LN7EIe4pZ8Mq8CqkrIIH0c/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            sample hardware proposal document
          </Link>
          .
        </Paragraph>
        <Paragraph>
          <strong>What makes it strong:</strong>
        </Paragraph>
        <CheckList>
          <li>Extensive literature review with citations</li>
          <li>Clear team responsibilities</li>
          <li>Detailed specifications (dimensions, power draw, components)</li>
          <li>Anticipated challenges with proposed solutions</li>
          <li>Realistic assessment of what can be done in the timeframe</li>
        </CheckList>

        <Divider />

        <SubTitle>What to Avoid</SubTitle>

        <Paragraph>
          <strong>Vague problem statement:</strong>
        </Paragraph>
        <BadExample>
          "Education is broken. Students struggle to learn online."
        </BadExample>

        <Paragraph>vs.</Paragraph>

        <Paragraph>
          <strong>Specific problem statement:</strong>
        </Paragraph>
        <GoodExample>
          "First-generation college students in tier-2 cities lack access to
          peer networks that urban students take for granted. Without seniors to
          ask 'is this professor's class worth attending?' they waste hours on
          low-value activities."
        </GoodExample>

        <Divider />

        <Paragraph>
          <strong>Overpromising:</strong>
        </Paragraph>
        <BadExample>
          "Our AI-powered platform will revolutionize how 50 million students
          learn."
        </BadExample>

        <Paragraph>vs.</Paragraph>

        <Paragraph>
          <strong>Honest scope:</strong>
        </Paragraph>
        <GoodExample>
          "Our current prototype helps students find study partners in their
          hostel. We've tested with 30 students at our college and 8 formed
          study groups."
        </GoodExample>
      </NeoAccordion>
    </Container>
  );
}

export default SubmissionGuide;
