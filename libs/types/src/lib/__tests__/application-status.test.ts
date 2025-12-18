import { ApplicationStatus } from '../application-status';

describe('ApplicationStatus', () => {
  it('should have NOT_APPLIED status', () => {
    expect(ApplicationStatus.NOT_APPLIED).toBe('NOT_APPLIED');
  });

  it('should have REGISTERED status', () => {
    expect(ApplicationStatus.REGISTERED).toBe('REGISTERED');
  });

  it('should have FINALIST status', () => {
    expect(ApplicationStatus.FINALIST).toBe('FINALIST');
  });

  it('should have CONFIRMED status', () => {
    expect(ApplicationStatus.CONFIRMED).toBe('CONFIRMED');
  });

  it('should have DECLINED status', () => {
    expect(ApplicationStatus.DECLINED).toBe('DECLINED');
  });

  it('should have NOT_SELECTED status', () => {
    expect(ApplicationStatus.NOT_SELECTED).toBe('NOT_SELECTED');
  });

  it('should have exactly 6 statuses', () => {
    const values = Object.values(ApplicationStatus);
    expect(values).toHaveLength(6);
  });
});
