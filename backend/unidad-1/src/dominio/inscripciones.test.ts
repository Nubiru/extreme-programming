import { describe, expect, it } from "vitest";
import {
  cuposDisponibles,
  inscribir,
  validarSolicitud,
  type EstadoAcademico
} from "./inscripciones.ts";

const FECHA = new Date("2026-03-10T12:00:00.000Z");

/** Estado mínimo y explícito: cada prueba ve exactamente los datos que usa. */
function estadoBase(sobrescribir: Partial<EstadoAcademico> = {}): EstadoAcademico {
  return {
    estudiantes: [
      { id: 1, nombre: "Ana Pérez", activo: true },
      { id: 42, nombre: "Juan Gómez", activo: false }
    ],
    materias: [
      { codigo: "algoritmos", nombre: "Algoritmos y Estructuras de Datos", cupo: 2 },
      { codigo: "bases", nombre: "Bases de Datos", cupo: 1 }
    ],
    inscripciones: [],
    ...sobrescribir
  };
}

describe("validarSolicitud", () => {
  it("acepta una solicitud con estudianteId entero y materia no vacía", () => {
    const resultado = validarSolicitud({ estudianteId: 1, materia: "algoritmos" });

    expect(resultado).toEqual({
      valida: true,
      solicitud: { estudianteId: 1, materia: "algoritmos" }
    });
  });

  it("recorta los espacios alrededor del código de materia", () => {
    const resultado = validarSolicitud({ estudianteId: 1, materia: "  algoritmos  " });

    expect(resultado).toMatchObject({ solicitud: { materia: "algoritmos" } });
  });

  it("rechaza un cuerpo que no es un objeto", () => {
    expect(validarSolicitud("algoritmos")).toEqual({
      valida: false,
      error: "El cuerpo debe ser un objeto JSON"
    });
    expect(validarSolicitud(null)).toMatchObject({ valida: false });
    expect(validarSolicitud([{ estudianteId: 1, materia: "algoritmos" }])).toMatchObject({
      valida: false
    });
  });

  it("rechaza un estudianteId ausente, decimal o escrito como texto", () => {
    const error = "El campo estudianteId debe ser un número entero";

    expect(validarSolicitud({ materia: "algoritmos" })).toEqual({ valida: false, error });
    expect(validarSolicitud({ estudianteId: 1.5, materia: "algoritmos" })).toEqual({
      valida: false,
      error
    });
    expect(validarSolicitud({ estudianteId: "1", materia: "algoritmos" })).toEqual({
      valida: false,
      error
    });
  });

  it("rechaza una materia ausente o compuesta solo por espacios", () => {
    const error = "El campo materia es obligatorio";

    expect(validarSolicitud({ estudianteId: 1 })).toEqual({ valida: false, error });
    expect(validarSolicitud({ estudianteId: 1, materia: "   " })).toEqual({ valida: false, error });
  });
});

describe("cuposDisponibles", () => {
  it("descuenta las inscripciones ya registradas en esa materia", () => {
    const estado = estadoBase({
      inscripciones: [
        { id: 1, estudianteId: 1, materia: "algoritmos", fecha: FECHA.toISOString() }
      ]
    });

    expect(cuposDisponibles(estado, "algoritmos")).toBe(1);
  });

  it("no cuenta las inscripciones de otras materias", () => {
    const estado = estadoBase({
      inscripciones: [{ id: 1, estudianteId: 1, materia: "bases", fecha: FECHA.toISOString() }]
    });

    expect(cuposDisponibles(estado, "algoritmos")).toBe(2);
  });

  it("devuelve cero para una materia que no existe", () => {
    expect(cuposDisponibles(estadoBase(), "inexistente")).toBe(0);
  });
});

describe("inscribir", () => {
  describe("cuando la inscripción procede", () => {
    it("acepta a un estudiante activo en una materia con cupo", () => {
      const resultado = inscribir({ estudianteId: 1, materia: "algoritmos" }, estadoBase(), FECHA);

      expect(resultado).toEqual({
        estado: "aceptada",
        inscripcion: {
          id: 1,
          estudianteId: 1,
          materia: "algoritmos",
          fecha: "2026-03-10T12:00:00.000Z"
        }
      });
    });

    it("acepta al último estudiante que entra justo en el cupo", () => {
      const estado = estadoBase({
        estudiantes: [{ id: 1, nombre: "Ana Pérez", activo: true }],
        inscripciones: [
          { id: 1, estudianteId: 7, materia: "algoritmos", fecha: FECHA.toISOString() }
        ]
      });

      expect(inscribir({ estudianteId: 1, materia: "algoritmos" }, estado, FECHA)).toMatchObject({
        estado: "aceptada"
      });
    });

    it("numera la inscripción a continuación de las existentes", () => {
      const estado = estadoBase({
        inscripciones: [{ id: 1, estudianteId: 1, materia: "bases", fecha: FECHA.toISOString() }]
      });

      expect(inscribir({ estudianteId: 1, materia: "algoritmos" }, estado, FECHA)).toMatchObject({
        inscripcion: { id: 2 }
      });
    });
  });

  describe("cuando la inscripción se rechaza", () => {
    it("rechaza a un estudiante que no existe", () => {
      expect(inscribir({ estudianteId: 999, materia: "algoritmos" }, estadoBase(), FECHA)).toEqual({
        estado: "rechazada",
        motivo: "estudiante-inexistente"
      });
    });

    it("rechaza una materia que no figura en la oferta", () => {
      expect(inscribir({ estudianteId: 1, materia: "quimica" }, estadoBase(), FECHA)).toEqual({
        estado: "rechazada",
        motivo: "materia-inexistente"
      });
    });

    it("rechaza a un estudiante inactivo", () => {
      expect(inscribir({ estudianteId: 42, materia: "algoritmos" }, estadoBase(), FECHA)).toEqual({
        estado: "rechazada",
        motivo: "estudiante-inactivo"
      });
    });

    it("rechaza una segunda inscripción en la misma materia", () => {
      const estado = estadoBase({
        inscripciones: [
          { id: 1, estudianteId: 1, materia: "algoritmos", fecha: FECHA.toISOString() }
        ]
      });

      expect(inscribir({ estudianteId: 1, materia: "algoritmos" }, estado, FECHA)).toEqual({
        estado: "rechazada",
        motivo: "inscripcion-duplicada"
      });
    });

    it("rechaza cuando la materia agotó su cupo", () => {
      const estado = estadoBase({
        inscripciones: [{ id: 1, estudianteId: 42, materia: "bases", fecha: FECHA.toISOString() }]
      });

      expect(inscribir({ estudianteId: 1, materia: "bases" }, estado, FECHA)).toEqual({
        estado: "rechazada",
        motivo: "sin-cupo"
      });
    });

    it("informa la duplicación antes que la falta de cupo, por ser más específica", () => {
      const estado = estadoBase({
        inscripciones: [{ id: 1, estudianteId: 1, materia: "bases", fecha: FECHA.toISOString() }]
      });

      expect(inscribir({ estudianteId: 1, materia: "bases" }, estado, FECHA)).toMatchObject({
        motivo: "inscripcion-duplicada"
      });
    });
  });

  it("no modifica el estado recibido: decidir e inscribir son pasos distintos", () => {
    const estado = estadoBase();

    inscribir({ estudianteId: 1, materia: "algoritmos" }, estado, FECHA);

    expect(estado.inscripciones).toHaveLength(0);
  });
});
