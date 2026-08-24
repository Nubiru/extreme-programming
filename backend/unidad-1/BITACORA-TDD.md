# Bitácora TDD — historia vertical de inscripciones

Evidencia del proceso, no sólo del resultado. Reproducible con `npm run verificar`.

**Historia.** Como coordinador de carrera quiero inscribir estudiantes en materias
para controlar el cupo disponible y la condición de cada estudiante.

**Corte vertical.** Regla de dominio → contrato HTTP → persistencia sustituible.
Sin UI: la Unidad 1 es backend.

## Secuencia seguida

| # | Fase | Qué se hizo | Resultado observado |
|---|------|-------------|---------------------|
| 0 | Línea de base | `curl` a los seis casos del README anterior | Conducta heredada registrada |
| 1 | Rojo | Pruebas de caracterización contra `crearAplicacion`, que todavía no existía | Rojo por construcción (ver nota) |
| 2 | Verde | Extraer el manejador de `servidor.ts` a `http/aplicacion.ts` | 7 pruebas en verde, `curl` idéntico a la línea de base |
| 3 | Rojo | Pruebas unitarias de `validarSolicitud`, `cuposDisponibles` e `inscribir` | Escritas antes del módulo de dominio |
| 4 | Verde | Implementar el dominio puro | Reglas verdes sin tocar HTTP |
| 5 | Rojo → verde | Pruebas de contrato de `POST /inscripciones` y del legajo | Se agrega el ruteo y la tabla motivo → código |
| 6 | Aceptación | 10 escenarios Gherkin en español sobre el contrato HTTP | 10 escenarios en verde |
| 7 | Mutación | Tres defectos sembrados, uno por vez | Un hueco real detectado |
| 8 | Refactor | Escenario 11 para cerrar el hueco; dos pruebas para cerrar cobertura | 41 pruebas + 11 escenarios en verde |

> **Nota honesta sobre el paso 1.** Las pruebas de caracterización se escribieron
> antes que el módulo que importan, pero la ejecución en rojo no quedó capturada:
> el entorno bloqueó ese primer intento y la primera corrida registrada ya estaba
> en verde. Los rojos que sí se observaron en esta historia son los del paso 7.
> La conducta previa al refactor quedó registrada por `curl`. En la historia de
> `suma`, más abajo, el rojo sí está capturado en los dos niveles.

## Segunda historia: `suma` (de afuera hacia adentro)

La kata de `TDD-to-backend.md`, ahora con criterios de aceptación primero. Acá sí
quedó capturado el rojo en los dos niveles, en este orden:

| # | Fase | Acción | Salida observada |
|---|------|--------|------------------|
| 1 | Criterios | `features/suma.feature`: 6 escenarios con las reglas acordadas | — |
| 2 | **Rojo (aceptación)** | `npm run aceptacion` sin el módulo de dominio | `ERR_MODULE_NOT_FOUND: src/dominio/suma.ts` |
| 3 | **Rojo (unitario)** | `npm test` con `suma.test.ts` escrito antes del código | `FAIL · Cannot find module './suma.ts'` · 41 pasaron, 1 archivo falló |
| 4 | Verde | Implementar `suma` con la guarda de tipo | 57 pruebas · 16 escenarios en verde |
| 5 | Refactor | El mensaje de error se movió del fixture al dominio | La dependencia va de la prueba al código, no al revés |

El paso 5 corrigió un olor: la constante `MENSAJE_ARGUMENTOS_INVALIDOS` vivía en
`suma.fixture.ts` y el módulo de producción la importaba desde `pruebas/`. Ahora
el dominio la define y el fixture la reexporta.

**Mutación sobre `suma`.** Se anuló la validación (`if (false)` y suma con
casteo), de modo que `"2" + 3` devuelve `"23"`:

| | Unitarias | Aceptación |
|---|---|---|
| Sin validación de tipo | ✅ 8 pruebas fallan | ✅ 1 escenario falla |

**Límite documentado, no resuelto.** `suma(Infinity, 1)` devuelve `Infinity`
porque el criterio acordado sólo excluye `NaN`. Hay una prueba que fija esa
conducta en un bloque llamado *"límites todavía sin acordar con el cliente"*:
si mañana se decide rechazarlo, la prueba falla y obliga a la conversación.

## Tercera historia: métodos y encabezados (`HEAD`, `OPTIONS`, `405`)

Motivo: la demostración con analizador de paquetes. Al probar `curl -I` contra el
servidor apareció un defecto real que ninguna prueba cubría: **`HEAD /salud`
respondía `404`**. El manejador comparaba `solicitud.method === "GET"`, así que
todas las rutas conocidas eran invisibles para `HEAD`.

| # | Fase | Acción | Salida observada |
|---|------|--------|------------------|
| 1 | Descubrimiento | `curl -I http://localhost:3000/salud` contra el servidor real | `HTTP/1.1 404 Not Found` |
| 2 | **Rojo (unitario)** | 7 pruebas nuevas en `aplicacion.test.ts` antes de tocar el código | `6 failed | 58 passed (64)` |
| 3 | Verde | Tabla `RUTAS`, `HEAD` resuelto como `GET`, `Content-Length`, `OPTIONS` y `405` | `64 passed (64)` |
| 4 | Aceptación | `features/metodos-http.feature`: 7 escenarios | `23 scenarios · 105 steps` en verde |

**Nota honesta sobre el orden.** Acá el rojo se capturó en el nivel unitario, no en
el de aceptación: los escenarios de `metodos-http.feature` se escribieron después de
la implementación, para dejar el contrato expresado en el lenguaje de la demo. Para
que no queden como pruebas que "pasan porque sí", se verificaron por mutación.

**Mutación.** Se revirtió la línea que resuelve `HEAD` como `GET`:

```ts
const metodo = metodoSolicitado;   // en vez de: esHead ? "GET" : metodoSolicitado
```

| | Unitarias | Aceptación |
|---|---|---|
| `HEAD` deja de resolverse como `GET` | ✅ 2 pruebas fallan | ✅ 2 escenarios fallan |

**Segundo defecto, encontrado ejecutando la demo.** La primera corrida de
`demo/captura-http.sh` mostró respuestas viejas —`Transfer-Encoding: chunked`,
`HEAD` con `404`— porque había quedado un servidor anterior escuchando en el puerto
3000: `node` terminó con `EADDRINUSE` y `curl` le habló al proceso ajeno sin que
nada avisara. El script ahora verifica que el puerto esté libre antes de arrancar y
corta con un mensaje. Es el mismo punto de la sección 3 de la consigna —dos procesos
no pueden escuchar el mismo puerto— visto como un fallo concreto.

## Cuarta historia: el vector didáctico y `/eco`

Motivo: mostrar en clase qué hace un `POST` sin una base de datos de por medio, y
poder responder «¿el dato puede ir en la URL?» con una demostración en vez de una
explicación.

| # | Fase | Acción | Salida observada |
|---|------|--------|------------------|
| 1 | **Rojo (unitario, dominio)** | `vector.test.ts` antes del módulo | `Cannot find module './vector.ts'` |
| 2 | Verde | `validarElemento` y `describir`, funciones puras | `80 passed (80)` |
| 3 | **Rojo (unitario, HTTP)** | 18 pruebas de contrato antes de tocar el router | `18 failed | 80 passed (98)` |
| 4 | Verde | Rutas `/vector`, `/vector/:indice` y `/eco` + el vector en el repositorio | `98 passed (98)` |
| 5 | **Rojo (aceptación)** | `vector.feature` con 8 escenarios | `8 undefined · 32 pasos sin definir` |
| 6 | Verde | `vector.pasos.ts` | `31 scenarios · 161 steps` |
| 7 | Cobertura | El reporte marcó `aplicacion.ts` en 98,43 % | Faltaba ejercitar el cuerpo ilegible en `POST /vector`; se agregó la prueba → 100 % |

**Decisión de diseño registrada.** El elemento se acepta por dos caminos: el cuerpo
JSON y el parámetro de consulta. El segundo no es una buena práctica —por la URL todo
llega como texto y queda escrito en registros e historial— pero se admite a propósito
para que la diferencia sea observable: la respuesta incluye `tipo`, y `{"elemento":42}`
produce `numero` mientras que `?elemento=42` produce `texto`. Si vienen los dos, gana
el cuerpo, y hay una prueba que lo fija.

**Contraste deliberado con las inscripciones.** Repetir `POST /vector` agrega dos
elementos; repetir `POST /inscripciones` responde `409`. Los dos son correctos: `POST`
no es idempotente, y qué significa repetirlo lo decide el recurso, no el método.

## Estado final

```
tsc --noEmit          sin errores
vitest run            5 archivos · 99 pruebas en verde
cucumber-js           31 escenarios · 161 pasos en verde
cobertura             100 % líneas · 96,34 % ramas
```

## Prueba de mutación (Clase 8)

Cada defecto se sembró por separado y se corrieron las dos suites.

| Defecto sembrado | Unitarias | Contrato | Aceptación |
|------------------|-----------|----------|------------|
| 1 · Se omite la regla "estudiante activo" (`if (false && !estudiante.activo)`) | ✅ 1 falla | ✅ 2 fallan | ✅ 1 escenario falla |
| 2 · El cupo cuenta inscripciones de **todas** las materias | ✅ 1 falla | ❌ no la detecta | ❌ no la detecta |
| 3 · `POST` exitoso devuelve `200` en vez de `201` | ❌ no aplica | ✅ 1 falla | ✅ 4 escenarios fallan |

**Lectura.** El defecto 2 revela un hueco real: ningún escenario inscribía en una
materia y verificaba el cupo de **otra**. Se agregó el escenario *"El cupo de una
materia no se ve afectado por inscripciones en otra"* y se reinyectó el defecto
para comprobar que ahora sí falla (10 pasaron, 1 falló). Con el código restaurado,
los 11 escenarios vuelven a verde.

El defecto 3 muestra el efecto contrario: un cambio de una línea en la capa HTTP
rompe cuatro escenarios de aceptación pero ninguna prueba de dominio. Cada nivel
detecta lo suyo; la duplicación entre niveles no es simetría.

## Cobertura leída como información

```
Statements 100 % (104/104)   Branches 96,05 % (73/76)
Functions  100 % (20/20)     Lines    100 % (97/97)
```

Al leer el primer reporte (93,42 % de ramas) aparecieron tres huecos. Dos se
cerraron con pruebas nuevas porque describían conducta observable:

- subruta desconocida bajo un estudiante existente (`/estudiantes/1/notas` → `404`);
- `POST /inscripciones` sin cuerpo → `400` por validación, no por JSON inválido.

El tercero —`aplicacion.ts:45-46`, los `?? ""` sobre `solicitud.method` y
`solicitud.url`— se deja sin cubrir a propósito: son defensas contra un estado
que el módulo `node:http` no produce. Cubrirlas exigiría simular la solicitud y
la prueba no verificaría ninguna conducta del sistema.

## Trazabilidad requisito → prueba → código

| Criterio de aceptación | Prueba unitaria | Prueba de contrato | Escenario |
|------------------------|-----------------|--------------------|-----------|
| Estudiante activo + cupo → inscripto | `acepta a un estudiante activo…` | `registra la inscripción… 201` | Un estudiante activo se inscribe |
| La inscripción figura en el legajo | — | `devuelve sólo las inscripciones de ese estudiante` | La inscripción queda visible en el legajo |
| El cupo se descuenta | `descuenta las inscripciones ya registradas` | `descuenta el cupo de la materia` | queda con 1 cupo disponible |
| El cupo es por materia | `no cuenta las inscripciones de otras materias` | — | El cupo no se ve afectado por otra materia |
| Estudiante inactivo → rechazo | `rechaza a un estudiante inactivo` | `responde 409…` | Un estudiante inactivo no puede inscribirse |
| Sin inscripción duplicada | `rechaza una segunda inscripción` | `responde 409 ante una inscripción repetida` | No se admite inscribirse dos veces |
| Sin cupo → rechazo | `rechaza cuando la materia agotó su cupo` | `responde 409 cuando la materia agotó el cupo` | Una materia sin cupo rechaza |
| Estudiante o materia inexistente | `rechaza a un estudiante que no existe` / `…materia…` | dos pruebas `404` | dos escenarios `404` |
| Contrato del cuerpo | seis pruebas de `validarSolicitud` | tres pruebas `400` | tres escenarios `400` |

## Decisiones de diseño que empujaron las pruebas

1. **Separar validar de decidir.** `validarSolicitud` responde "¿puedo
   interpretar esto?" y `inscribir` responde "¿debo aceptarlo?". Sin esa
   separación, cada prueba de regla tendría que armar un cuerpo JSON completo.
2. **El dominio no devuelve códigos HTTP.** Devuelve un motivo. Cambiar `409`
   por `422` es una línea en la capa HTTP y ninguna en las reglas.
3. **Inyectar el reloj.** Permite afirmar `fecha` exacta sin congelar el tiempo
   global ni volver frágil la prueba.
4. **`inscribir` no muta el estado.** Decidir y registrar son pasos distintos;
   hay una prueba que lo fija (`no modifica el estado recibido`).
5. **Repositorio nuevo por aplicación.** Cada prueba y cada escenario parten de
   datos limpios sin necesidad de un `reset` compartido.

## Deuda registrada

- Persistencia en memoria: se pierde al reiniciar.
- Método no contemplado sobre ruta existente → `404` en lugar de `405`
  (conducta heredada, conservada a propósito durante el refactor).
- `/estudiantes/` con barra final cambió de mensaje: único cambio observable
  introducido por el refactor.
- Sin CI todavía: el próximo paso es un workflow que ejecute `npm run verificar`.
