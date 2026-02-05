'use client';

import { useState, Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { LoginForm } from '@/components/auth/LoginForm';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useConference } from '@/context/ConferenceContext';
import { ChevronRight, Calendar, ChevronLeft } from 'lucide-react';
import { Conference } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('login');
  const { currentConference, selectConference, availableConferences, loading: confLoading } = useConference(); // Fix: destructure loading as confLoading

  if (confLoading) {
     return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-[#373737]">Cargando...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-12 px-4 xs:px-6 sm:px-8 md:p-12 relative bg-gray-50 overflow-x-hidden">
      
      <div className="w-full xs:max-w-md sm:max-w-md md:max-w-lg space-y-8 xs:space-y-10 z-10 my-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3 xs:space-y-4"
        >
            <h1 className="text-4xl xs:text-5xl md:text-6xl font-extrabold tracking-tight text-[#373737] leading-tight">
                Bienvenido <br/> de vuelta
            </h1>
            <p className="text-gray-400 text-base xs:text-lg md:text-xl">
               {currentConference ? (
                  <>Accediendo a: <span className="font-semibold text-gray-600 block">{currentConference.title}</span></>
               ) : (
                  "Selecciona un congreso para continuar"
               )}
            </p>
        </motion.div>

        {!currentConference ? (
           /* Conference Selector Mode */
           <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
           >
              {availableConferences.length > 0 ? (
                 availableConferences.map((conf) => (
                    <div 
                      key={conf.id}
                      onClick={() => selectConference(conf)}
                      className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:border-[#DBF227] hover:shadow-md transition-all flex items-center justify-between"
                    >
                       <div>
                          <h3 className="font-bold text-lg text-[#373737]">{conf.title}</h3>
                          <p className="text-sm text-gray-400 line-clamp-1">{conf.description}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-300 mt-1">
                             <Calendar className="h-3 w-3" />
                             <span>{new Date(conf.start_date).toLocaleDateString()}</span>
                          </div>
                       </div>
                       <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#DBF227] transition-colors" />
                    </div>
                 ))
              ) : (
                  <div className="text-center text-gray-400 p-4 border border-dashed rounded-xl">
                     No hay congresos activos disponibles.
                  </div>
              )}
           </motion.div>
        ) : (
           /* Login/Register Mode */
           <>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative grid grid-cols-2 bg-gray-100 p-1 rounded-2xl w-full max-w-[300px] mx-auto border border-gray-200"
              >
                  {/* Sliding Background Pill */}
                  <motion.div 
                      className="absolute top-1 bottom-1 bg-white shadow-sm rounded-xl ring-1 ring-black/5"
                      layout
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{
                          left: activeTab === 'login' ? '4px' : '50%',
                          right: activeTab === 'login' ? '50%' : '4px'
                      }}
                  />

                  <button
                      onClick={() => setActiveTab('login')}
                      className={cn(
                          "relative z-10 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200",
                          activeTab === 'login' ? "text-[#373737]" : "text-gray-500 hover:text-[#373737]"
                      )}
                  >
                      Ingresar
                  </button>
                  <button
                      onClick={() => setActiveTab('register')}
                      className={cn(
                          "relative z-10 px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200",
                          activeTab === 'register' ? "text-[#373737]" : "text-gray-500 hover:text-[#373737]"
                      )}
                  >
                      Registrarse
                  </button>
              </motion.div>

              <div className="relative min-h-[400px] overflow-visible">
                  <AnimatePresence mode="wait" initial={false}>
                      {activeTab === 'login' ? (
                          <motion.div
                              key="login"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3 }}
                              className="w-full"
                          >
                              <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full" /></div>}>
                                  <LoginForm />
                              </Suspense>
                          </motion.div>
                      ) : (
                          <motion.div
                              key="register"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="w-full"
                          >
                               <RegisterForm />
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>

               {/* Change Congress Option */}
               <div className="text-center mt-6">
                  <button 
                     onClick={() => {
                        localStorage.removeItem('conference_id');
                        window.location.reload(); 
                     }}
                     className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 hover:text-[#373737] hover:border-gray-300 hover:shadow-md transition-all active:scale-95"
                  >
                     <ChevronLeft className="w-4 h-4" />
                     Cambiar de actividad
                  </button>
               </div>
           </>
        )}
      </div>
    </main>
  );
}

