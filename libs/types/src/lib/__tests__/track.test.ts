import { TrackId } from '../track';

describe('TrackId', () => {
  it('should have QUALITY_EDUCATION with value 1', () => {
    expect(TrackId.QUALITY_EDUCATION).toBe(1);
  });

  it('should have SUSTAINABLE_CITIES with value 2', () => {
    expect(TrackId.SUSTAINABLE_CITIES).toBe(2);
  });

  it('should have CLIMATE_ACTION with value 3', () => {
    expect(TrackId.CLIMATE_ACTION).toBe(3);
  });

  it('should have exactly 3 track IDs', () => {
    const values = Object.values(TrackId).filter((v) => typeof v === 'number');
    expect(values).toHaveLength(3);
  });
});
