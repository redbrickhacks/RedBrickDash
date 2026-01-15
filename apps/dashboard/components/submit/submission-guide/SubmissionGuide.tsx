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

const ClosingNote = styled.div`
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  background: ${neoColors.accent.green}15;
  border: ${neoBorders.standard};
  text-align: center;

  p {
    font-size: 0.95rem;
    line-height: 1.6;
    color: ${neoColors.text};
    margin: 0;
  }
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

const Commentary = styled.p`
  font-size: 0.85rem;
  font-style: italic;
  color: ${neoColors.textMuted};
  margin: 0.5rem 0 1rem 0;
  padding: 0.5rem 0.75rem;
  background: ${neoColors.accent.blue}15;
  border-left: 2px solid ${neoColors.accent.blue};
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
        <Paragraph>
          You're in the final stretch. If you're reading this at 2am wondering
          if your project is good enough, you're not alone. Every team feels
          this. The doubt is part of the process.
        </Paragraph>

        <Paragraph>
          The goal isn't perfection. It's showing us how you think.
        </Paragraph>

        <Paragraph>Every judge is asking one question:</Paragraph>

        <Quote>
          "Does this team understand a real problem well enough to build
          something useful about it?"
        </Quote>

        <Paragraph>
          We look at four things. You don't need to ace all of them. But be
          honest about where you are.
        </Paragraph>

        <Divider />

        <SubTitle>Problem Understanding</SubTitle>
        <Paragraph>
          Have you spent time with the problem itself? Not just the solution you
          want to build, but the reality of people who face this problem today.
        </Paragraph>
        <Paragraph>
          The test: name specific people who have this problem. Explain how they
          currently cope. Show why it's hard to solve. If you removed all the
          technology from your pitch, would anyone still care about the problem?
        </Paragraph>
        <Paragraph>
          Your SDG connection should feel natural. If it feels bolted on, it
          probably is. And if you have a personal connection to this problem
          (lived experience, family, community), that matters. Tell us.
        </Paragraph>

        <Divider />

        <SubTitle>Solution Clarity</SubTitle>
        <Paragraph>
          Could someone outside tech understand what you built and why it
          matters? If not, simplify. Judges have seen hundreds of submissions.
          Yours has three minutes to land.
        </Paragraph>
        <List>
          <li>One sentence: what does it do?</li>
          <li>Who would use it, and when?</li>
          <li>Why this approach over alternatives?</li>
        </List>

        <Divider />

        <SubTitle>Honest Implementation</SubTitle>
        <Paragraph>
          Here's where many teams stumble. They oversell. "Our platform
          revolutionizes..." No. Tell us what actually works, what doesn't yet,
          and what you'd measure to know if you're succeeding.
        </Paragraph>
        <Paragraph>
          A working prototype with rough edges is worth more than a polished
          deck with hand-waving. Show your commit history. Messy, incremental
          commits are fine. One giant commit at the deadline raises questions.
        </Paragraph>
        <Paragraph>
          There's a tension here: ship fast vs. think carefully. The resolution
          is honesty. "This works. This doesn't. Here's what we'd do next."
          That's the right answer.
        </Paragraph>

        <Divider />

        <SubTitle>Roadmap</SubTitle>
        <Paragraph>
          If you make finals, what are you building in those 48 hours? Be
          specific. "Add more features" is not a plan. "Build the teacher
          dashboard and test with 3 classrooms" is a plan.
        </Paragraph>
        <Paragraph>
          Leave room for finals work. If your project is already "done," we
          wonder what you'd do with the time. We're selecting teams with
          momentum and direction, not finished products.
        </Paragraph>

        <Divider />

        <SubTitle>On AI use</SubTitle>
        <Paragraph>We're not anti-AI. We're anti-dishonesty.</Paragraph>
        <Paragraph>
          Using ChatGPT to debug code? Fine. Professionals do this. Using it to
          generate your entire proposal? That's a problem. We can't evaluate
          thinking you didn't do.
        </Paragraph>
        <Paragraph>
          The test: if a judge asked you to explain any part of your submission
          in depth, could you? Declare what you used. Honesty builds trust.
        </Paragraph>

        <Divider />

        <SubTitle>Permission to stop worrying</SubTitle>
        <Paragraph>
          Your submission doesn't need to be polished. A rough demo of something
          real beats a slick video of nothing. It doesn't need to be complex.
          Simple solutions to real problems win. It doesn't need to be complete.
          We're picking teams, not shipping software. And the code doesn't need
          to be pretty. We care that it works and that you built it.
        </Paragraph>

        <SubTitle>Building alone?</SubTitle>
        <Paragraph>
          Same standards apply. You have one advantage teams don't: no
          coordination overhead. Use it. Go deep on one thing rather than wide
          on many. The best solo submissions we've seen picked a narrow problem
          and understood it better than anyone.
        </Paragraph>
      </NeoAccordion>

      {/* Section 2: Writing Your Report */}
      <NeoAccordion id="report-guide" title="Writing Your Report">
        <Paragraph>
          Your report has one job: convince a skeptical, smart person that you
          understand a real problem and have a real plan to address it. Two
          pages of substance beat five pages of padding.
        </Paragraph>

        <Divider />

        <SubTitle>The Problem (this is where most teams under-invest)</SubTitle>
        <Paragraph>
          Who specifically has this problem? Not "users." Not "society." Name
          the people. A farmer in Vidarbha. A student in a hostel in Kota. A
          nurse on night shift at a government hospital.
        </Paragraph>
        <Paragraph>
          How do they cope today? What's broken about their current situation?
          Why hasn't this been solved already? If you have data or research,
          cite it.
        </Paragraph>
        <Paragraph>
          Common mistake: one paragraph on the problem, then straight to the
          solution. Resist this. The problem section is where you show you've
          done the thinking.
        </Paragraph>

        <Divider />

        <SubTitle>How Your Understanding Evolved</SubTitle>
        <Paragraph>
          What did you believe when you started? What changed when you talked to
          people? What assumptions did you drop?
        </Paragraph>
        <Paragraph>
          A team that says "we thought the problem was X, then we discovered it
          was actually Y" is showing real learning. That's more interesting than
          a team that got it right on day one.
        </Paragraph>

        <Divider />

        <SubTitle>Your Solution</SubTitle>
        <Paragraph>
          What did you build? Explain it in plain language. Walk through the key
          features. Show screenshots or diagrams. What does someone actually
          experience when they use it?
        </Paragraph>
        <Paragraph>
          Why this approach? What alternatives did you consider? This isn't
          about defending your choice. It's about showing you made a deliberate
          choice.
        </Paragraph>

        <Divider />

        <SubTitle>What Works, What Doesn't</SubTitle>
        <Paragraph>
          This is the honesty section. What's actually working right now? What's
          still broken or incomplete? What would you measure to know if this
          solution is helping?
        </Paragraph>
        <Paragraph>
          Don't just list features that aren't built yet. Tell us what you
          <em> tried</em> that flopped. The approach that seemed clever until
          you tested it. The assumption that turned out to be wrong.
        </Paragraph>
        <Paragraph>
          Define your own success metrics. Don't wait for judges to decide what
          "good" means for your project. A team that says "we'd measure X and Y,
          and here's our baseline" is thinking like builders, not students.
        </Paragraph>

        <Divider />

        <SubTitle>What's Next</SubTitle>
        <Paragraph>
          If you make finals, what are you building? Be specific. What are the
          hard problems still ahead? What would you need?
        </Paragraph>
        <Paragraph>
          Leave room to grow. If everything is already done, we wonder what
          you'd do with 48 more hours.
        </Paragraph>

        <Divider />

        <SubTitle>Format</SubTitle>
        <Paragraph>
          2-4 pages. PDF. Include visuals. Cite your sources if you reference
          research or data.
        </Paragraph>
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
                slides. The actual thing.
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
          <li>Speak naturally. You don't need a script.</li>
          <li>Phone recordings are completely fine</li>
          <li>Clear audio matters more than video quality</li>
          <li>Show the core user flow</li>
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

        <SubTitle>Recording logistics</SubTitle>
        <Paragraph>
          Upload to YouTube (unlisted is fine). Landscape orientation works
          best. Keep it under 90 seconds. Test your audio before you start;
          clear sound matters more than video quality.
        </Paragraph>

        <Divider />

        <SubTitle>One thing to remember</SubTitle>
        <Paragraph>
          If someone watched your video with the sound off, they should still
          see your product doing something real. And if your demo crashes
          mid-recording? Show how you recover. That's often more impressive than
          a perfect run.
        </Paragraph>
      </NeoAccordion>

      {/* Section 4: Your Code Repository */}
      <NeoAccordion id="repo-guide" title="Your Code Repository">
        <Paragraph>
          Your repository shows how you work. Here's what judges look for:
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
          A README that says "npm install && npm start" is fine. A README that
          says nothing is not. Screenshots or GIFs are a bonus.
        </Paragraph>

        <Divider />

        <SubTitle>Commit history matters</SubTitle>
        <Paragraph>
          Judges may look at your commit history. It tells a story:
        </Paragraph>
        <List>
          <li>Regular, incremental commits show real development</li>
          <li>One giant commit at the deadline raises questions</li>
          <li>Messy commits are fine. They show you were building.</li>
        </List>
        <Emphasis>
          This isn't about Git hygiene. It's about showing your work.
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
          Each track rewards different kinds of thinking. Here's what we've seen
          work.
        </Paragraph>

        <Divider />

        <TrackSection>
          <TrackName>Climate Action (SDG 13)</TrackName>
          <Paragraph>
            Chennai hits 47°C in summer. Delhi breathes AQI 400+ for weeks every
            winter. Mumbai floods every monsoon. Bangalore's lakes are dying.
            These aren't abstractions. Pick a climate reality your neighbors
            actually face.
          </Paragraph>
          <Paragraph>
            Strong submissions ground themselves in specifics:
          </Paragraph>
          <List>
            <li>
              A farmer in Vidarbha deciding when to sow, not "Indian
              agriculture"
            </li>
            <li>
              A family in Chennai managing water during cuts, not "water
              scarcity"
            </li>
            <li>
              An auto driver in Delhi choosing routes on bad air days, not "air
              pollution"
            </li>
          </List>
          <Paragraph>
            Real data helps. Check IMD for weather patterns, CPCB for air
            quality, India Water Portal for groundwater. Cite your sources.
          </Paragraph>
        </TrackSection>

        <Divider />

        <TrackSection>
          <TrackName>Quality Education (SDG 4)</TrackName>
          <Paragraph>
            "Students" is not a user segment. A coaching class student in Kota
            has different problems than a government school student in rural MP.
            An English-medium kid in Bangalore faces different barriers than a
            first-gen college student in a tier-3 town.
          </Paragraph>
          <Paragraph>
            Think about the teacher too. Their reality: attendance registers,
            parent WhatsApp groups, syllabus pressure, lesson plans that don't
            survive contact with the classroom.
          </Paragraph>
          <Paragraph>What does "accessibility" actually mean here?</Paragraph>
          <List>
            <li>A ₹5,000 phone shared between siblings</li>
            <li>Intermittent 2G data that costs real money</li>
            <li>Power cuts during exam prep</li>
            <li>No quiet place to study at home</li>
          </List>
          <Paragraph>
            Build for these constraints, not for the student with a MacBook and
            fast wifi.
          </Paragraph>
        </TrackSection>

        <Divider />

        <TrackSection>
          <TrackName>Sustainable Cities (SDG 11)</TrackName>
          <Paragraph>
            You know your city's problems. The Silk Board junction. The water
            tanker dependency. The last-mile from the metro. The garbage that
            piles up in the corner nobody owns. Start there.
          </Paragraph>
          <Paragraph>
            Who gets overlooked in urban planning? Migrant construction workers.
            Domestic help commuting 2 hours each way. Street vendors pushed out
            by "beautification." The night shift worker when buses stop running.
          </Paragraph>
          <Paragraph>A good question to ask:</Paragraph>
          <Paragraph>
            <em>
              What works at 10am but fails at 10pm? What's fine in October but
              breaks in July? Who can navigate the city easily, and who can't?
            </em>
          </Paragraph>
        </TrackSection>

        <Divider />

        <TrackSection>
          <TrackName>Hardware Track (All SDGs)</TrackName>
          <Paragraph>
            Hardware in India has constraints. Components take time to ship.
            Good makerspaces aren't everywhere. Budget matters. Work with these
            realities, not against them.
          </Paragraph>
          <Paragraph>
            For finals, remember: you have 48 hours. One or two 3D print
            iterations, max. Design for what you can actually build in that
            window.
          </Paragraph>
          <Paragraph>Your proposal should include:</Paragraph>
          <List>
            <li>CAD models, sketches, or even clear hand drawings</li>
            <li>A bill of materials with realistic Indian prices</li>
            <li>What you can prototype now vs. what needs more time</li>
          </List>
          <Paragraph>
            We've seen great hardware projects built from simple components.
            Clever beats expensive.
          </Paragraph>
        </TrackSection>
      </NeoAccordion>

      {/* Section 6: Sample Submissions */}
      <NeoAccordion id="sample-submissions" title="Sample Submissions">
        <Paragraph>
          Here are examples to calibrate your expectations. These are
          illustrations, not templates to copy. They show the depth and clarity
          we're looking for.
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
            provisions store, told us her family boils all drinking water, but
            still uses untested borewell water for cooking rice, washing
            vegetables, and bathing.
          </Paragraph>
          <Paragraph>
            The gap isn't awareness. It's access. Lab water testing costs
            ₹500-2000 and takes a week. For a daily-wage household, that's
            impractical.
          </Paragraph>
          <Commentary>
            Notice: specific location, specific people, specific numbers. Not
            "India has a water problem."
          </Commentary>

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
            aggregated data reveals patterns. Which borewells are safe, which
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

        <Divider />

        <SubTitle>Common Near-Misses</SubTitle>
        <Paragraph>
          These submissions were close but didn't make it. Knowing what was
          missing might help you check your own.
        </Paragraph>
        <List>
          <li>
            <strong>Good tech, vague problem:</strong> The prototype works, but
            it's unclear who it's for. "We built an app." Okay, but who needs
            it? Why?
          </li>
          <li>
            <strong>Good problem framing, no evidence:</strong> The problem
            sounds real, but there's no sign the team talked to anyone who has
            it. No quotes, no observations, no fieldwork.
          </li>
          <li>
            <strong>Overpromised scope:</strong> The vision is big ("will
            revolutionize...") but the submission can't explain what actually
            works right now. Ambition without grounding.
          </li>
        </List>
        <Paragraph>
          If any of these sound like your submission, you still have time to fix
          it. Add one user quote. Ground one claim. Be specific about what works
          today.
        </Paragraph>
      </NeoAccordion>

      <ClosingNote>
        <p>
          Putting your work out there is hard. You learned things this week that
          you couldn't learn any other way. Whatever the outcome, that's yours
          now. Ship it.
        </p>
      </ClosingNote>
    </Container>
  );
}

export default SubmissionGuide;
