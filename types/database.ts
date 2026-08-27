export type Plan = "free" | "pro";

export type ContentType =
  | "social_caption"
  | "blog_outline"
  | "tweet_thread"
  | "linkedin_post"
  | "product_description"
  | "email_subject_lines"
  | "video_script"
  | "image_caption";

export type Tone = "professional" | "casual" | "funny" | "bold" | "inspirational";

export interface UserRow {
  id: string;
  email: string;
  plan: Plan;
  created_at: string;
}

export interface GenerationRow {
  id: string;
  user_id: string;
  batch_id: string;
  variation_index: number;
  content_type: ContentType;
  tone: Tone;
  topic_input: string;
  output_text: string;
  created_at: string;
}

// A single generate call's worth of variations, grouped client-side.
export interface GenerationBatch {
  batch_id: string;
  content_type: ContentType;
  tone: Tone;
  topic_input: string;
  created_at: string;
  variations: GenerationRow[];
}

export interface TemplateRow {
  id: string;
  user_id: string;
  name: string;
  content_type: ContentType;
  tone: Tone;
  topic_input: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Partial<UserRow> & { id: string; email: string };
        Update: Partial<UserRow>;
      };
      generations: {
        Row: GenerationRow;
        Insert: Omit<GenerationRow, "id" | "created_at" | "batch_id" | "variation_index"> & {
          id?: string;
          created_at?: string;
          batch_id?: string;
          variation_index?: number;
        };
        Update: Partial<GenerationRow>;
      };
      templates: {
        Row: TemplateRow;
        Insert: Omit<TemplateRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<TemplateRow>;
      };
    };
  };
}
