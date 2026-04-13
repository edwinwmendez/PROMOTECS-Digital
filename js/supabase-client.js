// Inicialización del cliente Supabase para PROMOTECS-Digital
// Importa desde CDN sin build step — compatible con GitHub Pages
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Validación defensiva: detecta si config.js tiene placeholders o valores vacíos
if (!SUPABASE_URL || SUPABASE_URL.includes('TU-PROYECTO')) {
  console.error(
    '[PROMOTECS] Supabase no configurado. ' +
      'Copia js/config.example.js como js/config.js y reemplaza los valores.',
  );
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.includes('tu-anon-key')) {
  console.error('[PROMOTECS] SUPABASE_ANON_KEY no configurada. ' + 'Revisa js/config.js.');
}

// Cliente Supabase — punto único de importación para todos los módulos
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
