import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { UserProfile } from '@/types';

interface SpeakerSelectorProps {
    users: UserProfile[];
    selectedSpeakerId: string | null;
    onSelect: (id: string) => void;
}

export function SpeakerSelector({ users, selectedSpeakerId, onSelect }: SpeakerSelectorProps) {
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

    const selectedUser = users.find(u => u.id === selectedSpeakerId);
    
    // Derived state for display
    const displayValue = isSpeakerOpen 
        ? speakerSearch 
        : (selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : '');

    const filteredUsers = (() => {
        const lowerQuery = speakerSearch.toLowerCase();
        return users.filter(u => 
            `${u.first_name} ${u.last_name}`.toLowerCase().includes(lowerQuery) || 
            u.email?.toLowerCase().includes(lowerQuery)
        );
    })();

    const ponentes = filteredUsers.filter(u => u.role === 'ponente');
    const others = filteredUsers.filter(u => u.role !== 'ponente');

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            <label className="text-sm font-bold text-[#373737]">Ponente:</label>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        value={displayValue}
                        placeholder="Buscar ponente..."
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-[#373737] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DBF227] focus:border-transparent bg-gray-50/50 transition-all"
                        onFocus={() => {
                            setSpeakerSearch(selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : '');
                            setIsSpeakerOpen(true);
                        }}
                        onChange={(e) => {
                            setSpeakerSearch(e.target.value);
                            setIsSpeakerOpen(true);
                        }}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {selectedSpeakerId && (
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSelect('');
                                    setSpeakerSearch('');
                                }}
                                className="p-1 hover:bg-gray-200 rounded-full text-gray-400"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isSpeakerOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>

                {isSpeakerOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-400">No se encontraron usuarios.</div>
                        ) : (
                            <div className="py-2">
                                {ponentes.length > 0 && (
                                    <div>
                                        <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0 backdrop-blur-sm">Ponentes</div>
                                        {ponentes.map(user => (
                                            <div 
                                                key={user.id}
                                                onMouseDown={() => {
                                                    onSelect(user.id);
                                                    setSpeakerSearch('');
                                                    setIsSpeakerOpen(false);
                                                }}
                                                className={`px-4 py-3 hover:bg-[#DBF227]/10 cursor-pointer flex items-center justify-between group transition-colors ${selectedSpeakerId === user.id ? 'bg-[#DBF227]/5' : ''}`}
                                            >
                                                <div>
                                                    <div className="font-bold text-[#373737] text-sm group-hover:text-black">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs text-gray-400">{user.email}</div>
                                                </div>
                                                {selectedSpeakerId === user.id && <Check className="h-4 w-4 text-[#aacc00]" />}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {ponentes.length > 0 && others.length > 0 && (
                                    <div className="h-px bg-gray-100 my-2 mx-4" />
                                )}

                                {others.length > 0 && (
                                    <div>
                                        {ponentes.length > 0 && <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 sticky top-0 backdrop-blur-sm">Otros Asistentes</div>}
                                        {others.map(user => (
                                            <div 
                                                key={user.id}
                                                onMouseDown={() => {
                                                    onSelect(user.id);
                                                    setSpeakerSearch('');
                                                    setIsSpeakerOpen(false);
                                                }}
                                                className={`px-4 py-3 hover:bg-[#DBF227]/10 cursor-pointer flex items-center justify-between group transition-colors ${selectedSpeakerId === user.id ? 'bg-[#DBF227]/5' : ''}`}
                                            >
                                                <div>
                                                    <div className="font-bold text-[#373737] text-sm group-hover:text-black">{user.first_name} {user.last_name}</div>
                                                    <div className="text-xs text-gray-400">{user.email}</div>
                                                </div>
                                                {selectedSpeakerId === user.id && <Check className="h-4 w-4 text-[#aacc00]" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
