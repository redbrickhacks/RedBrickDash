export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      app_config: {
        Row: {
          description: string | null;
          key: string;
          value: string;
        };
        Insert: {
          description?: string | null;
          key: string;
          value: string;
        };
        Update: {
          description?: string | null;
          key?: string;
          value?: string;
        };
        Relationships: [];
      };
      application_status: {
        Row: {
          id: number;
          status: string | null;
        };
        Insert: {
          id?: number;
          status?: string | null;
        };
        Update: {
          id?: number;
          status?: string | null;
        };
        Relationships: [];
      };
      bonus_point_status: {
        Row: {
          id: number;
          status: string;
        };
        Insert: {
          id: number;
          status: string;
        };
        Update: {
          id?: number;
          status?: string;
        };
        Relationships: [];
      };
      bonus_points: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          link: string | null;
          name: string;
          points: number;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          link?: string | null;
          name: string;
          points: number;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          link?: string | null;
          name?: string;
          points?: number;
        };
        Relationships: [];
      };
      bonus_points_log: {
        Row: {
          bonus_points_id: string;
          log_id: string;
          status: number;
          timestamp: string | null;
          user_id: string;
        };
        Insert: {
          bonus_points_id: string;
          log_id?: string;
          status?: number;
          timestamp?: string | null;
          user_id: string;
        };
        Update: {
          bonus_points_id?: string;
          log_id?: string;
          status?: number;
          timestamp?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bonus_points_log_bonus_points_id_fkey';
            columns: ['bonus_points_id'];
            isOneToOne: false;
            referencedRelation: 'bonus_points';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bonus_points_log_status_fkey';
            columns: ['status'];
            isOneToOne: false;
            referencedRelation: 'bonus_point_status';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bonus_points_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      companies: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          profile_photo: string | null;
          website: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          profile_photo?: string | null;
          website?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          profile_photo?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      company_saved_participants: {
        Row: {
          company_id: string;
          created_at: string | null;
          id: number;
          saved: boolean;
          user_id: string;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          id?: number;
          saved: boolean;
          user_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          id?: number;
          saved?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'company_saved_participants_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'company_saved_participants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          }
        ];
      };
      discord_invites: {
        Row: {
          id: number;
          invite_code: string | null;
          invite_used: boolean;
          time_invite_used: string | null;
          user_profile_id: string | null;
        };
        Insert: {
          id?: number;
          invite_code?: string | null;
          invite_used: boolean;
          time_invite_used?: string | null;
          user_profile_id?: string | null;
        };
        Update: {
          id?: number;
          invite_code?: string | null;
          invite_used?: boolean;
          time_invite_used?: string | null;
          user_profile_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'discord_invites_user_profile_id_fkey';
            columns: ['user_profile_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      discord_profiles: {
        Row: {
          discord_user_id: string;
          discord_username: string | null;
          user_profile_id: string;
          verified_at: string;
        };
        Insert: {
          discord_user_id: string;
          discord_username?: string | null;
          user_profile_id: string;
          verified_at?: string;
        };
        Update: {
          discord_user_id?: string;
          discord_username?: string | null;
          user_profile_id?: string;
          verified_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'discord_profiles_user_profile_id_fkey';
            columns: ['user_profile_id'];
            isOneToOne: true;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      discord_tokens: {
        Row: {
          discord_verification_token: string;
          user_id: string;
        };
        Insert: {
          discord_verification_token?: string;
          user_id: string;
        };
        Update: {
          discord_verification_token?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      event_log: {
        Row: {
          check_in_time: string;
          event_id: number;
          log_id: number;
          user_id: string;
        };
        Insert: {
          check_in_time?: string;
          event_id: number;
          log_id?: number;
          user_id: string;
        };
        Update: {
          check_in_time?: string;
          event_id?: number;
          log_id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_log_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          }
        ];
      };
      events: {
        Row: {
          company_id: string | null;
          created_at: string | null;
          description: string | null;
          end: string;
          id: number;
          location: string;
          name: string;
          points: number;
          start: string;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          end: string;
          id?: number;
          location: string;
          name: string;
          points: number;
          start: string;
        };
        Update: {
          company_id?: string | null;
          created_at?: string | null;
          description?: string | null;
          end?: string;
          id?: number;
          location?: string;
          name?: string;
          points?: number;
          start?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          }
        ];
      };
      invitations: {
        Row: {
          created_at: string | null;
          id: string;
          invited_id: string;
          organizer_id: string;
          team_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          invited_id: string;
          organizer_id: string;
          team_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          invited_id?: string;
          organizer_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invitations_invited_id_fkey';
            columns: ['invited_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'invitations_organizer_id_fkey';
            columns: ['organizer_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'invitations_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['team_id'];
          }
        ];
      };
      leaderboard: {
        Row: {
          bonus_points: number;
          event_points: number;
          total_points: number | null;
          user_id: string;
        };
        Insert: {
          bonus_points?: number;
          event_points?: number;
          total_points?: number | null;
          user_id: string;
        };
        Update: {
          bonus_points?: number;
          event_points?: number;
          total_points?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leaderboard_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      notes: {
        Row: {
          company_id: string | null;
          created_at: string | null;
          id: string;
          note: string | null;
          participant_id: string | null;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string | null;
          id?: string;
          note?: string | null;
          participant_id?: string | null;
        };
        Update: {
          company_id?: string | null;
          created_at?: string | null;
          id?: string;
          note?: string | null;
          participant_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notes_participant_id_fkey';
            columns: ['participant_id'];
            isOneToOne: false;
            referencedRelation: 'participants';
            referencedColumns: ['id'];
          }
        ];
      };
      participants: {
        Row: {
          created_at: string | null;
          dob: string | null;
          graduation_year: string | null;
          id: string;
          major: string | null;
          portfolio_link: string | null;
          resume: string | null;
          school: string | null;
          waiver_signed: boolean;
          wristband_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          dob?: string | null;
          graduation_year?: string | null;
          id: string;
          major?: string | null;
          portfolio_link?: string | null;
          resume?: string | null;
          school?: string | null;
          waiver_signed?: boolean;
          wristband_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          dob?: string | null;
          graduation_year?: string | null;
          id?: string;
          major?: string | null;
          portfolio_link?: string | null;
          resume?: string | null;
          school?: string | null;
          waiver_signed?: boolean;
          wristband_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'participants_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      pinned_events: {
        Row: {
          created_at: string | null;
          event_id: number;
          id: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          event_id: number;
          id?: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          event_id?: number;
          id?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pinned_events_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pinned_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      pointr_shortlinks: {
        Row: {
          created_at: string | null;
          id: number;
          path: string;
          url: string;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          path: string;
          url: string;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          path?: string;
          url?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          created_at: string | null;
          discord_role_id: string | null;
          id: number;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          discord_role_id?: string | null;
          id?: number;
          name: string;
        };
        Update: {
          created_at?: string | null;
          discord_role_id?: string | null;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      sponsor_user_bridge_company: {
        Row: {
          company_id: string;
          created_at: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          company_id: string;
          created_at?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          company_id?: string;
          created_at?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sponsor_user_bridge_company_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sponsor_user_bridge_company_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          }
        ];
      };
      stamp_types: {
        Row: {
          created_at: string | null;
          description: string | null;
          emoji: string;
          id: number;
          is_system_only: boolean | null;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          emoji: string;
          id?: number;
          is_system_only?: boolean | null;
          name: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          emoji?: string;
          id?: number;
          is_system_only?: boolean | null;
          name?: string;
        };
        Relationships: [];
      };
      submission_status: {
        Row: {
          id: number;
          status: string;
        };
        Insert: {
          id?: number;
          status: string;
        };
        Update: {
          id?: number;
          status?: string;
        };
        Relationships: [];
      };
      target_graduations: {
        Row: {
          company_id: string | null;
          created_at: string | null;
          graduation_year: string | null;
          id: string;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string | null;
          graduation_year?: string | null;
          id?: string;
        };
        Update: {
          company_id?: string | null;
          created_at?: string | null;
          graduation_year?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'target_graduations_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          }
        ];
      };
      target_majors: {
        Row: {
          company_id: string | null;
          created_at: string | null;
          id: string;
          major: string | null;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string | null;
          id?: string;
          major?: string | null;
        };
        Update: {
          company_id?: string | null;
          created_at?: string | null;
          id?: string;
          major?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'target_majors_company_id_fkey';
            columns: ['company_id'];
            isOneToOne: false;
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          }
        ];
      };
      team_submissions: {
        Row: {
          github_url: string | null;
          hw_bom_url: string | null;
          id: string;
          live_url: string | null;
          pdf_url: string | null;
          submitted_at: string | null;
          submitted_by: string | null;
          tally_data: Json | null;
          tally_response_id: string;
          team_id: string;
          youtube_url: string | null;
        };
        Insert: {
          github_url?: string | null;
          hw_bom_url?: string | null;
          id?: string;
          live_url?: string | null;
          pdf_url?: string | null;
          submitted_at?: string | null;
          submitted_by?: string | null;
          tally_data?: Json | null;
          tally_response_id: string;
          team_id: string;
          youtube_url?: string | null;
        };
        Update: {
          github_url?: string | null;
          hw_bom_url?: string | null;
          id?: string;
          live_url?: string | null;
          pdf_url?: string | null;
          submitted_at?: string | null;
          submitted_by?: string | null;
          tally_data?: Json | null;
          tally_response_id?: string;
          team_id?: string;
          youtube_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'team_submissions_submitted_by_fkey';
            columns: ['submitted_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'team_submissions_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['team_id'];
          }
        ];
      };
      teams: {
        Row: {
          created_at: string | null;
          description: string | null;
          devpost_url: string | null;
          final_submitted_at: string | null;
          is_hardware: boolean | null;
          name: string;
          organizer_id: string;
          photo_key: string | null;
          pitch_video_url: string | null;
          project_title: string | null;
          submission_status: number | null;
          team_id: string;
          track_id: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          devpost_url?: string | null;
          final_submitted_at?: string | null;
          is_hardware?: boolean | null;
          name: string;
          organizer_id: string;
          photo_key?: string | null;
          pitch_video_url?: string | null;
          project_title?: string | null;
          submission_status?: number | null;
          team_id?: string;
          track_id?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          devpost_url?: string | null;
          final_submitted_at?: string | null;
          is_hardware?: boolean | null;
          name?: string;
          organizer_id?: string;
          photo_key?: string | null;
          pitch_video_url?: string | null;
          project_title?: string | null;
          submission_status?: number | null;
          team_id?: string;
          track_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'teams_organizer_id_fkey';
            columns: ['organizer_id'];
            isOneToOne: true;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'teams_submission_status_fkey';
            columns: ['submission_status'];
            isOneToOne: false;
            referencedRelation: 'submission_status';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'teams_track_id_fkey';
            columns: ['track_id'];
            isOneToOne: false;
            referencedRelation: 'tracks';
            referencedColumns: ['id'];
          }
        ];
      };
      tracks: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: number;
          name: string;
          sdg_number: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: number;
          name: string;
          sdg_number?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: number;
          name?: string;
          sdg_number?: number | null;
        };
        Relationships: [];
      };
      user_invites: {
        Row: {
          created_at: string;
          email: string;
          id: number;
          role: number;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: number;
          role: number;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: number;
          role?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'user_invites_role_fkey';
            columns: ['role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          }
        ];
      };
      user_profiles: {
        Row: {
          app_id: string | null;
          application_status: number;
          application_status_last_changed: string | null;
          attendance_confirmed: boolean | null;
          created_at: string | null;
          email: string | null;
          first_name: string;
          last_name: string;
          monkeytype_duel_otp: string | null;
          monkeytype_duel_settings: Json;
          referral_code: string | null;
          referred_by: string | null;
          role: number | null;
          submission_id: string | null;
          submission_status: number | null;
          submitted_at: string | null;
          team_id: string | null;
          user_id: string;
        };
        Insert: {
          app_id?: string | null;
          application_status?: number;
          application_status_last_changed?: string | null;
          attendance_confirmed?: boolean | null;
          created_at?: string | null;
          email?: string | null;
          first_name: string;
          last_name: string;
          monkeytype_duel_otp?: string | null;
          monkeytype_duel_settings?: Json;
          referral_code?: string | null;
          referred_by?: string | null;
          role?: number | null;
          submission_id?: string | null;
          submission_status?: number | null;
          submitted_at?: string | null;
          team_id?: string | null;
          user_id: string;
        };
        Update: {
          app_id?: string | null;
          application_status?: number;
          application_status_last_changed?: string | null;
          attendance_confirmed?: boolean | null;
          created_at?: string | null;
          email?: string | null;
          first_name?: string;
          last_name?: string;
          monkeytype_duel_otp?: string | null;
          monkeytype_duel_settings?: Json;
          referral_code?: string | null;
          referred_by?: string | null;
          role?: number | null;
          submission_id?: string | null;
          submission_status?: number | null;
          submitted_at?: string | null;
          team_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_application_status_fkey';
            columns: ['application_status'];
            isOneToOne: false;
            referencedRelation: 'application_status';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profiles_referred_by_fkey';
            columns: ['referred_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'user_profiles_role_fkey';
            columns: ['role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profiles_submission_status_fkey';
            columns: ['submission_status'];
            isOneToOne: false;
            referencedRelation: 'submission_status';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profiles_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['team_id'];
          }
        ];
      };
      user_stamps: {
        Row: {
          created_at: string | null;
          giver_id: string | null;
          id: string;
          is_system_gift: boolean | null;
          message: string | null;
          recipient_id: string;
          slot_position: number;
          stamp_type_id: number;
        };
        Insert: {
          created_at?: string | null;
          giver_id?: string | null;
          id?: string;
          is_system_gift?: boolean | null;
          message?: string | null;
          recipient_id: string;
          slot_position: number;
          stamp_type_id: number;
        };
        Update: {
          created_at?: string | null;
          giver_id?: string | null;
          id?: string;
          is_system_gift?: boolean | null;
          message?: string | null;
          recipient_id?: string;
          slot_position?: number;
          stamp_type_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'user_stamps_giver_id_fkey';
            columns: ['giver_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'user_stamps_recipient_id_fkey';
            columns: ['recipient_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['user_id'];
          },
          {
            foreignKeyName: 'user_stamps_stamp_type_id_fkey';
            columns: ['stamp_type_id'];
            isOneToOne: false;
            referencedRelation: 'stamp_types';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      gen_monkeytype_otp: { Args: never; Returns: string };
      get_sponsors: { Args: never; Returns: string[] };
      get_volunteers: { Args: never; Returns: string[] };
      is_valid_url: { Args: { url: string }; Returns: boolean };
      swap_stamp: {
        Args: {
          p_giver_id: string;
          p_is_system_gift?: boolean;
          p_message?: string;
          p_recipient_id: string;
          p_slot_position: number;
          p_stamp_type_id: number;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
      DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
