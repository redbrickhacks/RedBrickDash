import { EmailService } from '../email.service';
import { Resend } from 'resend';

// Mock Resend
jest.mock('resend');

describe('EmailService', () => {
  let emailService: EmailService;
  let mockResend: jest.Mocked<Resend>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockResend = {
      emails: {
        send: jest.fn(),
      },
    } as unknown as jest.Mocked<Resend>;

    (Resend as jest.Mock).mockImplementation(() => mockResend);
    emailService = new EmailService('test-api-key');
  });

  describe('sendTeamInviteEmail', () => {
    const defaultParams = {
      toEmail: 'invitee@example.com',
      recipientName: 'John',
      organizerName: 'Jane',
      teamName: 'Awesome Team',
      acceptLink:
        'https://portal.redbrickhacks.co/team/invite/accept?inviteId=123',
      declineLink:
        'https://portal.redbrickhacks.co/team/invite/reject?inviteId=123',
    };

    it('should send email with correct parameters', async () => {
      mockResend.emails.send.mockResolvedValue({
        data: { id: 'email-id' },
        error: null,
      });

      await emailService.sendTeamInviteEmail(defaultParams);

      expect(mockResend.emails.send).toHaveBeenCalledTimes(1);
      const callArgs = mockResend.emails.send.mock.calls[0][0];

      expect(callArgs.from).toBe('RedBrick Hacks <hello@redbrickhacks.co>');
      expect(callArgs.to).toBe('invitee@example.com');
      expect(callArgs.subject).toBe("You're invited to join Awesome Team!");
    });

    it('should include recipient name in email body', async () => {
      mockResend.emails.send.mockResolvedValue({
        data: { id: 'email-id' },
        error: null,
      });

      await emailService.sendTeamInviteEmail(defaultParams);

      const callArgs = mockResend.emails.send.mock.calls[0][0];
      expect(callArgs.html).toContain('Hi John,');
    });

    it('should include team name and organizer name in content', async () => {
      mockResend.emails.send.mockResolvedValue({
        data: { id: 'email-id' },
        error: null,
      });

      await emailService.sendTeamInviteEmail(defaultParams);

      const callArgs = mockResend.emails.send.mock.calls[0][0];
      expect(callArgs.html).toContain('Awesome Team');
      expect(callArgs.html).toContain('Jane');
    });

    it('should include accept link as CTA button', async () => {
      mockResend.emails.send.mockResolvedValue({
        data: { id: 'email-id' },
        error: null,
      });

      await emailService.sendTeamInviteEmail(defaultParams);

      const callArgs = mockResend.emails.send.mock.calls[0][0];
      expect(callArgs.html).toContain(defaultParams.acceptLink);
    });

    it('should include decline link in additional content', async () => {
      mockResend.emails.send.mockResolvedValue({
        data: { id: 'email-id' },
        error: null,
      });

      await emailService.sendTeamInviteEmail(defaultParams);

      const callArgs = mockResend.emails.send.mock.calls[0][0];
      expect(callArgs.html).toContain(defaultParams.declineLink);
    });

    it('should return success when email is sent', async () => {
      mockResend.emails.send.mockResolvedValue({
        data: { id: 'email-id' },
        error: null,
      });

      const result = await emailService.sendTeamInviteEmail(defaultParams);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error when Resend API fails', async () => {
      mockResend.emails.send.mockResolvedValue({
        data: null,
        error: { message: 'API Error', name: 'api_error' },
      });

      const result = await emailService.sendTeamInviteEmail(defaultParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });

    it('should handle thrown exceptions gracefully', async () => {
      mockResend.emails.send.mockRejectedValue(new Error('Network error'));

      const result = await emailService.sendTeamInviteEmail(defaultParams);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});
