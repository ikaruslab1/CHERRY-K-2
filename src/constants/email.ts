import { RegistrationEmailConfig } from '@/types';
import { PRESET_LOGOS } from '@/lib/constants';

export const EMAIL_PLACEHOLDERS = [
  { key: '{{nombre}}', label: 'Nombre Completo', example: 'Ana García', description: 'Nombre del usuario registrado' },
  { key: '{{usuario}}', label: 'Usuario', example: 'anagarcia24', description: 'Nombre de usuario en la plataforma' },
  { key: '{{contraseña}}', label: 'Contraseña / ID', example: 'CH-8492', description: 'ID de acceso / contraseña generada' },
  { key: '{{rol}}', label: 'Rol en Evento', example: 'Asistente', description: 'Rol asignado (Asistente, Ponente, Staff)' },
  { key: '{{email}}', label: 'Correo', example: 'ana@ejemplo.com', description: 'Dirección de correo electrónico' },
  { key: '{{evento}}', label: 'Nombre del Evento', example: 'Congreso Internacional 2026', description: 'Título del evento o conferencia global' },
  { key: '{{fecha}}', label: 'Fecha del Evento', example: '15 de Octubre, 2026', description: 'Fechas de inicio y fin del evento' },
  { key: '{{institucion}}', label: 'Institución', example: 'UNAM', description: 'Nombre de la institución organizadora' },
  { key: '{{url_acceso}}', label: 'URL de Acceso', example: 'https://scherry.click', description: 'Enlace directo para iniciar sesión' },
] as const;

export const FONT_FAMILY_OPTIONS = [
  { value: 'sans-serif', label: 'Sistema Sans (Limpio y Moderno)', family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif' },
  { value: 'Inter, sans-serif', label: 'Inter (Editorial / Moderno)', family: 'Inter, -apple-system, sans-serif' },
  { value: 'Roboto, sans-serif', label: 'Roboto (Geométrico)', family: 'Roboto, Arial, sans-serif' },
  { value: 'Georgia, serif', label: 'Georgia (Clásico / Elegante)', family: 'Georgia, Cambria, "Times New Roman", serif' },
  { value: '"Courier New", monospace', label: 'Monospace (Código / Técnico)', family: '"Courier New", Courier, monospace' },
  { value: '"Playfair Display", serif', label: 'Playfair Display (Titular Acid)', family: '"Playfair Display", Georgia, serif' },
] as const;

export const FONT_SIZE_OPTIONS = [
  { value: '14px', label: '14px (Pequeño)' },
  { value: '15px', label: '15px (Normal Email)' },
  { value: '16px', label: '16px (Mediano / Recomendado)' },
  { value: '18px', label: '18px (Grande)' },
  { value: '20px', label: '20px (Enfático)' },
] as const;

export const DEFAULT_REGISTRATION_EMAIL_CONFIG: RegistrationEmailConfig = {
  enabled: true,
  subject: '¡Te damos la bienvenida a {{evento}}, {{nombre}}! 🍒',
  preheader: 'Aquí están tus credenciales de acceso e información de la agenda.',
  logo: {
    type: 'preset',
    value: 'unam',
    height: 48,
    alignment: 'center',
  },
  styles: {
    font_family: 'sans-serif',
    font_size_body: '16px',
    text_color: '#1a1a1a',
    background_color: '#f8fafc',
    card_background: '#ffffff',
    accent_color: '#d9383a',
    border_radius: '16px',
    border_color: '#e2e8f0',
  },
  header_banner: {
    show: true,
    title: '¡Registro Confirmado!',
    subtitle: 'Estamos muy entusiasmados de contar con tu participación',
    background_type: 'accent',
    text_color: '#ffffff',
  },
  body_html: `<p>Hola <strong>{{nombre}}</strong>,</p>

<p>Tu registro para participar en <strong>{{evento}}</strong> se ha completado con éxito. A través de este correo te compartimos las credenciales personales con las que podrás iniciar sesión en nuestra plataforma, armar tu agenda y consultar tus reconocimientos.</p>`,
  credentials_box: {
    show: true,
    title: 'Tus Credenciales de Acceso',
    background_color: '#f1f5f9',
    border_color: '#cbd5e1',
    show_username: true,
    show_password: true,
    show_role: true,
    show_email: true,
  },
  agenda_section: {
    show: true,
    title: 'Eventos Destacados de la Agenda',
    selected_event_ids: [],
  },
  cta_button: {
    show: true,
    text: 'Entrar a la Plataforma',
    url: 'https://scherry.click',
    bg_color: '#d9383a',
    text_color: '#ffffff',
    border_radius: '9999px',
    alignment: 'center',
  },
  footer: {
    text: 'Este es un correo automático de la plataforma Cherry. Por favor no respondas a este mensaje.',
    copyright_text: '© 2026 {{institucion}}. Todos los derechos reservados.',
    show_socials: false,
    website_url: 'https://scherry.click',
  },
};
