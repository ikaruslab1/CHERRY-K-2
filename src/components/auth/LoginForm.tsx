'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resolveEmailByShortId, loginWithId } from '@/actions/auth';
import { Loader2, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { RecoverIdModal } from './RecoverIdModal';

const createFormSchema = (locale: string) => z.object({
  shortId: z.string().min(1, locale === 'en' ? 'ID is required' : 'El ID es obligatorio'),
});

type FormData = {
  shortId: string;
};

interface LoginFormProps {
  conferenceId?: string;
  isEmbedded?: boolean;
  locale?: string;
}

export function LoginForm({ conferenceId, isEmbedded, locale = 'es' }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createFormSchema(locale)),
  });

  const searchParams = useSearchParams();

  /**
   * Handler principal del formulario.
   *
   * - MODO EMBEDDED (iframe): Valida que el ID exista, luego redirige la
   *   ventana padre a /login?code=ID. La página de login (corriendo en el
   *   contexto principal del browser) detecta el parámetro `code`, lo
   *   auto-rellena y auto-submitea, estableciendo la sesión correctamente
   *   mediante el Server Action con cookies HTTP.
   *
   * - MODO NORMAL: Llama directamente al Server Action loginWithId que
   *   establece la sesión con cookies en el contexto actual.
   */
  const onSubmit = useCallback(async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isEmbedded) {
        // 1. Verificar que el ID existe (sin crear sesión en el servidor)
        const resolved = await resolveEmailByShortId(data.shortId);
        if (!resolved.success || !resolved.email) {
          setError(resolved.error || (locale === 'en' ? 'ID not found' : 'ID no encontrado'));
          setIsLoading(false);
          return;
        }

        // 2. Guardar conferenceId si aplica
        if (conferenceId) {
          try {
            localStorage.setItem('conference_id', conferenceId);
            document.cookie = `conference_id=${conferenceId}; path=/; max-age=31536000; SameSite=Lax`;
          } catch (_) {}
        }

        // 3. Redirigir la ventana padre a /login?code=ID
        // La página de login detecta el código, lo auto-rellena y auto-submitea,
        // estableciendo la sesión en el contexto correcto del browser principal.
        const loginUrl = `${window.location.origin}/login?code=${encodeURIComponent(data.shortId)}`;
        try {
          if (window.top && window.top !== window) {
            window.top.location.href = loginUrl;
          } else {
            window.location.href = loginUrl;
          }
        } catch (_) {
          // Fallback si window.top es cross-origin y lo bloquea el browser
          window.open(loginUrl, '_blank');
        }
      } else {
        // Flujo normal: Server Action establece sesión con cookies HTTP
        const result = await loginWithId(data.shortId);

        if (result.success) {
          if (conferenceId && typeof window !== 'undefined') {
            try {
              localStorage.setItem('conference_id', conferenceId);
              document.cookie = `conference_id=${conferenceId}; path=/; max-age=31536000; SameSite=Lax`;
            } catch (_) {}
          }
          window.location.href = '/profile';
        } else {
          setError(result.error || (locale === 'en' ? 'Login failed' : 'Error al iniciar sesión'));
        }
      }
    } catch (err) {
      setError(locale === 'en' ? 'Connection error' : 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }, [isEmbedded, conferenceId, locale]);

  // Auto-fill y auto-submit cuando llega el parámetro ?code= en la URL
  // (esto ocurre en la página /login normal, NO en el iframe)
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      console.log('[LoginForm] Auto-rellenando ID desde URL:', code);
      setValue('shortId', code.toUpperCase());

      // Pequeño delay para que el form registre el valor antes de submitear
      const timer = setTimeout(() => {
        handleSubmit(onSubmit)();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchParams, setValue, handleSubmit, onSubmit]);

  const handleRecoverLogin = useCallback((id: string) => {
    setValue('shortId', id);
    setIsRecoverModalOpen(false);
    handleSubmit(onSubmit)();
  }, [setValue, handleSubmit, onSubmit]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full text-left">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#373737] ml-1">
            {locale === 'en' ? 'Access ID' : 'ID de Acceso'}
          </label>
          <Input
            {...register('shortId', {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase();
              },
            })}
            placeholder="CK2-XXXX"
            className={`rounded-xl border bg-gray-50 text-black transition-all h-12 font-mono tracking-widest text-center text-lg uppercase ${
              errors.shortId ? 'border-red-500 bg-red-50' : 'border-gray-200'
            }`}
          />
          {errors.shortId && (
            <p className="text-red-500 text-xs ml-1">{errors.shortId.message}</p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-bold bg-[#373737] hover:bg-black text-white rounded-xl h-12"
          size="md"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {locale === 'en' ? 'Verifying...' : 'Verificando...'}
            </>
          ) : (
            <>
              {locale === 'en' ? 'Login' : 'Ingresar'} <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="text-center">
            <button
                type="button"
                onClick={() => setIsRecoverModalOpen(true)}
                className="text-sm text-gray-500 hover:text-blue-600 underline underline-offset-4 transition-colors"
            >
                {locale === 'en' ? 'Forgot your ID? Recover it here' : '¿Olvidaste tu ID? Recupéralo aquí'}
            </button>
        </div>
      </form>

      {/* Recover Modal */}
      {isRecoverModalOpen && (
        <RecoverIdModal
            isOpen={isRecoverModalOpen}
            onClose={() => setIsRecoverModalOpen(false)}
            onLoginRaw={(id) => handleRecoverLogin(id)}
            locale={locale}
        />
      )}
    </>
  );
}
