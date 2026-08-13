import { Resend } from 'resend';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { compileRegistrationEmailHtml } from '@/lib/emailCompiler';
import { RegistrationEmailConfig } from '@/types';

/**
 * Returns an instance of the Resend SDK initialized dynamically with runtime environment variables.
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Resend] WARNING: RESEND_API_KEY is missing in environment variables.');
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Legacy export for backward compatibility.
 */
export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Sends a transactional welcome email to a newly registered user using custom conference design if available.
 */
export async function sendWelcomeEmail({
  email,
  firstName,
  username,
  shortId,
  userRole = 'Asistente',
  conferenceId,
}: {
  email: string;
  firstName: string;
  username: string;
  shortId: string;
  userRole?: string;
  conferenceId?: string;
}) {
  const resendClient = getResendClient();
  if (!resendClient) {
    console.error('[Resend] Cannot send email: RESEND_API_KEY is not defined.');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const configuredFrom = process.env.RESEND_FROM_EMAIL || 'contacto@send.scherry.click';
  
  let htmlContent = '';
  let emailSubject = '¡Te damos la bienvenida a Cherry! 🍒';

  let customConfig: RegistrationEmailConfig | null = null;
  let conferenceTitle = 'Cherry';
  let institutionName = 'Institución Organizadora';
  let conferenceDate = '';
  let agendaEvents: any[] = [];

  // Try to load conference custom email configuration if conferenceId is provided
  if (conferenceId) {
    try {
      const { data: conf } = await supabaseAdmin
        .from('conferences')
        .select('title, institution_name, start_date, end_date, registration_email_config, custom_email_enabled, accent_color')
        .eq('id', conferenceId)
        .maybeSingle();

      if (conf) {
        conferenceTitle = conf.title || 'Cherry';
        institutionName = conf.institution_name || 'Institución Organizadora';
        if (conf.start_date) {
          conferenceDate = new Date(conf.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
        }

        if (conf.custom_email_enabled && conf.registration_email_config) {
          customConfig = conf.registration_email_config as RegistrationEmailConfig;
          
          // Inject dynamic conference accent color if not explicitly overridden
          if (conf.accent_color && customConfig.styles) {
            const rawAccent = typeof conf.accent_color === 'string' ? conf.accent_color : conf.accent_color.value;
            if (rawAccent && (!customConfig.styles.accent_color || customConfig.styles.accent_color === '#d9383a')) {
              customConfig.styles.accent_color = rawAccent;
            }
          }

          // Fetch agenda events if needed
          if (customConfig.agenda_section?.show && customConfig.agenda_section.selected_event_ids?.length) {
            const { data: evts } = await supabaseAdmin
              .from('events')
              .select('id, title, description, date, start_time, end_time, location, type')
              .in('id', customConfig.agenda_section.selected_event_ids);
            agendaEvents = evts || [];
          }
        }
      }
    } catch (err) {
      console.error('[Resend] Error fetching conference email config:', err);
    }
  }

  if (customConfig) {
    // Compile using dynamic configuration
    htmlContent = compileRegistrationEmailHtml(
      customConfig,
      {
        nombre: firstName,
        usuario: username,
        contraseña: shortId,
        rol: userRole,
        email: email,
        evento: conferenceTitle,
        fecha: conferenceDate,
        institucion: institutionName,
        url_acceso: 'https://scherry.click',
      },
      agendaEvents
    );

    // Dynamic subject
    if (customConfig.subject) {
      emailSubject = customConfig.subject
        .replace(/{{nombre}}/g, firstName)
        .replace(/{{usuario}}/g, username)
        .replace(/{{evento}}/g, conferenceTitle);
    }
  } else {
    // Default Fallback Template
    htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>¡Bienvenido a Cherry!</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f9f9fb; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
            .card { background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #eef0f3; }
            .logo { text-align: center; margin-bottom: 30px; }
            .logo-text { font-size: 28px; font-weight: 800; color: #d9383a; letter-spacing: -0.5px; }
            h1 { font-size: 24px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 16px; text-align: center; }
            p { font-size: 16px; color: #4b5563; margin-bottom: 24px; }
            .credentials-box { background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 30px; border: 1px solid #e5e7eb; }
            .credentials-title { font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; margin-top: 0; }
            .credential-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
            .credential-label { color: #6b7280; font-weight: 500; }
            .credential-value { color: #111827; font-weight: 600; font-family: monospace; background-color: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
            .btn-container { text-align: center; margin-bottom: 30px; }
            .btn { background-color: #d9383a; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(217, 56, 58, 0.2); }
            .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <span class="logo-text">🍒 Cherry</span>
              </div>
              <h1>¡Te damos la bienvenida, ${firstName}!</h1>
              <p>Tu registro en la plataforma se ha completado con éxito. A partir de ahora podrás acceder al evento, gestionar tu agenda y descargar tus certificados.</p>
              
              <div class="credentials-box">
                <h3 class="credentials-title">Tus credenciales de acceso</h3>
                <div class="credential-row">
                  <span class="credential-label">Usuario (Username):</span>
                  <span class="credential-value">${username}</span>
                </div>
                <div class="credential-row">
                  <span class="credential-label">ID de Acceso (Password):</span>
                  <span class="credential-value">${shortId}</span>
                </div>
              </div>

              <div class="btn-container">
                <a href="https://scherry.click" class="btn" target="_blank">Entrar a la Plataforma</a>
              </div>

              <p style="font-size: 14px; text-align: center; margin-bottom: 0;">
                Por seguridad, te recomendamos guardar estas credenciales en un lugar seguro.
              </p>
            </div>
            <div class="footer">
              Este es un correo automático, por favor no respondas a este mensaje.<br>
              &copy; ${new Date().getFullYear()} Cherry. Todos los derechos reservados.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // According to Resend SDK guidelines: SDK returns { data, error }, does not throw.
  const { data, error } = await resendClient.emails.send(
    {
      from: `Cherry <${configuredFrom}>`,
      to: [email],
      subject: emailSubject,
      html: htmlContent,
    },
    { idempotencyKey: `welcome-email/${username}-${shortId}` }
  );

  if (!error) {
    console.log(`[Resend] Welcome email sent successfully to ${email} (ID: ${data?.id})`);
    return { success: true, data };
  }

  console.error(`[Resend] Failed to send email via "${configuredFrom}":`, error.message);

  // Fallback check: Sandbox mode fallback
  const isDomainError = error.message?.toLowerCase().includes('not verified') || error.name === 'validation_error';
  if (isDomainError) {
    console.warn(`[Resend] Domain "${configuredFrom}" is not verified in Resend Dashboard yet.`);
    console.warn(`[Resend] Attempting sandbox fallback via "onboarding@resend.dev"...`);

    const fallbackSend = await resendClient.emails.send(
      {
        from: 'Cherry <onboarding@resend.dev>',
        to: [email],
        subject: `${emailSubject} (Sandbox)`,
        html: htmlContent,
      },
      { idempotencyKey: `welcome-email-sandbox/${username}-${shortId}` }
    );

    if (!fallbackSend.error) {
      console.log(`[Resend] Sandbox fallback email sent successfully to ${email} (ID: ${fallbackSend.data?.id})`);
      return { success: true, data: fallbackSend.data, usedFallback: true };
    }

    console.error('[Resend] Sandbox fallback also failed:', fallbackSend.error.message);
  }

  return { success: false, error: error.message };
}

/**
 * Sends a live test registration email with sample dynamic data to an admin recipient.
 */
export async function sendTestRegistrationEmail({
  recipientEmail,
  config,
  conferenceId,
}: {
  recipientEmail: string;
  config: RegistrationEmailConfig;
  conferenceId?: string;
}) {
  const resendClient = getResendClient();
  if (!resendClient) {
    return { success: false, error: 'RESEND_API_KEY no está configurada en las variables de entorno.' };
  }

  const configuredFrom = process.env.RESEND_FROM_EMAIL || 'contacto@send.scherry.click';
  
  let conferenceTitle = 'Congreso Internacional 2026';
  let institutionName = 'Universidad Nacional';
  let agendaEvents: any[] = [];

  if (conferenceId) {
    try {
      const { data: conf } = await supabaseAdmin
        .from('conferences')
        .select('title, institution_name')
        .eq('id', conferenceId)
        .maybeSingle();

      if (conf) {
        if (conf.title) conferenceTitle = conf.title;
        if (conf.institution_name) institutionName = conf.institution_name;
      }

      if (config.agenda_section?.selected_event_ids?.length) {
        const { data: evts } = await supabaseAdmin
          .from('events')
          .select('id, title, description, date, start_time, end_time, location, type')
          .in('id', config.agenda_section.selected_event_ids);
        agendaEvents = evts || [];
      }
    } catch (err) {
      console.error('[Resend Test] Error fetching conference data:', err);
    }
  }

  const compiledHtml = compileRegistrationEmailHtml(
    config,
    {
      nombre: 'Administrador (Prueba)',
      usuario: 'admin_prueba',
      contraseña: 'TEST-1234',
      rol: 'Administrador',
      email: recipientEmail,
      evento: conferenceTitle,
      fecha: '15-18 de Octubre 2026',
      institucion: institutionName,
      url_acceso: 'https://scherry.click',
    },
    agendaEvents
  );

  const subjectText = (config.subject || 'Prueba de Correo de Registro')
    .replace(/{{nombre}}/g, 'Administrador (Prueba)')
    .replace(/{{usuario}}/g, 'admin_prueba')
    .replace(/{{evento}}/g, conferenceTitle);

  const { data, error } = await resendClient.emails.send({
    from: `Cherry <${configuredFrom}>`,
    to: [recipientEmail],
    subject: `[PRUEBA] ${subjectText}`,
    html: compiledHtml,
  });

  if (!error) {
    return { success: true, data };
  }

  // Sandbox Fallback
  if (error.message?.toLowerCase().includes('not verified') || error.name === 'validation_error') {
    const fallbackSend = await resendClient.emails.send({
      from: 'Cherry <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `[PRUEBA Sandbox] ${subjectText}`,
      html: compiledHtml,
    });

    if (!fallbackSend.error) {
      return { success: true, data: fallbackSend.data, usedFallback: true };
    }
    return { success: false, error: fallbackSend.error.message };
  }

  return { success: false, error: error.message };
}
