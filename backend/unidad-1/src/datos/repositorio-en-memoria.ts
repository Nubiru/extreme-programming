import type { EstadoAcademico, Inscripcion } from "../dominio/inscripciones.ts";
import type { Elemento } from "../dominio/vector.ts";

/**
 * Persistencia en memoria. Sigue sin haber base de datos: lo que importa acá es
 * que la aplicación dependa de una interfaz y no de un arreglo global, para que
 * cada prueba pueda trabajar con datos propios.
 */
export interface Repositorio {
  estado(): EstadoAcademico;
  agregarInscripcion(inscripcion: Inscripcion): void;

  // Vector didáctico de la Unidad 1: sirve para ver el efecto de un POST.
  vector(): readonly Elemento[];
  /** Agrega al final y devuelve la posición en la que quedó. */
  agregarAlVector(elemento: Elemento): number;
  vaciarVector(): void;
}

export function crearRepositorioEnMemoria(): Repositorio {
  const estudiantes = [
    { id: 1, nombre: "Ana Pérez", activo: true },
    { id: 7, nombre: "Lucía Fernández", activo: true },
    { id: 42, nombre: "Juan Gómez", activo: false }
  ];

  const materias = [
    { codigo: "algoritmos", nombre: "Algoritmos y Estructuras de Datos", cupo: 2 },
    { codigo: "bases", nombre: "Bases de Datos", cupo: 1 }
  ];

  const inscripciones: Inscripcion[] = [];
  const vector: Elemento[] = [];

  return {
    estado: () => ({ estudiantes, materias, inscripciones }),
    agregarInscripcion: (inscripcion) => {
      inscripciones.push(inscripcion);
    },

    vector: () => vector,
    agregarAlVector: (elemento) => vector.push(elemento) - 1,
    vaciarVector: () => {
      vector.length = 0;
    }
  };
}
