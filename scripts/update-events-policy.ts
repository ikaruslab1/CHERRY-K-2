/**
 * Script para actualizar la política RLS de la tabla events
 * Permite acceso público de lectura en lugar de solo usuarios autenticados
 */

import { createClient } from '@supabase/supabase-js';

// Crear cliente con service role key para realizar operaciones admin
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function updateEventsPolicy() {
  try {
    console.log('🔄 Actualizando política RLS de la tabla events...');
    
    // Primero eliminar la política antigua
    const { error: dropError } = await supabase.rpc('drop_policy_if_exists', {
      policy_name: 'Events public read',
      table_name: 'events'
    });
    
    if (dropError && !dropError.message.includes('does not exist')) {
      console.warn('⚠️  Advertencia al eliminar política:', dropError.message);
    }
    
    // Ejecutar SQL directamente
    const sql = `
      DROP POLICY IF EXISTS "Events public read" ON events;
      CREATE POLICY "Events public read" ON events FOR SELECT USING (true);
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Política actualizada correctamente');
    console.log('📝 Los eventos ahora son accesibles públicamente (lectura)');
    
  } catch (error) {
    console.error('❌ Error al actualizar política:', error);
    throw error;
  }
}

updateEventsPolicy()
  .then(() => {
    console.log('🎉 Migración completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migración falló:', error);
    process.exit(1);
  });
