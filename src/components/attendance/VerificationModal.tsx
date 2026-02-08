import { IParticipant } from '@/services/attendanceService';
import { Button } from '@/components/ui/Button';
import NextImage from 'next/image';
import { Loader2, CheckCircle, XCircle, User, Award } from 'lucide-react';

interface VerificationModalProps {
    isOpen: boolean;
    participant: IParticipant | null;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function VerificationModal({ isOpen, participant, isLoading, onConfirm, onCancel }: VerificationModalProps) {
    if (!isOpen || !participant) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl xs:rounded-[2rem] shadow-2xl w-full max-w-sm xs:max-w-md md:max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                
                {/* Header Profile Image / Initials */}
                <div className="bg-[#DBF227] p-8 flex flex-col items-center justify-center pt-10 pb-12 relative overflow-hidden">
                     {/* Decorative background */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] opacity-30" />
                    
                    <div className="h-24 w-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-bold text-[#373737] z-10 relative">
                        {participant.avatar_url ? (
                            <div className="relative h-full w-full rounded-full overflow-hidden">
                                <NextImage 
                                    src={participant.avatar_url} 
                                    alt="Profile" 
                                    fill
                                    className="object-cover"
                                    sizes="96px"
                                />
                            </div>
                        ) : (
                            <span>{participant.first_name?.[0]}{participant.last_name?.[0]}</span>
                        )}
                        
                        <div className="absolute -bottom-2 -right-2 bg-[#373737] text-white p-1.5 rounded-full border-2 border-white">
                             <User className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 -mt-8 relative z-20 bg-white rounded-t-3xl text-center space-y-4">
                    
                    <div>
                        <h2 className="text-2xl font-black text-[#373737] leading-tight">
                            {participant.first_name} {participant.last_name}
                        </h2>
                        <div className="flex items-center justify-center gap-2 mt-1 text-gray-500 font-mono text-sm">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs tracking-wider">{participant.short_id}</span>
                            <span>•</span>
                            <span className="text-[#373737] font-semibold">{participant.degree}</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                         <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                participant.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                                participant.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {participant.role}
                            </span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-[#373737] font-medium">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Elegible para asistencia</span>
                         </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#373737] h-12 rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 h-12 rounded-xl font-bold text-[#373737] transition-all ${
                                isLoading ? 'bg-gray-200 cursor-not-allowed' : 'bg-[#DBF227] hover:bg-[#d4e626] hover:shadow-lg hover:shadow-[#DBF227]/20 hover:-translate-y-0.5'
                            }`}
                        >
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirmar'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
