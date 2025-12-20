import 'reflect-metadata';
import { DashboardRepository } from '../../../repository/dashboard.repository';
import { NextApiRequest, NextApiResponse } from 'next';
import { container } from 'tsyringe';
import { UserRepository } from '../../../repository/user.repository';
import { getAuthenticatedUser } from '../../../common/auth';
import { EmailService } from '../../../services/email.service';
import { getEnv } from '@hibiscus/env';

export default async function invite(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const repo = container.resolve(DashboardRepository);
    const userRepo = container.resolve(UserRepository);

    const email = req.body.email;
    const organizerId = req.body.organizerId;

    if (!email || !organizerId) {
      throw new Error(
        'One of more required parameters is missing from message body.'
      );
    }

    if (user.user_id !== organizerId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data, error } = await repo.getUserTeam(organizerId);
    if (error) {
      throw new Error(error.message);
    }

    const invitedUser = await userRepo.getUserIdByEmail(email);
    if (invitedUser.error) {
      console.error(invitedUser.error);
      throw new Error('Oops, an error occurred. Please try again later');
    }
    if (invitedUser.data === null) {
      throw new Error(
        "There's no user under this email! Please make sure whoever you invited have registered an account on HackSC"
      );
    }
    const invitedId = invitedUser.data.user_id;

    // people who made the team invites can't invite themselves (obviously)
    if (invitedId === organizerId) {
      throw new Error(
        `You're so lonely you invited yourself to your own team! 
        Please invite someone else but yourself or get some friends :) 
        -- 
        Sincerely, 
        HackSC Engineering
      `
      );
    }

    //very first check, make sure invite doesn't already exist
    const teamId = data.team_id;
    const team = await repo.getTeamInfo(teamId);
    if (!(await repo.checkInviteDoesNotExist(teamId, invitedId))) {
      throw new Error('Invitation to that user already exists.');
    }

    //check to make sure team isn't full
    const teamMembers = await repo.getAllTeamMembers(teamId);
    if (teamMembers.data.length >= repo.MAX_TEAM_MEMBERS) {
      throw new Error('Team is already full (4 members max).');
    }

    //get first names of organizer user
    const organizerFname: string | null = teamMembers.data.find(
      (member) => member['user_id'] === organizerId
    )?.first_name;
    if (organizerFname === null) {
      throw new Error('[ERROR]: organizer not in own team');
    }

    const teamName = team.data.name;
    const invitedUserFname: string = invitedUser.data.first_name;
    const invitedUserLname: string = invitedUser.data.last_name;
    const resCreateInvite = await repo.createInvite(
      organizerId,
      invitedId,
      teamId
    );
    const invitationId = resCreateInvite.data[0].id;
    const invitationCreatedAt = resCreateInvite.data[0].created_at;

    // Send team invite email
    let emailFailed = false;
    const portalUrl = getEnv().Hibiscus.AppURL.portal;
    const acceptLink = `${portalUrl}/team/invite/accept?inviteId=${invitationId}`;
    const declineLink = `${portalUrl}/team/invite/reject?inviteId=${invitationId}`;

    if (process.env.NODE_ENV === 'production') {
      const resendApiKey = getEnv().Hibiscus.Resend?.apiKey;
      if (resendApiKey) {
        const emailService = new EmailService(resendApiKey);
        const emailResult = await emailService.sendTeamInviteEmail({
          toEmail: email,
          recipientName: invitedUserFname,
          organizerName: organizerFname,
          teamName,
          acceptLink,
          declineLink,
        });

        if (!emailResult.success) {
          console.error('Failed to send team invite email:', emailResult.error);
          emailFailed = true;
        }
      } else {
        console.warn('Resend API key not configured, skipping email');
        emailFailed = true;
      }
    }

    return res.status(200).json({
      message: emailFailed
        ? 'Invite created but email notification failed. Please share the invite link manually.'
        : 'Invite sent successfully!',
      data: {
        inviteId: invitationId,
        createdAt: invitationCreatedAt,
        invitee: {
          id: invitedId,
          firstName: invitedUserFname,
          lastName: invitedUserLname,
          email,
        },
        acceptLink,
        emailFailed,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ message: e.message });
  }
}
