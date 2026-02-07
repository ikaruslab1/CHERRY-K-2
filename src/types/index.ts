export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  type: string;
  image_url?: string;
  speaker_id?: string | null;
  speaker?: {
    first_name: string;
    last_name: string;
    degree?: string;
    gender?: string;
  };
  tags?: string[];
  gives_certificate?: boolean;
  duration_days?: number;
  conference_id: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  short_id: string;
  degree: string;
  role: 'user' | 'staff' | 'admin' | 'ponente' | 'owner' | 'vip';
  email?: string;
  created_at?: string;
  gender?: string;
}

export interface Conference {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  event_type?: string;
  institution_name?: string;
  department_name?: string;
  created_at?: string;
}

export interface Attendance {
  event_id: string;
  user_id: string;
  created_at?: string;
}

export interface EventInterest {
  event_id: string;
  user_id: string;
  created_at?: string;
}
