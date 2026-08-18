import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";
import type { MundoDePruebas } from "../soporte/mundo.ts";

/**
 * Los pasos hablan el lenguaje del coordinador de carrera y sólo tocan el
 * sistema por su contrato HTTP. Si mañana cambia la implementación interna,
 * estos escenarios siguen sirviendo como criterio de aceptación.
 */

const cuerpoInscripcion = (estudianteId: number, materia: string): string =>
  JSON.stringify({ estudianteId, materia });

Given(
  "que el estudiante {int} ya está inscripto en {string}",
  async function (this: MundoDePruebas, estudianteId: number, materia: string) {
    await this.inscribir(cuerpoInscripcion(estudianteId, materia));

    assert.equal(
      this.respuesta.status,
      201,
      `La precondición falló: no se pudo inscribir al estudiante ${estudianteId} en ${materia}`
    );
  }
);

When(
  "inscribo al estudiante {int} en la materia {string}",
  async function (this: MundoDePruebas, estudianteId: number, materia: string) {
    await this.inscribir(cuerpoInscripcion(estudianteId, materia));
  }
);

When(
  "envío la siguiente solicitud de inscripción:",
  async function (this: MundoDePruebas, cuerpo: string) {
    await this.inscribir(cuerpo);
  }
);

When(
  "consulto las inscripciones del estudiante {int}",
  async function (this: MundoDePruebas, estudianteId: number) {
    await this.pedir(`/estudiantes/${estudianteId}/inscripciones`);
  }
);

Then("la respuesta tiene código {int}", function (this: MundoDePruebas, codigo: number) {
  assert.equal(
    this.respuesta.status,
    codigo,
    `Se esperaba ${codigo} y se recibió ${this.respuesta.status}: ${JSON.stringify(this.cuerpo)}`
  );
});

Then("el mensaje de error es {string}", function (this: MundoDePruebas, mensaje: string) {
  assert.deepEqual(this.cuerpo, { error: mensaje });
});

Then(
  "la inscripción registrada corresponde al estudiante {int} en {string}",
  function (this: MundoDePruebas, estudianteId: number, materia: string) {
    const inscripcion = this.cuerpo as { estudianteId: number; materia: string; fecha: string };

    assert.equal(inscripcion.estudianteId, estudianteId);
    assert.equal(inscripcion.materia, materia);
    assert.ok(inscripcion.fecha, "La inscripción debe registrar la fecha en que se hizo");
  }
);

Then(
  "la materia {string} queda con {int} cupo/cupos disponible/disponibles",
  async function (this: MundoDePruebas, materia: string, cupos: number) {
    await this.pedir("/materias");

    const oferta = this.cuerpo as { codigo: string; cuposDisponibles: number }[];
    const encontrada = oferta.find((m) => m.codigo === materia);

    assert.ok(encontrada, `La materia ${materia} no figura en la oferta`);
    assert.equal(encontrada.cuposDisponibles, cupos);
  }
);

Then(
  "el legajo contiene {int} inscripción/inscripciones en {string}",
  function (this: MundoDePruebas, cantidad: number, materia: string) {
    const legajo = this.cuerpo as { materia: string }[];

    assert.equal(legajo.length, cantidad);
    assert.ok(
      legajo.every((i) => i.materia === materia),
      `El legajo contiene materias distintas de ${materia}`
    );
  }
);
