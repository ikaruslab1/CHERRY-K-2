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
        subtitle: "Plataforma Cherry-K-2: Innovación en la organización de congresos, talleres y actividades académicas.",
        background_type: 'gradient',
        background_value: 'linear-gradient(135deg, #FFFFFF 0%, #CCEAFF 100%)',
        buttons: [
          { label: "Comenzar Registro", url: "#register" }
        ],
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
            description: "Validación segura y emisión instantánea de certificados digitales para tu comunidad."
          },
          {
            title: "Pase de Lista",
            description: "Registro de asistencia ágil y eficiente mediante lectura de códigos QR personalizados."
          },
          {
            title: "Gafete Virtual",
            description: "Identificación digital única y dinámica con acceso a beneficios exclusivos del evento."
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
        login_label: "Iniciar sesión",
        register_label: "Registrarse",
      }
    }
  ],
  global_styles: {
    font_family: 'inter',
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
      subtitle: "Subtítulo informativo",
      background_type: 'color',
      background_value: '#F3F4F6',
      buttons: [
        { label: "Botón Principal", url: "#" }
      ],
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
        { title: "Nueva Característica", description: "Descripción breve..." }
      ]
    }
  },
  cta: {
    variant: 'standard',
    content: {
      login_label: "Iniciar sesión",
      register_label: "Registrarse",
    }
  },
  speakers: {
    variant: 'grid',
    content: {
      title: "Nuestros Ponentes",
      show_all: true
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
