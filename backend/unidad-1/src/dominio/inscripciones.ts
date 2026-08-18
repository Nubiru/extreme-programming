/**
 * Dominio puro de inscripciones.
 *
 * Este módulo no conoce HTTP, ni Node, ni la base de datos: recibe el estado
 * académico y una solicitud, y devuelve una decisión. Por eso sus pruebas son
 * las más rápidas de la suite y sus reglas se pueden leer sin abrir el servidor.
 */

export interface Estudiante {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface Materia {
  codigo: string;
  nombre: string;
  cupo: number;
}

export interface Inscripcion {
  id: number;
  estudianteId: number;
  materia: string;
  fecha: string;
}

export interface EstadoAcademico {
  estudiantes: readonly Estudiante[];
  materias: readonly Materia[];
  inscripciones: readonly Inscripcion[];
}

export interface SolicitudInscripcion {
  estudianteId: number;
  materia: string;
}

export type MotivoRechazo =
  | "estudiante-inexistente"
  | "materia-inexistente"
  | "estudiante-inactivo"
  | "inscripcion-duplicada"
  | "sin-cupo";

export type ResultadoInscripcion =
  | { estado: "aceptada"; inscripcion: Inscripcion }
  | { estado: "rechazada"; motivo: MotivoRechazo };

export type ResultadoValidacion =
  | { valida: true; solicitud: SolicitudInscripcion }
  | { valida: false; error: string };

/**
 * Valida la forma del cuerpo recibido. Separada de las reglas de negocio porque
 * responde otra pregunta: "¿puedo interpretar esto?" y no "¿debo aceptarlo?".
 */
export function validarSolicitud(cuerpo: unknown): ResultadoValidacion {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return { valida: false, error: "El cuerpo debe ser un objeto JSON" };
  }

  const { estudianteId, materia } = cuerpo as Record<string, unknown>;

  if (!Number.isInteger(estudianteId)) {
    return { valida: false, error: "El campo estudianteId debe ser un número entero" };
  }

  if (typeof materia !== "string" || materia.trim() === "") {
    return { valida: false, error: "El campo materia es obligatorio" };
  }

  return {
    valida: true,
    solicitud: { estudianteId: estudianteId as number, materia: materia.trim() }
  };
}

/** Cupos que todavía puede ocupar una materia. Nunca devuelve un número negativo. */
export function cuposDisponibles(estado: EstadoAcademico, codigo: string): number {
  const materia = estado.materias.find((m) => m.codigo === codigo);

  if (materia === undefined) {
    return 0;
  }

  const ocupados = estado.inscripciones.filter((i) => i.materia === codigo).length;

  return Math.max(0, materia.cupo - ocupados);
}

/**
 * Decide si una inscripción se acepta. El orden de las reglas es deliberado:
 * primero lo que no existe, después la condición del estudiante y por último
 * la disponibilidad. Así el mensaje devuelto es siempre el más informativo.
 */
export function inscribir(
  solicitud: SolicitudInscripcion,
  estado: EstadoAcademico,
  fecha: Date
): ResultadoInscripcion {
  const estudiante = estado.estudiantes.find((e) => e.id === solicitud.estudianteId);

  if (estudiante === undefined) {
    return { estado: "rechazada", motivo: "estudiante-inexistente" };
  }

  const materia = estado.materias.find((m) => m.codigo === solicitud.materia);

  if (materia === undefined) {
    return { estado: "rechazada", motivo: "materia-inexistente" };
  }

  if (!estudiante.activo) {
    return { estado: "rechazada", motivo: "estudiante-inactivo" };
  }

  const yaInscripto = estado.inscripciones.some(
    (i) => i.estudianteId === estudiante.id && i.materia === materia.codigo
  );

  if (yaInscripto) {
    return { estado: "rechazada", motivo: "inscripcion-duplicada" };
  }

  if (cuposDisponibles(estado, materia.codigo) === 0) {
    return { estado: "rechazada", motivo: "sin-cupo" };
  }

  return {
    estado: "aceptada",
    inscripcion: {
      id: estado.inscripciones.length + 1,
      estudianteId: estudiante.id,
      materia: materia.codigo,
      fecha: fecha.toISOString()
    }
  };
}
