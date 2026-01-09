import { Resend } from 'resend';

interface TeamInviteEmailParams {
  toEmail: string;
  recipientName: string;
  organizerName: string;
  teamName: string;
  acceptLink: string;
  declineLink: string;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

export class EmailService {
  private resend: Resend;
  private readonly fromEmail = 'RedBrick Hacks <hello@redbrickhacks.co>';

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendTeamInviteEmail(
    params: TeamInviteEmailParams
  ): Promise<EmailResult> {
    const {
      toEmail,
      recipientName,
      organizerName,
      teamName,
      acceptLink,
      declineLink,
    } = params;

    const html = this.buildTeamInviteEmailHtml({
      recipientName,
      organizerName,
      teamName,
      acceptLink,
      declineLink,
    });

    try {
      const { error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: toEmail,
        subject: `You're invited to join ${teamName}!`,
        html,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  private buildTeamInviteEmailHtml(params: {
    recipientName: string;
    organizerName: string;
    teamName: string;
    acceptLink: string;
    declineLink: string;
  }): string {
    const { recipientName, organizerName, teamName, acceptLink, declineLink } =
      params;

    const previewText = `${organizerName} invited you to join ${teamName}`;
    const headline = 'Team Invitation';
    const content = `<strong>${organizerName}</strong> has invited you to join their team <strong>"${teamName}"</strong> for RedBrick Hacks III.`;
    const additionalContent = `If you'd like to decline this invitation, <a href="${declineLink}" style="color: #1a1a1a; text-decoration: underline;">click here</a>. If you haven't registered yet, create an account first at <a href="https://portal.redbrickhacks.co" style="color: #1a1a1a; text-decoration: underline;">portal.redbrickhacks.co</a>`;

    return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>RedBrick Hacks III</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @font-face {
      font-family: 'Open Sans';
      font-style: normal;
      font-weight: 400;
      src: url('https://redbrickhacks.co/assets/fonts/Open_Sans/static/OpenSans-Regular.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Open Sans';
      font-style: normal;
      font-weight: 600;
      src: url('https://redbrickhacks.co/assets/fonts/Open_Sans/static/OpenSans-SemiBold.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Open Sans';
      font-style: normal;
      font-weight: 700;
      src: url('https://redbrickhacks.co/assets/fonts/Open_Sans/static/OpenSans-Bold.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Zilla Slab';
      font-style: normal;
      font-weight: 500;
      src: url('https://redbrickhacks.co/assets/fonts/Zilla_Slab/ZillaSlab-Medium.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Zilla Slab';
      font-style: normal;
      font-weight: 600;
      src: url('https://redbrickhacks.co/assets/fonts/Zilla_Slab/ZillaSlab-SemiBold.ttf') format('truetype');
    }

    @font-face {
      font-family: 'Zilla Slab';
      font-style: normal;
      font-weight: 700;
      src: url('https://redbrickhacks.co/assets/fonts/Zilla_Slab/ZillaSlab-Bold.ttf') format('truetype');
    }
  </style>
</head>

<body
  style="margin: 0; padding: 0; background-color: #FAF7F2; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">

  <!-- Preview Text -->
  <div style="display: none; max-height: 0; overflow: hidden;">
    ${previewText}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF7F2;">
    <tr>
      <td align="center" style="padding: 48px 24px;">

        <!-- Email Container -->
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0"
          style="max-width: 560px; width: 100%;">

          <!-- Logo / Header -->
          <tr>
            <td style="padding-bottom: 32px;">
              <a href="https://redbrickhacks.co" target="_blank"
                style="text-decoration: none; font-family: 'Zilla Slab', Georgia, serif; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.01em;">
                RedBrick Hacks III
              </a>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                style="background-color: #ffffff; border: 3px solid #1a1a1a;">

                <!-- Brick Top Bar -->
                <tr>
                  <td style="background-color: #a70e13; height: 6px;"></td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 36px;">

                    <!-- Subject/Headline -->
                    <h2
                      style="margin: 0 0 24px 0; font-family: 'Zilla Slab', Georgia, serif; font-size: 24px; font-weight: 700; line-height: 1.2; letter-spacing: -0.01em; color: #1a1a1a; text-transform: uppercase;">
                      ${headline}
                    </h2>

                    <!-- Greeting -->
                    <p
                      style="margin: 0 0 20px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                      Hi ${recipientName},
                    </p>

                    <!-- Main Content -->
                    <p
                      style="margin: 0 0 20px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                      ${content}
                    </p>

                    <!-- CTA Button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
                      <tr>
                        <td>
                          <a href="${acceptLink}" target="_blank"
                            style="display: inline-block; padding: 14px 32px; font-family: 'Zilla Slab', Georgia, serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #ffffff; text-decoration: none; background-color: #1a1a1a; border: 3px solid #1a1a1a;">
                            Accept Invite
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Additional Content -->
                    <p
                      style="margin: 0 0 20px 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                      ${additionalContent}
                    </p>

                    <!-- Sign Off -->
                    <p
                      style="margin: 32px 0 0 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 400; line-height: 1.65; color: #1a1a1a;">
                      Best,<br>
                      <strong style="font-weight: 600;">The RedBrickHacks Team</strong>
                    </p>

                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 36px 0 0 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">

                <!-- Event Info -->
                <tr>
                  <td style="padding-bottom: 20px; border-bottom: 1px solid #e0dcd5;">
                    <p
                      style="margin: 0; font-family: 'Zilla Slab', Georgia, serif; font-size: 14px; font-weight: 600; letter-spacing: 0.02em; color: #1a1a1a;">
                      Ashoka University's Flagship Hackathon
                    </p>
                    <p
                      style="margin: 4px 0 0 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 400; color: #6B6B6B;">
                      Online Round Submissions Deadline: Jan 16, 2026 &nbsp;·&nbsp; Digital Makerspace, Ashoka
                      University
                    </p>
                  </td>
                </tr>

                <!-- Links Row -->
                <tr>
                  <td style="padding: 20px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <!-- Website Links -->
                        <td
                          style="font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px;">
                          <a href="https://redbrickhacks.co"
                            style="color: #1a1a1a; text-decoration: none; font-weight: 600;">Website</a>
                          <span style="color: #c4c0b8;">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
                          <a href="https://portal.redbrickhacks.co"
                            style="color: #1a1a1a; text-decoration: none; font-weight: 600;">Portal</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Legal -->
                <tr>
                  <td style="padding-top: 20px; border-top: 1px solid #e0dcd5;">
                    <p
                      style="margin: 0; font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 400; line-height: 1.6; color: #999999;">
                      You're receiving this because you registered for RedBrick Hacks III.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>

</html>`;
  }
}
