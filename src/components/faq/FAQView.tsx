'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronRight, User, Mic, Shield, Users, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this utility exists

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    id: string;
    label: string;
    icon: React.ElementType;
    items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
    {
        id: 'users',
        label: 'Usuarios y Asistentes',
        icon: User,
        items: [
            {
                question: '¿Cómo puedo ver mi horario y mis próximos eventos?',
                answer: 'Utiliza la sección **Agenda** en el menú lateral. Aquí encontrarás todos los eventos programados organizados por fecha y hora. Puedes filtrar por tipo de evento y marcar aquellos que te interesen para realizar un seguimiento más sencillo.'
            },
            {
                question: '¿Dónde encuentro mi código QR para el registro de asistencia?',
                answer: 'Tu código QR personal se encuentra en la sección **Mi Perfil**. Este código es único y necesario para registrar tu asistencia al ingresar a los eventos. Asegúrate de tenerlo listo al llegar.'
            },
            {
                question: '¿Cómo descargo mis constancias de participación?',
                answer: 'Una vez que hayas asistido a un evento y tu asistencia haya sido registrada, podrás descargar tu constancia en la sección **Constancias**. Las constancias se generan automáticamente y estarán disponibles en formato PDF.'
            }
        ]
    },
    {
        id: 'speakers',
        label: 'Ponentes',
        icon: Mic,
        items: [
            {
                question: '¿Dónde puedo ver los eventos en los que participo?',
                answer: 'Accede a la sección **Participación** en el menú lateral (bajo "Herramientas del Ponente"). Allí se listarán todos los eventos, talleres o conferencias donde estás asignado como ponente.'
            },
            {
                question: '¿Qué hago si hay un error en la información de mi ponencia?',
                answer: 'Si detectas algún error en el título, descripción u hora de tu ponencia, por favor contacta a un administrador o miembro del staff inmediatamente para realizar las correcciones necesarias antes del evento.'
            },
            {
                question: '¿Cómo se registra la asistencia a mi ponencia?',
                answer: 'El equipo de **Staff** o los **Administradores** estarán encargados de escanear los códigos QR de los asistentes al ingreso de tu sala. Tú no necesitas realizar ninguna acción para el registro de asistencia de los participantes.'
            }
        ]
    },
    {
        id: 'admins',
        label: 'Administradores',
        icon: Shield,
        items: [
            {
                question: '¿Cómo creo un nuevo evento?',
                answer: 'Dirígete a **Gestión Eventos** en el menú lateral. Haz clic en el botón para crear un nuevo evento, completa los detalles (título, descripción, fecha, ponentes, etc.) y guarda los cambios. El evento aparecerá inmediatamente en la agenda.'
            },
            {
                question: '¿Cómo gestiono los permisos de los usuarios?',
                answer: 'En la sección **Usuarios**, puedes ver la lista completa de usuarios registrados. Desde allí, puedes asignar o modificar roles (como promover a un usuario a Staff o Ponente) y gestionar su acceso a la plataforma.'
            },
            {
                question: '¿Cómo puedo ver las métricas del evento en tiempo real?',
                answer: 'Utiliza el **Dashboard Métricas**. Esta herramienta te proporciona estadísticas actualizadas sobre el registro de usuarios, asistencia por evento, y otros datos clave para monitorear el desempeño del congreso.'
            },
            {
                question: '¿Cómo diseño y personalizo las constancias?',
                answer: 'Accede a **Diseño de Constancias**. Aquí puedes seleccionar plantillas, subir logotipos, definir las firmas y ajustar el texto que aparecerá en los certificados que se generen para los asistentes.'
            }
        ]
    },
    {
        id: 'staff',
        label: 'Staff',
        icon: Users,
        items: [
            {
                question: '¿Cuál es mi función principal en la plataforma?',
                answer: 'Tu rol principal es el apoyo en la logística y registro. Tienes acceso a herramientas específicas para verificar la asistencia de los participantes y apoyar en la organización.'
            },
            {
                question: '¿Cómo registro la asistencia de los usuarios?',
                answer: 'Usa la herramienta **Asistencia (Scanner)**. Esta función te permite activar la cámara de tu dispositivo para escanear los códigos QR de los usuarios al entrar a una sala o evento, registrando su participación automáticamente.'
            },
            {
                question: '¿Puedo ver la información de los usuarios?',
                answer: 'Sí, tienes acceso a la lista de **Usuarios** en modo lectura para verificar identidades o estados de registro, pero no puedes modificar sus roles ni información sensible a menos que se te otorguen permisos adicionales.'
            }
        ]
    }
];

export function FAQView({ defaultRole = 'users' }: { defaultRole?: string }) {
    const [selectedCategory, setSelectedCategory] = useState<string>(() => {
        // Map roles to categories
        if (defaultRole === 'ponente') return 'speakers';
        if (defaultRole === 'admin' || defaultRole === 'owner') return 'admins';
        if (defaultRole === 'staff') return 'staff';
        return 'users';
    });
    
    // Search functionality could be added here
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = FAQ_DATA.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-black uppercase tracking-tight flex items-center gap-3">
                        <HelpCircle className="w-8 h-8 text-[var(--color-acid)]" />
                        Centro de Ayuda
                    </h2>
                    <p className="text-gray-500 font-medium mt-2">
                        Respuestas a las preguntas más frecuentes sobre el uso de la plataforma.
                    </p>
                </div>
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar pregunta..." 
                        className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:border-black/20 focus:ring-4 focus:ring-gray-50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 pb-4 overflow-x-auto scrollbar-hide">
                {FAQ_DATA.map((category) => {
                    const Icon = category.icon;
                    const isSelected = selectedCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all whitespace-nowrap borderSelect",
                                isSelected 
                                    ? "bg-black text-white shadow-lg scale-105" 
                                    : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300 hover:text-black hover:bg-gray-50"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isSelected ? "text-[var(--color-acid)]" : "text-current")} />
                            {category.label}
                        </button>
                    );
                })}
            </div>

            {/* Questions List */}
            <div className="grid gap-4 max-w-4xl">
                 <AnimatePresence mode="popLayout">
                    {filteredData.filter(c => searchQuery ? true : c.id === selectedCategory).map((category) => (
                        <div key={category.id} className="space-y-4">
                            {searchQuery && (
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-8 mb-4 border-b border-gray-100 pb-2">
                                    {category.label}
                                </h3>
                            )}
                            
                            {category.items.map((item, index) => (
                                <FAQItemComponent key={index} item={item} />
                            ))}
                        </div>
                    ))}
                    
                    {filteredData.length === 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200"
                        >
                            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No se encontraron resultados para "{searchQuery}"</p>
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="mt-4 text-sm font-bold text-black border-b border-black hover:opacity-70 transition-opacity"
                            >
                                Limpiar búsqueda
                            </button>
                        </motion.div>
                    )}
                 </AnimatePresence>
            </div>
        </div>
    );
}

function FAQItemComponent({ item }: { item: FAQItem }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                "bg-white rounded-xl border transition-all duration-300 overflow-hidden",
                isOpen ? "border-[#DBF227] shadow-md ring-1 ring-[#DBF227]/50" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
            )}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left gap-4"
            >
                <span className={cn("font-bold text-lg transition-colors", isOpen ? "text-black" : "text-[#373737]")}>
                    {item.question}
                </span>
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all bg-gray-50", 
                    isOpen && "bg-[#DBF227] rotate-180"
                )}>
                    <ChevronDown className={cn("w-5 h-5 transition-colors", isOpen ? "text-black" : "text-gray-400")} />
                </div>
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-5 pb-6 pt-0">
                            <div className="h-px w-full bg-gray-100 mb-4" />
                            <div 
                                className="text-gray-600 leading-relaxed prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                    __html: item.answer.replace(/\*\*(.*?)\*\*/g, '<strong class="text-black font-bold">$1</strong>') 
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
