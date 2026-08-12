'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginWithCredentials } from '@/actions/auth';
import { Loader2, ArrowRight, Eye, EyeOff, User, Lock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { RecoverIdModal } from './RecoverIdModal';

const createFormSchema = (locale: string) => z.object({
  identifier: z.string().min(1, locale === 'en' ? 'Username or email is required' : 'El usuario o correo es obligatorio'),
  password: z.string().min(1, locale === 'en' ? 'Password is required' : 'La contraseña es obligatoria'),
});

type FormData = z.infer<ReturnType<typeof createFormSchema>>;

interface LoginFormProps {
  conferenceId?: string;
  isEmbedded?: boolean;
  locale?: string;
}

export function LoginForm({ conferenceId, isEmbedded, locale = 'es' }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const onSubmit = useCallback(async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (conferenceId && typeof window !== 'undefined') {
        try {
          localStorage.setItem('conference_id', conferenceId);
          document.cookie = `conference_id=${conferenceId}; path=/; max-age=31536000; SameSite=Lax`;
        } catch (_) {}
      }

      const result = await loginWithCredentials(data.identifier, data.password);

      if (result.success) {
        if (isEmbedded) {
          if (window.top && window.top !== window) {
            window.top.location.href = '/profile';
          } else {
            window.location.href = '/profile';
          }
        } else {
          window.location.href = '/profile';
        }
      } else {
        setError(result.error || (locale === 'en' ? 'Invalid credentials' : 'Credenciales inválidas'));
      }
    } catch (err) {
      setError(locale === 'en' ? 'Connection error' : 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  }, [isEmbedded, conferenceId, locale]);

  // Auto-fill user from URL query param if present
  useEffect(() => {
    const userParam = searchParams.get('user') || searchParams.get('code');
    if (userParam) {
      setValue('identifier', userParam.toLowerCase());
    }
  }, [searchParams, setValue]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full text-left">
        {/* Username or Email field */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1 flex items-center gap-1.5">
            <User className="w-4 h-4 text-gray-500" />
            {locale === 'en' ? 'Username or Email' : 'Usuario o Correo'} <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('identifier', {
              onChange: (e) => {
                e.target.value = e.target.value.toLowerCase();
              },
            })}
            placeholder={locale === 'en' ? 'username or email@example.com' : 'usuario o correo@ejemplo.com'}
            className={`rounded-xl border bg-white text-black transition-all h-12 text-base ${
              errors.identifier ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-black'
            }`}
          />
          {errors.identifier && (
            <p className="text-red-500 text-xs ml-1">{errors.identifier.message}</p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-[#373737] ml-1 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-gray-500" />
            {locale === 'en' ? 'Password' : 'Contraseña'} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`rounded-xl border bg-white text-black transition-all h-12 text-base pr-10 ${
                errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-black'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs ml-1">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full font-bold bg-[#373737] hover:bg-black text-white rounded-xl h-12 transition-all mt-2"
          size="md"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {locale === 'en' ? 'Verifying...' : 'Verificando...'}
            </>
          ) : (
            <>
              {locale === 'en' ? 'Log In' : 'Iniciar Sesión'} <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setIsRecoverModalOpen(true)}
            className="text-sm text-gray-500 hover:text-blue-600 underline underline-offset-4 transition-colors"
          >
            {locale === 'en' ? 'Forgot your credentials? Recover here' : '¿Olvidaste tus credenciales? Recupéralas aquí'}
          </button>
        </div>
      </form>

      {/* Recover Modal */}
      {isRecoverModalOpen && (
        <RecoverIdModal
          isOpen={isRecoverModalOpen}
          onClose={() => setIsRecoverModalOpen(false)}
          onLoginRaw={(id) => {
            setValue('identifier', id);
            setIsRecoverModalOpen(false);
          }}
          locale={locale}
        />
      )}
    </>
  );
}
