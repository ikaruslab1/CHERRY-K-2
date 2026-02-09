'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from "next/navigation";
import { useConference } from '@/context/ConferenceContext';

const features = [
  {
    title: "Certificación",
    description: "Validación segura y emisión instantánea de certificados digitales para tu comunidad."
  },
  {
    title: "Pase de Lista",
    description: "Registro de asistencia ágil y eficiente mediante lectura de códigos QR personalizados."
  },
  {
    title: "Gafete Virtual",
    description: "Identificación digital única y dinámica con acceso a beneficios exclusivos del evento."
  },
  {
    title: "Gestión de Eventos",
    description: "Control total de conferencias, talleres y actividades académicas en tiempo real."
  },
  {
    title: "Constancias",
    description: "Generación automatizada de documentos probatorios con validez oficial inmediata."
  }
];

export default function LoginPage() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [currentFeature, setCurrentFeature] = useState(0);
  const [showEventModal, setShowEventModal] = useState(false);
  const { currentConference, availableConferences, selectConference } = useConference();
  const searchParams = useSearchParams();

  useEffect(() => {
      const action = searchParams.get('action');
      if (action === 'select_event') {
          setShowEventModal(true);
      }
  }, [searchParams]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 5000); // Rotate every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Column - Rainbow Animated Gradient */}
      <div 
        className="flex order-last lg:order-first flex-col justify-between p-6 lg:p-12 text-black relative overflow-hidden min-h-[500px] lg:h-auto"
        style={{
            background: 'linear-gradient(45deg, #FFFFFF, #FFD1FF, #CCEAFF, #FFFFFF, #D1FFEA, #FFFAD1, #FFFFFF)',
            backgroundSize: '300% 300%',
            animation: 'gradient 10s ease infinite'
        }}
      >
        <style jsx>{`
            @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `}</style>

        {/* Decorative Blur Orbs */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none mix-blend-multiply opacity-50">
             <div className="absolute top-0 left-0 w-full h-full bg-white/20 backdrop-blur-3xl" />
        </div>
        
        {/* Header Segment */}
        <div className="relative z-10 space-y-6">
            <span className="text-xs font-mono uppercase tracking-widest text-gray-500">Plataforma</span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-none">
            Cherry-K-2
          </h1>
          <div className="h-1 w-24 bg-black" />
          
        </div>

        {/* Middle Segment - Rotating Information */}
        <div className="relative z-10 max-w-lg space-y-8 min-h-[180px]">
          <div className="space-y-2">
            
            <h2 className="text-4xl font-light leading-tight tracking-tight">
              Gestión Integral de<br />
              <span className="font-semibold block mt-2">Eventos Académicos</span>
            </h2>
          </div>
          
          <div className="relative pt-8 border-t border-black/5">
             <AnimatePresence mode="wait">
                <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                >
                    <span className="text-xs font-mono uppercase tracking-widest text-gray-600">
                        {features[currentFeature].title}
                    </span>
                    <p className="text-xl text-gray-800 leading-relaxed font-manrope">
                        {features[currentFeature].description}
                    </p>
                </motion.div>
             </AnimatePresence>
          </div>
        </div>

        {/* Footer Segment */}
        <div className="relative z-10 pt-12 border-t border-black/5">
          <div className="flex justify-between items-end">
             <div className="space-y-1">
                <p className="text-xs font-mono text-gray-500 uppercase">Powered by</p>
                <a 
                    href="https://torrhez.myportfolio.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold tracking-wide hover:underline decoration-1 underline-offset-4"
                >
                    Prof. Adrián Torres
                </a>
             </div>
             <p className="text-xs text-gray-500 font-mono">v2.0.0</p>
          </div>
        </div>
      </div>

      {/* Right Column - Clean White Forms */}
      <div className="relative flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 bg-white">
        
        {/* Event Selection Button */}
        <div className="w-full flex justify-end mb-6 lg:absolute lg:top-6 lg:right-6 lg:mb-0 z-20">
            <button
                onClick={() => setShowEventModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
            >
                <div className={`w-2 h-2 rounded-full ${currentConference ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                {currentConference ? (
                    "Cambiar de evento"
                ) : (
                    "Seleccionar Evento"
                )}
                <span className="text-xs text-slate-400">▼</span>
            </button>
        </div>

        <div className="w-full max-w-[420px] space-y-8 relative z-10">
            
            {/* Toggle Header */}
            <div className="flex flex-col space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-syne">
                    {view === 'login' ? 'Bienvenido de nuevo' : 'Crear nueva cuenta'}
                </h2>
                <p className="text-sm text-muted-foreground font-manrope text-gray-700 pb-4">
                    {view === 'login' 
                        ? 'Ingresa tu ID de acceso para continuar' 
                        : 'Completa tus datos para generar tu ID digital'}
                </p>
                {/* Show active event in form header too if valid */}
                {/* Elegant Badge */}
                {currentConference && (
                    <div className="flex justify-center mb-6">
                        <button 
                            onClick={() => setShowEventModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-100 bg-gray-50/50 backdrop-blur-sm hover:bg-gray-100 transition-colors cursor-pointer group"
                        >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-md font-mono font-medium text-gray-500 uppercase tracking-widest group-hover:text-gray-700 transition-colors">
                                {currentConference.title}
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Form Container */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {view === 'login' ? <LoginForm /> : <RegisterForm />}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Toggle Footer */}
            <div className="text-center font-manrope text-sm">
                {view === 'login' ? (
                    <p className="text-gray-500">
                        ¿Aún no tienes cuenta?{' '}
                        <button 
                            onClick={() => setView('register')}
                            className="font-bold text-slate-600 hover:text-blue-500 hover:underline transition-all"
                        >
                            Regístrate aquí
                        </button>
                    </p>
                ) : (
                    <p className="text-gray-500">
                        ¿Ya tienes tu ID?{' '}
                        <button 
                            onClick={() => setView('login')}
                            className="font-bold text-blue-600 hover:text-blue-500 hover:underline transition-all"
                        >
                            Inicia sesión
                        </button>
                    </p>
                )}
            </div>

        </div>
      </div>

      {/* Event Selection Modal */}
      <AnimatePresence>
          {showEventModal && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  onClick={() => setShowEventModal(false)}
              >
                  <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
                  >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 font-syne">Seleccionar Evento</h3>
                                <p className="text-sm text-gray-500">Elige el evento al que deseas ingresar</p>
                            </div>
                            <button 
                                onClick={() => setShowEventModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                             {availableConferences.map((conf) => (
                                 <button
                                    key={conf.id}
                                    onClick={() => {
                                        selectConference(conf, `/login?event=${conf.id}`);
                                        setShowEventModal(false);
                                    }}
                                    className={`text-left p-4 rounded-xl border transition-all hover:shadow-md relative overflow-hidden group ${
                                        currentConference?.id === conf.id 
                                        ? 'border-blue-500 bg-blue-50/50' 
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                 >
                                      <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${
                                          currentConference?.id === conf.id ? 'bg-blue-500' : 'bg-transparent group-hover:bg-gray-300'
                                      }`} />
                                      
                                      <h4 className={`font-bold font-syne mb-1 ${
                                          currentConference?.id === conf.id ? 'text-blue-700' : 'text-gray-900'
                                      }`}>
                                          {conf.title}
                                      </h4>
                                      <p className="text-xs text-gray-500 line-clamp-2 font-manrope mb-3">
                                          {conf.description}
                                      </p>
                                      
                                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono uppercase">
                                          <span>{new Date(conf.start_date).toLocaleDateString()}</span>
                                          {currentConference?.id === conf.id && (
                                              <span className="ml-auto text-blue-600 font-bold bg-white px-2 py-0.5 rounded-full shadow-sm">Activo</span>
                                          )}
                                      </div>
                                 </button>
                             ))}
                             
                             {availableConferences.length === 0 && (
                                 <div className="col-span-full py-8 text-center text-gray-400">
                                     No hay eventos disponibles
                                 </div>
                             )}
                        </div>
                  </motion.div>
              </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

