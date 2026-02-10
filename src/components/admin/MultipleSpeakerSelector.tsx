import { useState, useRef, useEffect } from 'react';
import { Search, X, UserPlus, Users } from 'lucide-react';
import { UserProfile } from '@/types';

interface MultipleSpeakerSelectorProps {
    users: UserProfile[];
    selectedSpeakerIds: string[];
    onSelect: (ids: string[]) => void;
    maxSpeakers?: number;
}

export function MultipleSpeakerSelector({ 
    users, 
    selectedSpeakerIds, 
    onSelect,
    maxSpeakers = 10 
}: MultipleSpeakerSelectorProps) {
    const [speakerSearch, setSpeakerSearch] = useState('');
    const [isSpeakerOpen, setIsSpeakerOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsSpeakerOpen(false);
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const selectedUsers = users.filter(u => selectedSpeakerIds.includes(u.id));

    const filteredUsers = (() => {
        const lowerQuery = speakerSearch.toLowerCase();
        return users.filter(u => 
            !selectedSpeakerIds.includes(u.id) && (
                `${u.first_name} ${u.last_name}`.toLowerCase().includes(lowerQuery) || 
                u.email?.toLowerCase().includes(lowerQuery)
            )
        );
    })();

    const ponentes = filteredUsers.filter(u => u.role === 'ponente');
    const others = filteredUsers.filter(u => u.role !== 'ponente');

    const toggleSpeaker = (userId: string) => {
        if (selectedSpeakerIds.includes(userId)) {
            onSelect(selectedSpeakerIds.filter(id => id !== userId));
        } else {
            if (selectedSpeakerIds.length < maxSpeakers) {
                onSelect([...selectedSpeakerIds, userId]);
            }
        }
    };

    const removeSpeaker = (userId: string) => {
        onSelect(selectedSpeakerIds.filter(id => id !== userId));
    };

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            <label className="text-sm font-bold text-[#373737] flex items-center gap-2">
                <Users className="h-4 w-4" />
                Ponentes ({selectedSpeakerIds.length}/{maxSpeakers}):
            </label>
            
            {/* Selected Speakers - Compact Grid */}
            {selectedUsers.length > 0 && (
                <div className="p-3 bg-[#DBF227]/5 rounded-xl border border-[#DBF227]/20">
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {selectedUsers.map((user, index) => (
                            <div 
                                key={user.id}
                                className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs group hover:border-[#DBF227]/50 transition-all animate-in zoom-in-95 duration-200"
                            >
                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <span className="text-[10px] font-bold text-gray-400 shrink-0">#{index + 1}</span>
                                    <span className="font-semibold text-[#373737] truncate">
                                        {user.first_name} {user.last_name}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeSpeaker(user.id)}
                                    className="text-gray-300 hover:text-red-500 transition-colors shrink-0 p-0.5"
                                    title="Eliminar ponente"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {selectedUsers.length >= 5 && (
                        <p className="text-[10px] text-gray-400 mt-2 italic">
                            Tip: Puedes hacer scroll si hay muchos ponentes
                        </p>
                    )}
                </div>
            )}

            {/* Search Input */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        value={speakerSearch}
                        placeholder={selectedSpeakerIds.length >= maxSpeakers ? `Máximo ${maxSpeakers} ponentes` : "Buscar y agregar ponente..."}
                        disabled={selectedSpeakerIds.length >= maxSpeakers}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-[#373737] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent bg-gray-50/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        onFocus={() => {
                            if (selectedSpeakerIds.length < maxSpeakers) {
                                setIsSpeakerOpen(true);
                            }
                        }}
                        onChange={(e) => {
                            setSpeakerSearch(e.target.value);
                            setIsSpeakerOpen(true);
                        }}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <UserPlus className={`h-4 w-4 transition-colors ${isSpeakerOpen ? 'text-[#aacc00]' : 'text-gray-400'}`} />
                    </div>
                </div>

                {/* Dropdown */}
                {isSpeakerOpen && selectedSpeakerIds.length < maxSpeakers && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-400">
                                {speakerSearch ? 'No se encontraron usuarios.' : 'Todos los usuarios ya están agregados.'}
                            </div>
                        ) : (
                            <div className="py-2">
                                {ponentes.length > 0 && (
                                    <div>
                                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0 border-b border-gray-100">Ponentes</div>
                                        {ponentes.map(user => (
                                            <div 
                                                key={user.id}
                                                onMouseDown={() => {
                                                    toggleSpeaker(user.id);
                                                    setSpeakerSearch('');
                                                }}
                                                className="px-4 py-3 hover:bg-[#DBF227]/10 cursor-pointer flex items-center justify-between group transition-colors"
                                            >
                                                <div>
                                                    <div className="font-bold text-[#373737] text-sm group-hover:text-black">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {ponentes.length > 0 && others.length > 0 && (
                                    <div className="h-px bg-gray-100 my-2 mx-4" />
                                )}

                                {others.length > 0 && (
                                    <div>
                                        {ponentes.length > 0 && <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0 border-b border-gray-100">Otros Asistentes</div>}
                                        {others.map(user => (
                                            <div 
                                                key={user.id}
                                                onMouseDown={() => {
                                                    toggleSpeaker(user.id);
                                                    setSpeakerSearch('');
                                                }}
                                                className="px-4 py-3 hover:bg-[#DBF227]/10 cursor-pointer flex items-center justify-between group transition-colors"
                                            >
                                                <div>
                                                    <div className="font-bold text-[#373737] text-sm group-hover:text-black">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs text-gray-400">{user.email}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-400">
                Puedes agregar hasta {maxSpeakers} ponentes. Todos recibirán constancia por presidir el evento.
            </p>
        </div>
    );
}
