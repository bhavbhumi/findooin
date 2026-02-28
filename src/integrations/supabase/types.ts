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
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string | null
          reason: string
          reported_user_id: string | null
          reporter_id: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      cleanup_stale_sessions: { Args: never; Returns: undefined }
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
      enforce_session_limit: {
        Args: { p_max_sessions?: number; p_user_id: string }
        Returns: {
          session_token: string
        }[]
      }
      get_conversations: { Args: { p_user_id: string }; Returns: Json }
      get_feed_posts: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
      user_type: ["individual", "entity"],
      verification_status: ["unverified", "pending", "verified"],
    },
  },
} as const
