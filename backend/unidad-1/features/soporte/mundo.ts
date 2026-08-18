import { After, Before, setWorldConstructor, World } from "@cucumber/cucumber";
import { crearAplicacion } from "../../src/http/aplicacion.ts";
import { levantar, type ServidorDePrueba } from "../../src/pruebas/servidor-de-prueba.ts";

/**
 * El "mundo" es el estado que comparten los pasos de un mismo escenario.
 * Cucumber admite un único constructor de mundo, así que este objeto sirve a
 * los dos tipos de escenario: los que entran por HTTP y los que ejercitan una
 * función del dominio.
 */
export class MundoDePruebas extends World {
  // Escenarios @api
  servidor!: ServidorDePrueba;
  respuesta!: Response;
  cuerpo: unknown;

  // Escenarios @dominio
  resultado: unknown;
  error: unknown;

  /** Único punto por el que los pasos @api tocan el sistema: su contrato HTTP. */
  async pedir(ruta: string, opciones?: RequestInit): Promise<void> {
    this.respuesta = await this.servidor.pedir(ruta, opciones);
    this.cuerpo = await this.respuesta.json();
  }

  async inscribir(cuerpo: string): Promise<void> {
    await this.pedir("/inscripciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: cuerpo
    });
  }

  /**
   * Ejecuta una operación que puede fallar y guarda el resultado o el error.
   * Los pasos "Entonces" deciden después cuál de los dos esperaban: así una
   * excepción inesperada se reporta como aserción y no como escenario roto.
   */
  intentar(operacion: () => unknown): void {
    this.resultado = undefined;
    this.error = undefined;

    try {
      this.resultado = operacion();
    } catch (error) {
      this.error = error;
    }
  }
}

setWorldConstructor(MundoDePruebas);

// Sólo los escenarios etiquetados @api necesitan un servidor: los de dominio
// llaman a la función directamente y no deben pagar el costo de levantarlo.
Before({ tags: "@api" }, async function (this: MundoDePruebas) {
  this.servidor = await levantar(crearAplicacion());
});

After({ tags: "@api" }, async function (this: MundoDePruebas) {
  await this.servidor.cerrar();
});
