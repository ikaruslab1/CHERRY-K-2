"use client";

import { Conference } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface HomeClientViewProps {
  initialConferences: Conference[];
}

export default function HomeClientView({ initialConferences }: HomeClientViewProps) {
  const router = useRouter();

  // If there's only one active conference, we might want to default to it or something similar,
  // but for now, let's just show the list.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground animate-in fade-in duration-500">
      <main className="w-full max-w-5xl flex flex-col items-center gap-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600 font-syne">
            Cherry-K
          </h1>
          <p className="text-xl text-muted-foreground font-manrope max-w-2xl mx-auto">
            Plataforma Integral de Gestión de Eventos y Certificados
          </p>
        </div>

        <div className="w-full grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {initialConferences.length > 0 ? (
            initialConferences.map((conf) => (
              <div 
                key={conf.id} 
                className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md cursor-pointer bg-white/5 backdrop-blur-sm border-white/10"
                  onClick={() => {
                     // Navigate to login with event context
                     router.push(`/login?event=${conf.id}`); 
                  }}
              >
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold font-syne group-hover:text-blue-600 transition-colors">
                      {conf.title}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 font-manrope">
                      {conf.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-auto pt-4 border-t border-border/50">
                    <span className="px-2 py-1 rounded-full bg-blue-100/10 text-blue-600 dark:text-blue-400">
                      {new Date(conf.start_date).toLocaleDateString()}
                    </span>
                    <span>-</span>
                    <span className="px-2 py-1 rounded-full bg-violet-100/10 text-violet-600 dark:text-violet-400">
                      {new Date(conf.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-12 text-muted-foreground">
              <p>No hay eventos activos en este momento.</p>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8">
            <button 
                onClick={() => router.push('/login')}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity bg-black text-white dark:bg-white dark:text-black"
            >
                Iniciar Sesión
            </button>
        </div>
      </main>
      
      <footer className="mt-16 text-sm text-muted-foreground font-manrope">
        © {new Date().getFullYear()} Cherry-K. Todos los derechos reservados.
      </footer>
    </div>
  );
}
