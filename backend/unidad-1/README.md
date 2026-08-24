# Unidad 1 — Fundamentos del desarrollo backend

Servidor HTTP en TypeScript sobre Node.js, sin frameworks, con el módulo nativo
`node:http`. La historia de inscripciones se desarrolló con TDD y se verifica en
tres niveles: dominio (Vitest), contrato HTTP (Vitest) y aceptación (Cucumber).

## Requisitos

Node.js 22.18 o superior: ejecuta TypeScript directamente, sin compilar.

## Comandos

```bash
npm install

npm start            # ejecuta el servidor en http://localhost:3000
npm run dev          # ejecuta y reinicia ante cada cambio
npm run check        # verifica los tipos sin ejecutar

npm test             # pruebas de dominio y de contrato (Vitest)
npm run test:watch   # modo observación, para el ciclo rojo-verde-refactor
npm run coverage     # cobertura v8 en consola y en coverage/index.html
npm run aceptacion   # escenarios Gherkin en español (Cucumber)
npm run verificar    # tipos + pruebas + aceptación, lo mismo que corre CI
```

Para cambiar el puerto: `PORT=4000 npm start`.

## Endpoints

| Método | Ruta                          | Respuesta                                              |
| ------ | ----------------------------- | ------------------------------------------------------ |
| `GET`  | `/salud`                      | `200` estado y fecha del servidor                       |
| `GET`  | `/hora`                       | `200` hora actual en ISO 8601                           |
| `GET`  | `/materias`                   | `200` oferta con `cuposDisponibles` calculado           |
| `GET`  | `/estudiantes/:id`            | `200` el estudiante · `400` id no entero · `404` no existe |
| `GET`  | `/estudiantes/:id/inscripciones` | `200` inscripciones del estudiante · `404` no existe |
| `POST` | `/inscripciones`              | `201` inscripción creada · ver tabla de rechazos        |
| `HEAD` | cualquier ruta de `GET`       | los mismos encabezados que `GET`, sin cuerpo            |
| `OPTIONS` | cualquier ruta conocida    | `204` con `Allow` listando los métodos admitidos        |
| otro   | ruta conocida                 | `405` con `Allow`: la ruta existe, la operación no      |
| —      | ruta desconocida              | `404` con un mensaje de error                           |

`HEAD` se resuelve con el mismo manejador que `GET` y se omite el cuerpo al escribir
la respuesta, así que ninguna ruta puede quedar con `GET` y sin `HEAD`. Todas las
respuestas con cuerpo declaran `Content-Length`: es la única forma que tiene el
cliente de saber dónde termina el mensaje, porque TCP entrega un flujo de bytes sin
marcas de fin. `HEAD` existe justamente para pedir ese dato sin transferir el cuerpo.

### `POST /inscripciones`

```json
{ "estudianteId": 1, "materia": "algoritmos" }
```

| Código | Situación                       | Mensaje                                          |
| ------ | ------------------------------- | ------------------------------------------------ |
| `201`  | Inscripción aceptada            | cuerpo con `id`, `estudianteId`, `materia`, `fecha`; encabezado `Location` |
| `400`  | Cuerpo no interpretable         | `El cuerpo no es JSON válido`                     |
| `400`  | Falta o es inválido un campo    | `El campo estudianteId debe ser un número entero` / `El campo materia es obligatorio` |
| `404`  | El estudiante no existe         | `Estudiante no encontrado`                        |
| `404`  | La materia no está en la oferta | `Materia no encontrada`                           |
| `409`  | El estudiante está inactivo     | `El estudiante no está activo`                    |
| `409`  | Ya estaba inscripto             | `El estudiante ya está inscripto en esta materia` |
| `409`  | La materia agotó el cupo        | `La materia no tiene cupo disponible`             |

Se distingue `400` (no puedo interpretar la solicitud) de `409` (la entiendo,
pero el estado del sistema no la admite).

### Datos de partida

Siguen siendo datos en memoria; todavía no hay base de datos. El repositorio se
crea nuevo en cada llamada a `crearAplicacion()`, por eso cada prueba parte de
un estado limpio.

| Estudiantes                    | Materias                          |
| ------------------------------ | --------------------------------- |
| `1` Ana Pérez · activa         | `algoritmos` · cupo 2             |
| `7` Lucía Fernández · activa   | `bases` · cupo 1                  |
| `42` Juan Gómez · inactivo     |                                   |

### Comprobación manual

```bash
curl -i http://localhost:3000/salud
curl -i http://localhost:3000/materias
curl -i -X POST http://localhost:3000/inscripciones \
  -H 'Content-Type: application/json' \
  -d '{"estudianteId":1,"materia":"algoritmos"}'
curl -i http://localhost:3000/estudiantes/1/inscripciones
```

## Demostración con analizador de paquetes

```bash
./demo/captura-http.sh              # captura + 21 solicitudes (pide sudo)
./demo/captura-http.sh --sin-captura # sólo las solicitudes, sin sudo
```

Levanta el servidor, ejercita el contrato completo con `curl -i` y captura el tráfico
con `tshark` para abrirlo con Wireshark. El guion de la clase —qué instalar, qué
mostrar y cómo leer la captura capa por capa— está en
[`demo/GUION-DEMO.md`](demo/GUION-DEMO.md); la salida de una corrida real quedó en
[`demo/sesion-ejemplo.txt`](demo/sesion-ejemplo.txt).

## Estructura

```
unidad-1/
├── src/
│   ├── dominio/inscripciones.ts        reglas puras: sin HTTP, sin Node
│   ├── dominio/inscripciones.test.ts   pruebas unitarias
│   ├── dominio/suma.ts                 kata de la Unidad 3, con validación
│   ├── dominio/suma.test.ts            pruebas unitarias
│   ├── datos/repositorio-en-memoria.ts persistencia sustituible
│   ├── http/aplicacion.ts              traduce HTTP ↔ dominio
│   ├── http/aplicacion.test.ts         pruebas de contrato
│   ├── pruebas/servidor-de-prueba.ts   levanta la app en un puerto libre
│   ├── pruebas/suma.fixture.ts         ejemplos compartidos por los dos niveles
│   └── servidor.ts                     punto de entrada: sólo escucha
├── demo/                               ← demostración para la clase
│   ├── captura-http.sh                 levanta, ejercita y captura el tráfico
│   ├── GUION-DEMO.md                   qué instalar y cómo leer la captura
│   └── sesion-ejemplo.txt              transcripción de una corrida real
├── features/                           ← lo que Cucumber necesita
│   ├── inscripciones.feature           @api · escenarios sobre el contrato HTTP
│   ├── metodos-http.feature            @api · HEAD, OPTIONS y 405
│   ├── suma.feature                    @dominio · escenarios sobre la función
│   ├── pasos/                          definiciones de pasos
│   │   ├── inscripciones.pasos.ts
│   │   ├── metodos.pasos.ts
│   │   └── suma.pasos.ts
│   └── soporte/mundo.ts                estado compartido por escenario y hooks
├── cucumber.json                       rutas, glob de pasos y formato
├── vitest.config.ts
└── BITACORA-TDD.md                     evidencia del ciclo y de la mutación
```

## Los dos corredores conviven

Vitest y Cucumber no compiten: responden preguntas distintas y no comparten
ningún archivo de configuración.

| | Vitest | Cucumber |
|---|---|---|
| Pregunta | ¿La unidad hace lo que diseñé? | ¿El sistema cumple lo acordado? |
| Lo lee | quien programa | quien programa **y** quien pidió la funcionalidad |
| Archivos | `src/**/*.test.ts` | `features/**/*.feature` |
| Aserciones | `expect` de Vitest | `node:assert/strict` |
| Comando | `npm test` | `npm run aceptacion` |

Tres detalles que evitan que se pisen:

1. `vitest.config.ts` limita la búsqueda a `src/**/*.test.ts`, así que Vitest
   nunca intenta ejecutar una definición de pasos.
2. Los pasos usan `node:assert` y no `expect`: los ayudantes de Vitest sólo
   existen dentro de su propio corredor.
3. Los hooks que levantan el servidor están etiquetados `@api`, de modo que los
   escenarios `@dominio` no pagan el costo de abrir un puerto.

Para correr un subconjunto: `npm run aceptacion -- --tags @dominio`.

## Decisiones técnicas

- **El punto de entrada no contiene conducta.** `crearAplicacion()` devuelve el
  manejador; `servidor.ts` sólo abre el puerto. Sin esa separación las pruebas
  necesitarían un puerto fijo y no podrían correr en paralelo.
- **El dominio no sabe de HTTP.** `inscribir` devuelve un motivo de rechazo;
  la tabla `RESPUESTA_POR_MOTIVO` lo traduce a código y mensaje. Cambiar un
  código de estado no toca las reglas académicas.
- **El reloj se inyecta.** `crearAplicacion({ reloj })` permite afirmar fechas
  exactas sin congelar el tiempo global.
- **Las pruebas de aceptación entran sólo por HTTP.** No importan módulos
  internos, así que sobreviven a una refactorización.

## Limitaciones conocidas

- Los datos viven en memoria: se pierden al reiniciar el servidor.
- Un método no contemplado sobre una ruta existente devuelve `404` y no `405`.
  Es la conducta que ya tenía el servidor; se conserva y queda como deuda.
- `/estudiantes/` (con barra final y sin id) pasó a responder
  `Recurso no encontrado` en lugar de `Estudiante no encontrado`. Es el único
  cambio observable introducido por el refactor.
- Sin autenticación ni control de acceso.

## Uso de IA declarado

El andamiaje de pruebas, el refactor y la historia de inscripciones se
desarrollaron con asistencia de Claude Code. Toda la evidencia de ejecución
—suites, mutación y cobertura— está registrada en `BITACORA-TDD.md` y es
reproducible con `npm run verificar`.
