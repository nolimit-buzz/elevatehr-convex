export interface CalendlyEvent {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number;
  kind: string;
  pooling_type: string;
  type: string;
  color: string;
  created_at: string;
  updated_at: string;
  start_time: string;
  end_time: string;
  status: string;
  internal_note?: string;
  description_plain: string;
  description_html: string;
  profile: {
    type: string;
    name: string;
    owner: string;
    owner_type: string;
  };
  secret?: boolean;
  custom_questions?: Array<{
    name: string;
    type: string;
    position: number;
    enabled: boolean;
    required: boolean;
    answer_choices?: string[];
    include_other?: boolean;
  }>;
  event_type_memberships?: Array<{
    user: string;
    role: string;
  }>;
  event_guests?: Array<{
    email: string;
    created_at: string;
  }>;
  location: {
    type: string;
    location: string;
  };
  invitees_counter: {
    active: number;
    limit: number;
  };
} 