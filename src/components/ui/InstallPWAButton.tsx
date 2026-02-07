import { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallPWAButtonProps {
  collapsed?: boolean;
}

export function InstallPWAButton({ collapsed = false }: InstallPWAButtonProps) {
  const { isInstallable, isIOS, promptToInstall } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleClick = () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      promptToInstall();
    }
  };

  if (!isInstallable) return null;

  return (
    <>
      <button 
        type="button"
        onClick={handleClick}
        className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-left font-medium transition-all text-[#373737] bg-[#DBF227] hover:bg-[#c9df24] shadow-sm mb-2 ${
          collapsed ? 'justify-center' : ''
        }`}
        title={collapsed ? "Instalar App" : ""}
      >
        <Download className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm font-semibold truncate"
          >
            Instalar App
          </motion.span>
        )}
      </button>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSInstructions && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIOSInstructions(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-t-2xl md:rounded-2xl p-6 z-[10000] shadow-2xl w-full md:w-[400px] border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-[#373737] font-playfair">Instalar en iPhone/iPad</h3>
                <button 
                  onClick={() => setShowIOSInstructions(false)} 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-[#373737]" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-2.5 rounded-xl flex-shrink-0">
                    <Share className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#373737] mb-1">1. Toca el botón "Compartir"</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Busca el icono <Share className="inline w-3 h-3 text-blue-600"/> en la barra de navegación de Safari (inferior o superior).
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-gray-100 p-2.5 rounded-xl flex-shrink-0">
                    <PlusSquare className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#373737] mb-1">2. Selecciona "Agregar a Inicio"</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Desliza hacia abajo en el menú de opciones hasta encontrar "Agregar a Inicio".
                    </p>
                  </div>
                </div>
              </div>

               <div className="mt-8">
                  <button 
                    onClick={() => setShowIOSInstructions(false)}
                    className="w-full py-3 bg-[#1C1C1C] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors"
                  >
                    Entendido
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
