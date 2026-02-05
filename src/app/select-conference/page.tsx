'use client';

import { useConference } from '@/context/ConferenceContext';
import { useRouter } from 'next/navigation';

export default function SelectConferencePage() {
  const { availableConferences, selectConference, loading } = useConference();
  const router = useRouter();

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center text-foreground bg-background">Cargando congresos...</div>;
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-foreground text-center mb-4 font-playfair">
          Bienvenido
        </h1>
        <p className="text-muted-foreground text-center mb-12 text-lg">
          Selecciona el congreso para continuar
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableConferences.length > 0 ? (
            availableConferences.map((conf) => (
              <div 
                key={conf.id}
                onClick={() => selectConference(conf)}
                className="group bg-white rounded-xl p-6 border border-border cursor-pointer hover:border-black transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden"
              >
                {/* Decorative Accent */}
                <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <h3 className="text-xl font-bold text-foreground mb-3">{conf.title}</h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 leading-relaxed">
                  {conf.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                   <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{new Date(conf.start_date).toLocaleDateString()}</span>
                   </div>
                   <span className="text-accent-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity">Entrar &rarr;</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-12">
              <p>No hay congresos activos disponibles en este momento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
