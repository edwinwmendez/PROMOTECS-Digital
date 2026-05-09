-- ============================================================================
-- 002_rls_policies.sql — Políticas de Row Level Security
-- Change: supabase-schema-initial (002)
-- Autor: edwinwmendez
-- Fecha: 2026-04-13
--
-- Principio: DENY ALL por defecto. Solo las políticas explícitas abren acceso.
-- Constitution principio 12: seguridad por defecto.
-- Constitution principio 14: doble defensa (RLS server-side + sanitización frontend).
-- ============================================================================

-- ============================================================================
-- Habilitar RLS en las 8 tablas (DENY ALL implícito)
-- ============================================================================
ALTER TABLE instituciones_certificadoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructores ENABLE ROW LEVEL SECURITY;
ALTER TABLE programa_instructores ENABLE ROW LEVEL SECURITY;
ALTER TABLE convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Catálogo público — 5 tablas con lectura abierta para todos
-- Cualquier visitante puede consultar programas, instructores, convenios, etc.
-- ============================================================================

-- Instituciones certificadoras: lectura pública
CREATE POLICY "catalogo_publico_instituciones_certificadoras"
  ON instituciones_certificadoras FOR SELECT
  USING (true);

-- Programas: lectura pública
CREATE POLICY "catalogo_publico_programas"
  ON programas FOR SELECT
  USING (true);

-- Instructores: lectura pública
CREATE POLICY "catalogo_publico_instructores"
  ON instructores FOR SELECT
  USING (true);

-- Programa-instructores: lectura pública (necesario para JOINs del catálogo)
CREATE POLICY "catalogo_publico_programa_instructores"
  ON programa_instructores FOR SELECT
  USING (true);

-- Convenios: lectura pública
CREATE POLICY "catalogo_publico_convenios"
  ON convenios FOR SELECT
  USING (true);

-- ============================================================================
-- Participantes — acceso restringido al registro propio
-- Un participante autenticado solo puede ver y editar SU perfil.
-- Anónimos: ningún acceso (DENY implícito por RLS).
-- ============================================================================

-- Participante puede leer solo su propio registro
CREATE POLICY "participante_lee_propio"
  ON participantes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Participante puede actualizar solo su propio registro
CREATE POLICY "participante_actualiza_propio"
  ON participantes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Inscripciones — acceso restringido a inscripciones propias
-- Un participante autenticado solo puede ver y crear SUS inscripciones.
-- Anónimos: ningún acceso.
-- ============================================================================

-- Participante puede leer solo sus propias inscripciones
CREATE POLICY "participante_lee_inscripciones_propias"
  ON inscripciones FOR SELECT
  TO authenticated
  USING (
    participante_id IN (
      SELECT id FROM participantes WHERE user_id = auth.uid()
    )
  );

-- Participante puede crear inscripciones solo para sí mismo
CREATE POLICY "participante_crea_inscripcion_propia"
  ON inscripciones FOR INSERT
  TO authenticated
  WITH CHECK (
    participante_id IN (
      SELECT id FROM participantes WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Certificados — lectura pública para validación
-- Cualquier persona puede verificar un certificado por codigo_validacion.
--
-- DEUDA TÉCNICA (PA2): esta política permite paginar todos los certificados.
-- Para el release final, considerar:
-- - Edge Function que limite a 1 resultado por query (filtro por codigo_validacion)
-- - Rate limiting en Supabase
-- Aceptable para PA2 porque no hay certificados reales en el sistema.
-- ============================================================================

-- Certificados: lectura pública (validación de autenticidad)
CREATE POLICY "certificados_validacion_publica"
  ON certificados FOR SELECT
  USING (true);
