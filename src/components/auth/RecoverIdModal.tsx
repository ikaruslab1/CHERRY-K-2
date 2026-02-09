'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Copy, Printer, Check, ChevronRight, Loader2, LogIn, ArrowLeft } from 'lucide-react';
import { checkEmailForRecovery, verifyRecoveredUser } from '@/actions/auth';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface RecoverIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRaw: (id: string, e?: React.FormEvent) => void; 
  // onLoginRaw is a way to trigger the login logic from the parent without a form event if needed, 
  // or we can just populate the parent state and submit. 
  // Actually, easiest is to just pass a "onRecovered" which sets the ID in the parent form.
  // But the prompt says "un boton extra para iniciar sesión de una vez".
  // So I'll probably just emit the ID back or handle login here if I can import login logic.
  // Since login logic is inside LoginForm, I should probably expose a function from LoginForm or just pass a callback.
}

export function RecoverIdModal({ isOpen, onClose, onLoginRaw }: RecoverIdModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [recoveredId, setRecoveredId] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const res = await checkEmailForRecovery(email);
    setIsLoading(false);

    if (res.success) {
      setStep(2);
    } else {
      setError(res.error || 'Error al validar correo');
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic length validation
    if (phone.length !== 10) {
        setError('El número debe tener 10 dígitos');
        setIsLoading(false);
        return;
    }

    const res = await verifyRecoveredUser(email, phone);
    setIsLoading(false);

    if (res.success && res.short_id) {
      setRecoveredId(res.short_id);
      setStep(3);
    } else {
      setError(res.error || 'Error al validar datos');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recoveredId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    // Open a simple window to print or just print the current view.
    // Creating a printable window is cleaner.
    const printWindow = window.open('', '_blank', 'width=400,height=400');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tu ID de Acceso</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; }
              .id { font-size: 40px; font-weight: bold; margin: 20px 0; border: 2px dashed #000; padding: 10px 20px; }
            </style>
          </head>
          <body>
            <h2>Recuperación de ID</h2>
            <p>Tu código de acceso es:</p>
            <div class="id">${recoveredId}</div>
            <p>Guárdalo en un lugar seguro.</p>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleReset = () => {
      setStep(1);
      setEmail('');
      setPhone('');
      setRecoveredId('');
      setError(null);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {step > 1 && step < 3 && (
                    <button onClick={() => setStep(step - 1 as any)} className="text-gray-600 hover:text-black transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h3 className="font-bold text-xl text-black">Recuperar ID</h3>
            </div>
            <button onClick={handleReset} className="text-gray-400 hover:text-black transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* Content */}
        <div className="p-6">
            {step === 1 && (
                <form onSubmit={handleStep1} className="space-y-5">
                    <p className="text-gray-800 text-base font-medium leading-relaxed">
                        Ingresa tu correo electrónico registrado para comenzar el proceso de recuperación.
                    </p>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">Correo Electrónico</label>
                        <Input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all text-black font-medium h-12 rounded-xl placeholder:text-gray-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-600 text-sm font-bold animate-pulse">{error}</p>}
                    <Button type="submit" className="w-full mt-2 h-12 text-base font-bold bg-[#373737] hover:bg-black text-white rounded-xl" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
                        Continuar <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleStep2} className="space-y-5">
                    <p className="text-gray-800 text-base font-medium leading-relaxed">
                        ¡Correo encontrado! Ahora, confirma tu identidad ingresando tu número de celular (10 dígitos).
                    </p>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">Celular</label>
                        <Input 
                            type="tel" 
                            value={phone} 
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPhone(val);
                            }}
                            placeholder="Ej. 5512345678"
                            className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all text-center tracking-widest font-mono text-xl font-bold text-black h-12 rounded-xl placeholder:text-gray-500"
                            required
                        />
                         <p className="text-xs text-gray-500 font-semibold text-right">{phone.length}/10</p>
                    </div>
                    {error && <p className="text-red-600 text-sm font-bold animate-pulse">{error}</p>}
                    <Button type="submit" className="w-full mt-2 h-12 text-base font-bold bg-[#373737] hover:bg-black text-white rounded-xl" disabled={isLoading || phone.length < 10}>
                         {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
                        Validar Identidad
                    </Button>
                </form>
            )}

            {step === 3 && (
                <div className="space-y-6 text-center">
                    <div className="w-20 h-20 bg-[#DBF227]/20 rounded-full flex items-center justify-center mx-auto text-[#aebf22]">
                        <Check size={40} strokeWidth={3} />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-2xl font-black text-black">¡Validación Exitosa!</h4>
                        <p className="text-gray-700 font-medium">Hemos recuperado tu código de acceso.</p>
                    </div>

                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6 relative group">
                        <p className="font-mono text-4xl font-black tracking-widest text-black uppercase select-all">
                            {recoveredId}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" type="button" onClick={copyToClipboard} className="w-full relative overflow-hidden h-11 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 hover:text-black">
                            {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                            {copied ? "Copiado" : "Copiar"}
                        </Button>
                        <Button variant="outline" type="button" onClick={handlePrint} className="w-full h-11 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 hover:text-black">
                            <Printer className="w-4 h-4 mr-2" />
                            Imprimir
                        </Button>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <Button 
                            className="w-full bg-[#373737] hover:bg-black text-white font-bold rounded-xl h-14 text-lg shadow-lg hover:shadow-xl transition-all" 
                            size="lg"
                            onClick={() => onLoginRaw(recoveredId)}
                        >
                            <LogIn className="w-5 h-5 mr-2" />
                            Iniciar Sesión Ahora
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
