import { Resend } from 'resend';

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
 * Sends a premium transactional welcome email to the newly registered user.
 */
export async function sendWelcomeEmail({
  email,
  firstName,
  username,
  shortId,
}: {
  email: string;
  firstName: string;
  username: string;
  shortId: string;
}) {
  const resendClient = getResendClient();
  if (!resendClient) {
    console.error('[Resend] Cannot send email: RESEND_API_KEY is not defined.');
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  const configuredFrom = process.env.RESEND_FROM_EMAIL || 'contacto@send.scherry.click';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Bienvenido a Cherry!</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #f9f9fb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .card {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #eef0f3;
          }
          .logo {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo-text {
            font-size: 28px;
            font-weight: 800;
            color: #d9383a; /* Cherry theme primary */
            letter-spacing: -0.5px;
          }
          h1 {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-top: 0;
            margin-bottom: 16px;
            text-align: center;
          }
          p {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 24px;
          }
          .credentials-box {
            background-color: #f3f4f6;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 30px;
            border: 1px solid #e5e7eb;
          }
          .credentials-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            margin-top: 0;
          }
          .credential-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 15px;
          }
          .credential-row:last-child {
            margin-bottom: 0;
          }
          .credential-label {
            color: #6b7280;
            font-weight: 500;
          }
          .credential-value {
            color: #111827;
            font-weight: 600;
            font-family: monospace;
            background-color: #e5e7eb;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .btn-container {
            text-align: center;
            margin-bottom: 30px;
          }
          .btn {
            background-color: #d9383a;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
            transition: background-color 0.2s ease;
            box-shadow: 0 4px 6px rgba(217, 56, 58, 0.2);
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 30px;
          }
          .footer a {
            color: #9ca3af;
            text-decoration: underline;
          }
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

  // According to Resend SDK guidelines: SDK returns { data, error }, does not throw.
  const { data, error } = await resendClient.emails.send(
    {
      from: `Cherry <${configuredFrom}>`,
      to: [email],
      subject: '¡Te damos la bienvenida a Cherry! 🍒',
      html: htmlContent,
    },
    { idempotencyKey: `welcome-email/${username}-${shortId}` }
  );

  if (!error) {
    console.log(`[Resend] Welcome email sent successfully to ${email} (ID: ${data?.id})`);
    return { success: true, data };
  }

  console.error(`[Resend] Failed to send email via "${configuredFrom}":`, error.message);

  // Fallback check: If the error is due to an unverified domain (403 validation_error)
  const isDomainError = error.message?.toLowerCase().includes('not verified') || error.name === 'validation_error';
  if (isDomainError) {
    console.warn(`[Resend] Domain "${configuredFrom}" is not verified in Resend Dashboard yet.`);
    console.warn(`[Resend] Please verify your domain at https://resend.com/domains.`);
    console.warn(`[Resend] Attempting sandbox fallback via "onboarding@resend.dev"...`);

    const fallbackSend = await resendClient.emails.send(
      {
        from: 'Cherry <onboarding@resend.dev>',
        to: [email],
        subject: '¡Te damos la bienvenida a Cherry! 🍒 (Sandbox)',
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

