'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Copy, Check, ChevronRight, Loader2, LogIn, ArrowLeft, User, KeyRound } from 'lucide-react';
import { checkEmailForRecovery, verifyRecoveredUser } from '@/actions/auth';

interface RecoverIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRaw: (id: string, e?: React.FormEvent) => void; 
  locale?: string;
}

export function RecoverIdModal({ isOpen, onClose, onLoginRaw, locale = 'es' }: RecoverIdModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [recoveredId, setRecoveredId] = useState('');
  const [recoveredUsername, setRecoveredUsername] = useState('');
  
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
      setError(res.error || (locale === 'en' ? 'Error validating email' : 'Error al validar correo'));
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (phone.length !== 10) {
      setError(locale === 'en' ? 'The number must have 10 digits' : 'El número debe tener 10 dígitos');
      setIsLoading(false);
      return;
    }

    const res = await verifyRecoveredUser(email, phone);
    setIsLoading(false);

    if (res.success) {
      setRecoveredId(res.short_id || '');
      setRecoveredUsername(res.username || '');
      setStep(3);
    } else {
      setError(res.error || (locale === 'en' ? 'Error validating data' : 'Error al validar datos'));
    }
  };

  const copyToClipboard = () => {
    const textToCopy = recoveredUsername ? `@${recoveredUsername} (ID: ${recoveredId})` : recoveredId;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(1);
    setEmail('');
    setPhone('');
    setRecoveredId('');
    setRecoveredUsername('');
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
            <h3 className="font-bold text-xl text-black">
              {locale === 'en' ? 'Recover Account' : 'Recuperar Cuenta'}
            </h3>
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
                {locale === 'en' 
                  ? 'Enter your registered email to start the recovery process.' 
                  : 'Ingresa tu correo electrónico registrado para comenzar el proceso de recuperación.'
                }
              </p>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">
                  {locale === 'en' ? 'Email Address' : 'Correo Electrónico'}
                </label>
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
                {locale === 'en' ? 'Continue' : 'Continuar'} <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-5">
              <p className="text-gray-800 text-base font-medium leading-relaxed">
                {locale === 'en'
                  ? 'Email found! Now, confirm your identity by entering your cell phone number (10 digits).'
                  : '¡Correo encontrado! Ahora, confirma tu identidad ingresando tu número de celular (10 dígitos).'
                }
              </p>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900 uppercase tracking-wide ml-1">
                  {locale === 'en' ? 'Phone Number' : 'Celular'}
                </label>
                <Input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(val);
                  }}
                  placeholder={locale === 'en' ? 'Ex. 5512345678' : 'Ej. 5512345678'}
                  className="bg-white border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all text-center tracking-widest font-mono text-xl font-bold text-black h-12 rounded-xl placeholder:text-gray-500"
                  required
                />
                <p className="text-xs text-gray-500 font-semibold text-right">{phone.length}/10</p>
              </div>
              {error && <p className="text-red-600 text-sm font-bold animate-pulse">{error}</p>}
              <Button type="submit" className="w-full mt-2 h-12 text-base font-bold bg-[#373737] hover:bg-black text-white rounded-xl" disabled={isLoading || phone.length < 10}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : null}
                {locale === 'en' ? 'Validate Identity' : 'Validar Identidad'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-[#DBF227]/20 rounded-full flex items-center justify-center mx-auto text-[#aebf22]">
                <Check size={32} strokeWidth={3} />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-black text-black">
                  {locale === 'en' ? 'Validation Successful!' : '¡Validación Exitosa!'}
                </h4>
                <p className="text-gray-600 font-medium text-sm">
                  {locale === 'en' ? 'We have recovered your account details.' : 'Hemos recuperado los datos de tu cuenta.'}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-left space-y-3">
                {recoveredUsername && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                      {locale === 'en' ? 'Username' : 'Nombre de Usuario'}
                    </span>
                    <span className="text-lg font-bold font-mono text-blue-600">
                      @{recoveredUsername}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    {locale === 'en' ? 'Access ID / Badge' : 'ID de Acceso / Gafete'}
                  </span>
                  <span className="text-xl font-bold font-mono tracking-wider text-gray-800">
                    {recoveredId}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={copyToClipboard} className="w-full h-11 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 rounded-xl">
                  {copied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? (locale === 'en' ? "Copied" : "Copiado") : (locale === 'en' ? "Copy Data" : "Copiar Datos")}
                </Button>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <Button 
                  className="w-full bg-[#373737] hover:bg-black text-white font-bold rounded-xl h-12 text-base shadow-md transition-all" 
                  size="lg"
                  onClick={() => onLoginRaw(recoveredUsername || recoveredId)}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  {locale === 'en' ? 'Use for Login' : 'Usar para Iniciar Sesión'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
