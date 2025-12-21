import { injectable } from 'tsyringe';
import { HibiscusSupabaseClient } from '@hibiscus/hibiscus-supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';

@injectable()
export class DashboardRepository {
  private client: SupabaseClient;

  constructor(private readonly hbc: HibiscusSupabaseClient) {
    hbc.setOptions({ useServiceKey: true });
    this.client = hbc.getClient();
  }

  public readonly MAX_TEAM_MEMBERS: number = parseInt(
    process.env.NEXT_PUBLIC_MAX_TEAM_MEMBERS
  );

  getClient() {
    return this.client;
  }

  async getAllTeamMembers(teamId: string) {
    const { data, error } = await this.client
      .from('user_profiles')
      .select()
      .eq('team_id', teamId);
    return { data, error };
  }

  async getTeamInfo(teamId: string) {
    const { data, error } = await this.client
      .from('teams')
      .select('team_id,name,created_at,description,organizer_id')
      .eq('team_id', teamId)
      .single();
    return { data, error };
  }

  async getUserTeam(userId: string) {
    const { data, error } = await this.client
      .from('user_profiles')
      .select('team_id')
      .eq('user_id', userId)
      .single();
    return { data, error };
  }

  //checks if the user has no team, if it does, then length > 0
  async checkHasNoTeam(userId: string) {
    const { data, error } = await this.client
      .from('user_profiles')
      .select()
      .eq('user_id', userId)
      .is('team_id', null);
    return { data, error };
  }

  async verifyUserIsOrganizer(userId: string, teamId: string) {
    const { data } = await this.client
      .from('teams')
      .select()
      .eq('organizer_id', userId)
      .eq('team_id', teamId);

    if (data.length > 0) {
      return true;
    }

    return false;
  }

  async insertTeam(
    name: string,
    description: string,
    photoKey: string,
    organizerId: string
  ) {
    const { data, error } = await this.client
      .from('teams')
      .insert([
        {
          name: name,
          description: description,
          photo_key: photoKey,
          organizer_id: organizerId,
        },
      ])
      .select();
    return { data, error };
  }

  async updateOrganizerTeam(team_id: string, organizerId: string) {
    const { data, error } = await this.client
      .from('user_profiles')
      .update({ team_id: team_id })
      .eq('user_id', organizerId)
      .select();

    return { data, error };
  }

  async updateUserTeamId(userId: string, teamId: string | null) {
    const { data, error } = await this.client
      .from('user_profiles')
      .update({ team_id: teamId })
      .eq('user_id', userId)
      .select();

    return { data, error };
  }

  async updateAllTeamMembersToNull(teamId: string) {
    const { data, error } = await this.client
      .from('user_profiles')
      .update({ team_id: null })
      .eq('team_id', teamId)
      .select();

    return { data, error };
  }

  async deleteTeamInvites(teamId: string) {
    const { data, error } = await this.client
      .from('invitations')
      .delete()
      .eq('team_id', teamId);
    return { data, error };
  }

  async deleteTeam(teamId: string) {
    const { data, error } = await this.client
      .from('teams')
      .delete()
      .eq('team_id', teamId);
    return { data, error };
  }

  async updateKickedUser(kickId: string, teamId: string) {
    const { data, error } = await this.client
      .from('user_profiles')
      .update({ team_id: null })
      .eq('user_id', kickId)
      .eq('team_id', teamId)
      .select();

    return { data, error };
  }

  async getInviteInfo(inviteId: string) {
    const { data, error } = await this.client
      .from('invitations')
      .select()
      .eq('id', inviteId);

    return { data, error };
  }

  async checkInviteDoesNotExist(teamId: string, invitedId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await this.client
      .from('invitations')
      .select()
      .eq('team_id', teamId)
      .eq('invited_id', invitedId);

    if (data.length === 0) {
      return true;
    }
    return false;
  }

  async createInvite(organizerId: string, invitedId: string, teamId: string) {
    const { data, error } = await this.client
      .from('invitations')
      .insert([
        {
          organizer_id: organizerId,
          invited_id: invitedId,
          team_id: teamId,
        },
      ])
      .select('id,created_at');

    return { data, error };
  }

  async updateUserWithAcceptedInvite(teamId: string, invitedId: string) {
    const { data, error } = await this.client
      .from('user_profiles')
      .update({ team_id: teamId })
      .eq('user_id', invitedId);

    return { data, error };
  }

  async deleteAcceptedInvite(inviteId: string) {
    const { data, error } = await this.client
      .from('invitations')
      .delete()
      .eq('id', inviteId);

    return { data, error };
  }

  async getUserByEmailAndId(invitedId: string, email: string) {
    const { data, error } = await this.client
      .from('user_profiles')
      .select()
      .eq('email', email)
      .eq('user_id', invitedId)
      .single();

    return { data, error };
  }

  async getCompanyById(companyId: string) {
    const { data, error } = await this.client
      .from('companies')
      .select(
        `
      id,
      name,
      description,
      website,
      profile_photo
      target_majors (
        major
      )
      target_graduations (
        graduation_year
      )
    `
      )
      .eq('id', companyId)
      .single();

    return { data, error };
  }

  async insertCompany(
    name: string,
    description?: string,
    website?: string,
    profilePhoto?: string
  ) {
    const { data, error } = await this.client
      .from('companies')
      .insert([
        {
          name: name,
          description: description,
          website: website,
          profile_photo: profilePhoto,
        },
      ])
      .select()
      .single();
    return { data, error };
  }

  async insertMajors(companyId: string, targetMajors: string[]) {
    const majorInsertObjects = targetMajors.map((ele) => {
      return { company_id: companyId, major: ele };
    });
    const { data, error } = await this.client
      .from('target_majors')
      .insert(majorInsertObjects)
      .select();

    return { data, error };
  }

  async insertGraduationTerms(companyId: string, targetGraduations: string[]) {
    const graduationInsertObjects = targetGraduations.map((ele) => {
      return { company_id: companyId, graduation_year: ele };
    });
    const { data, error } = await this.client
      .from('target_graduations')
      .insert(graduationInsertObjects)
      .select();

    return { data, error };
  }
}
