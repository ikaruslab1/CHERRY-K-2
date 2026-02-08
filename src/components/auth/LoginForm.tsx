'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Correct for App Router
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginWithId } from '@/actions/auth';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

// ... imports
import { RecoverIdModal } from './RecoverIdModal';

export function LoginForm() {
  const [shortId, setShortId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setShortId(codeParam.toUpperCase());
    } else {
        const savedId = localStorage.getItem('login_short_id');
        if (savedId) setShortId(savedId);
    }
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem('login_short_id', shortId);
  }, [shortId]);

  const handleLogin = async (e?: React.FormEvent, idOverride?: string) => {
    if (e) e.preventDefault();
    const idToUse = idOverride || shortId;
    
    if (!idToUse) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get credentials and sign in from server
      const result = await loginWithId(idToUse);

      if (!result.success) {
        setError(result.error || 'Credenciales inválidas');
        setIsLoading(false);
        return;
      }

      // 2. Redirect (Session is already set by server action via cookies)
      router.push('/profile');
      router.refresh();

    } catch (err: any) {
      setError("Error de conexión");
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4 w-full text-left">
        <div className="space-y-4">
            <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-[#373737] text-center">ID de Acceso</label>
                <button 
                  type="button" 
                  onClick={() => setShowRecoverModal(true)}
                  className="text-xs font-medium text-gray-500 hover:text-[#DBF227] hover:underline transition-colors"
                >
                  ¿Olvidaste tu ID?
                </button>
            </div>
            <Input 
              value={shortId}
              onChange={(e) => setShortId(e.target.value.toUpperCase())}
              placeholder="Pega tu código aquí (Ej. CK2-X9Z1)" 
              className="text-center font-mono text-base xs:text-lg uppercase tracking-widest text-[#373737] bg-white border-2 border-gray-100 focus-visible:border-[#DBF227] h-12 xs:h-14 md:h-16 rounded-2xl"
            />
            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full mt-6" size="lg">
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</> : "Ingresar"}
        </Button>
      </form>

      <RecoverIdModal 
        isOpen={showRecoverModal}
        onClose={() => setShowRecoverModal(false)}
        onLoginRaw={(id) => {
            setShowRecoverModal(false);
            setShortId(id);
            handleLogin(undefined, id);
        }}
      />
    </>
  );
}

