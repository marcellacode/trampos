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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      application_usage: {
        Row: {
          applications_count: number
          applications_limit: number
          created_at: string
          id: string
          period_end: string
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applications_count?: number
          applications_limit?: number
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applications_count?: number
          applications_limit?: number
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          context: Database["public"]["Enums"]["chat_context"]
          created_at: string
          id: string
          job_id: string | null
          role: Database["public"]["Enums"]["chat_role"]
          user_id: string
        }
        Insert: {
          content: string
          context?: Database["public"]["Enums"]["chat_context"]
          created_at?: string
          id?: string
          job_id?: string | null
          role: Database["public"]["Enums"]["chat_role"]
          user_id: string
        }
        Update: {
          content?: string
          context?: Database["public"]["Enums"]["chat_context"]
          created_at?: string
          id?: string
          job_id?: string | null
          role?: Database["public"]["Enums"]["chat_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_read_state: {
        Row: {
          context: Database["public"]["Enums"]["chat_context"]
          last_read_at: string
          user_id: string
        }
        Insert: {
          context: Database["public"]["Enums"]["chat_context"]
          last_read_at?: string
          user_id: string
        }
        Update: {
          context?: Database["public"]["Enums"]["chat_context"]
          last_read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_read_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          brand_color: string
          created_at: string
          employees_label: string
          environment: Database["public"]["Enums"]["company_environment"] | null
          href: string | null
          id: string
          logo: string
          market_years: number | null
          name: string
          rating: number | null
          remote_friendly: boolean
          segment: string
          slug: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          brand_color?: string
          created_at?: string
          employees_label?: string
          environment?:
            | Database["public"]["Enums"]["company_environment"]
            | null
          href?: string | null
          id?: string
          logo?: string
          market_years?: number | null
          name: string
          rating?: number | null
          remote_friendly?: boolean
          segment?: string
          slug: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          brand_color?: string
          created_at?: string
          employees_label?: string
          environment?:
            | Database["public"]["Enums"]["company_environment"]
            | null
          href?: string | null
          id?: string
          logo?: string
          market_years?: number | null
          name?: string
          rating?: number | null
          remote_friendly?: boolean
          segment?: string
          slug?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      company_benefits: {
        Row: {
          benefit: string
          company_id: string
          sort_order: number
        }
        Insert: {
          benefit: string
          company_id: string
          sort_order?: number
        }
        Update: {
          benefit?: string
          company_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "company_benefits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_missions: {
        Row: {
          completed_at: string | null
          created_at: string
          href: string
          icon_name: string
          id: string
          is_completed: boolean
          label: string
          mission_date: string
          uplift_percent: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          href?: string
          icon_name?: string
          id?: string
          is_completed?: boolean
          label: string
          mission_date?: string
          uplift_percent?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          href?: string
          icon_name?: string
          id?: string
          is_completed?: boolean
          label?: string
          mission_date?: string
          uplift_percent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_missions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_ai_suggestions: {
        Row: {
          color_token: string
          created_at: string
          description: string
          href: string
          icon_name: string
          id: string
          impact_label: string
          is_dismissed: boolean
          sort_order: number
          title: string
          user_id: string
        }
        Insert: {
          color_token?: string
          created_at?: string
          description?: string
          href?: string
          icon_name?: string
          id?: string
          impact_label?: string
          is_dismissed?: boolean
          sort_order?: number
          title: string
          user_id: string
        }
        Update: {
          color_token?: string
          created_at?: string
          description?: string
          href?: string
          icon_name?: string
          id?: string
          impact_label?: string
          is_dismissed?: boolean
          sort_order?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_ai_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_recommendations: {
        Row: {
          company_name: string
          created_at: string
          cta_primary: string
          cta_secondary: string
          description: string
          duration_label: string
          href: string
          id: string
          is_active: boolean
          job_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string
          created_at?: string
          cta_primary?: string
          cta_secondary?: string
          description?: string
          duration_label?: string
          href?: string
          id?: string
          is_active?: boolean
          job_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          cta_primary?: string
          cta_secondary?: string
          description?: string
          duration_label?: string
          href?: string
          id?: string
          is_active?: boolean
          job_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_recommendations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dashboard_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_summaries: {
        Row: {
          analyzed: number
          compatible: number
          computed_at: string
          perfect: number
          user_id: string
          very_compatible: number
        }
        Insert: {
          analyzed?: number
          compatible?: number
          computed_at?: string
          perfect?: number
          user_id: string
          very_compatible?: number
        }
        Update: {
          analyzed?: number
          compatible?: number
          computed_at?: string
          perfect?: number
          user_id?: string
          very_compatible?: number
        }
        Relationships: [
          {
            foreignKeyName: "discovery_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_compatibility_scores: {
        Row: {
          dna_id: string
          id: string
          label: string
          score: number
          sort_order: number
        }
        Insert: {
          dna_id: string
          id?: string
          label: string
          score: number
          sort_order?: number
        }
        Update: {
          dna_id?: string
          id?: string
          label?: string
          score?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "dna_compatibility_scores_dna_id_fkey"
            columns: ["dna_id"]
            isOneToOne: false
            referencedRelation: "professional_dna"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_salary_ranges: {
        Row: {
          currency: Database["public"]["Enums"]["currency_code"]
          display_label: string
          dna_id: string
          id: string
          max_amount: number | null
          min_amount: number
          range_kind: Database["public"]["Enums"]["salary_range_kind"]
        }
        Insert: {
          currency: Database["public"]["Enums"]["currency_code"]
          display_label?: string
          dna_id: string
          id?: string
          max_amount?: number | null
          min_amount: number
          range_kind: Database["public"]["Enums"]["salary_range_kind"]
        }
        Update: {
          currency?: Database["public"]["Enums"]["currency_code"]
          display_label?: string
          dna_id?: string
          id?: string
          max_amount?: number | null
          min_amount?: number
          range_kind?: Database["public"]["Enums"]["salary_range_kind"]
        }
        Relationships: [
          {
            foreignKeyName: "dna_salary_ranges_dna_id_fkey"
            columns: ["dna_id"]
            isOneToOne: false
            referencedRelation: "professional_dna"
            referencedColumns: ["id"]
          },
        ]
      }
      dna_strengths: {
        Row: {
          dna_id: string
          sort_order: number
          strength: string
        }
        Insert: {
          dna_id: string
          sort_order?: number
          strength: string
        }
        Update: {
          dna_id?: string
          sort_order?: number
          strength?: string
        }
        Relationships: [
          {
            foreignKeyName: "dna_strengths_dna_id_fkey"
            columns: ["dna_id"]
            isOneToOne: false
            referencedRelation: "professional_dna"
            referencedColumns: ["id"]
          },
        ]
      }
      employability_overviews: {
        Row: {
          goal_score: number
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          goal_score?: number
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          goal_score?: number
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employability_overviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employability_skills: {
        Row: {
          explanation: string
          id: string
          label: string
          market_context: string | null
          score: number
          sort_order: number
          updated_at: string
          uplift_percent: number
          user_id: string
        }
        Insert: {
          explanation?: string
          id?: string
          label: string
          market_context?: string | null
          score?: number
          sort_order?: number
          updated_at?: string
          uplift_percent?: number
          user_id: string
        }
        Update: {
          explanation?: string
          id?: string
          label?: string
          market_context?: string | null
          score?: number
          sort_order?: number
          updated_at?: string
          uplift_percent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employability_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      external_jobs: {
        Row: {
          apply_url: string | null
          company_name: string
          created_at: string
          description: string
          external_key: string
          fetched_at: string
          id: string
          location: string
          provider: string
          raw_payload: Json | null
          remote: boolean
          salary_max: number | null
          salary_min: number | null
          stack: Json
          title: string
          updated_at: string
        }
        Insert: {
          apply_url?: string | null
          company_name?: string
          created_at?: string
          description?: string
          external_key: string
          fetched_at?: string
          id?: string
          location?: string
          provider?: string
          raw_payload?: Json | null
          remote?: boolean
          salary_max?: number | null
          salary_min?: number | null
          stack?: Json
          title: string
          updated_at?: string
        }
        Update: {
          apply_url?: string | null
          company_name?: string
          created_at?: string
          description?: string
          external_key?: string
          fetched_at?: string
          id?: string
          location?: string
          provider?: string
          raw_payload?: Json | null
          remote?: boolean
          salary_max?: number | null
          salary_min?: number | null
          stack?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      goal_chips: {
        Row: {
          category: Database["public"]["Enums"]["goal_chip_category"]
          created_at: string
          id: string
          label: string
          sort_order: number
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["goal_chip_category"]
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["goal_chip_category"]
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_chips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          company_name: string
          created_at: string
          external_job_id: string | null
          feedback_summary: string
          id: string
          job_id: string | null
          messages: Json
          questions: Json
          role_title: string
          score: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name?: string
          created_at?: string
          external_job_id?: string | null
          feedback_summary?: string
          id?: string
          job_id?: string | null
          messages?: Json
          questions?: Json
          role_title?: string
          score?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          external_job_id?: string | null
          feedback_summary?: string
          id?: string
          job_id?: string | null
          messages?: Json
          questions?: Json
          role_title?: string
          score?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_sessions_external_job_id_fkey"
            columns: ["external_job_id"]
            isOneToOne: false
            referencedRelation: "external_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_ai_summary_reasons: {
        Row: {
          job_id: string
          reason: string
          sort_order: number
        }
        Insert: {
          job_id: string
          reason: string
          sort_order?: number
        }
        Update: {
          job_id?: string
          reason?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_ai_summary_reasons_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applied_at: string | null
          ats_provider: string | null
          company_id: string
          cover_letter_text: string | null
          created_at: string
          external_apply_url: string | null
          external_job_id: string | null
          id: string
          job_id: string | null
          last_activity_at: string
          role_title: string
          source: string
          status: Database["public"]["Enums"]["application_status"]
          status_label: string
          submission_error: string | null
          submission_status: string
          tailored_resume_text: string | null
          updated_at: string
          user_confirmed_at: string | null
          user_consent_at: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          ats_provider?: string | null
          company_id: string
          cover_letter_text?: string | null
          created_at?: string
          external_apply_url?: string | null
          external_job_id?: string | null
          id?: string
          job_id?: string | null
          last_activity_at?: string
          role_title: string
          source?: string
          status?: Database["public"]["Enums"]["application_status"]
          status_label?: string
          submission_error?: string | null
          submission_status?: string
          tailored_resume_text?: string | null
          updated_at?: string
          user_confirmed_at?: string | null
          user_consent_at?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          ats_provider?: string | null
          company_id?: string
          cover_letter_text?: string | null
          created_at?: string
          external_apply_url?: string | null
          external_job_id?: string | null
          id?: string
          job_id?: string | null
          last_activity_at?: string
          role_title?: string
          source?: string
          status?: Database["public"]["Enums"]["application_status"]
          status_label?: string
          submission_error?: string | null
          submission_status?: string
          tailored_resume_text?: string | null
          updated_at?: string
          user_confirmed_at?: string | null
          user_consent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_external_job_id_fkey"
            columns: ["external_job_id"]
            isOneToOne: false
            referencedRelation: "external_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_benefits: {
        Row: {
          benefit: string
          job_id: string
          sort_order: number
        }
        Insert: {
          benefit: string
          job_id: string
          sort_order?: number
        }
        Update: {
          benefit?: string
          job_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_benefits_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_culture_indicators: {
        Row: {
          description: string
          id: string
          job_id: string
          label: string
          score: number
          sort_order: number
        }
        Insert: {
          description?: string
          id?: string
          job_id: string
          label: string
          score: number
          sort_order?: number
        }
        Update: {
          description?: string
          id?: string
          job_id?: string
          label?: string
          score?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_culture_indicators_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_faqs: {
        Row: {
          answer: string
          id: string
          job_id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer?: string
          id?: string
          job_id: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          id?: string
          job_id?: string
          question?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_faqs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_hiring_stages: {
        Row: {
          avg_days: number
          id: string
          job_id: string
          label: string
          sort_order: number
        }
        Insert: {
          avg_days?: number
          id?: string
          job_id: string
          label: string
          sort_order?: number
        }
        Update: {
          avg_days?: number
          id?: string
          job_id?: string
          label?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_hiring_stages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_interview_questions: {
        Row: {
          id: string
          job_id: string
          question: string
          sort_order: number
          tech: string
        }
        Insert: {
          id?: string
          job_id: string
          question: string
          sort_order?: number
          tech?: string
        }
        Update: {
          id?: string
          job_id?: string
          question?: string
          sort_order?: number
          tech?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_interview_questions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_apply_checklist: {
        Row: {
          id: string
          label: string
          match_id: string
          sort_order: number
          status: Database["public"]["Enums"]["apply_checklist_status"]
        }
        Insert: {
          id?: string
          label: string
          match_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["apply_checklist_status"]
        }
        Update: {
          id?: string
          label?: string
          match_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["apply_checklist_status"]
        }
        Relationships: [
          {
            foreignKeyName: "job_match_apply_checklist_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_approval_reasons: {
        Row: {
          match_id: string
          reason: string
          sort_order: number
        }
        Insert: {
          match_id: string
          reason: string
          sort_order?: number
        }
        Update: {
          match_id?: string
          reason?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_match_approval_reasons_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_career_impact_roles: {
        Row: {
          id: string
          match_id: string
          role_title: string
          sort_order: number
          uplift_percent: number
        }
        Insert: {
          id?: string
          match_id: string
          role_title: string
          sort_order?: number
          uplift_percent?: number
        }
        Update: {
          id?: string
          match_id?: string
          role_title?: string
          sort_order?: number
          uplift_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_match_career_impact_roles_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_comparison_items: {
        Row: {
          benefits_rating: number
          compared_job_id: string
          compatibility: number
          id: string
          match_id: string
          process_steps: number
          remote_label: string
          salary_display: string
          sort_order: number
        }
        Insert: {
          benefits_rating?: number
          compared_job_id: string
          compatibility: number
          id?: string
          match_id: string
          process_steps?: number
          remote_label?: string
          salary_display?: string
          sort_order?: number
        }
        Update: {
          benefits_rating?: number
          compared_job_id?: string
          compatibility?: number
          id?: string
          match_id?: string
          process_steps?: number
          remote_label?: string
          salary_display?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_match_comparison_items_compared_job_id_fkey"
            columns: ["compared_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_match_comparison_items_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_github_projects: {
        Row: {
          description: string
          id: string
          match_id: string
          name: string
          relevance: string
          sort_order: number
        }
        Insert: {
          description?: string
          id?: string
          match_id: string
          name: string
          relevance?: string
          sort_order?: number
        }
        Update: {
          description?: string
          id?: string
          match_id?: string
          name?: string
          relevance?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_match_github_projects_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_portfolio_projects: {
        Row: {
          description: string
          id: string
          is_highlight: boolean
          match_id: string
          name: string
          sort_order: number
        }
        Insert: {
          description?: string
          id?: string
          is_highlight?: boolean
          match_id: string
          name: string
          sort_order?: number
        }
        Update: {
          description?: string
          id?: string
          is_highlight?: boolean
          match_id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_match_portfolio_projects_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_reasons: {
        Row: {
          id: string
          match_id: string
          reason_type: Database["public"]["Enums"]["match_reason_type"]
          sort_order: number
          text: string
        }
        Insert: {
          id?: string
          match_id: string
          reason_type?: Database["public"]["Enums"]["match_reason_type"]
          sort_order?: number
          text: string
        }
        Update: {
          id?: string
          match_id?: string
          reason_type?: Database["public"]["Enums"]["match_reason_type"]
          sort_order?: number
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_match_reasons_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_resume_suggestions: {
        Row: {
          id: string
          match_id: string
          sort_order: number
          suggestion_type: Database["public"]["Enums"]["resume_suggestion_type"]
          text: string
        }
        Insert: {
          id?: string
          match_id: string
          sort_order?: number
          suggestion_type: Database["public"]["Enums"]["resume_suggestion_type"]
          text: string
        }
        Update: {
          id?: string
          match_id?: string
          sort_order?: number
          suggestion_type?: Database["public"]["Enums"]["resume_suggestion_type"]
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_match_resume_suggestions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_simulation_stages: {
        Row: {
          id: string
          label: string
          match_id: string
          sort_order: number
          status: Database["public"]["Enums"]["simulation_stage_status"]
        }
        Insert: {
          id?: string
          label: string
          match_id: string
          sort_order?: number
          status?: Database["public"]["Enums"]["simulation_stage_status"]
        }
        Update: {
          id?: string
          label?: string
          match_id?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["simulation_stage_status"]
        }
        Relationships: [
          {
            foreignKeyName: "job_match_simulation_stages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_study_topics: {
        Row: {
          id: string
          match_id: string
          priority: number
          sort_order: number
          title: string
        }
        Insert: {
          id?: string
          match_id: string
          priority?: number
          sort_order?: number
          title: string
        }
        Update: {
          id?: string
          match_id?: string
          priority?: number
          sort_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_match_study_topics_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_tech_comparisons: {
        Row: {
          id: string
          match_id: string
          required_level: Database["public"]["Enums"]["tech_level"]
          sort_order: number
          tech_name: string
          user_level: Database["public"]["Enums"]["tech_level"]
          weight: number
        }
        Insert: {
          id?: string
          match_id: string
          required_level: Database["public"]["Enums"]["tech_level"]
          sort_order?: number
          tech_name: string
          user_level: Database["public"]["Enums"]["tech_level"]
          weight?: number
        }
        Update: {
          id?: string
          match_id?: string
          required_level?: Database["public"]["Enums"]["tech_level"]
          sort_order?: number
          tech_name?: string
          user_level?: Database["public"]["Enums"]["tech_level"]
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_match_tech_comparisons_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_match_weight_factors: {
        Row: {
          label: string
          match_id: string
          sort_order: number
          weight: number
        }
        Insert: {
          label: string
          match_id: string
          sort_order?: number
          weight: number
        }
        Update: {
          label?: string
          match_id?: string
          sort_order?: number
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_match_weight_factors_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "job_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      job_matches: {
        Row: {
          approval_level: Database["public"]["Enums"]["approval_level"]
          approval_stars: number
          approval_suggestion: string
          best_send_day_label: string
          best_send_insight: string
          best_send_time_range: string
          career_impact_explanation: string
          comparison_ai_conclusion: string
          comparison_recommended_job_id: string | null
          compatibility: number
          created_at: string
          generated_at: string
          id: string
          job_id: string
          salary_insight: string
          salary_job_max: number | null
          salary_job_min: number | null
          salary_market_max: number | null
          salary_market_min: number | null
          salary_user_expectation: number | null
          updated_at: string
          user_id: string
          why_match_summary: string
        }
        Insert: {
          approval_level?: Database["public"]["Enums"]["approval_level"]
          approval_stars?: number
          approval_suggestion?: string
          best_send_day_label?: string
          best_send_insight?: string
          best_send_time_range?: string
          career_impact_explanation?: string
          comparison_ai_conclusion?: string
          comparison_recommended_job_id?: string | null
          compatibility: number
          created_at?: string
          generated_at?: string
          id?: string
          job_id: string
          salary_insight?: string
          salary_job_max?: number | null
          salary_job_min?: number | null
          salary_market_max?: number | null
          salary_market_min?: number | null
          salary_user_expectation?: number | null
          updated_at?: string
          user_id: string
          why_match_summary?: string
        }
        Update: {
          approval_level?: Database["public"]["Enums"]["approval_level"]
          approval_stars?: number
          approval_suggestion?: string
          best_send_day_label?: string
          best_send_insight?: string
          best_send_time_range?: string
          career_impact_explanation?: string
          comparison_ai_conclusion?: string
          comparison_recommended_job_id?: string | null
          compatibility?: number
          created_at?: string
          generated_at?: string
          id?: string
          job_id?: string
          salary_insight?: string
          salary_job_max?: number | null
          salary_job_min?: number | null
          salary_market_max?: number | null
          salary_market_min?: number | null
          salary_user_expectation?: number | null
          updated_at?: string
          user_id?: string
          why_match_summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_comparison_recommended_job_id_fkey"
            columns: ["comparison_recommended_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_related: {
        Row: {
          job_id: string
          related_job_id: string
          sort_order: number
        }
        Insert: {
          job_id: string
          related_job_id: string
          sort_order?: number
        }
        Update: {
          job_id?: string
          related_job_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_related_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_related_related_job_id_fkey"
            columns: ["related_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_section_items: {
        Row: {
          content: string
          id: string
          job_id: string
          section_type: Database["public"]["Enums"]["job_section_type"]
          sort_order: number
        }
        Insert: {
          content: string
          id?: string
          job_id: string
          section_type: Database["public"]["Enums"]["job_section_type"]
          sort_order?: number
        }
        Update: {
          content?: string
          id?: string
          job_id?: string
          section_type?: Database["public"]["Enums"]["job_section_type"]
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_section_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_similar_companies: {
        Row: {
          company_id: string
          job_id: string
          sort_order: number
        }
        Insert: {
          company_id: string
          job_id: string
          sort_order?: number
        }
        Update: {
          company_id?: string
          job_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_similar_companies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_similar_companies_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_stack: {
        Row: {
          job_id: string
          sort_order: number
          tech_name: string
        }
        Insert: {
          job_id: string
          sort_order?: number
          tech_name: string
        }
        Update: {
          job_id?: string
          sort_order?: number
          tech_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_stack_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_stats: {
        Row: {
          candidates: number
          job_id: string
          process_days: number
          response_days: number
          steps: number
        }
        Insert: {
          candidates?: number
          job_id: string
          process_days?: number
          response_days?: number
          steps?: number
        }
        Update: {
          candidates?: number
          job_id?: string
          process_days?: number
          response_days?: number
          steps?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_stats_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_team_info: {
        Row: {
          average_tenure_years: number
          is_available: boolean
          job_id: string
          team_name: string
          team_size: number
        }
        Insert: {
          average_tenure_years?: number
          is_available?: boolean
          job_id: string
          team_name?: string
          team_size?: number
        }
        Update: {
          average_tenure_years?: number
          is_available?: boolean
          job_id?: string
          team_name?: string
          team_size?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_team_info_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_team_stack: {
        Row: {
          job_id: string
          sort_order: number
          tech_name: string
        }
        Insert: {
          job_id: string
          sort_order?: number
          tech_name: string
        }
        Update: {
          job_id?: string
          sort_order?: number
          tech_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_team_stack_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_team_info"
            referencedColumns: ["job_id"]
          },
        ]
      }
      jobs: {
        Row: {
          ai_summary: string
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          location: string
          published_at: string | null
          remote: boolean
          salary_currency: Database["public"]["Enums"]["currency_code"]
          salary_display: string
          salary_max: number | null
          salary_min: number | null
          slug: string
          title: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          ai_summary?: string
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string
          published_at?: string | null
          remote?: boolean
          salary_currency?: Database["public"]["Enums"]["currency_code"]
          salary_display?: string
          salary_max?: number | null
          salary_min?: number | null
          slug: string
          title: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          ai_summary?: string
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string
          published_at?: string | null
          remote?: boolean
          salary_currency?: Database["public"]["Enums"]["currency_code"]
          salary_display?: string
          salary_max?: number | null
          salary_min?: number | null
          slug?: string
          title?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_metrics: {
        Row: {
          color_token: string
          delta_label: string | null
          delta_positive: boolean | null
          id: string
          label: string
          metric_key: string
          prefix: string | null
          recorded_at: string
          sparkline: number[]
          suffix: string | null
          user_id: string
          value: number
        }
        Insert: {
          color_token?: string
          delta_label?: string | null
          delta_positive?: boolean | null
          id?: string
          label: string
          metric_key: string
          prefix?: string | null
          recorded_at?: string
          sparkline?: number[]
          suffix?: string | null
          user_id: string
          value?: number
        }
        Update: {
          color_token?: string
          delta_label?: string | null
          delta_positive?: boolean | null
          id?: string
          label?: string
          metric_key?: string
          prefix?: string | null
          recorded_at?: string
          sparkline?: number[]
          suffix?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_insights: {
        Row: {
          change_percent: number
          id: string
          recorded_at: string
          region_code: string
          tech_name: string
        }
        Insert: {
          change_percent?: number
          id?: string
          recorded_at?: string
          region_code?: string
          tech_name: string
        }
        Update: {
          change_percent?: number
          id?: string
          recorded_at?: string
          region_code?: string
          tech_name?: string
        }
        Relationships: []
      }
      market_trends: {
        Row: {
          change_percent: number
          demand_score: number
          id: string
          recorded_at: string
          region_code: string
          tech_name: string
        }
        Insert: {
          change_percent?: number
          demand_score?: number
          id?: string
          recorded_at?: string
          region_code?: string
          tech_name: string
        }
        Update: {
          change_percent?: number
          demand_score?: number
          id?: string
          recorded_at?: string
          region_code?: string
          tech_name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_label: string
          color_token: string
          created_at: string
          description: string
          href: string
          icon_name: string
          id: string
          is_unread: boolean
          notification_group: Database["public"]["Enums"]["notification_group"]
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_label?: string
          color_token?: string
          created_at?: string
          description?: string
          href?: string
          icon_name?: string
          id?: string
          is_unread?: boolean
          notification_group?: Database["public"]["Enums"]["notification_group"]
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_label?: string
          color_token?: string
          created_at?: string
          description?: string
          href?: string
          icon_name?: string
          id?: string
          is_unread?: boolean
          notification_group?: Database["public"]["Enums"]["notification_group"]
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_connections: {
        Row: {
          access_token_encrypted: string | null
          connected_at: string
          created_at: string
          id: string
          last_synced_at: string | null
          profile_url: string | null
          provider: Database["public"]["Enums"]["auth_provider"]
          provider_user_id: string | null
          refresh_token_encrypted: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token_encrypted?: string | null
          connected_at?: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          profile_url?: string | null
          provider: Database["public"]["Enums"]["auth_provider"]
          provider_user_id?: string | null
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token_encrypted?: string | null
          connected_at?: string
          created_at?: string
          id?: string
          last_synced_at?: string | null
          profile_url?: string | null
          provider?: Database["public"]["Enums"]["auth_provider"]
          provider_user_id?: string | null
          refresh_token_encrypted?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_regions: {
        Row: {
          country_code: string
          country_name: string
          flag_emoji: string
          id: string
          map_x: number
          map_y: number
          opportunity_count: number
          recorded_at: string
          region_code: string
        }
        Insert: {
          country_code: string
          country_name: string
          flag_emoji?: string
          id?: string
          map_x?: number
          map_y?: number
          opportunity_count?: number
          recorded_at?: string
          region_code?: string
        }
        Update: {
          country_code?: string
          country_name?: string
          flag_emoji?: string
          id?: string
          map_x?: number
          map_y?: number
          opportunity_count?: number
          recorded_at?: string
          region_code?: string
        }
        Relationships: []
      }
      professional_dna: {
        Row: {
          created_at: string
          generated_at: string
          id: string
          predominant_profile: string
          updated_at: string
          user_id: string
          with_skills_label: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          id?: string
          predominant_profile: string
          updated_at?: string
          user_id: string
          with_skills_label?: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: string
          predominant_profile?: string
          updated_at?: string
          user_id?: string
          with_skills_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_dna_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_ai_suggestions: {
        Row: {
          action_label: string
          applied_at: string | null
          created_at: string
          description: string
          id: string
          is_applied: boolean
          suggestion_type: Database["public"]["Enums"]["ai_suggestion_type"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_label?: string
          applied_at?: string | null
          created_at?: string
          description?: string
          id?: string
          is_applied?: boolean
          suggestion_type: Database["public"]["Enums"]["ai_suggestion_type"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_label?: string
          applied_at?: string | null
          created_at?: string
          description?: string
          id?: string
          is_applied?: boolean
          suggestion_type?: Database["public"]["Enums"]["ai_suggestion_type"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_ai_suggestions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_certificates: {
        Row: {
          created_at: string
          id: string
          issuer: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
          year_label: string
        }
        Insert: {
          created_at?: string
          id?: string
          issuer?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
          year_label?: string
        }
        Update: {
          created_at?: string
          id?: string
          issuer?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
          year_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_contract_types: {
        Row: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at: string
          user_id: string
        }
        Insert: {
          contract_type: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          user_id: string
        }
        Update: {
          contract_type?: Database["public"]["Enums"]["contract_type"]
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_contract_types_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_experiences: {
        Row: {
          company: string
          created_at: string
          description: string
          ended_at: string | null
          id: string
          is_current: boolean
          period_label: string
          role: string
          sort_order: number
          started_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string
          ended_at?: string | null
          id?: string
          is_current?: boolean
          period_label?: string
          role: string
          sort_order?: number
          started_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string
          ended_at?: string | null
          id?: string
          is_current?: boolean
          period_label?: string
          role?: string
          sort_order?: number
          started_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_languages: {
        Row: {
          created_at: string
          id: string
          level_label: string
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_label?: string
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level_label?: string
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_languages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_project_tech: {
        Row: {
          project_id: string
          sort_order: number
          tech_name: string
        }
        Insert: {
          project_id: string
          sort_order?: number
          tech_name: string
        }
        Update: {
          project_id?: string
          sort_order?: number
          tech_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_project_tech_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "profile_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_projects: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          sort_order: number
          stars: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          name: string
          sort_order?: number
          stars?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          sort_order?: number
          stars?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_skills: {
        Row: {
          created_at: string
          id: string
          level_label: string | null
          skill_name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_label?: string | null
          skill_name: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level_label?: string | null
          skill_name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_work_models: {
        Row: {
          created_at: string
          user_id: string
          work_model: Database["public"]["Enums"]["work_model"]
        }
        Insert: {
          created_at?: string
          user_id: string
          work_model: Database["public"]["Enums"]["work_model"]
        }
        Update: {
          created_at?: string
          user_id?: string
          work_model?: Database["public"]["Enums"]["work_model"]
        }
        Relationships: [
          {
            foreignKeyName: "profile_work_models_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          availability:
            | Database["public"]["Enums"]["availability_option"]
            | null
          avatar_initials: string
          avatar_url: string | null
          copilot_status: Database["public"]["Enums"]["copilot_status"]
          created_at: string
          current_role: string
          email: string
          first_name: string
          full_name: string
          goal_availability_label: string
          goal_location: string
          goal_role: string
          goal_salary: string
          goal_text: string
          id: string
          import_method: Database["public"]["Enums"]["import_method"] | null
          initials: string
          onboarding_completed: boolean
          onboarding_step: Database["public"]["Enums"]["onboarding_step"] | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          seniority: string
          summary: string
          updated_at: string
          uploaded_resume_filename: string | null
        }
        Insert: {
          availability?:
            | Database["public"]["Enums"]["availability_option"]
            | null
          avatar_initials?: string
          avatar_url?: string | null
          copilot_status?: Database["public"]["Enums"]["copilot_status"]
          created_at?: string
          current_role?: string
          email: string
          first_name?: string
          full_name?: string
          goal_availability_label?: string
          goal_location?: string
          goal_role?: string
          goal_salary?: string
          goal_text?: string
          id: string
          import_method?: Database["public"]["Enums"]["import_method"] | null
          initials?: string
          onboarding_completed?: boolean
          onboarding_step?:
            | Database["public"]["Enums"]["onboarding_step"]
            | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          seniority?: string
          summary?: string
          updated_at?: string
          uploaded_resume_filename?: string | null
        }
        Update: {
          availability?:
            | Database["public"]["Enums"]["availability_option"]
            | null
          avatar_initials?: string
          avatar_url?: string | null
          copilot_status?: Database["public"]["Enums"]["copilot_status"]
          created_at?: string
          current_role?: string
          email?: string
          first_name?: string
          full_name?: string
          goal_availability_label?: string
          goal_location?: string
          goal_role?: string
          goal_salary?: string
          goal_text?: string
          id?: string
          import_method?: Database["public"]["Enums"]["import_method"] | null
          initials?: string
          onboarding_completed?: boolean
          onboarding_step?:
            | Database["public"]["Enums"]["onboarding_step"]
            | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          seniority?: string
          summary?: string
          updated_at?: string
          uploaded_resume_filename?: string | null
        }
        Relationships: []
      }
      resume_uploads: {
        Row: {
          created_at: string
          error_message: string | null
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          original_filename: string
          status: Database["public"]["Enums"]["resume_upload_status"]
          storage_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          original_filename: string
          status?: Database["public"]["Enums"]["resume_upload_status"]
          storage_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string
          status?: Database["public"]["Enums"]["resume_upload_status"]
          storage_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_uploads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_market_data: {
        Row: {
          avg_salary: number
          currency: Database["public"]["Enums"]["currency_code"]
          id: string
          max_salary: number
          min_salary: number
          recorded_at: string
          region_code: string
          tech_name: string
        }
        Insert: {
          avg_salary: number
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          max_salary: number
          min_salary: number
          recorded_at?: string
          region_code?: string
          tech_name: string
        }
        Update: {
          avg_salary?: number
          currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          max_salary?: number
          min_salary?: number
          recorded_at?: string
          region_code?: string
          tech_name?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          external_job_id: string | null
          id: string
          job_id: string | null
          saved_at: string
          user_id: string
        }
        Insert: {
          external_job_id?: string | null
          id?: string
          job_id?: string | null
          saved_at?: string
          user_id: string
        }
        Update: {
          external_job_id?: string | null
          id?: string
          job_id?: string | null
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_external_job_id_fkey"
            columns: ["external_job_id"]
            isOneToOne: false
            referencedRelation: "external_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_filters: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          sort_order: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_filters_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string
          company_name: string
          created_at: string
          id: string
          is_published: boolean
          name: string
          quote: string
          role_title: string
          sort_order: number
        }
        Insert: {
          avatar_url?: string
          company_name?: string
          created_at?: string
          id?: string
          is_published?: boolean
          name: string
          quote: string
          role_title?: string
          sort_order?: number
        }
        Update: {
          avatar_url?: string
          company_name?: string
          created_at?: string
          id?: string
          is_published?: boolean
          name?: string
          quote?: string
          role_title?: string
          sort_order?: number
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          actor: Database["public"]["Enums"]["timeline_actor"]
          color_token: string
          company_id: string | null
          created_at: string
          description: string | null
          event_kind: Database["public"]["Enums"]["timeline_event_kind"]
          glow_token: string
          href: string
          icon_name: string
          id: string
          is_live: boolean
          job_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          actor?: Database["public"]["Enums"]["timeline_actor"]
          color_token?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          event_kind: Database["public"]["Enums"]["timeline_event_kind"]
          glow_token?: string
          href?: string
          icon_name?: string
          id?: string
          is_live?: boolean
          job_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          actor?: Database["public"]["Enums"]["timeline_actor"]
          color_token?: string
          company_id?: string | null
          created_at?: string
          description?: string | null
          event_kind?: Database["public"]["Enums"]["timeline_event_kind"]
          glow_token?: string
          href?: string
          icon_name?: string
          id?: string
          is_live?: boolean
          job_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_company_matches: {
        Row: {
          company_id: string
          compatibility: number
          generated_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          compatibility: number
          generated_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          compatibility?: number
          generated_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_company_matches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_company_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_hidden_jobs: {
        Row: {
          external_job_id: string | null
          hidden_at: string
          id: string
          job_id: string | null
          reason: Database["public"]["Enums"]["hide_reason"]
          user_id: string
        }
        Insert: {
          external_job_id?: string | null
          hidden_at?: string
          id?: string
          job_id?: string | null
          reason?: Database["public"]["Enums"]["hide_reason"]
          user_id: string
        }
        Update: {
          external_job_id?: string | null
          hidden_at?: string
          id?: string
          job_id?: string | null
          reason?: Database["public"]["Enums"]["hide_reason"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_hidden_jobs_external_job_id_fkey"
            columns: ["external_job_id"]
            isOneToOne: false
            referencedRelation: "external_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_hidden_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_hidden_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_job_matches: {
        Row: {
          ai_summary: string
          approval_level: Database["public"]["Enums"]["approval_level"]
          approval_stars: number
          best_send_day_label: string
          best_send_time_range: string
          compatibility: number
          computed_at: string
          created_at: string
          external_job_id: string | null
          id: string
          job_id: string | null
          match_reasons: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string
          approval_level?: Database["public"]["Enums"]["approval_level"]
          approval_stars?: number
          best_send_day_label?: string
          best_send_time_range?: string
          compatibility?: number
          computed_at?: string
          created_at?: string
          external_job_id?: string | null
          id?: string
          job_id?: string | null
          match_reasons?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string
          approval_level?: Database["public"]["Enums"]["approval_level"]
          approval_stars?: number
          best_send_day_label?: string
          best_send_time_range?: string
          compatibility?: number
          computed_at?: string
          created_at?: string
          external_job_id?: string | null
          id?: string
          job_id?: string | null
          match_reasons?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_job_matches_external_job_id_fkey"
            columns: ["external_job_id"]
            isOneToOne: false
            referencedRelation: "external_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_job_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_opportunity_regions: {
        Row: {
          computed_at: string
          personalized_count: number
          region_id: string
          user_id: string
        }
        Insert: {
          computed_at?: string
          personalized_count?: number
          region_id: string
          user_id: string
        }
        Update: {
          computed_at?: string
          personalized_count?: number
          region_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_opportunity_regions_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "opportunity_regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_opportunity_regions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_owner: { Args: { target_user_id: string }; Returns: boolean }
    }
    Enums: {
      ai_suggestion_type:
        | "github"
        | "linkedin"
        | "skill"
        | "project"
        | "experience"
      application_status:
        | "interested"
        | "applied"
        | "viewed"
        | "interview"
        | "rejected"
        | "offer"
      apply_checklist_status: "done" | "pending" | "auto"
      approval_level: "baixa" | "media" | "alta"
      auth_provider: "google" | "github" | "linkedin"
      availability_option:
        | "immediate"
        | "15days"
        | "30days"
        | "45days"
        | "other"
      chat_context: "dashboard" | "discovery" | "job_detail" | "assistant"
      chat_role: "assistant" | "user"
      company_environment: "startup" | "scale_up" | "corporativa"
      contract_type: "clt" | "pj" | "freelancer" | "international"
      copilot_status: "active" | "paused"
      currency_code: "BRL" | "USD"
      goal_chip_category:
        | "skill"
        | "role"
        | "location"
        | "salary"
        | "contract"
        | "model"
      hide_reason: "distance" | "salary" | "tech" | "company" | "other"
      import_method: "linkedin" | "github" | "resume" | "scratch"
      job_section_type:
        | "summary"
        | "responsibilities"
        | "requirements"
        | "differentials"
        | "benefits"
      match_reason_type: "match" | "warning"
      notification_group: "today" | "yesterday" | "week"
      onboarding_step:
        | "import"
        | "processing"
        | "summary"
        | "goals"
        | "availability"
        | "profile"
        | "dna"
        | "success"
      resume_suggestion_type: "add" | "move" | "highlight"
      resume_upload_status: "pending" | "processing" | "completed" | "failed"
      salary_range_kind:
        | "current_brazil"
        | "current_international"
        | "with_skills_brazil"
        | "with_skills_international"
      simulation_stage_status: "pass" | "warning" | "fail"
      subscription_plan: "free" | "pro" | "elite"
      tech_level: "basico" | "intermediario" | "avancado"
      timeline_actor: "ai" | "company"
      timeline_event_kind:
        | "job_found"
        | "compatibility"
        | "resume_tailored"
        | "application_sent"
        | "company_viewed"
        | "interview_invite"
      work_model: "onsite" | "hybrid" | "remote" | "any"
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
      ai_suggestion_type: [
        "github",
        "linkedin",
        "skill",
        "project",
        "experience",
      ],
      application_status: [
        "interested",
        "applied",
        "viewed",
        "interview",
        "rejected",
        "offer",
      ],
      apply_checklist_status: ["done", "pending", "auto"],
      approval_level: ["baixa", "media", "alta"],
      auth_provider: ["google", "github", "linkedin"],
      availability_option: ["immediate", "15days", "30days", "45days", "other"],
      chat_context: ["dashboard", "discovery", "job_detail", "assistant"],
      chat_role: ["assistant", "user"],
      company_environment: ["startup", "scale_up", "corporativa"],
      contract_type: ["clt", "pj", "freelancer", "international"],
      copilot_status: ["active", "paused"],
      currency_code: ["BRL", "USD"],
      goal_chip_category: [
        "skill",
        "role",
        "location",
        "salary",
        "contract",
        "model",
      ],
      hide_reason: ["distance", "salary", "tech", "company", "other"],
      import_method: ["linkedin", "github", "resume", "scratch"],
      job_section_type: [
        "summary",
        "responsibilities",
        "requirements",
        "differentials",
        "benefits",
      ],
      match_reason_type: ["match", "warning"],
      notification_group: ["today", "yesterday", "week"],
      onboarding_step: [
        "import",
        "processing",
        "summary",
        "goals",
        "availability",
        "profile",
        "dna",
        "success",
      ],
      resume_suggestion_type: ["add", "move", "highlight"],
      resume_upload_status: ["pending", "processing", "completed", "failed"],
      salary_range_kind: [
        "current_brazil",
        "current_international",
        "with_skills_brazil",
        "with_skills_international",
      ],
      simulation_stage_status: ["pass", "warning", "fail"],
      subscription_plan: ["free", "pro", "elite"],
      tech_level: ["basico", "intermediario", "avancado"],
      timeline_actor: ["ai", "company"],
      timeline_event_kind: [
        "job_found",
        "compatibility",
        "resume_tailored",
        "application_sent",
        "company_viewed",
        "interview_invite",
      ],
      work_model: ["onsite", "hybrid", "remote", "any"],
    },
  },
} as const
