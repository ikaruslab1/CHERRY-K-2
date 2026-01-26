export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  type: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  short_id: string;
  degree: string;
  role: 'user' | 'staff' | 'admin';
  email?: string;
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
