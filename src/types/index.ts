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
  speaker_id?: string | null; // Primary speaker (legacy)
  speaker?: {
    first_name: string;
    last_name: string;
    degree?: string;
    gender?: string;
  };
  speakers?: Array<{ // Multiple speakers support (up to 10)
    id: string;
    first_name: string;
    last_name: string;
    degree?: string;
    gender?: string;
  }>;
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
  // Global attendance certificate (per conference)
  gives_global_certificate?: boolean;
  global_certificate_threshold?: number; // Number of events user must attend
  global_certificate_config?: any | null; // Same structure as certificate_config
  deliver_global_certificate?: boolean; // If false, show email banner instead of certificate
  custom_landing_enabled?: boolean;
  conference_landing_config?: ConferenceLandingConfig | null;
}

// --- New Modular Landing Types ---

export type LandingBlockType = 'hero' | 'features' | 'auth' | 'cta' | 'speakers' | 'agenda';

export interface HeroButton {
  label: string;
  url: string;
  color?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface HeroBlockContent {
  // Global Typography & Colors
  logos?: string[];
  title: string;
  title_font?: 'inter' | 'syne' | 'manrope' | 'mono';
  title_color?: string;
  subtitle: string;
  subtitle_font?: 'inter' | 'syne' | 'manrope' | 'mono';
  subtitle_color?: string;

  // Backgrounds
  background_type?: 'color' | 'gradient' | 'image';
  background_value?: string; // Hex, Gradient CSS, or URL
  
  // Legacy support (to be migrated or kept as fallback)
  gradient_start?: string;
  gradient_end?: string;
  gradient_direction?: string;

  // Variant Centered
  buttons?: HeroButton[];

  // Variant Split
  split_alignment?: 'left' | 'right';
  feature_area_background_type?: 'color' | 'gradient' | 'image';
  feature_area_background_value?: string;
  feature_area_gradient_start?: string;
  feature_area_gradient_end?: string;
  feature_area_gradient_direction?: string;
}

export interface LandingBlock {
  id: string;
  type: LandingBlockType;
  variant: string;
  is_visible: boolean;
  content: HeroBlockContent | any; // HeroBlockContent used when type is 'hero'
}

export interface ConferenceLandingConfig {
  blocks: LandingBlock[];
  global_styles: {
    font_family: 'sans' | 'serif' | 'mono' | 'cursive';
  };
}

// Keep legacy interface for migration reference if needed
export interface LegacyConferenceLandingConfig {
  hero: {
    title: string;
    subtitle: string;
    gradient_start: string;
    gradient_end: string;
  };
  features: Array<{
    title: string;
    description: string;
  }>;
  cta: {
    login_label: string;
    register_label: string;
  };
  colors: {
    primary: string;
    accent: string;
  };
  typography: {
    font_family: 'inter' | 'syne' | 'manrope' | 'mono';
  };
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
