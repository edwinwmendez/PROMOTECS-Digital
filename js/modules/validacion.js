// Módulo de validación de certificados — PROMOTECS-Digital
// Lógica del formulario de validacion.html: consulta pública a Supabase
// (RLS REQ-7/AC-7.1: USING (true) sobre certificados) y renderiza el
// resultado con tres estados: loading, success, error.
import { supabase } from '../supabase-client.js';
import { validateRequired } from '../utils/form-validator.js';

// --- Helpers de UI ---------------------------------------------------------

// Cambia el botón a estado "Verificando..." durante la consulta.
// Restaura el texto original al finalizar (try/finally en handleSubmit).
function setSubmitLoading(btn, loading) {
  if (loading) {
    if (!btn.dataset.originalText) {
      btn.dataset.originalText = btn.textContent.trim();
    }
    btn.disabled = true;
    btn.textContent = 'Verificando...';
  } else {
    btn.disabled = false;
    btn.textContent = btn.dataset.originalText || 'Verificar certificado';
  }
}

// Oculta ambos resultados (válido e inválido) antes de un nuevo intento.
function hideResult() {
  const validEl = document.getElementById('validacion-result-valid');
  const invalidEl = document.getElementById('validacion-result-invalid');
  if (validEl) validEl.hidden = true;
  if (invalidEl) invalidEl.hidden = true;
}

// Formatea fecha ISO (YYYY-MM-DD) a formato legible es-PE.
function formatFechaEmision(fechaIso) {
  if (!fechaIso) return '—';
  const d = new Date(fechaIso);
  if (Number.isNaN(d.getTime())) return fechaIso;
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Asigna textContent a un elemento por id (XSS-safe — usa textContent, no HTML).
function setRowValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '—';
}

// Renderiza el resultado válido: extrae los datos de la respuesta de Supabase.
// Toda asignación usa textContent — los datos vienen del servidor sin sanitizar.
function renderValidResult(data) {
  const inscripcion = data.inscripciones || {};
  const participante = inscripcion.participantes || {};
  const programa = inscripcion.programas || {};
  const institucion = data.instituciones_certificadoras || {};

  setRowValue('validacion-r-nombre', participante.nombre);
  setRowValue('validacion-r-programa', programa.titulo);
  setRowValue(
    'validacion-r-horas',
    data.horas_pedagogicas ? `${data.horas_pedagogicas} horas` : '—',
  );
  setRowValue('validacion-r-fecha', formatFechaEmision(data.fecha_emision));
  setRowValue('validacion-r-codigo', data.codigo_validacion);

  // institución certificadora es opcional (FK ON DELETE SET NULL)
  const institucionRow = document.getElementById('validacion-r-institucion-row');
  if (institucion && institucion.nombre) {
    setRowValue('validacion-r-institucion', institucion.nombre);
    if (institucionRow) institucionRow.hidden = false;
  } else if (institucionRow) {
    institucionRow.hidden = true;
  }

  const validEl = document.getElementById('validacion-result-valid');
  if (validEl) validEl.hidden = false;
}

// Muestra el bloque de "no encontrado" — sin detalles técnicos al participante.
function renderInvalidResult() {
  const invalidEl = document.getElementById('validacion-result-invalid');
  if (invalidEl) invalidEl.hidden = false;
}

// --- Handler principal ----------------------------------------------------

async function handleSubmit(event) {
  event.preventDefault();

  const codigoEl = document.getElementById('codigo');
  const errorEl = document.getElementById('codigo-error');
  const btn = document.getElementById('btn-verificar');
  const alertEl = document.getElementById('validacion-alert');

  hideResult();
  if (alertEl) alertEl.hidden = true;

  // Normaliza el código a mayúsculas (ej: PROMO-2026-001).
  const codigo = codigoEl.value.trim().toUpperCase();

  const reqResult = validateRequired(codigo, 'El código del certificado');
  if (!reqResult.valid) {
    errorEl.textContent = reqResult.message;
    codigoEl.setAttribute('aria-invalid', 'true');
    codigoEl.focus();
    return;
  }
  codigoEl.setAttribute('aria-invalid', 'false');
  errorEl.textContent = '';

  setSubmitLoading(btn, true);
  try {
    const { data, error } = await supabase
      .from('certificados')
      .select(
        `
          codigo_validacion,
          fecha_emision,
          horas_pedagogicas,
          inscripciones (
            participantes ( nombre ),
            programas ( titulo, modalidad, area_tematica )
          ),
          instituciones_certificadoras ( nombre )
        `,
      )
      .eq('codigo_validacion', codigo)
      .maybeSingle();

    if (error || !data) {
      renderInvalidResult();
      return;
    }
    renderValidResult(data);
  } catch (err) {
    // Mensaje legible al participante; el detalle queda solo en console.
    console.error('[validacion] error de red:', err);
    if (alertEl) {
      alertEl.textContent =
        'No pudimos verificar el certificado. Revisa tu conexión e inténtalo de nuevo.';
      alertEl.hidden = false;
    }
  } finally {
    setSubmitLoading(btn, false);
  }
}

// --- Punto de entrada -----------------------------------------------------

function init() {
  const form = document.getElementById('form-validacion');
  if (form) form.addEventListener('submit', handleSubmit);
}

init();
