-- ============================================================================
-- 003_seed_data.sql — Datos de demostración para PA2
-- Change: supabase-schema-initial (002)
-- Autor: edwinwmendez
-- Fecha: 2026-04-13
--
-- IMPORTANTE: Estos son datos de DEMOSTRACIÓN para desarrollo y presentación
-- del PA2. Los nombres de instructores son FICTICIOS (marcados con "Demo").
-- Los programas están basados en la oferta real de IIC PROMOTECS E.I.R.L.
--
-- El script es IDEMPOTENTE: usa ON CONFLICT DO NOTHING.
-- Orden de inserción respeta dependencias FK.
-- UUIDs generados automáticamente (no hard-codeados).
-- ============================================================================

-- ============================================================================
-- 1. Instituciones certificadoras (2 registros)
-- ============================================================================
INSERT INTO instituciones_certificadoras (nombre, tipo, sitio_web, activa)
VALUES
  ('IIC PROMOTECS E.I.R.L.', 'instituto', 'https://promotecs.edu.pe', true),
  ('Universidad Nacional San Luis Gonzaga — Escuela de Posgrado', 'universidad', 'https://www.unica.edu.pe', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. Programas (4 registros)
-- Usamos CTEs para referenciar los IDs de las instituciones certificadoras
-- ============================================================================
WITH cert_promotecs AS (
  SELECT id FROM instituciones_certificadoras
  WHERE nombre = 'IIC PROMOTECS E.I.R.L.'
  LIMIT 1
),
cert_unslg AS (
  SELECT id FROM instituciones_certificadoras
  WHERE nombre LIKE 'Universidad Nacional San Luis Gonzaga%'
  LIMIT 1
)
INSERT INTO programas (
  titulo, descripcion, tipo_programa, area_tematica, modalidad,
  horas_pedagogicas, creditos, apertura_permanente, estado, precio,
  institucion_certificadora_id
)
VALUES
  (
    'Diplomado en Educación y Gestión Escolar',
    'Programa integral de formación para profesionales de educación que buscan fortalecer competencias en gestión escolar, liderazgo pedagógico y políticas educativas.',
    'diplomado', 'educacion', 'virtual',
    1200, 80, true, 'activo', 350.00,
    (SELECT id FROM cert_unslg)
  ),
  (
    'Curso de Actualización en Farmacia Clínica',
    'Actualización profesional en farmacia clínica, atención farmacéutica y farmacovigilancia para químicos farmacéuticos.',
    'curso', 'farmacia', 'semipresencial',
    120, NULL, false, 'activo', 150.00,
    (SELECT id FROM cert_promotecs)
  ),
  (
    'Especialización en Salud Pública y Epidemiología',
    'Formación especializada en salud pública, epidemiología y gestión sanitaria para profesionales del sector salud.',
    'especializacion', 'salud', 'virtual',
    600, 40, false, 'activo', 280.00,
    (SELECT id FROM cert_unslg)
  ),
  (
    'Curso de Gestión Pública y Modernización del Estado',
    'Capacitación en gestión pública, gobierno digital y modernización del Estado para funcionarios y profesionales del sector público.',
    'curso', 'gestion_publica', 'virtual',
    200, NULL, false, 'proximamente', 120.00,
    (SELECT id FROM cert_promotecs)
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. Instructores (2 registros — FICTICIOS, marcados con "Demo")
-- ============================================================================
INSERT INTO instructores (nombre, email, especialidad, grado_academico, bio, activo)
VALUES
  (
    'Mg. Demo Instructor Uno',
    'demo.instructor1@example.com',
    'educacion',
    'magister',
    'Instructor de demostración para el PA2. Especialista en educación y gestión escolar.',
    true
  ),
  (
    'Dr. Demo Instructor Dos',
    'demo.instructor2@example.com',
    'salud',
    'doctor',
    'Instructor de demostración para el PA2. Especialista en salud pública y epidemiología.',
    true
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. Programa-instructores (2 relaciones)
-- Vincula: Diplomado Educación ↔ Instructor 1, Especialización Salud ↔ Instructor 2
-- ============================================================================
WITH prog_diplomado AS (
  SELECT id FROM programas
  WHERE titulo LIKE 'Diplomado en Educación%'
  LIMIT 1
),
prog_especializacion AS (
  SELECT id FROM programas
  WHERE titulo LIKE 'Especialización en Salud%'
  LIMIT 1
),
inst_uno AS (
  SELECT id FROM instructores
  WHERE email = 'demo.instructor1@example.com'
  LIMIT 1
),
inst_dos AS (
  SELECT id FROM instructores
  WHERE email = 'demo.instructor2@example.com'
  LIMIT 1
)
INSERT INTO programa_instructores (programa_id, instructor_id, rol)
VALUES
  ((SELECT id FROM prog_diplomado), (SELECT id FROM inst_uno), 'titular'),
  ((SELECT id FROM prog_especializacion), (SELECT id FROM inst_dos), 'titular')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Tablas que quedan VACÍAS intencionalmente:
-- - participantes (se llena via auth.users + trigger handle_new_user)
-- - inscripciones (se llena via módulo de inscripción)
-- - certificados (se llena via proceso administrativo)
-- - convenios (se llena via panel admin — fuera del scope PA2)
-- ============================================================================
