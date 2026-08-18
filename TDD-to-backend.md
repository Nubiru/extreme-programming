Dame instrucciones para implementar una funcion suma a partir de la prueba de testing.

dame codigo en javascript y vitest para hacer una prueba de testing unitario de una funcion suma.

Indicame el paso a paso

Para aplicar Desarrollo Guiado por Pruebas (TDD - Test-Driven Development), seguimos el ciclo clásico: redactamos primero la prueba (que fallará), escribimos el código mínimo para que pase y luego refactorizamos si es necesario.

A continuación tienes la guía paso a paso utilizando JavaScript y Vitest.

Paso 1: Instalar y configurar Vitest
Si estás iniciando un proyecto con Node.js desde cero, ejecuta los siguientes comandos en tu terminal:

Bash
# Inicializar el proyecto (crea el archivo package.json)
npm init -y

# Instalar Vitest como dependencia de desarrollo
npm install -D vitest
En tu archivo package.json, añade el script para correr las pruebas:

JSON
"scripts": {
  "test": "vitest"
}
Paso 2: Crear el archivo de prueba (Test First)
Primero escribimos la prueba unitaria antes de crear la función. En Vitest, el patrón estándar para nombres de archivo de prueba es [nombre].test.js.

Crea un archivo llamado suma.test.js:

JavaScript
// suma.test.js
import { describe, it, expect } from 'vitest';
import { suma } from './suma.js';

describe('Función suma', () => {
  it('debe retornar 5 al sumar 2 y 3', () => {
    // Organizar / Actuar
    const resultado = suma(2, 3);

    // Afirmar (Assert)
    expect(resultado).toBe(5);
  });

  it('debe manejar números negativos correctamente', () => {
    expect(suma(-1, -4)).toBe(-5);
  });
});
Paso 3: Ejecutar la prueba (Fase Roja 🔴)
Si ejecutas la prueba ahora, fallará porque la función suma ni siquiera existe. Esto confirma que el test está evaluando algo real.

Ejecuta en la terminal:

Bash
npm run test
Resultado esperado: Error indicando que ./suma.js no existe o que suma no está definida.

Paso 4: Implementar la función (Fase Verde 🟢)
Ahora creamos la implementación mínima necesaria para hacer pasar la prueba.

Crea un archivo llamado suma.js:

JavaScript
// suma.js
export function suma(a, b) {
  return a + b;
}
Paso 5: Confirmar que la prueba pasa
Al guardar suma.js, Vitest ejecutará automáticamente la prueba y verás el resultado en verde en tu terminal:

Plaintext
 ✓ suma.test.js (2)
   ✓ Función suma (2)
     ✓ debe retornar 5 al sumar 2 y 3
     ✓ debe manejar números negativos correctamente

 Test Files  1 passed (1)
      Tests  2 passed (2)
1
Escribir el test
Fase Roja
Define las expectativas de tu función en suma.test.js importando los módulos de Vitest.

2
Ejecutar el test y ver el fallo
Verificación
Corre npm run test para asegurar que la prueba falla por falta de implementación.

3
Escribir el código de la función
Fase Verde
Crea suma.js e implementa la lógica mínima necesaria (return a + b).

4
Verificar que pase y refactorizar
Refactor
Revisa la consola para confirmar que la prueba está en verde y limpia el código si es necesario.

¿Quieres agregar validaciones para casos límite (como recibir strings o undefined)?

Yes
si

Aquí tienes el archivo de pruebas actualizado con los casos límite y la implementación necesaria en la función para que todas las pruebas pasen.

1. Actualizar el archivo de pruebas (suma.test.js)
Agregamos casos para verificar que la función lance un error cuando los argumentos no sean de tipo numérico o cuando falten parámetros.

JavaScript
// suma.test.js
import { describe, it, expect } from 'vitest';
import { suma } from './suma.js';

describe('Función suma', () => {
  describe('Casos exitosos', () => {
    it('debe retornar 5 al sumar 2 y 3', () => {
      expect(suma(2, 3)).toBe(5);
    });

    it('debe manejar números negativos correctamente', () => {
      expect(suma(-1, -4)).toBe(-5);
    });

    it('debe trabajar con números decimales', () => {
      expect(suma(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });

  describe('Casos límite y validación de errores', () => {
    it('debe lanzar un error si se pasa un string en lugar de un número', () => {
      expect(() => suma('2', 3)).toThrow('Ambos argumentos deben ser números');
    });

    it('debe lanzar un error si falta uno o ambos argumentos', () => {
      expect(() => suma(5)).toThrow('Ambos argumentos deben ser números');
      expect(() => suma()).toThrow('Ambos argumentos deben ser números');
    });

    it('debe lanzar un error si se pasa null o NaN', () => {
      expect(() => suma(null, 5)).toThrow('Ambos argumentos deben ser números');
      expect(() => suma(NaN, 5)).toThrow('Ambos argumentos deben ser números');
    });
  });
});
2. Actualizar la función (suma.js)
Para hacer pasar los nuevos tests, añadimos la validación correspondiente antes de realizar la operación.

JavaScript
// suma.js
export function suma(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number' || Number.isNaN(a) || Number.isNaN(b)) {
    throw new TypeError('Ambos argumentos deben ser números');
  }

  return a + b;
}