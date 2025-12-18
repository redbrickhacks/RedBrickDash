import styled from 'styled-components';

export function NotSelectedPlaceholder() {
  return (
    <Container>
      <h1>Thank You for Participating</h1>
      <p>
        Unfortunately, your team was not selected for the National Finals this
        time.
      </p>
      <p>
        We appreciate your hard work and encourage you to keep building! Stay
        connected on Discord for future opportunities.
      </p>
    </Container>
  );
}

const Container = styled.div`
  text-align: center;
  padding: 2rem;

  h1 {
    color: #666;
  }

  p {
    color: #888;
    max-width: 500px;
    margin: 1rem auto;
  }
`;

export default NotSelectedPlaceholder;
