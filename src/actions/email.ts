'use server';

import { sendTestRegistrationEmail } from '@/lib/resend';
import { RegistrationEmailConfig } from '@/types';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function sendTestRegistrationEmailAction(data: {
  config: RegistrationEmailConfig;
  conferenceId?: string;
  recipientEmail?: string;
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No se ha encontrado una sesión de usuario válida.' };
    }

    const targetEmail = data.recipientEmail || user.email;
    if (!targetEmail) {
      return { success: false, error: 'No se pudo determinar el correo de destino para la prueba.' };
    }

    const result = await sendTestRegistrationEmail({
      recipientEmail: targetEmail,
      config: data.config,
      conferenceId: data.conferenceId,
    });

    return result;
  } catch (err: any) {
    console.error('Error in sendTestRegistrationEmailAction:', err);
    return { success: false, error: err?.message || 'Error inesperado al enviar correo de prueba.' };
  }
}
