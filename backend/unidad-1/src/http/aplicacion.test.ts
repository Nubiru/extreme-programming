import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { crearAplicacion } from "./aplicacion.ts";
import { levantar, type ServidorDePrueba } from "../pruebas/servidor-de-prueba.ts";

/**
 * Pruebas de caracterización: fijan la conducta que el servidor YA tenía antes
 * de refactorizarlo. No agregan funcionalidad; son la red de seguridad que
 * permite mover el código sin cambiar lo que el cliente observa.
 */
describe("Aplicación HTTP · conducta heredada de la Unidad 1", () => {
  let servidor: ServidorDePrueba;

  beforeEach(async () => {
    servidor = await levantar(crearAplicacion());
  });

  afterEach(async () => {
    await servidor.cerrar();
  });

  it("responde 200 y estado ok en GET /salud", async () => {
    const respuesta = await servidor.pedir("/salud");

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toMatchObject({ estado: "ok" });
  });

  it("responde la hora en ISO 8601 en GET /hora", async () => {
    const respuesta = await servidor.pedir("/hora");
    const cuerpo = (await respuesta.json()) as { hora: string };

    expect(respuesta.status).toBe(200);
    expect(new Date(cuerpo.hora).toISOString()).toBe(cuerpo.hora);
  });

  it("devuelve el estudiante existente en GET /estudiantes/42", async () => {
    const respuesta = await servidor.pedir("/estudiantes/42");

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual({ id: 42, nombre: "Juan Gómez", activo: false });
  });

  it("responde 404 cuando el estudiante no existe", async () => {
    const respuesta = await servidor.pedir("/estudiantes/999");

    expect(respuesta.status).toBe(404);
    expect(await respuesta.json()).toEqual({ error: "Estudiante no encontrado" });
  });

  it("responde 400 cuando el id no es un número entero", async () => {
    const respuesta = await servidor.pedir("/estudiantes/abc");

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: "El id debe ser un número entero" });
  });

  it("responde 404 en cualquier otra ruta", async () => {
    const respuesta = await servidor.pedir("/ruta-inexistente");

    expect(respuesta.status).toBe(404);
    expect(await respuesta.json()).toEqual({ error: "Recurso no encontrado" });
  });

  // Hueco detectado leyendo el reporte de cobertura: la rama de una subruta
  // desconocida bajo un estudiante existente no estaba ejercitada.
  it("responde 404 ante una subruta desconocida de un estudiante existente", async () => {
    const respuesta = await servidor.pedir("/estudiantes/1/notas");

    expect(respuesta.status).toBe(404);
    expect(await respuesta.json()).toEqual({ error: "Recurso no encontrado" });
  });

  it("declara JSON con codificación UTF-8 en todas las respuestas", async () => {
    const respuesta = await servidor.pedir("/salud");

    expect(respuesta.headers.get("content-type")).toBe("application/json; charset=utf-8");
  });
});

/**
 * Pruebas de integración de la historia nueva: recorren el contrato completo
 * —ruta, método, cuerpo, código de estado— sin conocer cómo está implementado
 * el dominio. Las reglas ya tienen sus propias pruebas unitarias; acá sólo se
 * verifica que la traducción a HTTP sea la acordada.
 */
describe("POST /inscripciones", () => {
  const FECHA = new Date("2026-03-10T12:00:00.000Z");
  let servidor: ServidorDePrueba;

  const inscribir = (cuerpo: unknown): Promise<Response> =>
    servidor.pedir("/inscripciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof cuerpo === "string" ? cuerpo : JSON.stringify(cuerpo)
    });

  beforeEach(async () => {
    servidor = await levantar(crearAplicacion({ reloj: () => FECHA }));
  });

  afterEach(async () => {
    await servidor.cerrar();
  });

  it("registra la inscripción de un estudiante activo y responde 201", async () => {
    const respuesta = await inscribir({ estudianteId: 1, materia: "algoritmos" });

    expect(respuesta.status).toBe(201);
    expect(await respuesta.json()).toEqual({
      id: 1,
      estudianteId: 1,
      materia: "algoritmos",
      fecha: "2026-03-10T12:00:00.000Z"
    });
  });

  it("indica en Location dónde quedó la inscripción creada", async () => {
    const respuesta = await inscribir({ estudianteId: 1, materia: "algoritmos" });

    expect(respuesta.headers.get("location")).toBe("/inscripciones/1");
  });

  it("descuenta el cupo de la materia", async () => {
    await inscribir({ estudianteId: 1, materia: "algoritmos" });

    const respuesta = await servidor.pedir("/materias");
    const materias = (await respuesta.json()) as { codigo: string; cuposDisponibles: number }[];

    expect(materias.find((m) => m.codigo === "algoritmos")).toMatchObject({ cuposDisponibles: 1 });
  });

  it("responde 409 cuando el estudiante no está activo", async () => {
    const respuesta = await inscribir({ estudianteId: 42, materia: "algoritmos" });

    expect(respuesta.status).toBe(409);
    expect(await respuesta.json()).toEqual({ error: "El estudiante no está activo" });
  });

  it("responde 409 ante una inscripción repetida", async () => {
    await inscribir({ estudianteId: 1, materia: "algoritmos" });
    const respuesta = await inscribir({ estudianteId: 1, materia: "algoritmos" });

    expect(respuesta.status).toBe(409);
    expect(await respuesta.json()).toEqual({
      error: "El estudiante ya está inscripto en esta materia"
    });
  });

  it("responde 409 cuando la materia agotó el cupo", async () => {
    await inscribir({ estudianteId: 1, materia: "bases" });
    const respuesta = await inscribir({ estudianteId: 7, materia: "bases" });

    expect(respuesta.status).toBe(409);
    expect(await respuesta.json()).toEqual({ error: "La materia no tiene cupo disponible" });
  });

  it("responde 404 cuando el estudiante no existe", async () => {
    const respuesta = await inscribir({ estudianteId: 999, materia: "algoritmos" });

    expect(respuesta.status).toBe(404);
    expect(await respuesta.json()).toEqual({ error: "Estudiante no encontrado" });
  });

  it("responde 404 cuando la materia no está en la oferta", async () => {
    const respuesta = await inscribir({ estudianteId: 1, materia: "quimica" });

    expect(respuesta.status).toBe(404);
    expect(await respuesta.json()).toEqual({ error: "Materia no encontrada" });
  });

  it("responde 400 cuando falta un campo obligatorio", async () => {
    const respuesta = await inscribir({ materia: "algoritmos" });

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({
      error: "El campo estudianteId debe ser un número entero"
    });
  });

  it("responde 400 cuando el cuerpo no es JSON válido", async () => {
    const respuesta = await inscribir("{ esto no es json");

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: "El cuerpo no es JSON válido" });
  });

  // Hueco detectado leyendo el reporte de cobertura: el cuerpo vacío se trata
  // como objeto vacío y debe fallar por validación, no por JSON inválido.
  it("responde 400 cuando la solicitud llega sin cuerpo", async () => {
    const respuesta = await servidor.pedir("/inscripciones", { method: "POST" });

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({
      error: "El campo estudianteId debe ser un número entero"
    });
  });

  it("no registra nada cuando la inscripción es rechazada", async () => {
    await inscribir({ estudianteId: 42, materia: "algoritmos" });

    const respuesta = await servidor.pedir("/estudiantes/42/inscripciones");

    expect(await respuesta.json()).toEqual([]);
  });
});

describe("GET /estudiantes/:id/inscripciones", () => {
  let servidor: ServidorDePrueba;

  beforeEach(async () => {
    servidor = await levantar(crearAplicacion());
  });

  afterEach(async () => {
    await servidor.cerrar();
  });

  it("devuelve una lista vacía cuando el estudiante no se inscribió", async () => {
    const respuesta = await servidor.pedir("/estudiantes/1/inscripciones");

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual([]);
  });

  it("devuelve sólo las inscripciones de ese estudiante", async () => {
    const cuerpo = (estudianteId: number, materia: string): RequestInit => ({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estudianteId, materia })
    });

    await servidor.pedir("/inscripciones", cuerpo(1, "algoritmos"));
    await servidor.pedir("/inscripciones", cuerpo(7, "bases"));

    const respuesta = await servidor.pedir("/estudiantes/1/inscripciones");
    const inscripciones = (await respuesta.json()) as { materia: string }[];

    expect(inscripciones).toHaveLength(1);
    expect(inscripciones[0]).toMatchObject({ estudianteId: 1, materia: "algoritmos" });
  });

  it("responde 404 cuando el estudiante no existe", async () => {
    const respuesta = await servidor.pedir("/estudiantes/999/inscripciones");

    expect(respuesta.status).toBe(404);
    expect(await respuesta.json()).toEqual({ error: "Estudiante no encontrado" });
  });
});

/**
 * Contrato a nivel de método y encabezado. Estas pruebas nacieron de la consigna
 * de la Unidad 1 (sección 7: "casos de prueba" con `curl -i`) y de la demostración
 * con analizador de paquetes: lo que se ve en Wireshark es exactamente esto.
 *
 * `HEAD` merece pruebas propias porque es el único método cuya respuesta no tiene
 * cuerpo pero sí declara su tamaño: es la prueba de que `Content-Length` viaja en
 * la capa de aplicación y no la calcula TCP.
 */
describe("Contrato HTTP · métodos y encabezados", () => {
  let servidor: ServidorDePrueba;

  beforeEach(async () => {
    servidor = await levantar(crearAplicacion());
  });

  afterEach(async () => {
    await servidor.cerrar();
  });

  it("responde HEAD /salud con el mismo código que GET y sin cuerpo", async () => {
    const respuesta = await servidor.pedir("/salud", { method: "HEAD" });

    expect(respuesta.status).toBe(200);
    expect(await respuesta.text()).toBe("");
  });

  it("anuncia en HEAD el mismo Content-Length que tendría el cuerpo de GET", async () => {
    const conCuerpo = await servidor.pedir("/materias");
    const sinCuerpo = await servidor.pedir("/materias", { method: "HEAD" });

    const bytes = Buffer.byteLength(await conCuerpo.text(), "utf8");

    expect(sinCuerpo.headers.get("content-length")).toBe(String(bytes));
    expect(conCuerpo.headers.get("content-length")).toBe(String(bytes));
  });

  it("responde HEAD sobre una ruta inexistente con 404 y sin cuerpo", async () => {
    const respuesta = await servidor.pedir("/ruta-inexistente", { method: "HEAD" });

    expect(respuesta.status).toBe(404);
    expect(await respuesta.text()).toBe("");
  });

  it("responde OPTIONS con 204 y anuncia los métodos admitidos", async () => {
    const respuesta = await servidor.pedir("/materias", { method: "OPTIONS" });

    expect(respuesta.status).toBe(204);
    expect(respuesta.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
    expect(await respuesta.text()).toBe("");
  });

  it("responde 405 —y no 404— cuando la ruta existe pero el método no", async () => {
    const respuesta = await servidor.pedir("/materias", { method: "DELETE" });

    expect(respuesta.status).toBe(405);
    expect(respuesta.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
    expect(await respuesta.json()).toEqual({ error: "Método no permitido" });
  });

  it("distingue el método admitido en cada ruta: /inscripciones sólo acepta POST", async () => {
    const respuesta = await servidor.pedir("/inscripciones");

    expect(respuesta.status).toBe(405);
    expect(respuesta.headers.get("allow")).toBe("POST, OPTIONS");
  });

  it("declara Content-Length en las respuestas con cuerpo", async () => {
    const respuesta = await servidor.pedir("/salud");
    const bytes = Buffer.byteLength(await respuesta.text(), "utf8");

    expect(respuesta.headers.get("content-length")).toBe(String(bytes));
    expect(respuesta.headers.get("transfer-encoding")).toBeNull();
  });
});

/**
 * Endpoint didáctico de la Unidad 1: un vector en memoria que hace observable
 * lo que un `POST` produce. El par POST → GET es el que se muestra en clase.
 */
describe("POST /vector y GET /vector", () => {
  let servidor: ServidorDePrueba;

  const agregar = (cuerpo: unknown): Promise<Response> =>
    servidor.pedir("/vector", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    });

  beforeEach(async () => {
    servidor = await levantar(crearAplicacion());
  });

  afterEach(async () => {
    await servidor.cerrar();
  });

  it("empieza vacío", async () => {
    const respuesta = await servidor.pedir("/vector");

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual({ total: 0, cantidad: 0, elementos: [] });
  });

  it("responde 201 con el índice donde quedó el elemento", async () => {
    const respuesta = await agregar({ elemento: "hola" });

    expect(respuesta.status).toBe(201);
    expect(respuesta.headers.get("location")).toBe("/vector/0");
    expect(await respuesta.json()).toEqual({
      indice: 0,
      elemento: "hola",
      tipo: "texto",
      total: 1
    });
  });

  it("el GET posterior muestra el elemento agregado", async () => {
    await agregar({ elemento: "hola" });
    await agregar({ elemento: "chau" });

    const respuesta = await servidor.pedir("/vector");

    expect(await respuesta.json()).toEqual({
      total: 2,
      cantidad: 2,
      elementos: [
        { indice: 0, elemento: "hola", tipo: "texto" },
        { indice: 1, elemento: "chau", tipo: "texto" }
      ]
    });
  });

  // Contraste deliberado con POST /inscripciones, que responde 409 al repetirse:
  // POST no es idempotente, y acá se ve porque el vector admite repetidos.
  it("dos POST iguales agregan dos elementos", async () => {
    await agregar({ elemento: "hola" });
    const segundo = await agregar({ elemento: "hola" });

    expect(segundo.status).toBe(201);
    expect(await segundo.json()).toMatchObject({ indice: 1, total: 2 });
  });

  it("acepta el dato en la URL, como parámetro de consulta", async () => {
    const respuesta = await servidor.pedir("/vector?elemento=desdeLaUrl", { method: "POST" });

    expect(respuesta.status).toBe(201);
    expect(await respuesta.json()).toMatchObject({ elemento: "desdeLaUrl", tipo: "texto" });
  });

  // El cuerpo es el lugar correcto para el dato de un POST; la consulta existe
  // sólo para poder mostrarlo en clase. Si vienen los dos, gana el cuerpo.
  it("el cuerpo tiene precedencia sobre la consulta", async () => {
    const respuesta = await servidor.pedir("/vector?elemento=porLaUrl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ elemento: "porElCuerpo" })
    });

    expect(await respuesta.json()).toMatchObject({ elemento: "porElCuerpo" });
  });

  it("distingue el número 42 del texto \"42\" según por dónde viajó", async () => {
    const porElCuerpo = await agregar({ elemento: 42 });
    const porLaUrl = await servidor.pedir("/vector?elemento=42", { method: "POST" });

    expect(await porElCuerpo.json()).toMatchObject({ elemento: 42, tipo: "numero" });
    expect(await porLaUrl.json()).toMatchObject({ elemento: "42", tipo: "texto" });
  });

  it("responde 400 cuando el elemento falta o está vacío", async () => {
    expect((await agregar({})).status).toBe(400);
    expect((await agregar({ elemento: "   " })).status).toBe(400);
    expect(await (await agregar({})).json()).toEqual({
      error: "El campo elemento debe ser un texto no vacío o un número"
    });
  });

  // Hueco detectado leyendo el reporte de cobertura: la rama del cuerpo ilegible
  // en POST /vector no estaba ejercitada por ninguna prueba.
  it("responde 400 cuando el cuerpo no es JSON válido", async () => {
    const respuesta = await servidor.pedir("/vector", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ esto no es json"
    });

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: "El cuerpo no es JSON válido" });
  });

  it("filtra con un parámetro de consulta sin cambiar el índice real", async () => {
    await agregar({ elemento: "hola" });
    await agregar({ elemento: "Chau" });

    const respuesta = await servidor.pedir("/vector?contiene=cha");

    expect(await respuesta.json()).toEqual({
      total: 2,
      cantidad: 1,
      elementos: [{ indice: 1, elemento: "Chau", tipo: "texto" }]
    });
  });

  it("devuelve un elemento por su índice", async () => {
    await agregar({ elemento: "hola" });

    const respuesta = await servidor.pedir("/vector/0");

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual({ indice: 0, elemento: "hola", tipo: "texto" });
  });

  it("responde 404 cuando el índice está fuera del vector", async () => {
    const respuesta = await servidor.pedir("/vector/7");

    expect(respuesta.status).toBe(404);
    expect(await respuesta.json()).toEqual({ error: "No hay ningún elemento en esa posición" });
  });

  it("responde 400 cuando el índice no es un entero", async () => {
    const respuesta = await servidor.pedir("/vector/abc");

    expect(respuesta.status).toBe(400);
    expect(await respuesta.json()).toEqual({ error: "El índice debe ser un número entero" });
  });

  it("vacía el vector con DELETE y responde 204", async () => {
    await agregar({ elemento: "hola" });

    const borrado = await servidor.pedir("/vector", { method: "DELETE" });

    expect(borrado.status).toBe(204);
    expect(await borrado.text()).toBe("");
    expect(await (await servidor.pedir("/vector")).json()).toMatchObject({ total: 0 });
  });

  it("anuncia en OPTIONS los cuatro métodos del recurso", async () => {
    const respuesta = await servidor.pedir("/vector", { method: "OPTIONS" });

    expect(respuesta.headers.get("allow")).toBe("GET, HEAD, POST, DELETE, OPTIONS");
  });
});

/**
 * `/eco` no guarda nada: devuelve lo que recibió. Sirve para ver, sin adivinar,
 * en qué parte del mensaje viajó cada dato.
 */
describe("/eco", () => {
  let servidor: ServidorDePrueba;

  beforeEach(async () => {
    servidor = await levantar(crearAplicacion());
  });

  afterEach(async () => {
    await servidor.cerrar();
  });

  it("devuelve el método, la ruta y los parámetros de consulta", async () => {
    const respuesta = await servidor.pedir("/eco?nombre=Ana&materia=algoritmos");

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toMatchObject({
      metodo: "GET",
      ruta: "/eco",
      consulta: { nombre: "Ana", materia: "algoritmos" }
    });
  });

  it("devuelve el cuerpo tal como llegó y también interpretado", async () => {
    const respuesta = await servidor.pedir("/eco", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"elemento":42}'
    });

    expect(await respuesta.json()).toMatchObject({
      metodo: "POST",
      cuerpo: {
        crudo: '{"elemento":42}',
        bytes: 15,
        esJsonValido: true,
        interpretado: { elemento: 42 }
      }
    });
  });

  it("avisa cuando el cuerpo no es JSON válido, sin fallar", async () => {
    const respuesta = await servidor.pedir("/eco", { method: "POST", body: "{ roto" });

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toMatchObject({
      cuerpo: { crudo: "{ roto", esJsonValido: false, interpretado: null }
    });
  });

  it("muestra los encabezados que envió el cliente", async () => {
    const respuesta = await servidor.pedir("/eco", { headers: { "X-Materia": "backend" } });
    const eco = (await respuesta.json()) as { encabezados: Record<string, string> };

    expect(eco.encabezados["x-materia"]).toBe("backend");
  });
});
