import type { IncomingMessage, RequestListener } from "node:http";
import {
  cuposDisponibles,
  inscribir,
  validarSolicitud,
  type MotivoRechazo
} from "../dominio/inscripciones.ts";
import { describir, validarElemento } from "../dominio/vector.ts";
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

/**
 * Tabla de rutas: qué métodos admite cada forma de ruta.
 *
 * Existe para poder distinguir dos situaciones que un router ingenuo confunde:
 * "no conozco ese recurso" (404) y "conozco el recurso, pero no esa operación
 * sobre él" (405, con el encabezado `Allow` diciendo cuáles sí). También permite
 * contestar `OPTIONS` sin repetir las reglas en otro lugar.
 */
const RUTAS: ReadonlyArray<{ patron: RegExp; metodos: readonly string[] }> = [
  { patron: /^\/salud$/, metodos: ["GET", "HEAD"] },
  { patron: /^\/hora$/, metodos: ["GET", "HEAD"] },
  { patron: /^\/materias$/, metodos: ["GET", "HEAD"] },
  { patron: /^\/estudiantes\/[^/]+$/, metodos: ["GET", "HEAD"] },
  { patron: /^\/estudiantes\/[^/]+\/inscripciones$/, metodos: ["GET", "HEAD"] },
  { patron: /^\/inscripciones$/, metodos: ["POST"] },
  { patron: /^\/vector$/, metodos: ["GET", "HEAD", "POST", "DELETE"] },
  { patron: /^\/vector\/[^/]+$/, metodos: ["GET", "HEAD"] },
  { patron: /^\/eco$/, metodos: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"] }
];

export function crearAplicacion(opciones: OpcionesAplicacion = {}): RequestListener {
  const repositorio = opciones.repositorio ?? crearRepositorioEnMemoria();
  const reloj = opciones.reloj ?? (() => new Date());

  return async (solicitud, respuesta) => {
    respuesta.setHeader("Content-Type", "application/json; charset=utf-8");

    const metodoSolicitado = solicitud.method ?? "";

    // HEAD es GET sin cuerpo. Se resuelve con el mismo manejador —abajo se lee
    // `metodo`, no `metodoSolicitado`— y `responder` omite el cuerpo al final.
    // De este modo ninguna ruta puede quedar con GET y sin HEAD.
    const esHead = metodoSolicitado === "HEAD";
    const metodo = esHead ? "GET" : metodoSolicitado;

    const ruta = (solicitud.url ?? "").split("?")[0] ?? "";
    const partes = ruta.split("/").filter((parte) => parte !== "");

    // Lo que viene después del "?": el mismo mensaje puede traer datos en la
    // ruta, en la consulta, en los encabezados y en el cuerpo. `/eco` los muestra.
    const consulta = new URLSearchParams((solicitud.url ?? "").split("?").slice(1).join("?"));

    /**
     * Escribe la respuesta. Serializa una sola vez para poder anunciar
     * `Content-Length`: el largo del cuerpo es información de la capa de
     * aplicación, TCP no lo transporta. Sin ese encabezado el cliente sólo sabe
     * que el mensaje terminó cuando se cierra la conexión (o por trozos).
     * Con `cuerpo` indefinido se responde sin cuerpo alguno, como pide el 204.
     */
    const responder = (codigo: number, cuerpo?: unknown): void => {
      if (cuerpo === undefined) {
        respuesta.removeHeader("Content-Type");
        respuesta.writeHead(codigo);
        respuesta.end();
        return;
      }

      const serializado = JSON.stringify(cuerpo);

      respuesta.setHeader("Content-Length", Buffer.byteLength(serializado, "utf8"));
      respuesta.writeHead(codigo);
      respuesta.end(esHead ? undefined : serializado);
    };

    const conocida = RUTAS.find(({ patron }) => patron.test(ruta));

    if (conocida !== undefined) {
      // `OPTIONS` siempre se admite: es la forma de preguntarle a la ruta qué acepta.
      const admitidos = [...conocida.metodos, "OPTIONS"].join(", ");

      if (metodoSolicitado === "OPTIONS") {
        respuesta.setHeader("Allow", admitidos);
        responder(204);
        return;
      }

      if (!conocida.metodos.includes(metodo)) {
        respuesta.setHeader("Allow", admitidos);
        responder(405, { error: "Método no permitido" });
        return;
      }
    }

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

    // GET · POST · DELETE  /vector
    if (partes.length === 1 && partes[0] === "vector") {
      if (metodo === "GET") {
        responder(200, describir(repositorio.vector(), consulta.get("contiene") ?? undefined));
        return;
      }

      if (metodo === "DELETE") {
        repositorio.vaciarVector();
        responder(204);
        return;
      }

      let cuerpo: unknown;

      try {
        cuerpo = await leerJson(solicitud);
      } catch {
        responder(400, { error: "El cuerpo no es JSON válido" });
        return;
      }

      // El dato puede llegar por dos caminos. El cuerpo es el lugar correcto para
      // un POST; la consulta se admite para poder mostrar en clase que también es
      // posible —y qué se pierde—: por la URL todo llega como texto.
      const enviado =
        typeof cuerpo === "object" && cuerpo !== null && "elemento" in cuerpo
          ? (cuerpo as { elemento: unknown }).elemento
          : consulta.get("elemento");

      const validacion = validarElemento(enviado);

      if (!validacion.valido) {
        responder(400, { error: validacion.error });
        return;
      }

      const indice = repositorio.agregarAlVector(validacion.elemento);

      respuesta.setHeader("Location", `/vector/${indice}`);
      responder(201, {
        indice,
        elemento: validacion.elemento,
        tipo: typeof validacion.elemento === "number" ? "numero" : "texto",
        total: repositorio.vector().length
      });
      return;
    }

    // GET /vector/:indice
    if (metodo === "GET" && partes.length === 2 && partes[0] === "vector") {
      const indice = Number(partes[1]);

      if (!Number.isInteger(indice)) {
        responder(400, { error: "El índice debe ser un número entero" });
        return;
      }

      const encontrado = describir(repositorio.vector()).elementos[indice];

      if (encontrado === undefined) {
        responder(404, { error: "No hay ningún elemento en esa posición" });
        return;
      }

      responder(200, encontrado);
      return;
    }

    // Cualquier método sobre /eco: devuelve el mensaje recibido, sin guardar nada.
    if (partes.length === 1 && partes[0] === "eco") {
      const crudo = await leerTexto(solicitud);
      let interpretado: unknown = null;
      let esJsonValido = false;

      if (crudo !== "") {
        try {
          interpretado = JSON.parse(crudo);
          esJsonValido = true;
        } catch {
          // Un cuerpo ilegible no es un error acá: mostrarlo es justamente el punto.
        }
      }

      responder(200, {
        metodo: metodoSolicitado,
        url: solicitud.url,
        ruta,
        consulta: Object.fromEntries(consulta),
        encabezados: solicitud.headers,
        cuerpo: {
          crudo,
          bytes: Buffer.byteLength(crudo, "utf8"),
          esJsonValido,
          interpretado
        }
      });
      return;
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

/** Acumula el cuerpo de la solicitud tal como llegó, sin interpretarlo. */
async function leerTexto(solicitud: IncomingMessage): Promise<string> {
  const trozos: Buffer[] = [];

  for await (const trozo of solicitud) {
    trozos.push(trozo as Buffer);
  }

  return Buffer.concat(trozos).toString("utf8");
}

/** El mismo cuerpo, interpretado como JSON. Un cuerpo vacío es un objeto vacío. */
async function leerJson(solicitud: IncomingMessage): Promise<unknown> {
  const texto = await leerTexto(solicitud);

  return texto === "" ? {} : JSON.parse(texto);
}
