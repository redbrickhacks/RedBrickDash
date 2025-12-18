import { SubmissionStatus } from '../submission-status';

describe('SubmissionStatus', () => {
  it('should have NOT_SUBMITTED status', () => {
    expect(SubmissionStatus.NOT_SUBMITTED).toBe('NOT_SUBMITTED');
  });

  it('should have SUBMITTED status', () => {
    expect(SubmissionStatus.SUBMITTED).toBe('SUBMITTED');
  });

  it('should have FINALIST status', () => {
    expect(SubmissionStatus.FINALIST).toBe('FINALIST');
  });

  it('should have NOT_SELECTED status', () => {
    expect(SubmissionStatus.NOT_SELECTED).toBe('NOT_SELECTED');
  });

  it('should have exactly 4 statuses', () => {
    const values = Object.values(SubmissionStatus);
    expect(values).toHaveLength(4);
  });
});
