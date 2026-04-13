-- ============================================================================
-- 001_schema.sql — Schema inicial de PROMOTECS-Digital
-- Change: supabase-schema-initial (002)
-- Proyecto Supabase: jmjtzfgwkxllubbhmbvc (sa-east-1)
-- Autor: edwinwmendez
-- Fecha: 2026-04-13
--
-- Orden de creación: tablas padres antes que hijas (respeta FKs).
-- Todos los IDs son UUID con uuid_generate_v4().
-- Enums implementados con CHECK constraints inline.
-- ============================================================================

-- Extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Función auxiliar: actualizar columna updated_at automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. instituciones_certificadoras
-- Entidades externas que avalan programas (ej: UNSLG, PROMOTECS mismo)
-- ============================================================================
CREATE TABLE instituciones_certificadoras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'instituto', 'universidad', 'colegio_profesional', 'gobierno', 'otro'
  )),
  logo_url TEXT,
  sitio_web TEXT,
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. programas
-- Oferta académica: diplomados, especializaciones, cursos, auxiliares
-- ============================================================================
CREATE TABLE programas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo_programa TEXT NOT NULL CHECK (tipo_programa IN (
    'diplomado', 'especializacion', 'curso', 'auxiliar'
  )),
  area_tematica TEXT NOT NULL CHECK (area_tematica IN (
    'educacion', 'salud', 'farmacia', 'derecho', 'gestion_publica',
    'psicologia', 'nutricion', 'obstetricia', 'laboratorio',
    'contabilidad', 'administracion', 'ingenieria', 'enfermeria', 'tecnica'
  )),
  modalidad TEXT NOT NULL CHECK (modalidad IN (
    'presencial', 'virtual', 'semipresencial'
  )),
  horas_pedagogicas INTEGER NOT NULL CHECK (horas_pedagogicas > 0),
  creditos INTEGER,
  fecha_inicio DATE,
  fecha_fin DATE,
  apertura_permanente BOOLEAN NOT NULL DEFAULT false,
  estado TEXT NOT NULL DEFAULT 'activo' CHECK (estado IN (
    'activo', 'inactivo', 'proximamente'
  )),
  precio NUMERIC(10, 2),
  imagen_url TEXT,
  institucion_certificadora_id UUID REFERENCES instituciones_certificadoras(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para updated_at en programas
CREATE TRIGGER programas_updated_at
  BEFORE UPDATE ON programas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 3. instructores
-- Profesionales que imparten programas (relación N:M con programas)
-- ============================================================================
CREATE TABLE instructores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE,
  especialidad TEXT,
  grado_academico TEXT CHECK (grado_academico IN (
    'licenciado', 'magister', 'doctor', 'especialista', 'tecnico'
  )),
  bio TEXT,
  foto_url TEXT,
  institucion_afiliacion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. programa_instructores
-- Tabla de unión N:M entre programas e instructores
-- ============================================================================
CREATE TABLE programa_instructores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  programa_id UUID NOT NULL REFERENCES programas(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES instructores(id) ON DELETE CASCADE,
  rol TEXT NOT NULL DEFAULT 'titular' CHECK (rol IN (
    'titular', 'asistente', 'coordinador'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (programa_id, instructor_id)
);

-- ============================================================================
-- 5. convenios
-- Acuerdos de PROMOTECS con entidades externas
-- ============================================================================
CREATE TABLE convenios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institucion TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'universidad', 'colegio_profesional', 'ugel', 'drelp', 'ie', 'otro'
  )),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 6. participantes
-- Profesionales que se capacitan en PROMOTECS (vinculados a auth.users)
-- ============================================================================
CREATE TABLE participantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  perfil_profesional TEXT NOT NULL DEFAULT 'otro' CHECK (perfil_profesional IN (
    'docente', 'profesional_salud', 'abogado', 'farmaceutico',
    'psicologo', 'nutricionista', 'obstetra', 'tecnologo_laboratorio',
    'administrador_publico', 'contador', 'ingeniero', 'enfermero',
    'tecnico', 'otro'
  )),
  institucion_laboral TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para updated_at en participantes
CREATE TRIGGER participantes_updated_at
  BEFORE UPDATE ON participantes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 7. inscripciones
-- Vínculo participante↔programa (N:M con estado y datos de pago)
-- ============================================================================
CREATE TABLE inscripciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE RESTRICT,
  programa_id UUID NOT NULL REFERENCES programas(id) ON DELETE RESTRICT,
  fecha_inscripcion TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN (
    'pendiente', 'confirmada', 'completada', 'cancelada'
  )),
  monto_pagado NUMERIC(10, 2),
  comprobante_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (participante_id, programa_id)
);

-- ============================================================================
-- 8. certificados
-- Documento digital con código de validación único
-- ============================================================================
CREATE TABLE certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inscripcion_id UUID UNIQUE NOT NULL REFERENCES inscripciones(id) ON DELETE RESTRICT,
  codigo_validacion TEXT UNIQUE NOT NULL,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  horas_pedagogicas INTEGER NOT NULL CHECK (horas_pedagogicas > 0),
  url_pdf TEXT,
  institucion_certificadora_id UUID REFERENCES instituciones_certificadoras(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Trigger: crear participante automáticamente al registrarse en auth.users
-- Usa SECURITY DEFINER porque el usuario recién creado no tiene permiso
-- de INSERT en participantes (RLS lo bloquea para anon).
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO participantes (user_id, nombre, email, perfil_profesional)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Sin nombre'),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'perfil_profesional', 'otro')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se dispara después de cada INSERT en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
