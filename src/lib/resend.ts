import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'contacto@scherry.click';

if (!apiKey) {
  console.warn('WARNING: RESEND_API_KEY is not defined in the environment variables.');
}

export const resend = apiKey ? new Resend(apiKey) : null;

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
  if (!resend) {
    console.error('Cannot send email: Resend client is not initialized (missing API key).');
    return { success: false, error: 'Resend client not initialized' };
  }

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
  const { data, error } = await resend.emails.send(
    {
      from: `Cherry <${fromEmail}>`,
      to: [email],
      subject: '¡Te damos la bienvenida a Cherry! 🍒',
      html: htmlContent,
    },
    { idempotencyKey: `welcome-email/${username}-${shortId}` }
  );

  if (error) {
    console.error('Failed to send welcome email via Resend:', error.message);
    return { success: false, error: error.message };
  }

  console.log('Welcome email sent successfully:', data?.id);
  return { success: true, data };
}
