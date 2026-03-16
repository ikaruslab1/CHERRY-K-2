import { ConferenceLandingConfig, LandingBlockType } from "@/types";

export const createBlockId = () => Math.random().toString(36).substring(2, 9);

export const DEFAULT_LANDING_CONFIG: ConferenceLandingConfig = {
  blocks: [
    {
      id: 'hero-default',
      type: 'hero',
      variant: 'centered',
      is_visible: true,
      content: {
        title: "Gestión Integral de Eventos Académicos",
        title_font: 'sans',
        subtitle: "Plataforma Cherry-K-2: Innovación en la organización de congresos, talleres y actividades académicas.",
        subtitle_font: 'sans',
        background_type: 'gradient',
        background_value: 'linear-gradient(135deg, #FFFFFF 0%, #CCEAFF 100%)',
        buttons: [
          { label: "Comenzar Registro", url: "#register", color: "#000000" }
        ],
        title_color: "#000000",
        subtitle_color: "#000000",
        logos: [],
        split_alignment: 'left',
        feature_area_background_type: 'color',
        feature_area_background_value: '#F8FAFC'
      }
    },
    {
      id: 'auth-block-fixed',
      type: 'auth',
      variant: 'modern',
      is_visible: true,
      content: {
        title: "Portal de Acceso",
        subtitle: "Ingresa tus credenciales para continuar"
      }
    },
    {
      id: 'features-default',
      type: 'features',
      variant: 'grid',
      is_visible: true,
      content: {
        items: [
          {
            title: "Certificación",
            description: "Validación segura y emisión instantánea de certificados digitales para tu comunidad.",
            icon_color: "#FFFFFF"
          },
          {
            title: "Pase de Lista",
            description: "Registro de asistencia ágil y eficiente mediante lectura de códigos QR personalizados.",
            icon_color: "#FFFFFF"
          },
          {
            title: "Gafete Virtual",
            description: "Identificación digital única y dinámica con acceso a beneficios exclusivos del evento.",
            icon_color: "#FFFFFF"
          }
        ]
      }
    },
    {
      id: 'cta-default',
      type: 'cta',
      variant: 'standard',
      is_visible: true,
      content: {
        title: "Únete al Futuro de la Legislación",
        subtitle: "Asegura tu lugar en uno de los eventos más importantes de la zona",
        background_color: "#000000",
        text_color: "#FFFFFF",
        text_align: "center",
        button_align: "center",
        buttons: [
          { label: "Obtener Entrada", url: "#register", color: "#FFFFFF", text_color: "#000000" },
          { label: "Acceder a mi Portal", url: "#login", color: "#373737", text_color: "#FFFFFF" }
        ],
        login_label: "Iniciar sesión",
        register_label: "Registrarse",
      }
    }
  ],
  global_styles: {
    font_family: 'sans',
  }
};

export const BLOCK_DEFAULTS: Record<string, any> = {
  auth: {
    variant: 'modern',
    content: {
      title: "Portal de Acceso",
      subtitle: "Ingresa tus credenciales para continuar"
    }
  },
  hero: {
    variant: 'centered',
    content: {
      title: "Título del Hero",
      title_font: 'sans',
      subtitle: "Subtítulo informativo",
      subtitle_font: 'sans',
      background_type: 'color',
      background_value: '#F3F4F6',
      buttons: [
        { label: "Botón Principal", url: "#", color: "#000000" }
      ],
      title_color: "#000000",
      subtitle_color: "#000000",
      logos: [],
      split_alignment: 'left',
      feature_area_background_type: 'color',
      feature_area_background_value: '#FFFFFF'
    }
  },
  features: {
    variant: 'grid',
    content: {
      items: [
        { title: "Nueva Característica", description: "Descripción breve...", icon_color: "#FFFFFF" }
      ]
    }
  },
  cta: {
    variant: 'standard',
    content: {
      title: "Únete al Futuro de la Legislación",
      subtitle: "Asegura tu lugar en uno de los eventos más importantes de la zona",
      background_color: "#000000",
      text_color: "#FFFFFF",
      text_align: "center",
      button_align: "center",
      buttons: [
        { label: "Obtener Entrada", url: "#register", color: "#FFFFFF", text_color: "#000000" },
        { label: "Acceder a mi Portal", url: "#login", color: "#373737", text_color: "#FFFFFF" }
      ],
      login_label: "Iniciar sesión",
      register_label: "Registrarse",
    }
  },
  agenda: {
    variant: 'list',
    content: {
      title: "Cronograma del Evento",
      compact: false
    }
  }
};
