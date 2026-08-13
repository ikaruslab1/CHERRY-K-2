'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useConference } from '@/context/ConferenceContext';
import { RegistrationEmailConfig } from '@/types';
import { DEFAULT_REGISTRATION_EMAIL_CONFIG } from '@/constants/email';
import { EmailEditorSidebar } from './EmailEditorSidebar';
import { EmailPreview } from './EmailPreview';
import { DesktopRequiredWarning } from '@/components/ui/DesktopRequiredWarning';
import { sendTestRegistrationEmailAction } from '@/actions/email';
import { AgendaEventItem } from '@/lib/emailCompiler';
import { 
  Mail, 
  Save, 
  Send, 
  RotateCcw, 
  Loader2, 
  Check, 
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function EmailEditor() {
  const { currentConference, refreshConference } = useConference();
  const [config, setConfig] = useState<RegistrationEmailConfig>(DEFAULT_REGISTRATION_EMAIL_CONFIG);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [agendaEvents, setAgendaEvents] = useState<AgendaEventItem[]>([]);
  const [testEmailModal, setTestEmailModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');

  // Load conference configuration & agenda events
  useEffect(() => {
    async function loadData() {
      if (!currentConference) return;

      // 1. Set Config
      if (currentConference.registration_email_config) {
        setConfig({
          ...DEFAULT_REGISTRATION_EMAIL_CONFIG,
          ...(currentConference.registration_email_config as RegistrationEmailConfig),
        });
      } else {
        setConfig(DEFAULT_REGISTRATION_EMAIL_CONFIG);
      }

      setEnabled(currentConference.custom_email_enabled ?? true);

      // 2. Fetch agenda events for event selector
      try {
        const { data: events } = await supabase
          .from('events')
          .select('id, title, description, date, start_time, end_time, location, type')
          .eq('conference_id', currentConference.id)
          .order('date', { ascending: true });

        setAgendaEvents((events as AgendaEventItem[]) || []);
      } catch (err) {
        console.error('Error fetching conference events for email editor:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentConference]);

  // Extract dynamic reactive accent color
  const accentColor = (() => {
    if (!currentConference?.accent_color) return '#d9383a';
    if (typeof currentConference.accent_color === 'string') return currentConference.accent_color;
    return currentConference.accent_color.value || '#d9383a';
  })();

  const handleSave = async () => {
    if (!currentConference) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('conferences')
        .update({
          registration_email_config: config,
          custom_email_enabled: enabled,
        })
        .eq('id', currentConference.id);

      if (error) throw error;

      await refreshConference();
      alert('Configuración de correo de registro guardada correctamente.');
    } catch (err: any) {
      console.error('Error saving email template config:', err);
      alert(`Error al guardar la configuración: ${err?.message || 'Error de base de datos'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (confirm('¿Estás seguro de restablecer el diseño del correo a la plantilla original? Perderás los cambios no guardados.')) {
      setConfig(DEFAULT_REGISTRATION_EMAIL_CONFIG);
    }
  };

  const handleSendTestEmail = async () => {
    setSendingTest(true);
    try {
      const res = await sendTestRegistrationEmailAction({
        config,
        conferenceId: currentConference?.id,
        recipientEmail: testRecipient.trim() || undefined,
      });

      if (res.success) {
        alert('¡Correo de prueba enviado correctamente! Revisa tu bandeja de entrada.');
        setTestEmailModal(false);
      } else {
        alert(`No se pudo enviar el correo de prueba: ${res.error}`);
      }
    } catch (err: any) {
      console.error('Error sending test email:', err);
      alert('Error inesperado al enviar el correo de prueba.');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-white dark:bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden relative">
      {/* Mobile Guard Warning */}
      <DesktopRequiredWarning
        title="Editor de Correos de Registro"
        description="El panel de personalización de correo de registro requiere una pantalla más amplia para editar fuentes, insertar placeholders, seleccionar eventos de la agenda y ver la vista previa en tiempo real."
        recommendedResolution="1280px+ (Escritorio)"
      />

      {/* Top Action Header Bar */}
      <div className="h-16 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-6 flex items-center justify-between z-20 shadow-sm">
        {/* Title & Global Accent Branding */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: accentColor }}
          >
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <span>Personalización de Correo de Registro</span>
              <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase">
                Admin & Owner
              </span>
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Personaliza el formato, la agenda y las credenciales enviadas automáticamente al registrarse.
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Custom Email Active Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Correo Personalizado
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
            </label>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-zinc-800 rounded-xl transition-all hover:bg-gray-200 cursor-pointer"
            title="Restablecer plantilla a los valores originales"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>

          {/* Send Test Email Modal Trigger */}
          <button
            onClick={() => setTestEmailModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl transition-all cursor-pointer border border-gray-200 dark:border-zinc-700"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Probar Envíos</span>
          </button>

          {/* Save Action Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: accentColor }}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Sidebar + Live Preview) */}
      <div className="flex-1 flex overflow-hidden">
        <EmailEditorSidebar
          config={config}
          onChange={setConfig}
          agendaEvents={agendaEvents}
          accentColor={accentColor}
        />
        <div className="flex-1 overflow-hidden">
          <EmailPreview
            config={config}
            agendaEvents={agendaEvents}
            accentColor={accentColor}
            conferenceTitle={currentConference?.title}
            institutionName={currentConference?.institution_name}
          />
        </div>
      </div>

      {/* Test Email Modal */}
      {testEmailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" />
                <span>Enviar Correo de Prueba</span>
              </h3>
              <button
                onClick={() => setTestEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Enviaremos una muestra real de este correo con datos de demostración a tu casilla de correo electrónico o al destinatario que especifiques.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Correo de Destino
              </label>
              <input
                type="email"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                placeholder="Dejar en blanco para usar tu email de sesión"
                className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setTestEmailModal(false)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={sendingTest}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-black dark:bg-white dark:text-black rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {sendingTest ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{sendingTest ? 'Enviando...' : 'Enviar Prueba'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
