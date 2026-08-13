import { RegistrationEmailConfig } from '@/types';
import { DEFAULT_REGISTRATION_EMAIL_CONFIG } from '@/constants/email';

export interface EmailDataVariables {
  nombre?: string;
  usuario?: string;
  contraseña?: string;
  rol?: string;
  email?: string;
  evento?: string;
  fecha?: string;
  institucion?: string;
  url_acceso?: string;
  [key: string]: string | undefined;
}

export interface AgendaEventItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  type?: string;
}

export function compileRegistrationEmailHtml(
  config: RegistrationEmailConfig = DEFAULT_REGISTRATION_EMAIL_CONFIG,
  variables: EmailDataVariables = {},
  agendaEvents: AgendaEventItem[] = [],
  appOrigin: string = 'https://scherry.click'
): string {
  // Merge defaults
  const mergedConfig: RegistrationEmailConfig = {
    ...DEFAULT_REGISTRATION_EMAIL_CONFIG,
    ...config,
    styles: {
      ...DEFAULT_REGISTRATION_EMAIL_CONFIG.styles,
      ...(config?.styles || {}),
    },
    header_banner: {
      show: true,
      ...DEFAULT_REGISTRATION_EMAIL_CONFIG.header_banner,
      ...(config?.header_banner || {}),
    },
    credentials_box: {
      show: true,
      ...DEFAULT_REGISTRATION_EMAIL_CONFIG.credentials_box,
      ...(config?.credentials_box || {}),
    },
    agenda_section: {
      show: true,
      ...DEFAULT_REGISTRATION_EMAIL_CONFIG.agenda_section,
      ...(config?.agenda_section || {}),
    },
    cta_button: {
      show: true,
      ...DEFAULT_REGISTRATION_EMAIL_CONFIG.cta_button,
      ...(config?.cta_button || {}),
    },
    footer: {
      ...DEFAULT_REGISTRATION_EMAIL_CONFIG.footer,
      ...(config?.footer || {}),
    },
  };

  const { styles, logo, header_banner, credentials_box, agenda_section, cta_button, footer } = mergedConfig;

  // Resolved dynamic placeholders map
  const placeholdersMap: Record<string, string> = {
    '{{nombre}}': variables.nombre || 'Asistente',
    '{{first_name}}': variables.nombre || 'Asistente',
    '{{usuario}}': variables.usuario || 'usuario_demo',
    '{{username}}': variables.usuario || 'usuario_demo',
    '{{contraseña}}': variables.contraseña || 'CH-0000',
    '{{password}}': variables.contraseña || 'CH-0000',
    '{{short_id}}': variables.contraseña || 'CH-0000',
    '{{rol}}': variables.rol || 'Asistente',
    '{{role}}': variables.rol || 'Asistente',
    '{{email}}': variables.email || 'usuario@ejemplo.com',
    '{{evento}}': variables.evento || 'Evento Global',
    '{{conference_title}}': variables.evento || 'Evento Global',
    '{{fecha}}': variables.fecha || 'Próximamente',
    '{{institucion}}': variables.institucion || 'Institución Organizadora',
    '{{url_acceso}}': variables.url_acceso || `${appOrigin}/auth/login`,
  };

  const replaceTags = (str?: string): string => {
    if (!str) return '';
    let result = str;
    Object.entries(placeholdersMap).forEach(([tag, val]) => {
      result = result.replace(new RegExp(tag, 'g'), val);
    });
    return result;
  };

  const accentColor = styles.accent_color || '#d9383a';
  const fontFamily = styles.font_family || 'sans-serif';
  const fontSize = styles.font_size_body || '16px';
  const textColor = styles.text_color || '#1a1a1a';
  const bgColor = styles.background_color || '#f8fafc';
  const cardBg = styles.card_background || '#ffffff';
  const borderRadius = styles.border_radius || '16px';
  const borderColor = styles.border_color || '#e2e8f0';

  // 1. Render Logo
  let logoHtml = '';
  if (logo && logo.type !== 'none') {
    const logoHeight = logo.height || 48;
    const align = logo.alignment || 'center';
    const alignStyle = align === 'center' ? 'margin: 0 auto;' : align === 'right' ? 'margin-left: auto; margin-right: 0;' : 'margin-right: auto; margin-left: 0;';

    if (logo.type === 'preset' && logo.value) {
      const logoUrl = `${appOrigin}/assets/${logo.value}.svg`;
      logoHtml = `
        <div style="text-align: ${align}; margin-bottom: 24px;">
          <img src="${logoUrl}" alt="${logo.value}" style="height: ${logoHeight}px; max-width: 100%; display: inline-block; ${alignStyle} border: 0; outline: none;" />
        </div>
      `;
    } else if (logo.type === 'custom' && logo.value) {
      logoHtml = `
        <div style="text-align: ${align}; margin-bottom: 24px;">
          <img src="${logo.value}" alt="Logo" style="height: ${logoHeight}px; max-width: 100%; display: inline-block; ${alignStyle} border: 0; outline: none;" />
        </div>
      `;
    } else if (logo.type === 'text' && logo.value) {
      logoHtml = `
        <div style="text-align: ${align}; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 800; color: ${accentColor}; letter-spacing: -0.5px;">${replaceTags(logo.value)}</span>
        </div>
      `;
    }
  }

  // 2. Render Header Banner
  let headerBannerHtml = '';
  if (header_banner?.show) {
    const title = replaceTags(header_banner.title || '¡Registro Confirmado!');
    const subtitle = replaceTags(header_banner.subtitle || '');
    const headerBg = header_banner.background_type === 'accent' ? accentColor : (header_banner.background_value || accentColor);
    const headerTextColor = header_banner.text_color || '#ffffff';

    headerBannerHtml = `
      <div style="background: ${headerBg}; padding: 28px 24px; border-radius: ${borderRadius} ${borderRadius} 0 0; text-align: center; color: ${headerTextColor};">
        <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">${title}</h2>
        ${subtitle ? `<p style="margin: 0; font-size: 14px; opacity: 0.92; line-height: 1.4;">${subtitle}</p>` : ''}
      </div>
    `;
  }

  // 3. Render Body HTML Content
  const compiledBodyHtml = replaceTags(mergedConfig.body_html || '');

  // 4. Render Credentials Box
  let credentialsHtml = '';
  if (credentials_box?.show) {
    const credTitle = replaceTags(credentials_box.title || 'Tus Credenciales de Acceso');
    const credBg = credentials_box.background_color || '#f1f5f9';
    const credBorder = credentials_box.border_color || '#cbd5e1';

    const rows = [];
    if (credentials_box.show_username !== false) {
      rows.push(`
        <tr style="border-bottom: 1px solid ${credBorder};">
          <td style="padding: 10px 12px; font-size: 14px; color: #475569; font-weight: 600;">Usuario:</td>
          <td style="padding: 10px 12px; font-size: 14px; color: #0f172a; font-weight: 700; font-family: monospace; text-align: right;">${placeholdersMap['{{usuario}}']}</td>
        </tr>
      `);
    }
    if (credentials_box.show_password !== false) {
      rows.push(`
        <tr style="border-bottom: 1px solid ${credBorder};">
          <td style="padding: 10px 12px; font-size: 14px; color: #475569; font-weight: 600;">ID / Contraseña:</td>
          <td style="padding: 10px 12px; font-size: 14px; color: #0f172a; font-weight: 700; font-family: monospace; text-align: right;">${placeholdersMap['{{contraseña}}']}</td>
        </tr>
      `);
    }
    if (credentials_box.show_role !== false) {
      rows.push(`
        <tr style="border-bottom: 1px solid ${credBorder};">
          <td style="padding: 10px 12px; font-size: 14px; color: #475569; font-weight: 600;">Rol Asignado:</td>
          <td style="padding: 10px 12px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">${placeholdersMap['{{rol}}']}</td>
        </tr>
      `);
    }
    if (credentials_box.show_email !== false) {
      rows.push(`
        <tr>
          <td style="padding: 10px 12px; font-size: 14px; color: #475569; font-weight: 600;">Correo Registrado:</td>
          <td style="padding: 10px 12px; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">${placeholdersMap['{{email}}']}</td>
        </tr>
      `);
    }

    credentialsHtml = `
      <div style="background-color: ${credBg}; border: 1px solid ${credBorder}; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin: 0 0 14px 0; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #334155; text-align: center;">${credTitle}</h3>
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${rows.join('')}
        </table>
      </div>
    `;
  }

  // 5. Render Selected Agenda Events Section
  let agendaHtml = '';
  if (agenda_section?.show && agenda_section.selected_event_ids && agenda_section.selected_event_ids.length > 0) {
    const selectedEvents = agendaEvents.filter(e => agenda_section.selected_event_ids?.includes(e.id));
    if (selectedEvents.length > 0) {
      const agendaTitle = replaceTags(agenda_section.title || 'Eventos Destacados de la Agenda');
      const eventCards = selectedEvents.map(evt => `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-left: 4px solid ${accentColor}; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${accentColor}; letter-spacing: 0.5px; margin-bottom: 4px;">
            ${evt.type || 'Evento'} ${evt.date ? `• ${evt.date}` : ''} ${evt.start_time ? `(${evt.start_time}${evt.end_time ? ` - ${evt.end_time}` : ''})` : ''}
          </div>
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${evt.title}</div>
          ${evt.location ? `<div style="font-size: 12px; color: #64748b;">📍 ${evt.location}</div>` : ''}
          ${evt.description ? `<div style="font-size: 13px; color: #475569; margin-top: 6px;">${evt.description}</div>` : ''}
        </div>
      `).join('');

      agendaHtml = `
        <div style="margin: 28px 0;">
          <h3 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #1e293b; border-bottom: 2px solid ${accentColor}; padding-bottom: 6px; display: inline-block;">
            ${agendaTitle}
          </h3>
          ${eventCards}
        </div>
      `;
    }
  }

  // 6. Render CTA Button
  let ctaHtml = '';
  if (cta_button?.show) {
    const buttonText = replaceTags(cta_button.text || 'Entrar a la Plataforma');
    const buttonUrl = replaceTags(cta_button.url || placeholdersMap['{{url_acceso}}']);
    const buttonBg = cta_button.bg_color || accentColor;
    const buttonTextColor = cta_button.text_color || '#ffffff';
    const buttonRadius = cta_button.border_radius || '9999px';
    const align = cta_button.alignment || 'center';

    ctaHtml = `
      <div style="text-align: ${align}; margin: 32px 0 24px 0;">
        <a href="${buttonUrl}" target="_blank" style="background-color: ${buttonBg}; color: ${buttonTextColor} !important; text-decoration: none; padding: 14px 32px; border-radius: ${buttonRadius}; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 0;">
          ${buttonText}
        </a>
      </div>
    `;
  }

  // 7. Render Footer
  let footerHtml = '';
  if (footer) {
    const footerText = replaceTags(footer.text || '');
    const copyright = replaceTags(footer.copyright_text || '');
    const socials = footer.show_socials;

    footerHtml = `
      <div style="text-align: center; margin-top: 36px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        ${footerText ? `<p style="margin: 0 0 8px 0;">${footerText}</p>` : ''}
        ${copyright ? `<p style="margin: 0 0 8px 0; font-weight: 600;">${copyright}</p>` : ''}
        ${socials ? `
          <div style="margin-top: 12px;">
            ${footer.website_url ? `<a href="${footer.website_url}" target="_blank" style="color: ${accentColor}; text-decoration: underline; margin: 0 6px;">Sitio Web</a>` : ''}
            ${footer.twitter_url ? `<a href="${footer.twitter_url}" target="_blank" style="color: ${accentColor}; text-decoration: underline; margin: 0 6px;">Twitter/X</a>` : ''}
            ${footer.linkedin_url ? `<a href="${footer.linkedin_url}" target="_blank" style="color: ${accentColor}; text-decoration: underline; margin: 0 6px;">LinkedIn</a>` : ''}
            ${footer.instagram_url ? `<a href="${footer.instagram_url}" target="_blank" style="color: ${accentColor}; text-decoration: underline; margin: 0 6px;">Instagram</a>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  // Construct complete HTML document with clean inline CSS tables
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${replaceTags(mergedConfig.subject)}</title>
    ${mergedConfig.preheader ? `<span style="display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; max-height:0; max-width:0; overflow:hidden;">${replaceTags(mergedConfig.preheader)}</span>` : ''}
    <style>
      body {
        margin: 0;
        padding: 0;
        min-width: 100%;
        background-color: ${bgColor};
        font-family: ${fontFamily};
        font-size: ${fontSize};
        color: ${textColor};
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
      }
      table {
        border-collapse: collapse;
      }
      p {
        margin: 0 0 16px 0;
      }
      p:last-child {
        margin-bottom: 0;
      }
      a {
        color: ${accentColor};
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: ${fontFamily}; color: ${textColor}; font-size: ${fontSize};">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: ${bgColor}; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
            <tr>
              <td>
                ${logoHtml}
                <div style="background-color: ${cardBg}; border-radius: ${borderRadius}; border: 1px solid ${borderColor}; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); overflow: hidden;">
                  ${headerBannerHtml}
                  <div style="padding: ${header_banner?.show ? '32px 36px 36px 36px' : '36px'};">
                    ${compiledBodyHtml}
                    ${credentialsHtml}
                    ${agendaHtml}
                    ${ctaHtml}
                  </div>
                </div>
                ${footerHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
