'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginWithId } from '@/actions/auth'; // Ensure this matches the export
import { Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RecoverIdModal } from './RecoverIdModal';

const formSchema = z.object({
  shortId: z.string().min(1, 'El ID es obligatorio'),
});

type FormData = z.infer<typeof formSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecoverModalOpen, setIsRecoverModalOpen] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginWithId(data.shortId);
      
      if (result.success) {
        // Redirigir usando window.location para asegurar que las cookies se procesen correctamente
        window.location.href = '/profile'; 
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverLogin = (id: string) => {
    setValue('shortId', id);
    setIsRecoverModalOpen(false);
    // Auto submit
    handleSubmit(onSubmit)();
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full text-left">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#373737] ml-1">
            ID de Acceso
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...
            </>
          ) : (
            <>
              Ingresar <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="text-center">
            <button 
                type="button"
                onClick={() => setIsRecoverModalOpen(true)}
                className="text-sm text-gray-500 hover:text-blue-600 underline underline-offset-4 transition-colors"
            >
                ¿Olvidaste tu ID? Recupéralo aquí
            </button>
        </div>
      </form>

      {/* Recover Modal */}
      {isRecoverModalOpen && (
        <RecoverIdModal 
            isOpen={isRecoverModalOpen}
            onClose={() => setIsRecoverModalOpen(false)}
            onLoginRaw={(id) => handleRecoverLogin(id)}
        />
      )}
    </>
  );
}
