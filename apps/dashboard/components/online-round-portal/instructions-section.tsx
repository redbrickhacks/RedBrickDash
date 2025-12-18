import styled from 'styled-components';

export function InstructionsSection() {
  return (
    <Container>
      <h2>How to Participate</h2>

      <Steps>
        <Step>
          <StepNumber>1</StepNumber>
          <StepContent>
            <h3>Form Your Team</h3>
            <p>
              Find teammates on Discord or work solo. Create your team on the
              portal.
            </p>
          </StepContent>
        </Step>

        <Step>
          <StepNumber>2</StepNumber>
          <StepContent>
            <h3>Choose Your Track</h3>
            <p>
              Select from SDG 4 (Education), SDG 11 (Cities), or SDG 13
              (Climate). Hardware projects can compete in any track + hardware
              category.
            </p>
          </StepContent>
        </Step>

        <Step>
          <StepNumber>3</StepNumber>
          <StepContent>
            <h3>Build Your Project</h3>
            <p>
              Create your MVP and submit it on Devpost. Record a pitch video
              explaining your solution.
            </p>
          </StepContent>
        </Step>

        <Step>
          <StepNumber>4</StepNumber>
          <StepContent>
            <h3>Submit Before Deadline</h3>
            <p>
              Submit your Devpost link and pitch video by January 14, 2026. You
              can update your submission anytime before the deadline.
            </p>
          </StepContent>
        </Step>
      </Steps>

      <TrackInfo>
        <h3>Tracks</h3>
        <TrackList>
          <TrackItem color="#4CAF50">
            <strong>SDG 4: Quality Education</strong>
            <p>
              Solutions that improve access to education and learning outcomes
            </p>
          </TrackItem>
          <TrackItem color="#2196F3">
            <strong>SDG 11: Sustainable Cities</strong>
            <p>
              Solutions for inclusive, safe, and resilient urban environments
            </p>
          </TrackItem>
          <TrackItem color="#FF9800">
            <strong>SDG 13: Climate Action</strong>
            <p>Solutions to combat climate change and its impacts</p>
          </TrackItem>
          <TrackItem color="#9C27B0">
            <strong>Hardware Track</strong>
            <p>
              Projects with physical hardware components (can be combined with
              any SDG track)
            </p>
          </TrackItem>
        </TrackList>
      </TrackInfo>
    </Container>
  );
}

const Container = styled.div`
  background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  border: 1px solid #ffcdd2;
  border-radius: 12px;
  padding: 1.5rem;
`;

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
`;

const Step = styled.div`
  display: flex;
  gap: 1rem;
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  background: #ff6347;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1rem;
  }
  p {
    margin: 0;
    color: #666;
    font-size: 0.875rem;
  }
`;

const TrackInfo = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ffcdd2;

  h3 {
    margin: 0 0 1rem 0;
  }
`;

const TrackList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const TrackItem = styled.div<{ color: string }>`
  padding: 1rem;
  border-left: 4px solid ${(props) => props.color};
  background: white;
  border-radius: 0 8px 8px 0;

  strong {
    color: ${(props) => props.color};
  }

  p {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
    color: #666;
  }
`;

export default InstructionsSection;
