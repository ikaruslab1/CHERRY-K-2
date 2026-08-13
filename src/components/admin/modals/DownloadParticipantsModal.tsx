'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Download, FileJson, Table, Loader2, CheckCircle, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Conference, ConferenceLandingConfig } from '@/types';
import { getConferenceReportData } from '@/actions/reports';

interface DownloadParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conference: Conference;
}

export function DownloadParticipantsModal({ isOpen, onClose, conference }: DownloadParticipantsModalProps) {
  const [dbType, setDbType] = useState<'organizers' | 'users'>('users');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  // Selection state
  const [fields, setFields] = useState({
    nombre: true,
    apellidos: true,
    grado: true,
    genero: true,
    email: true,
    confirmEmail: true,
    telefono: true,
    actividadesAsistidas: true,
    actividadesInteresadas: true,
    constanciaGeneral: true,
  });

  // Custom fields from landing config
  const [customFields, setCustomFields] = useState<Record<string, boolean>>({});
  
  const authBlock = conference.conference_landing_config?.blocks?.find(b => b.type === 'auth');
  const customInputs = (authBlock?.content?.custom_inputs || []) as any[];
  const showCustomFields = conference.custom_landing_enabled && customInputs.length > 0;

  useEffect(() => {
    if (showCustomFields) {
      const initialCustomFields: Record<string, boolean> = {};
      customInputs.forEach(input => {
        initialCustomFields[input.id] = true;
      });
      setCustomFields(initialCustomFields);
    }
  }, [showCustomFields, customInputs]);



  const toggleField = (key: keyof typeof fields) => {
    setFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCustomField = (id: string) => {
    setCustomFields(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownload = async (format: 'csv' | 'json' | 'bjson') => {
    setDownloading(true);
    try {
      const result = await getConferenceReportData(conference.id, dbType);
      if (!result.success || !result.data) {
        alert("Error al obtener datos: " + result.error);
        return;
      }

      const users = result.data;
      const threshold = conference.global_certificate_threshold || 1;

      // Extract raw data
      const dataToExport = users.map(user => {
        const row: any = {};
        if (fields.nombre) row['Nombre'] = user.first_name;
        if (fields.apellidos) row['Apellidos'] = user.last_name;
        if (fields.grado) row['Grado Académico'] = user.degree;
        if (fields.genero) row['Género'] = user.gender;
        if (fields.email) row['Email'] = user.email;
        if (fields.confirmEmail) row['Confirmar Email'] = user.email;
        if (fields.telefono) row['Teléfono'] = user.phone;
        
        // Custom fields
        if (showCustomFields) {
            customInputs.forEach(input => {
                if (customFields[input.id]) {
                    row[input.label] = user.custom_data?.[input.id] || '';
                }
            });
        }

        if (fields.actividadesAsistidas) row['Actividades Asistidas'] = user.asistencias.join(', ');
        if (fields.actividadesInteresadas) row['Actividades interesadas'] = user.intereses.join(', ');
        if (fields.constanciaGeneral) {
            const hasCert = user.asistencias.length >= threshold;
            row['Constancia General'] = hasCert ? 'SÍ' : 'NO';
        }

        return row;
      });

      if (format === 'json' || format === 'bjson') {
        const jsonData = format === 'bjson' ? JSON.stringify(dataToExport) : JSON.stringify(dataToExport, null, 2);
        const ext = format === 'bjson' ? 'bjson' : 'json';
        const blob = new Blob([jsonData], { type: 'application/json' });
        triggerDownload(blob, `reporte_${dbType}_${conference.title.replace(/\s+/g, '_')}.${ext}`);
      } else {
        // CSV
        const headers = Object.keys(dataToExport[0] || {});
        if (headers.length === 0) {
            alert("No hay campos seleccionados para exportar.");
            return;
        }
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        // Add UTF-8 BOM
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(blob, `reporte_${dbType}_${conference.title.replace(/\s+/g, '_')}.csv`);
      }
    } catch (err) {
      console.error(err);
      alert("Error en la descarga.");
    } finally {
      setDownloading(false);
    }
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]"
          >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-xl shadow-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--color-acid)', 
                color: 'var(--color-acid-text)',
                boxShadow: '0 10px 15px -3px rgb(var(--color-acid-rgb) / 0.2)'
              }}
            >
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Descargar Base de Datos</h3>
              <p className="text-xs text-gray-500 font-medium">Exportación de participantes y organizadores.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Section 1: DB Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4 text-gray-400" />
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Base de Datos</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDbType('organizers')}
                className={`p-4 rounded-2xl border-2 transition-colors flex flex-col items-center gap-2 ${dbType === 'organizers' ? 'border-[var(--color-acid)] bg-[rgb(var(--color-acid-rgb)/0.15)] text-black shadow-none' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
               >
                 <span className="font-bold text-sm">Organizadores</span>
                 <span className="text-[10px] opacity-60">Admin, Staff, Propietarios</span>
               </motion.button>
               <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDbType('users')}
                className={`p-4 rounded-2xl border-2 transition-colors flex flex-col items-center gap-2 ${dbType === 'users' ? 'border-[var(--color-acid)] bg-[rgb(var(--color-acid-rgb)/0.15)] text-black shadow-none' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
               >
                 <span className="font-bold text-sm">Participantes</span>
                 <span className="text-[10px] opacity-60">Asistentes, Ponentes, VIP</span>
               </motion.button>
            </div>
          </div>

          {/* Section 2: Fields Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-gray-400" />
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Campos a incluir</label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
               {[
                 { id: 'shortId', label: 'ID Corto' },
                 { id: 'grado', label: 'Grado' },
                 { id: 'nombre', label: 'Nombre Completo' },
                 { id: 'rol', label: 'Rol' },
                 { id: 'email', label: 'Email' },
                 { id: 'confirmEmail', label: 'Confirmar Email' },
                 { id: 'telefono', label: 'Teléfono' },
                 { id: 'actividadesAsistidas', label: 'Actividades Asistidas' },
                 { id: 'actividadesInteresadas', label: 'Actividades Interesadas' },
               ].map(f => (
                 <motion.button
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.95 }}
                   key={f.id}
                   onClick={() => toggleField(f.id as any)}
                   className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${fields[f.id as keyof typeof fields] ? 'bg-[rgb(var(--color-acid-rgb)/0.15)] border-[var(--color-acid)] text-black' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                 >
                   <div className={`w-4 h-4 rounded border flex items-center justify-center ${fields[f.id as keyof typeof fields] ? 'bg-[var(--color-acid)] border-[var(--color-acid)]' : 'border-gray-300'}`}>
                     {fields[f.id as keyof typeof fields] && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-black/80" />}
                   </div>
                   <span className="text-[11px] font-bold uppercase tracking-tight">{f.label}</span>
                 </motion.button>
               ))}

               {/* Conditional Field: General Certificate */}
               {conference.gives_global_certificate && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleField('constanciaGeneral')}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${fields.constanciaGeneral ? 'bg-[rgb(var(--color-acid-rgb)/0.15)] border-[var(--color-acid)] text-black' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${fields.constanciaGeneral ? 'bg-[var(--color-acid)] border-[var(--color-acid)]' : 'border-gray-300'}`}>
                      {fields.constanciaGeneral && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-black/80" />}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-tight">Constancia General</span>
                  </motion.button>
               )}

               {/* Custom Fields */}
               {showCustomFields && customInputs.map(input => (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    key={input.id}
                    onClick={() => toggleCustomField(input.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${customFields[input.id] ? 'bg-[rgb(var(--color-acid-rgb)/0.15)] border-[var(--color-acid)] text-black' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${customFields[input.id] ? 'bg-[var(--color-acid)] border-[var(--color-acid)]' : 'border-gray-300'}`}>
                      {customFields[input.id] && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-black/80" />}
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-tight truncate" title={input.label}>{input.label}</span>
                  </motion.button>
               ))}
            </div>
          </div>

          {/* Section 3: Export Format */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Table className="h-4 w-4 text-gray-400" />
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Formato de Exportación</label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => handleDownload('json')} 
                  disabled={downloading}
                  variant="outline"
                  className="w-full h-14 bg-white border-gray-200 text-gray-800 hover:bg-gray-50 gap-3 rounded-2xl shadow-sm"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileJson className="h-4 w-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-bold leading-none">JSON</p>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">Crudo</p>
                  </div>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => handleDownload('bjson')} 
                  disabled={downloading}
                  variant="outline"
                  className="w-full h-14 bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-3 rounded-2xl shadow-sm"
                >
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <FileJson className="h-4 w-4" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-bold leading-none">BJSON</p>
                    <p className="text-[10px] opacity-70 mt-1 truncate">Formato IA</p>
                  </div>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => handleDownload('csv')} 
                  disabled={downloading}
                  className="w-full h-14 bg-gray-900 text-white hover:bg-black gap-3 rounded-2xl shadow-lg border-2 border-[var(--color-acid)]"
                >
                  <div className="p-2 bg-white/10 rounded-lg">
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Table className="h-4 w-4" />}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-xs font-bold leading-none">CSV</p>
                    <p className="text-[10px] text-white/50 mt-1 truncate">Excel / BOM</p>
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
}
