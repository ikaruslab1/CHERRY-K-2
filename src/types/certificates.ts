export interface Certificate {
    id: string; // attendance id OR event id for speakers
    scanned_at: string; // OR event date for speakers
    events: {
      id: string;
      title: string;
      date: string; // Timestamptz
      type: string;
      location: string;
      description: string;
      gives_certificate?: boolean;
      duration_days?: number;
      conference_id: string;
      conferences?: {
          title: string;
          institution_name: string;
          department_name: string;
          certificate_config?: any;
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
          context?: string;
        };
        signers?: Array<{
           name: string;
           role: string;
           degree?: string;
           gender?: string;
           signature_url?: string;
        }>;
        show_qr?: boolean;
        qr_position?: 'bottom-left' | 'bottom-right';
        signer_count?: number;
        template_id?: 'default' | 'classic' | 'modern';
      } | null;
    };
    profiles: {
        first_name: string;
        last_name: string;
        degree: string | null;
        gender: string | null;
    }
    isSpeaker?: boolean;
    isStaff?: boolean;
    isOrganizer?: boolean;
}
