---
name: glossary
project: PROMOTECS-Digital
version: 1.0.0
created: 2026-04-10
author: edwinwmendez
formality_level: 2
status: living
description: Ubiquitous Language del proyecto. Define cómo se llaman las cosas del negocio en el código. Se actualiza vía `/sdd-foundation refresh`.
---

# Glossary — PROMOTECS-Digital

## Dominio del negocio

**IIC PROMOTECS E.I.R.L.** (Instituto de Investigación y Capacitación PROMOTECS) es un instituto peruano de **educación continua para profesionales**, ubicado en Barranca, Lima (Leoncio Prado 154, 2.º piso). Capacita y actualiza a profesionales activos de múltiples rubros: **educación, salud, farmacia, derecho, gestión pública, psicología, nutrición, obstetricia, laboratorio clínico, contabilidad, administración, ingeniería, enfermería y carreras técnicas**.

Su oferta académica incluye **diplomados** (típicamente 1200 horas pedagógicas / 80 créditos), **especializaciones**, **cursos** y **programas auxiliares**, impartidos en modalidades **virtual, presencial y semipresencial**, algunos con **apertura permanente** y otros con fechas fijas. Parte de los programas están **avalados por instituciones externas** como la Universidad Nacional San Luis Gonzaga — Escuela de Posgrado.

PROMOTECS opera mediante **convenios institucionales** con universidades, colegios profesionales y entidades educativas regionales (DRELP, UGEL, colegios como la I.E.E. Ventura Ccalamaqui de Barranca). Para participantes que son **docentes**, los programas otorgan horas válidas para el **escalafón docente** y la **Carrera Pública Magisterial**; para otros profesionales, las horas son válidas ante sus respectivos colegios profesionales.

**El sistema PROMOTECS-Digital** es la plataforma web pública donde cualquier profesional puede (1) consultar el catálogo de programas vigentes filtrados por área temática y modalidad, (2) inscribirse en línea, y (3) validar la autenticidad de certificados emitidos por PROMOTECS mediante un código único.

---

## Convenciones de nombrado

| Tipo              | Convención                | Ejemplo                                       |
| ----------------- | ------------------------- | --------------------------------------------- |
| Archivos HTML     | kebab-case                | `validacion-certificado.html`                 |
| Archivos JS/CSS   | kebab-case                | `supabase-client.js`, `button.css`            |
| Clases CSS        | kebab-case (BEM opcional) | `.card-programa__titulo`                      |
| Variables JS      | camelCase                 | `codigoValidacion`, `horasPedagogicas`        |
| Funciones JS      | camelCase + verbo         | `getProgramas()`, `validateCertificado()`     |
| Constantes JS     | UPPER_SNAKE_CASE          | `MAX_HORAS_PROGRAMA`                          |
| Tablas Supabase   | snake_case plural         | `participantes`, `programas`, `inscripciones` |
| Columnas Supabase | snake_case                | `codigo_validacion`, `fecha_emision`          |
| Componentes JS    | PascalCase                | `CatalogoPrograma`, `FormularioInscripcion`   |

**Regla de oro**: código en inglés técnico, sustantivos del dominio en español.

---

## Sección 1 — Entidades del sistema (14 términos que van al código)

| #   | Término                       | Definición                                                                                                                                                                                                                              | Código                           | NO lo llames                                                         |
| --- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- |
| 1   | **Participante**              | Profesional activo de cualquier rubro (salud, derecho, educación, etc.) que se inscribe como usuario del sistema para capacitarse en PROMOTECS. Es el cliente principal del sistema.                                                    | `participante` / `participantes` | ❌ user, student, alumno, docente, cliente, inscrito, customer       |
| 2   | **Perfil profesional**        | Rubro del participante: `docente`, `profesional_salud`, `abogado`, `farmaceutico`, `psicologo`, `nutricionista`, `obstetra`, `tecnologo_laboratorio`, `administrador_publico`, `contador`, `ingeniero`, `enfermero`, `tecnico`, `otro`. | `perfil_profesional` (enum)      | ❌ profession, job, role, career                                     |
| 3   | **Programa**                  | Oferta académica de PROMOTECS: diplomado, especialización, curso o programa auxiliar. Tiene duración, modalidad, área temática, instructores asociados e institución certificadora opcional.                                            | `programa` / `programas`         | ❌ course, training, curso, class, módulo                            |
| 4   | **Tipo de programa**          | Categoría del programa: `diplomado`, `especializacion`, `curso`, `auxiliar`.                                                                                                                                                            | `tipo_programa` (enum)           | ❌ program_type, category, kind                                      |
| 5   | **Área temática**             | Rubro macro del programa: `educacion`, `salud`, `farmacia`, `derecho`, `gestion_publica`, `psicologia`, `nutricion`, `obstetricia`, `laboratorio`, `contabilidad`, `administracion`, `ingenieria`, `enfermeria`, `tecnica`.             | `area_tematica` (enum)           | ❌ subject, topic, category, field                                   |
| 6   | **Instructor**                | Profesional experto que imparte uno o más programas en PROMOTECS. Tiene especialidad, grado académico y afiliación institucional. Un programa puede tener varios instructores (relación N:M).                                           | `instructor` / `instructores`    | ❌ teacher, professor, docente, profesor, trainer, speaker, educator |
| 7   | **Inscripción**               | Registro de un participante en un programa específico. Es el vínculo entre participante y programa.                                                                                                                                     | `inscripcion` / `inscripciones`  | ❌ registration, enrollment, signup, subscription                    |
| 8   | **Certificado**               | Documento digital emitido al completar un programa. Contiene código de validación único, participante, programa, horas, modalidad, fecha de emisión e institución certificadora.                                                        | `certificado` / `certificados`   | ❌ diploma, certificate, credential, badge                           |
| 9   | **Código de validación**      | ID único alfanumérico del certificado usado para verificar autenticidad desde el módulo público de validación.                                                                                                                          | `codigo_validacion`              | ❌ token, hash, validation_id, verification_code                     |
| 10  | **Horas pedagógicas**         | Unidad de duración de un programa, válida para escalafón docente (en el caso de docentes) o colegios profesionales (en otros rubros). Ejemplo: 1200 horas en un diplomado.                                                              | `horas_pedagogicas`              | ❌ hours, duration, time                                             |
| 11  | **Créditos académicos**       | Equivalente académico formal de las horas pedagógicas. Ejemplo: 1200 horas ≈ 80 créditos. Usado por institución certificadora universitaria.                                                                                            | `creditos`                       | ❌ credits, points, units                                            |
| 12  | **Modalidad**                 | Forma de entrega del programa: `presencial`, `virtual`, `semipresencial`.                                                                                                                                                               | `modalidad` (enum)               | ❌ format, delivery, type, mode                                      |
| 13  | **Institución certificadora** | Entidad externa que avala el programa (ej: Universidad Nacional San Luis Gonzaga — Escuela de Posgrado). Opcional — no todos los programas tienen aval externo.                                                                         | `institucion_certificadora`      | ❌ issuer, authority, partner, validator                             |
| 14  | **Convenio**                  | Acuerdo institucional entre PROMOTECS y otra entidad (universidad, UGEL, DRELP, colegio profesional, IE). Habilita que las horas sean reconocidas en el sistema de la contraparte.                                                      | `convenio` / `convenios`         | ❌ partnership, agreement, contract                                  |

### Relaciones clave

- `participante` ──< `inscripcion` >── `programa` (N:M)
- `programa` ──< `programa_instructores` >── `instructor` (N:M, con campo `rol` opcional: `titular`, `asistente`, `coordinador`)
- `programa` ──(N:1)── `institucion_certificadora` (opcional)
- `programa` ──(N:1)── `tipo_programa`, `modalidad`, `area_tematica`
- `inscripcion` ──(1:1)── `certificado` (cuando se completa)

---

## Sección 2 — Contexto del dominio (7 términos que NO van al código)

Términos que el equipo debe conocer para entender el negocio, pero que **no son entidades del sistema**. Son marco legal, cultural o regulatorio.

| Término                         | Qué es                                                                                                                         | Por qué importa                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Escalafón docente**           | Sistema peruano de ascenso profesional del docente público, gestionado por MINEDU bajo la Ley de Reforma Magisterial.          | Las horas pedagógicas de PROMOTECS se acreditan al escalafón del docente. Es POR ESTO que existe gran parte del negocio para el rubro educación. |
| **Carrera Pública Magisterial** | Marco legal peruano de la carrera docente pública.                                                                             | Los programas de educación de PROMOTECS deben alinearse con sus niveles y requisitos.                                                            |
| **DRELP**                       | Dirección Regional de Educación de Lima Provincias.                                                                            | Entidad reguladora con la que PROMOTECS tiene convenios. Valida horas pedagógicas en la región.                                                  |
| **UGEL**                        | Unidad de Gestión Educativa Local.                                                                                             | Supervisa escuelas en el territorio; emite reconocimiento de horas pedagógicas a docentes.                                                       |
| **MINEDU**                      | Ministerio de Educación del Perú.                                                                                              | Autoridad máxima del sector educativo; define políticas que afectan los programas del rubro docente.                                             |
| **Colegios profesionales**      | Entidades gremiales de cada profesión (Colegio de Químicos Farmacéuticos del Perú, Colegio de Abogados, Colegio Médico, etc.). | Reciben las horas de capacitación para acreditación profesional continua de los participantes no-docentes.                                       |
| **Apertura permanente**         | Modalidad de inscripción donde el programa está siempre abierto (sin fecha fija de inicio).                                    | Es un patrón común en PROMOTECS. El sistema debe soportarlo como modalidad de fecha, no solo fechas fijas.                                       |

---

## Sección 3 — Forbidden synonyms globales (anti-hallucination)

Palabras **NUNCA permitidas** en el código ni documentación del proyecto, aunque parezcan razonables. Esta es la regla anti-drift más importante del glossary.

| Palabra prohibida                              | Usar en su lugar                                                                         | Razón                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `user`, `usuario`                              | `participante`                                                                           | Genérico de software, sin significado de negocio                    |
| `student`, `alumno`                            | `participante`                                                                           | Infantilizante para profesionales activos                           |
| `teacher`, `profesor`                          | `instructor` (si imparte) o `participante` con `perfil_profesional=docente` (si aprende) | Ambiguo: puede ser quien aprende o quien enseña                     |
| `docente` como entidad                         | `participante` con `perfil_profesional=docente`                                          | Reservado como perfil, no como entidad                              |
| `course`, `curso`                              | `programa`                                                                               | El negocio usa "programa" para todo tipo de oferta académica        |
| `registration`, `enrollment`                   | `inscripcion`                                                                            | Coherencia con el dominio en español                                |
| `diploma`, `certificate`                       | `certificado`                                                                            | Término oficial del negocio                                         |
| `credential`, `badge`                          | `certificado`                                                                            | Mismo motivo                                                        |
| `issuer`, `authority`                          | `institucion_certificadora`                                                              | Nombre oficial del rol                                              |
| `trainer`, `speaker`, `educator`               | `instructor`                                                                             | Todos connotan roles distintos (deportivo, conferencista, genérico) |
| `hours`, `duration` como campo numérico suelto | `horas_pedagogicas`                                                                      | Pierde el significado legal/regulatorio                             |

---

## Regla de consistencia

**Código en inglés técnico, sustantivos del dominio en español.**

```javascript
// ✅ CORRECTO
async function getProgramasByAreaTematica(areaTematica) {
  const { data: programas, error } = await supabase
    .from('programas')
    .select('*, instructores(*), institucion_certificadora(*)')
    .eq('area_tematica', areaTematica);
  return programas;
}

// ❌ INCORRECTO
async function getCoursesByCategory(category) {
  const { data: courses } = await supabase
    .from('courses')
    .select('*, teachers(*), issuer(*)')
    .eq('category', category);
}
```

---

**Este glossary es vivo.** Se actualiza vía `/sdd-foundation refresh` cuando el equipo descubre términos nuevos del negocio. Las 14 entidades del sistema y los forbidden synonyms son el mínimo aprobado en la primera versión (2026-04-10).
