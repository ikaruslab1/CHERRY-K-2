export interface EventLink {
  icon: string;
  label: string;
  url: string;
}

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
  auto_attendance?: boolean;
  auto_attendance_limit?: number; // Minutes after start
  duration_days?: number;
  conference_id: string;
  custom_links?: EventLink[];
  certificate_config?: {
    mode: 'template_v1' | 'custom_background';
    background_url?: string;
    styles?: {
      text_color: string;
      accent_color: string; // Used for "Award" icon and perhaps emphasis text
      font_family: string;
      text_alignment: 'left' | 'center' | 'right';
      content_vertical_position: string; // e.g. "50%"
    };
    texts?: {
      attendee: string;
      speaker: string;
      staff: string;
      organizer: string;
    };
    signers?: Array<{
       name: string;
       role: string;
       signature_url?: string;
    }>;
    show_qr?: boolean;
    qr_position?: 'bottom-left' | 'bottom-right';
  } | null;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  short_id: string;
  degree: string;
  role: 'user' | 'staff' | 'admin' | 'ponente' | 'owner' | 'vip';
  is_owner: boolean;
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
  accent_color?: {
    type: 'solid' | 'gradient';
    value: string; // hex color for solid, CSS gradient string for gradient
  };
  badge_icon?: {
    type: 'preset' | 'custom' | 'default';
    value: string;
  };
  certificate_config?: {
    mode: 'template_v1' | 'custom_background';
    background_url?: string;
    styles?: {
      text_color: string;
      accent_color: string;
      font_family: string;
      text_alignment: 'left' | 'center' | 'right';
      content_vertical_position: string;
    };
    texts?: {
      attendee: string;
      speaker: string;
      staff: string;
      organizer: string;
    };
    signers?: Array<{
       name: string;
       role: string;
       signature_url?: string;
    }>;
    show_qr?: boolean;
    qr_position?: 'bottom-left' | 'bottom-right';
  } | null;
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
