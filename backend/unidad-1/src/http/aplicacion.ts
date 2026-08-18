import type { IncomingMessage, RequestListener } from "node:http";
import {
  cuposDisponibles,
  inscribir,
  validarSolicitud,
  type MotivoRechazo
} from "../dominio/inscripciones.ts";
import {
  crearRepositorioEnMemoria,
  type Repositorio
} from "../datos/repositorio-en-memoria.ts";

/**
 * Capa HTTP: traduce solicitudes a llamadas al dominio y decisiones del dominio
 * a códigos de estado. No contiene reglas académicas.
 */

export interface OpcionesAplicacion {
  repositorio?: Repositorio;
  /** Inyectable para que las pruebas obtengan fechas deterministas. */
  reloj?: () => Date;
}

/** Cada motivo de rechazo tiene un único código y mensaje: el contrato es estable. */
const RESPUESTA_POR_MOTIVO: Record<MotivoRechazo, { codigo: number; error: string }> = {
  "estudiante-inexistente": { codigo: 404, error: "Estudiante no encontrado" },
  "materia-inexistente": { codigo: 404, error: "Materia no encontrada" },
  "estudiante-inactivo": { codigo: 409, error: "El estudiante no está activo" },
  "inscripcion-duplicada": { codigo: 409, error: "El estudiante ya está inscripto en esta materia" },
  "sin-cupo": { codigo: 409, error: "La materia no tiene cupo disponible" }
};

export function crearAplicacion(opciones: OpcionesAplicacion = {}): RequestListener {
  const repositorio = opciones.repositorio ?? crearRepositorioEnMemoria();
  const reloj = opciones.reloj ?? (() => new Date());

  return async (solicitud, respuesta) => {
    respuesta.setHeader("Content-Type", "application/json; charset=utf-8");

    const responder = (codigo: number, cuerpo: unknown): void => {
      respuesta.writeHead(codigo);
      respuesta.end(JSON.stringify(cuerpo));
    };

    const metodo = solicitud.method ?? "";
    const ruta = (solicitud.url ?? "").split("?")[0] ?? "";
    const partes = ruta.split("/").filter((parte) => parte !== "");

    // GET /salud
    if (metodo === "GET" && partes.length === 1 && partes[0] === "salud") {
      responder(200, { estado: "ok", fecha: reloj().toISOString() });
      return;
    }

    // GET /hora
    if (metodo === "GET" && partes.length === 1 && partes[0] === "hora") {
      responder(200, { hora: reloj().toISOString() });
      return;
    }

    // GET /materias
    if (metodo === "GET" && partes.length === 1 && partes[0] === "materias") {
      const estado = repositorio.estado();

      responder(
        200,
        estado.materias.map((materia) => ({
          ...materia,
          cuposDisponibles: cuposDisponibles(estado, materia.codigo)
        }))
      );
      return;
    }

    // GET /estudiantes/:id  y  GET /estudiantes/:id/inscripciones
    if (metodo === "GET" && partes[0] === "estudiantes" && partes.length >= 2 && partes.length <= 3) {
      const id = Number(partes[1]);

      if (!Number.isInteger(id)) {
        responder(400, { error: "El id debe ser un número entero" });
        return;
      }

      const estado = repositorio.estado();
      const estudiante = estado.estudiantes.find((e) => e.id === id);

      if (estudiante === undefined) {
        responder(404, { error: "Estudiante no encontrado" });
        return;
      }

      if (partes.length === 2) {
        responder(200, estudiante);
        return;
      }

      if (partes[2] === "inscripciones") {
        responder(
          200,
          estado.inscripciones.filter((i) => i.estudianteId === id)
        );
        return;
      }
    }

    // POST /inscripciones
    if (metodo === "POST" && partes.length === 1 && partes[0] === "inscripciones") {
      let cuerpo: unknown;

      try {
        cuerpo = await leerJson(solicitud);
      } catch {
        responder(400, { error: "El cuerpo no es JSON válido" });
        return;
      }

      const validacion = validarSolicitud(cuerpo);

      if (!validacion.valida) {
        responder(400, { error: validacion.error });
        return;
      }

      const resultado = inscribir(validacion.solicitud, repositorio.estado(), reloj());

      if (resultado.estado === "rechazada") {
        const { codigo, error } = RESPUESTA_POR_MOTIVO[resultado.motivo];

        responder(codigo, { error });
        return;
      }

      repositorio.agregarInscripcion(resultado.inscripcion);
      respuesta.setHeader("Location", `/inscripciones/${resultado.inscripcion.id}`);
      responder(201, resultado.inscripcion);
      return;
    }

    responder(404, { error: "Recurso no encontrado" });
  };
}

/** Acumula el cuerpo de la solicitud y lo interpreta como JSON. */
async function leerJson(solicitud: IncomingMessage): Promise<unknown> {
  const trozos: Buffer[] = [];

  for await (const trozo of solicitud) {
    trozos.push(trozo as Buffer);
  }

  const texto = Buffer.concat(trozos).toString("utf8");

  return texto === "" ? {} : JSON.parse(texto);
}
