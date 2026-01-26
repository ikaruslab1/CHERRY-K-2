'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct for App Router
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginWithId } from '@/app/actions';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export function LoginForm() {
  const [shortId, setShortId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get credentials from server
      const result = await loginWithId(shortId);

      if (!result.success || !result.email || !result.password) {
        setError(result.error || 'Credenciales inválidas');
        setIsLoading(false);
        return;
      }

      // 2. Sign in client-side to establish session
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: result.email,
        password: result.password,
      });

      if (authError) {
        setError("Error de autenticación: " + authError.message);
        setIsLoading(false);
        return;
      }

      // 3. Redirect
      router.push('/profile');

    } catch (err: any) {
      setError("Error de conexión");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full text-left">
      <div className="space-y-4">
          <label className="text-sm font-bold text-[#373737] ml-1">ID de Acceso</label>
          <Input 
            value={shortId}
            onChange={(e) => setShortId(e.target.value)}
            placeholder="Pega tu código aquí (Ej. CK2-X9Z1)" 
            className="text-center font-mono text-base xs:text-lg uppercase tracking-widest text-[#373737] bg-white border-2 border-gray-100 focus-visible:border-[#DBF227] h-16 rounded-2xl"
          />
          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full mt-6" size="lg">
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</> : "Ingresar"}
      </Button>
    </form>
  );
}
