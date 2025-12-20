import styled from 'styled-components';
import { FaGraduationCap, FaCity, FaLeaf, FaMicrochip } from 'react-icons/fa6';

const TRACKS = [
  {
    id: 'sdg4',
    name: 'Quality Education',
    sdg: 'SDG 4',
    description:
      'Solutions that improve access to education and learning outcomes',
    icon: FaGraduationCap,
    color: '#4CAF50',
  },
  {
    id: 'sdg11',
    name: 'Sustainable Cities',
    sdg: 'SDG 11',
    description:
      'Solutions for inclusive, safe, and resilient urban environments',
    icon: FaCity,
    color: '#2196F3',
  },
  {
    id: 'sdg13',
    name: 'Climate Action',
    sdg: 'SDG 13',
    description: 'Solutions to combat climate change and its impacts',
    icon: FaLeaf,
    color: '#FF9800',
  },
  {
    id: 'hardware',
    name: 'Hardware Track',
    sdg: null,
    description: 'Physical hardware components (combinable with any SDG)',
    icon: FaMicrochip,
    color: '#9C27B0',
  },
];

export function TracksSection() {
  return (
    <Container>
      <Header>
        <Title>TRACKS</Title>
        <Subtitle>Choose your challenge</Subtitle>
      </Header>

      <TracksGrid>
        {TRACKS.map((track) => (
          <TrackCard key={track.id} $color={track.color}>
            <TrackIcon $color={track.color}>
              <track.icon size={24} />
            </TrackIcon>
            <TrackContent>
              {track.sdg && <TrackSDG>{track.sdg}</TrackSDG>}
              <TrackName>{track.name}</TrackName>
              <TrackDescription>{track.description}</TrackDescription>
            </TrackContent>
          </TrackCard>
        ))}
      </TracksGrid>
    </Container>
  );
}

const Container = styled.div`
  background: #fff;
  border: 3px solid #000;
  padding: 1.25rem;
  box-shadow: 6px 6px 0px #000;
`;

const Header = styled.div`
  margin-bottom: 1.25rem;
`;

const Title = styled.h3`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: #000;
  margin: 0 0 0.25rem 0;
  letter-spacing: 0.05em;
`;

const Subtitle = styled.p`
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: #666;
  margin: 0;
`;

const TracksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
`;

const TrackCard = styled.div<{ $color: string }>`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fafafa;
  border: 2px solid #000;
  border-left: 4px solid ${(props) => props.$color};
  transition: transform 0.1s ease, box-shadow 0.1s ease;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0px #000;
  }
`;

const TrackIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.$color}20;
  color: ${(props) => props.$color};
  flex-shrink: 0;
`;

const TrackContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TrackSDG = styled.span`
  font-family: 'Space Mono', monospace;
  font-size: 0.625rem;
  font-weight: 700;
  color: #666;
  letter-spacing: 0.05em;
`;

const TrackName = styled.h4`
  font-family: 'Space Mono', monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: #000;
  margin: 0.125rem 0 0.375rem 0;
`;

const TrackDescription = styled.p`
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

export default TracksSection;
