export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          created_at: string
          device_info: string | null
          id: string
          last_active_at: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: string | null
          id?: string
          last_active_at?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: string | null
          id?: string
          last_active_at?: string
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      affinity_scores: {
        Row: {
          activity_resonance: number | null
          affinity_score: number
          circle_tier: number
          computed_at: string | null
          freshness_decay: number | null
          id: string
          intent_multiplier: number | null
          referral_boost: number | null
          referral_source: string | null
          role_weight: number | null
          target_id: string
          trust_proximity: number | null
          viewer_id: string
        }
        Insert: {
          activity_resonance?: number | null
          affinity_score?: number
          circle_tier?: number
          computed_at?: string | null
          freshness_decay?: number | null
          id?: string
          intent_multiplier?: number | null
          referral_boost?: number | null
          referral_source?: string | null
          role_weight?: number | null
          target_id: string
          trust_proximity?: number | null
          viewer_id: string
        }
        Update: {
          activity_resonance?: number | null
          affinity_score?: number
          circle_tier?: number
          computed_at?: string | null
          freshness_decay?: number | null
          id?: string
          intent_multiplier?: number | null
          referral_boost?: number | null
          referral_source?: string | null
          role_weight?: number | null
          target_id?: string
          trust_proximity?: number | null
          viewer_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_hint: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_hint?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_hint?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_id?: string
        }
        Relationships: []
      }
      badge_definitions: {
        Row: {
          category: string
          created_at: string
          criteria_field: string | null
          criteria_type: string
          criteria_value: number
          description: string
          icon_name: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tier: string
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          criteria_field?: string | null
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tier?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          criteria_field?: string | null
          criteria_type?: string
          criteria_value?: number
          description?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tier?: string
          xp_reward?: number
        }
        Relationships: []
      }
      blog_poll_options: {
        Row: {
          blog_post_id: string
          created_at: string
          id: string
          is_multi_select: boolean
          option_text: string
          position: number
        }
        Insert: {
          blog_post_id: string
          created_at?: string
          id?: string
          is_multi_select?: boolean
          option_text: string
          position?: number
        }
        Update: {
          blog_post_id?: string
          created_at?: string
          id?: string
          is_multi_select?: boolean
          option_text?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_poll_options_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_poll_votes: {
        Row: {
          blog_post_id: string
          created_at: string
          id: string
          option_id: string
          user_id: string
        }
        Insert: {
          blog_post_id: string
          created_at?: string
          id?: string
          option_id: string
          user_id: string
        }
        Update: {
          blog_post_id?: string
          created_at?: string
          id?: string
          option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_poll_votes_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "blog_poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_avatar_url: string | null
          author_name: string
          category: string
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string
          featured: boolean
          id: string
          post_type: Database["public"]["Enums"]["blog_post_type"]
          published: boolean
          published_at: string | null
          read_time_minutes: number
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_avatar_url?: string | null
          author_name?: string
          category?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          featured?: boolean
          id?: string
          post_type?: Database["public"]["Enums"]["blog_post_type"]
          published?: boolean
          published_at?: string | null
          read_time_minutes?: number
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_avatar_url?: string | null
          author_name?: string
          category?: string
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string
          featured?: boolean
          id?: string
          post_type?: Database["public"]["Enums"]["blog_post_type"]
          published?: boolean
          published_at?: string | null
          read_time_minutes?: number
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_survey_options: {
        Row: {
          id: string
          option_text: string
          position: number
          question_id: string
        }
        Insert: {
          id?: string
          option_text: string
          position?: number
          question_id: string
        }
        Update: {
          id?: string
          option_text?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_survey_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "blog_survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_survey_questions: {
        Row: {
          blog_post_id: string
          created_at: string
          id: string
          position: number
          question_text: string
          question_type: string
          required: boolean
        }
        Insert: {
          blog_post_id: string
          created_at?: string
          id?: string
          position?: number
          question_text: string
          question_type?: string
          required?: boolean
        }
        Update: {
          blog_post_id?: string
          created_at?: string
          id?: string
          position?: number
          question_text?: string
          question_type?: string
          required?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "blog_survey_questions_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_survey_responses: {
        Row: {
          blog_post_id: string
          created_at: string
          id: string
          option_id: string | null
          question_id: string
          text_response: string | null
          user_id: string
        }
        Insert: {
          blog_post_id: string
          created_at?: string
          id?: string
          option_id?: string | null
          question_id: string
          text_response?: string | null
          user_id: string
        }
        Update: {
          blog_post_id?: string
          created_at?: string
          id?: string
          option_id?: string | null
          question_id?: string
          text_response?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_survey_responses_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_survey_responses_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "blog_survey_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "blog_survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          campaign_type: string
          click_count: number | null
          completed_at: string | null
          content: Json | null
          conversion_count: number | null
          created_at: string
          created_by: string
          id: string
          name: string
          open_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          status: string
          target_audience: string | null
          target_count: number | null
          updated_at: string
        }
        Insert: {
          campaign_type?: string
          click_count?: number | null
          completed_at?: string | null
          content?: Json | null
          conversion_count?: number | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          target_audience?: string | null
          target_count?: number | null
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          click_count?: number | null
          completed_at?: string | null
          content?: Json | null
          conversion_count?: number | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          open_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          target_audience?: string | null
          target_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      card_exchanges: {
        Row: {
          action: string
          card_owner_id: string
          context: string
          created_at: string
          event_id: string | null
          id: string
          viewer_id: string | null
          viewer_name: string | null
        }
        Insert: {
          action?: string
          card_owner_id: string
          context?: string
          created_at?: string
          event_id?: string | null
          id?: string
          viewer_id?: string | null
          viewer_name?: string | null
        }
        Update: {
          action?: string
          card_owner_id?: string
          context?: string
          created_at?: string
          event_id?: string | null
          id?: string
          viewer_id?: string | null
          viewer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "card_exchanges_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          connection_type: Database["public"]["Enums"]["connection_type"]
          created_at: string
          from_user_id: string
          id: string
          status: Database["public"]["Enums"]["connection_status"]
          to_user_id: string
        }
        Insert: {
          connection_type?: Database["public"]["Enums"]["connection_type"]
          created_at?: string
          from_user_id: string
          id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          to_user_id: string
        }
        Update: {
          connection_type?: Database["public"]["Enums"]["connection_type"]
          created_at?: string
          from_user_id?: string
          id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          to_user_id?: string
        }
        Relationships: []
      }
      education: {
        Row: {
          activities: string | null
          created_at: string
          degree: string
          description: string | null
          end_year: number | null
          field_of_study: string | null
          grade: string | null
          id: string
          institution: string
          is_current: boolean
          start_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activities?: string | null
          created_at?: string
          degree: string
          description?: string | null
          end_year?: number | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution: string
          is_current?: boolean
          start_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activities?: string | null
          created_at?: string
          degree?: string
          description?: string | null
          end_year?: number | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution?: string
          is_current?: boolean
          start_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      endorsements: {
        Row: {
          created_at: string
          endorsed_user_id: string
          endorser_id: string
          id: string
          skill: string
        }
        Insert: {
          created_at?: string
          endorsed_user_id: string
          endorser_id: string
          id?: string
          skill: string
        }
        Update: {
          created_at?: string
          endorsed_user_id?: string
          endorser_id?: string
          id?: string
          skill?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          cancelled_at: string | null
          event_id: string
          id: string
          registered_at: string
          status: Database["public"]["Enums"]["registration_status"]
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          event_id: string
          id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"]
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          event_id?: string
          id?: string
          registered_at?: string
          status?: Database["public"]["Enums"]["registration_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_speakers: {
        Row: {
          created_at: string
          event_id: string
          id: string
          position: number
          speaker_avatar_url: string | null
          speaker_name: string
          speaker_profile_id: string | null
          speaker_title: string | null
          topic: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          position?: number
          speaker_avatar_url?: string | null
          speaker_name: string
          speaker_profile_id?: string | null
          speaker_title?: string | null
          topic?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          position?: number
          speaker_avatar_url?: string | null
          speaker_name?: string
          speaker_profile_id?: string | null
          speaker_title?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          capacity: number | null
          category: Database["public"]["Enums"]["event_category"]
          created_at: string
          description: string
          end_time: string
          event_mode: Database["public"]["Enums"]["event_mode"]
          id: string
          is_free: boolean
          organizer_id: string
          registration_count: number
          start_time: string
          status: Database["public"]["Enums"]["event_status"]
          tags: string[] | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
          virtual_link: string | null
        }
        Insert: {
          banner_url?: string | null
          capacity?: number | null
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string
          description?: string
          end_time: string
          event_mode?: Database["public"]["Enums"]["event_mode"]
          id?: string
          is_free?: boolean
          organizer_id: string
          registration_count?: number
          start_time: string
          status?: Database["public"]["Enums"]["event_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          virtual_link?: string | null
        }
        Update: {
          banner_url?: string | null
          capacity?: number | null
          category?: Database["public"]["Enums"]["event_category"]
          created_at?: string
          description?: string
          end_time?: string
          event_mode?: Database["public"]["Enums"]["event_mode"]
          id?: string
          is_free?: boolean
          organizer_id?: string
          registration_count?: number
          start_time?: string
          status?: Database["public"]["Enums"]["event_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          virtual_link?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          created_by: string
          description: string
          flag_key: string
          id: string
          is_enabled: boolean
          label: string
          metadata: Json | null
          rollout_percentage: number
          target_segment: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          flag_key: string
          id?: string
          is_enabled?: boolean
          label: string
          metadata?: Json | null
          rollout_percentage?: number
          target_segment?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          flag_key?: string
          id?: string
          is_enabled?: boolean
          label?: string
          metadata?: Json | null
          rollout_percentage?: number
          target_segment?: string
          updated_at?: string
        }
        Relationships: []
      }
      featured_posts: {
        Row: {
          created_at: string
          id: string
          position: number
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      file_uploads: {
        Row: {
          bucket: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          public_url: string | null
          user_id: string
        }
        Insert: {
          bucket: string
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          public_url?: string | null
          user_id: string
        }
        Update: {
          bucket?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          public_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      intent_signals: {
        Row: {
          created_at: string | null
          id: string
          signal_data: Json | null
          signal_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          signal_data?: Json | null
          signal_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          signal_data?: Json | null
          signal_type?: string
          user_id?: string
        }
        Relationships: []
      }
      introductions: {
        Row: {
          acted_at: string | null
          created_at: string | null
          id: string
          introduced_user_id: string
          introducer_id: string
          introduction_type: string
          message: string | null
          status: string | null
          target_user_id: string
        }
        Insert: {
          acted_at?: string | null
          created_at?: string | null
          id?: string
          introduced_user_id: string
          introducer_id: string
          introduction_type?: string
          message?: string | null
          status?: string | null
          target_user_id: string
        }
        Update: {
          acted_at?: string | null
          created_at?: string | null
          id?: string
          introduced_user_id?: string
          introducer_id?: string
          introduction_type?: string
          message?: string | null
          status?: string | null
          target_user_id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          archived_at: string | null
          converted_user_id: string | null
          created_at: string
          created_by: string
          id: string
          last_reminder_at: string | null
          max_reminders: number
          next_reminder_at: string | null
          notes: string | null
          reactivate_after: string | null
          registry_entity_id: string | null
          reminder_count: number
          status: string
          target_email: string
          target_name: string | null
          target_phone: string | null
          target_role: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          converted_user_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          last_reminder_at?: string | null
          max_reminders?: number
          next_reminder_at?: string | null
          notes?: string | null
          reactivate_after?: string | null
          registry_entity_id?: string | null
          reminder_count?: number
          status?: string
          target_email: string
          target_name?: string | null
          target_phone?: string | null
          target_role?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          converted_user_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          last_reminder_at?: string | null
          max_reminders?: number
          next_reminder_at?: string | null
          notes?: string | null
          reactivate_after?: string | null
          registry_entity_id?: string | null
          reminder_count?: number
          status?: string
          target_email?: string
          target_name?: string | null
          target_phone?: string | null
          target_role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_registry_entity_id_fkey"
            columns: ["registry_entity_id"]
            isOneToOne: false
            referencedRelation: "registry_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_note: string | null
          created_at: string
          employer_notes: string | null
          id: string
          job_id: string
          resume_name: string | null
          resume_url: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_note?: string | null
          created_at?: string
          employer_notes?: string | null
          id?: string
          job_id: string
          resume_name?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_note?: string | null
          created_at?: string
          employer_notes?: string | null
          id?: string
          job_id?: string
          resume_name?: string | null
          resume_url?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          application_count: number
          certifications_preferred: string[] | null
          company_logo_url: string | null
          company_name: string
          created_at: string
          description: string
          experience_max: number | null
          experience_min: number | null
          expires_at: string | null
          id: string
          is_remote: boolean
          job_category: Database["public"]["Enums"]["job_category"]
          job_type: Database["public"]["Enums"]["job_type"]
          location: string
          poster_id: string
          qualifications: string[] | null
          salary_currency: string
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          application_count?: number
          certifications_preferred?: string[] | null
          company_logo_url?: string | null
          company_name?: string
          created_at?: string
          description?: string
          experience_max?: number | null
          experience_min?: number | null
          expires_at?: string | null
          id?: string
          is_remote?: boolean
          job_category?: Database["public"]["Enums"]["job_category"]
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string
          poster_id: string
          qualifications?: string[] | null
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          application_count?: number
          certifications_preferred?: string[] | null
          company_logo_url?: string | null
          company_name?: string
          created_at?: string
          description?: string
          experience_max?: number | null
          experience_min?: number | null
          expires_at?: string | null
          id?: string
          is_remote?: boolean
          job_category?: Database["public"]["Enums"]["job_category"]
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string
          poster_id?: string
          qualifications?: string[] | null
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      kb_articles: {
        Row: {
          category: string
          category_slug: string
          content: string
          created_at: string
          excerpt: string
          helpful_count: number
          id: string
          published: boolean
          read_time_minutes: number
          slug: string
          sort_order: number
          subcategory: string
          tags: string[] | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          category?: string
          category_slug?: string
          content?: string
          created_at?: string
          excerpt?: string
          helpful_count?: number
          id?: string
          published?: boolean
          read_time_minutes?: number
          slug: string
          sort_order?: number
          subcategory?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          category?: string
          category_slug?: string
          content?: string
          created_at?: string
          excerpt?: string
          helpful_count?: number
          id?: string
          published?: boolean
          read_time_minutes?: number
          slug?: string
          sort_order?: number
          subcategory?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      listing_enquiries: {
        Row: {
          contact_preference: string | null
          created_at: string
          enquirer_id: string
          id: string
          listing_id: string
          message: string
          status: string
        }
        Insert: {
          contact_preference?: string | null
          created_at?: string
          enquirer_id: string
          id?: string
          listing_id: string
          message?: string
          status?: string
        }
        Update: {
          contact_preference?: string | null
          created_at?: string
          enquirer_id?: string
          id?: string
          listing_id?: string
          message?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_enquiries_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_reviews: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          rating: number
          review_text: string | null
          reviewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          review_text?: string | null
          reviewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          average_rating: number
          certifications: string[] | null
          created_at: string
          description: string
          enquiry_count: number
          highlights: string[] | null
          id: string
          listing_type: Database["public"]["Enums"]["listing_type"]
          location: string | null
          media_urls: string[] | null
          min_investment: number | null
          pricing_info: Json | null
          product_category:
            | Database["public"]["Enums"]["product_category"]
            | null
          returns_info: string | null
          review_count: number
          risk_level: string | null
          service_category:
            | Database["public"]["Enums"]["service_category"]
            | null
          status: Database["public"]["Enums"]["listing_status"]
          tags: string[] | null
          tenure: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number
        }
        Insert: {
          average_rating?: number
          certifications?: string[] | null
          created_at?: string
          description?: string
          enquiry_count?: number
          highlights?: string[] | null
          id?: string
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location?: string | null
          media_urls?: string[] | null
          min_investment?: number | null
          pricing_info?: Json | null
          product_category?:
            | Database["public"]["Enums"]["product_category"]
            | null
          returns_info?: string | null
          review_count?: number
          risk_level?: string | null
          service_category?:
            | Database["public"]["Enums"]["service_category"]
            | null
          status?: Database["public"]["Enums"]["listing_status"]
          tags?: string[] | null
          tenure?: string | null
          title: string
          updated_at?: string
          user_id: string
          view_count?: number
        }
        Update: {
          average_rating?: number
          certifications?: string[] | null
          created_at?: string
          description?: string
          enquiry_count?: number
          highlights?: string[] | null
          id?: string
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location?: string | null
          media_urls?: string[] | null
          min_investment?: number | null
          pricing_info?: Json | null
          product_category?:
            | Database["public"]["Enums"]["product_category"]
            | null
          returns_info?: string | null
          review_count?: number
          risk_level?: string | null
          service_category?:
            | Database["public"]["Enums"]["service_category"]
            | null
          status?: Database["public"]["Enums"]["listing_status"]
          tags?: string[] | null
          tenure?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          category: Database["public"]["Enums"]["message_category"]
          content: string
          created_at: string
          id: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["message_category"]
          content: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["message_category"]
          content?: string
          created_at?: string
          id?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          reference_id: string | null
          reference_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opinion_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          opinion_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          opinion_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          opinion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opinion_comments_opinion_id_fkey"
            columns: ["opinion_id"]
            isOneToOne: false
            referencedRelation: "opinions"
            referencedColumns: ["id"]
          },
        ]
      }
      opinion_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          opinion_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          opinion_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          opinion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opinion_interactions_opinion_id_fkey"
            columns: ["opinion_id"]
            isOneToOne: false
            referencedRelation: "opinions"
            referencedColumns: ["id"]
          },
        ]
      }
      opinion_votes: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          opinion_id: string
          selected_option: string
          user_id: string
          voter_role: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          opinion_id: string
          selected_option: string
          user_id: string
          voter_role?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          opinion_id?: string
          selected_option?: string
          user_id?: string
          voter_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "opinion_votes_opinion_id_fkey"
            columns: ["opinion_id"]
            isOneToOne: false
            referencedRelation: "opinions"
            referencedColumns: ["id"]
          },
        ]
      }
      opinions: {
        Row: {
          category: Database["public"]["Enums"]["opinion_category"]
          comment_count: number
          created_at: string
          created_by: string
          description: string
          disclaimer_text: string | null
          ends_at: string
          format: Database["public"]["Enums"]["opinion_format"]
          id: string
          is_featured: boolean
          like_count: number
          options: Json
          participation_count: number
          share_count: number
          starts_at: string
          status: Database["public"]["Enums"]["opinion_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["opinion_category"]
          comment_count?: number
          created_at?: string
          created_by: string
          description?: string
          disclaimer_text?: string | null
          ends_at: string
          format?: Database["public"]["Enums"]["opinion_format"]
          id?: string
          is_featured?: boolean
          like_count?: number
          options?: Json
          participation_count?: number
          share_count?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["opinion_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["opinion_category"]
          comment_count?: number
          created_at?: string
          created_by?: string
          description?: string
          disclaimer_text?: string | null
          ends_at?: string
          format?: Database["public"]["Enums"]["opinion_format"]
          id?: string
          is_featured?: boolean
          like_count?: number
          options?: Json
          participation_count?: number
          share_count?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["opinion_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          razorpay_invoice_id: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          refund_amount: number | null
          refund_reason: string | null
          status: Database["public"]["Enums"]["payment_status"]
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          razorpay_invoice_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          razorpay_invoice_id?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          created_at: string
          id: string
          option_text: string
          position: number
          post_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_text: string
          position?: number
          post_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_text?: string
          position?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          poll_option_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          poll_option_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          poll_option_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      post_drafts: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          mentioned_users: Json | null
          poll_options: Json | null
          post_kind: string
          post_type: string
          query_category: string | null
          schedule_time: string | null
          scheduled_at: string | null
          survey_questions: Json | null
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          mentioned_users?: Json | null
          poll_options?: Json | null
          post_kind?: string
          post_type?: string
          query_category?: string | null
          schedule_time?: string | null
          scheduled_at?: string | null
          survey_questions?: Json | null
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          mentioned_users?: Json | null
          poll_options?: Json | null
          post_kind?: string
          post_type?: string
          query_category?: string | null
          schedule_time?: string | null
          scheduled_at?: string | null
          survey_questions?: Json | null
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      post_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          author_id: string
          content: string
          created_at: string
          hashtags: string[] | null
          id: string
          post_kind: Database["public"]["Enums"]["post_kind"]
          post_type: Database["public"]["Enums"]["post_type"]
          query_category: Database["public"]["Enums"]["query_category"] | null
          scheduled_at: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["post_visibility"]
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          author_id: string
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          post_kind?: Database["public"]["Enums"]["post_kind"]
          post_type?: Database["public"]["Enums"]["post_type"]
          query_category?: Database["public"]["Enums"]["query_category"] | null
          scheduled_at?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          author_id?: string
          content?: string
          created_at?: string
          hashtags?: string[] | null
          id?: string
          post_kind?: Database["public"]["Enums"]["post_kind"]
          post_type?: Database["public"]["Enums"]["post_type"]
          query_category?: Database["public"]["Enums"]["query_category"] | null
          scheduled_at?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["post_visibility"]
        }
        Relationships: []
      }
      profile_flair: {
        Row: {
          avatar_border: string
          id: string
          name_effect: string
          profile_theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_border?: string
          id?: string
          name_effect?: string
          profile_theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_border?: string
          id?: string
          name_effect?: string
          profile_theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_tab_privacy: {
        Row: {
          activity_visibility: string
          id: string
          network_visibility: string
          updated_at: string
          user_id: string
          vault_visibility: string
        }
        Insert: {
          activity_visibility?: string
          id?: string
          network_visibility?: string
          updated_at?: string
          user_id: string
          vault_visibility?: string
        }
        Update: {
          activity_visibility?: string
          id?: string
          network_visibility?: string
          updated_at?: string
          user_id?: string
          vault_visibility?: string
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          viewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          viewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          viewer_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          designation: string | null
          digital_card_fields: Json | null
          display_name: string | null
          experience_years: number | null
          full_name: string
          headline: string | null
          id: string
          is_staff: boolean
          languages: Json | null
          location: string | null
          onboarding_completed: boolean
          organization: string | null
          regulatory_ids: Json | null
          social_links: Json | null
          specializations: string[] | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          verification_status: Database["public"]["Enums"]["verification_status"]
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          designation?: string | null
          digital_card_fields?: Json | null
          display_name?: string | null
          experience_years?: number | null
          full_name?: string
          headline?: string | null
          id: string
          is_staff?: boolean
          languages?: Json | null
          location?: string | null
          onboarding_completed?: boolean
          organization?: string | null
          regulatory_ids?: Json | null
          social_links?: Json | null
          specializations?: string[] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          designation?: string | null
          digital_card_fields?: Json | null
          display_name?: string | null
          experience_years?: number | null
          full_name?: string
          headline?: string | null
          id?: string
          is_staff?: boolean
          languages?: Json | null
          location?: string | null
          onboarding_completed?: boolean
          organization?: string | null
          regulatory_ids?: Json | null
          social_links?: Json | null
          specializations?: string[] | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_status?: Database["public"]["Enums"]["verification_status"]
          website?: string | null
        }
        Relationships: []
      }
      publications: {
        Row: {
          co_authors: string[] | null
          created_at: string
          description: string | null
          id: string
          publication_type: string
          published_date: string | null
          publisher: string | null
          tags: string[] | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          co_authors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          publication_type?: string
          published_date?: string | null
          publisher?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          co_authors?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          publication_type?: string
          published_date?: string | null
          publisher?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          recipient_id: string
          relationship: string
          status: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          recipient_id: string
          relationship?: string
          status?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          recipient_id?: string
          relationship?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_conversions: {
        Row: {
          created_at: string
          id: string
          mentor_bonus_until: string
          referral_link_id: string | null
          referred_user_id: string
          referrer_id: string
          total_bonus_xp: number
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_bonus_until?: string
          referral_link_id?: string | null
          referred_user_id: string
          referrer_id: string
          total_bonus_xp?: number
        }
        Update: {
          created_at?: string
          id?: string
          mentor_bonus_until?: string
          referral_link_id?: string | null
          referred_user_id?: string
          referrer_id?: string
          total_bonus_xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_referral_link_id_fkey"
            columns: ["referral_link_id"]
            isOneToOne: false
            referencedRelation: "referral_links"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_links: {
        Row: {
          click_count: number
          code: string
          created_at: string
          id: string
          referrer_id: string
        }
        Insert: {
          click_count?: number
          code: string
          created_at?: string
          id?: string
          referrer_id: string
        }
        Update: {
          click_count?: number
          code?: string
          created_at?: string
          id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      registry_entities: {
        Row: {
          address: string | null
          city: string | null
          claimed_at: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          entity_name: string
          entity_type: string | null
          id: string
          is_public: boolean
          last_synced_at: string | null
          matched_user_id: string | null
          pincode: string | null
          raw_data: Json | null
          registration_category: string | null
          registration_number: string | null
          source: string
          source_id: string | null
          state: string | null
          status: string
          updated_at: string
          view_count: number
        }
        Insert: {
          address?: string | null
          city?: string | null
          claimed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          entity_name: string
          entity_type?: string | null
          id?: string
          is_public?: boolean
          last_synced_at?: string | null
          matched_user_id?: string | null
          pincode?: string | null
          raw_data?: Json | null
          registration_category?: string | null
          registration_number?: string | null
          source?: string
          source_id?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          address?: string | null
          city?: string | null
          claimed_at?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          entity_name?: string
          entity_type?: string | null
          id?: string
          is_public?: boolean
          last_synced_at?: string | null
          matched_user_id?: string | null
          pincode?: string | null
          raw_data?: Json | null
          registration_category?: string | null
          registration_number?: string | null
          source?: string
          source_id?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string | null
          reason: string
          reported_user_id: string | null
          reporter_id: string
          resource_id: string | null
          resource_type: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason: string
          reported_user_id?: string | null
          reporter_id: string
          resource_id?: string | null
          resource_type?: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason?: string
          reported_user_id?: string | null
          reporter_id?: string
          resource_id?: string | null
          resource_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_leads: {
        Row: {
          assigned_to: string | null
          company_name: string | null
          created_at: string
          id: string
          invitation_id: string | null
          last_contacted_at: string | null
          lead_email: string | null
          lead_name: string
          lead_phone: string | null
          lead_priority: string
          lead_source: string
          lead_stage: string
          metadata: Json | null
          notes: string | null
          registry_entity_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          invitation_id?: string | null
          last_contacted_at?: string | null
          lead_email?: string | null
          lead_name: string
          lead_phone?: string | null
          lead_priority?: string
          lead_source?: string
          lead_stage?: string
          metadata?: Json | null
          notes?: string | null
          registry_entity_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          invitation_id?: string | null
          last_contacted_at?: string | null
          lead_email?: string | null
          lead_name?: string
          lead_phone?: string | null
          lead_priority?: string
          lead_source?: string
          lead_stage?: string
          metadata?: Json | null
          notes?: string | null
          registry_entity_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_leads_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_leads_registry_entity_id_fkey"
            columns: ["registry_entity_id"]
            isOneToOne: false
            referencedRelation: "registry_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      social_proof_events: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_events: {
        Row: {
          created_at: string
          event_type: string
          from_plan_id: string | null
          id: string
          metadata: Json | null
          subscription_id: string | null
          to_plan_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          from_plan_id?: string | null
          id?: string
          metadata?: Json | null
          subscription_id?: string | null
          to_plan_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          from_plan_id?: string | null
          id?: string
          metadata?: Json | null
          subscription_id?: string | null
          to_plan_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_events_from_plan_id_fkey"
            columns: ["from_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_events_to_plan_id_fkey"
            columns: ["to_plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          annual_discount_pct: number
          billing_interval: Database["public"]["Enums"]["billing_interval"]
          created_at: string
          description: string
          features: Json
          id: string
          limits: Json
          name: string
          price_amount: number
          price_currency: string
          razorpay_plan_id: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["plan_status"]
          target_role: string
          tier: string
          trial_days: number
          updated_at: string
        }
        Insert: {
          annual_discount_pct?: number
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          created_at?: string
          description?: string
          features?: Json
          id?: string
          limits?: Json
          name: string
          price_amount?: number
          price_currency?: string
          razorpay_plan_id?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["plan_status"]
          target_role: string
          tier: string
          trial_days?: number
          updated_at?: string
        }
        Update: {
          annual_discount_pct?: number
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          created_at?: string
          description?: string
          features?: Json
          id?: string
          limits?: Json
          name?: string
          price_amount?: number
          price_currency?: string
          razorpay_plan_id?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["plan_status"]
          target_role?: string
          tier?: string
          trial_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      survey_options: {
        Row: {
          id: string
          option_text: string
          position: number
          question_id: string
        }
        Insert: {
          id?: string
          option_text: string
          position?: number
          question_id: string
        }
        Update: {
          id?: string
          option_text?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string
          id: string
          position: number
          post_id: string
          question_text: string
          question_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          post_id: string
          question_text: string
          question_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          post_id?: string
          question_text?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          created_at: string
          id: string
          option_id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "survey_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          is_admin_reply: boolean
          ticket_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          ticket_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          is_pinned: boolean
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          is_pinned?: boolean
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          is_pinned?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_count: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_count?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_count?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          sub_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          sub_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          sub_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          email_notifications: boolean
          id: string
          notify_comments: boolean
          notify_connections: boolean
          notify_follows: boolean
          notify_likes: boolean
          notify_messages: boolean
          profile_visibility: string
          show_email: boolean
          show_phone: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          email_notifications?: boolean
          id?: string
          notify_comments?: boolean
          notify_connections?: boolean
          notify_follows?: boolean
          notify_likes?: boolean
          notify_messages?: boolean
          profile_visibility?: string
          show_email?: boolean
          show_phone?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          email_notifications?: boolean
          id?: string
          notify_comments?: boolean
          notify_connections?: boolean
          notify_follows?: boolean
          notify_likes?: boolean
          notify_messages?: boolean
          profile_visibility?: string
          show_email?: boolean
          show_phone?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_interval: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end: boolean
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          metadata: Json | null
          plan_id: string
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          trial_starts_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_interval?: Database["public"]["Enums"]["billing_interval"]
          cancel_at_period_end?: boolean
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          trial_starts_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_xp: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_active_date: string | null
          last_post_date: string | null
          level: number
          longest_streak: number
          post_streak: number
          streak_multiplier: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          last_post_date?: string | null
          level?: number
          longest_streak?: number
          post_streak?: number
          streak_multiplier?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          last_post_date?: string | null
          level?: number
          longest_streak?: number
          post_streak?: number
          streak_multiplier?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_files: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_shared: boolean
          public_url: string | null
          share_token: string | null
          source: string
          source_ref: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number
          file_type: string
          id?: string
          is_shared?: boolean
          public_url?: string | null
          share_token?: string | null
          source?: string
          source_ref?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_shared?: boolean
          public_url?: string | null
          share_token?: string | null
          source?: string
          source_ref?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          document_name: string
          document_type: string | null
          document_url: string
          id: string
          notes: string | null
          registration_number: string | null
          regulator: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          document_name: string
          document_type?: string | null
          document_url: string
          id?: string
          notes?: string | null
          registration_number?: string | null
          regulator?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          document_name?: string
          document_type?: string | null
          document_url?: string
          id?: string
          notes?: string | null
          registration_number?: string | null
          regulator?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          action_type: string
          created_at: string
          description: string
          ends_at: string
          id: string
          is_active: boolean
          starts_at: string
          target_count: number
          title: string
          xp_reward: number
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string
          ends_at: string
          id?: string
          is_active?: boolean
          starts_at?: string
          target_count?: number
          title: string
          xp_reward?: number
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          starts_at?: string
          target_count?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      work_experiences: {
        Row: {
          company: string
          company_logo_url: string | null
          created_at: string
          description: string | null
          employment_type: string | null
          end_date: string | null
          id: string
          is_current: boolean
          location: string | null
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          company_logo_url?: string | null
          created_at?: string
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          start_date: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          company_logo_url?: string | null
          created_at?: string
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          action: string
          created_at: string
          id: string
          multiplier: number
          source_id: string | null
          source_type: string | null
          user_id: string
          xp_amount: number
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          multiplier?: number
          source_id?: string | null
          source_type?: string | null
          user_id: string
          xp_amount: number
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          multiplier?: number
          source_id?: string | null
          source_type?: string | null
          user_id?: string
          xp_amount?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: {
          p_action: string
          p_source_id?: string
          p_source_type?: string
          p_user_id: string
          p_xp_amount: number
        }
        Returns: number
      }
      check_rate_limit: {
        Args: {
          p_action: string
          p_max_count: number
          p_table: string
          p_user_id: string
          p_window_minutes: number
        }
        Returns: boolean
      }
      cleanup_old_intent_signals: { Args: never; Returns: undefined }
      cleanup_stale_data: { Args: never; Returns: Json }
      cleanup_stale_sessions: { Args: never; Returns: undefined }
      compute_trustcircle_iq: {
        Args: { p_limit?: number; p_viewer_id: string }
        Returns: {
          activity_resonance: number
          affinity_score: number
          circle_tier: number
          freshness_decay: number
          intent_multiplier: number
          referral_boost: number
          referral_source: string
          role_weight: number
          target_id: string
          trust_proximity: number
        }[]
      }
      compute_user_activity_status: {
        Args: { p_user_id: string }
        Returns: Json
      }
      create_notification: {
        Args: {
          p_actor_id: string
          p_message: string
          p_reference_id: string
          p_reference_type: string
          p_type: string
          p_user_id: string
        }
        Returns: undefined
      }
      date_of: { Args: { ts: string }; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enforce_session_limit: {
        Args: { p_max_sessions?: number; p_user_id: string }
        Returns: {
          session_token: string
        }[]
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_admin_module_stats: { Args: never; Returns: Json }
      get_conversations: { Args: { p_user_id: string }; Returns: Json }
      get_feed_posts: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_growth_metrics: { Args: { p_days?: number }; Returns: Json }
      get_leaderboard: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: Json
      }
      get_seed_user_ids: { Args: never; Returns: string[] }
      get_staff_permissions: { Args: { _user_id: string }; Returns: string[] }
      get_user_plan_tier: { Args: { p_user_id: string }; Returns: string }
      get_users_activity_status: {
        Args: { p_user_ids: string[] }
        Returns: {
          days_inactive: number
          last_active_at: string
          status: string
          user_id: string
        }[]
      }
      grant_moderator_defaults: {
        Args: { _granted_by: string; _user_id: string }
        Returns: undefined
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_plan_tier: {
        Args: { p_tier: string; p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_seed_user: { Args: { p_user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      resolve_flair_from_level: {
        Args: { p_level: number }
        Returns: {
          avatar_border: string
          name_effect: string
          profile_theme: string
        }[]
      }
      track_challenge_progress: {
        Args: { p_action: string; p_user_id: string }
        Returns: undefined
      }
      update_login_streak: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "issuer" | "intermediary" | "investor" | "admin"
      application_status:
        | "submitted"
        | "viewed"
        | "shortlisted"
        | "interviewing"
        | "offered"
        | "hired"
        | "rejected"
        | "withdrawn"
      billing_interval: "monthly" | "annual"
      blog_post_type: "article" | "survey" | "poll" | "bulletin"
      connection_status: "pending" | "accepted" | "rejected"
      connection_type: "follow" | "connect"
      event_category:
        | "webinar"
        | "investor_meet"
        | "agm_egm"
        | "nfo_ipo_launch"
        | "earnings_call"
        | "regulatory_update"
        | "training_certification"
        | "industry_conference"
        | "other"
      event_mode: "virtual" | "physical" | "hybrid"
      event_status: "draft" | "published" | "cancelled" | "completed"
      job_category:
        | "fund_management"
        | "research_analysis"
        | "compliance_legal"
        | "risk_management"
        | "distribution_sales"
        | "wealth_advisory"
        | "relationship_management"
        | "operations"
        | "fintech"
        | "data_analytics"
        | "corporate_finance"
        | "treasury"
        | "insurance"
        | "banking"
        | "other"
      job_status: "draft" | "active" | "paused" | "closed" | "expired"
      job_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "internship"
        | "freelance"
      listing_status: "draft" | "active" | "paused" | "archived"
      listing_type: "product" | "service"
      message_category:
        | "general"
        | "sales"
        | "ops"
        | "accounts"
        | "support"
        | "complaint"
      opinion_category:
        | "rbi_monetary_policy"
        | "markets_indices"
        | "regulatory_sebi"
        | "insurance_irdai"
        | "mutual_funds_amfi"
        | "banking_nbfc"
        | "macro_india"
        | "global_impact"
      opinion_format: "binary" | "multiple_choice" | "scale" | "over_under"
      opinion_status: "draft" | "active" | "closed" | "archived"
      payment_status:
        | "created"
        | "authorized"
        | "captured"
        | "failed"
        | "refunded"
        | "partially_refunded"
      plan_status: "active" | "archived" | "draft"
      post_kind: "normal" | "poll" | "survey"
      post_type:
        | "text"
        | "market_commentary"
        | "research_note"
        | "announcement"
        | "article"
        | "requirement"
        | "expert_find"
        | "query"
      post_visibility:
        | "public"
        | "network"
        | "following"
        | "followers"
        | "connections"
        | "private"
      product_category:
        | "mutual_fund"
        | "insurance"
        | "pms"
        | "aif"
        | "bonds"
        | "fixed_deposit"
        | "nps"
        | "ipo_nfo"
        | "other_product"
      query_category: "expert_find" | "requirement"
      registration_status:
        | "registered"
        | "waitlisted"
        | "cancelled"
        | "attended"
      service_category:
        | "advisory"
        | "compliance"
        | "auditing"
        | "tax_planning"
        | "wealth_management"
        | "portfolio_management"
        | "financial_planning"
        | "legal"
        | "other_service"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "cancelled"
        | "expired"
        | "paused"
      user_type: "individual" | "entity"
      verification_status: "unverified" | "pending" | "verified"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["issuer", "intermediary", "investor", "admin"],
      application_status: [
        "submitted",
        "viewed",
        "shortlisted",
        "interviewing",
        "offered",
        "hired",
        "rejected",
        "withdrawn",
      ],
      billing_interval: ["monthly", "annual"],
      blog_post_type: ["article", "survey", "poll", "bulletin"],
      connection_status: ["pending", "accepted", "rejected"],
      connection_type: ["follow", "connect"],
      event_category: [
        "webinar",
        "investor_meet",
        "agm_egm",
        "nfo_ipo_launch",
        "earnings_call",
        "regulatory_update",
        "training_certification",
        "industry_conference",
        "other",
      ],
      event_mode: ["virtual", "physical", "hybrid"],
      event_status: ["draft", "published", "cancelled", "completed"],
      job_category: [
        "fund_management",
        "research_analysis",
        "compliance_legal",
        "risk_management",
        "distribution_sales",
        "wealth_advisory",
        "relationship_management",
        "operations",
        "fintech",
        "data_analytics",
        "corporate_finance",
        "treasury",
        "insurance",
        "banking",
        "other",
      ],
      job_status: ["draft", "active", "paused", "closed", "expired"],
      job_type: [
        "full_time",
        "part_time",
        "contract",
        "internship",
        "freelance",
      ],
      listing_status: ["draft", "active", "paused", "archived"],
      listing_type: ["product", "service"],
      message_category: [
        "general",
        "sales",
        "ops",
        "accounts",
        "support",
        "complaint",
      ],
      opinion_category: [
        "rbi_monetary_policy",
        "markets_indices",
        "regulatory_sebi",
        "insurance_irdai",
        "mutual_funds_amfi",
        "banking_nbfc",
        "macro_india",
        "global_impact",
      ],
      opinion_format: ["binary", "multiple_choice", "scale", "over_under"],
      opinion_status: ["draft", "active", "closed", "archived"],
      payment_status: [
        "created",
        "authorized",
        "captured",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      plan_status: ["active", "archived", "draft"],
      post_kind: ["normal", "poll", "survey"],
      post_type: [
        "text",
        "market_commentary",
        "research_note",
        "announcement",
        "article",
        "requirement",
        "expert_find",
        "query",
      ],
      post_visibility: [
        "public",
        "network",
        "following",
        "followers",
        "connections",
        "private",
      ],
      product_category: [
        "mutual_fund",
        "insurance",
        "pms",
        "aif",
        "bonds",
        "fixed_deposit",
        "nps",
        "ipo_nfo",
        "other_product",
      ],
      query_category: ["expert_find", "requirement"],
      registration_status: [
        "registered",
        "waitlisted",
        "cancelled",
        "attended",
      ],
      service_category: [
        "advisory",
        "compliance",
        "auditing",
        "tax_planning",
        "wealth_management",
        "portfolio_management",
        "financial_planning",
        "legal",
        "other_service",
      ],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "cancelled",
        "expired",
        "paused",
      ],
      user_type: ["individual", "entity"],
      verification_status: ["unverified", "pending", "verified"],
    },
  },
} as const
