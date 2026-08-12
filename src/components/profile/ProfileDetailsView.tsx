'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUserProfile } from '@/actions/auth';
import { 
  User, 
  ShieldAlert, 
  KeyRound, 
  UserCheck, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  GraduationCap, 
  Users, 
  Lock, 
  Loader2,
  IdCard,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

interface UserProfileData {
  id: string;
  short_id: string;
  username: string;
  first_name: string;
  last_name: string;
  degree: string;
  gender: string;
  email: string;
  phone: string;
  user_password?: string;
  created_at?: string;
}

interface ProfileDetailsViewProps {
  role?: string;
}

export function ProfileDetailsView({ role = 'user' }: ProfileDetailsViewProps) {
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        // 1. Try client browser session first
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: pData } = await supabase
            .from('profiles')
            .select('id, short_id, username, first_name, last_name, degree, gender, email, phone, user_password, created_at')
            .eq('id', session.user.id)
            .maybeSingle();

          if (pData) {
            setProfile(pData as UserProfileData);
            setLoading(false);
            return;
          }
        }

        // 2. Fallback to Server Action
        const res = await getCurrentUserProfile();
        if (res.success && res.profile) {
          setProfile(res.profile as UserProfileData);
        } else {
          setError(res.error || 'No se pudo cargar la información del perfil.');
        }
      } catch (err: any) {
        console.error('Error fetching profile in component:', err);
        setError('Error al conectar con la base de datos.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleCopy = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-acid)]" />
        <p className="text-sm text-gray-400 font-medium">Cargando tus datos de perfil...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-center font-medium">
        {error || 'No se pudo recuperar la información del usuario.'}
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-3xl mx-auto w-full pb-8"
    >
      {/* Top Banner - Staff Data Correction Warning */}
      <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5 text-amber-900 dark:text-amber-200 flex items-start gap-3.5 shadow-sm">
        <div className="p-2 bg-amber-500/10 rounded-xl shrink-0 mt-0.5 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Aviso de Verificación de Datos
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-amber-800/90 dark:text-amber-200/90 font-medium">
            Si alguno de estos datos no es correcto o necesitas hacer alguna corrección, por favor acércate con un integrante del equipo de <strong>Staff del evento</strong> para poder realizar la actualización de tu información.
          </p>
        </div>
      </div>

      {/* Main Account Card */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/40 dark:shadow-none space-y-6">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-gray-100 pb-6 text-center sm:text-left">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-md shrink-0"
            style={{
              background: 'var(--color-acid-gradient)',
              color: 'var(--color-acid-text, #121212)'
            }}
          >
            {profile.first_name?.[0]?.toUpperCase()}{profile.last_name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-bold text-gray-900 font-syne">
                {fullName}
              </h2>
              <span
                className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: 'rgb(var(--color-acid-rgb) / 0.15)',
                  borderColor: 'rgb(var(--color-acid-rgb) / 0.3)',
                  color: 'var(--color-acid-text, #121212)'
                }}
              >
                {role}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Miembro desde {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Cherry-K-2'}
            </p>
          </div>
        </div>

        {/* Section 1: Access Credentials (ID, Username, Password) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-4 h-4" style={{ color: 'var(--color-acid)' }} />
            Credenciales de Acceso
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gafete ID */}
            <div className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-4 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-gray-500" /> ID Gafete
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(profile.short_id, 'short_id')}
                  className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  title="Copiar ID"
                >
                  {copiedField === 'short_id' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-xl font-mono font-black text-gray-900 dark:text-white tracking-widest">
                {profile.short_id}
              </p>
            </div>

            {/* Username */}
            <div className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-4 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-gray-500" /> Usuario
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(profile.username ? `@${profile.username}` : '', 'username')}
                  className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  title="Copiar Usuario"
                >
                  {copiedField === 'username' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400 truncate">
                @{profile.username || 'sin_usuario'}
              </p>
            </div>

            {/* Password */}
            <div className="bg-gray-50 dark:bg-zinc-800/50 border border-gray-200/80 dark:border-zinc-700/60 rounded-2xl p-4 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-gray-500" /> Contraseña
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    title={showPassword ? "Ocultar" : "Mostrar"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {profile.user_password && (
                    <button
                      type="button"
                      onClick={() => handleCopy(profile.user_password || '', 'user_password')}
                      className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                      title="Copiar Contraseña"
                    >
                      {copiedField === 'user_password' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-lg font-mono font-bold text-gray-900 dark:text-white truncate">
                {showPassword 
                  ? (profile.user_password || '••••••••') 
                  : '••••••••'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Registration Fields */}
        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-zinc-800">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-4 h-4 text-green-500" />
            Datos del Registro
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div className="bg-gray-50/70 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Nombre(s) y Apellidos
              </span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {fullName}
              </p>
            </div>

            {/* Grado Académico */}
            <div className="bg-gray-50/70 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-gray-400" /> Grado Académico
              </span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {profile.degree || 'No especificado'}
              </p>
            </div>

            {/* Género */}
            <div className="bg-gray-50/70 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" /> Género
              </span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {profile.gender || 'No especificado'}
              </p>
            </div>

            {/* Correo Electrónico */}
            <div className="bg-gray-50/70 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800 rounded-xl p-3.5">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> Correo Electrónico
              </span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {profile.email}
              </p>
            </div>

            {/* Teléfono */}
            <div className="bg-gray-50/70 dark:bg-zinc-800/30 border border-gray-100 dark:border-zinc-800 rounded-xl p-3.5 sm:col-span-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> Teléfono Celular
              </span>
              <p className="text-sm font-semibold font-mono text-gray-900 dark:text-white">
                {profile.phone || 'No registrado'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
