# APIs REST con Express & TypeScript

**Base:** “Guía de Ejercicios Prácticos: Análisis de Código, Diagnóstico y Diseño de APIs REST con Express & TypeScript”.

> Nota: las respuestas siguen convenciones estándar de HTTP/REST, Express y TypeScript. Si la materia usa una convención particular distinta, conviene ajustar la redacción al Documento Docente de la Unidad 2.

---

## EJERCICIO 1 — Diseño de rutas y métodos HTTP

### 1. ¿Qué principios REST se violan?

Las rutas están diseñadas alrededor de **acciones/verbos** (`obtenerTodasLasTareas`, `crearNuevaTarea`, etc.) en lugar de representar un **recurso** mediante sustantivos.

Además, se usan métodos HTTP con semántica incorrecta:

- `POST /modificarTarea/:id` usa `POST` para una actualización.
- `GET /eliminarTarea/:id` usa `GET` para producir un cambio destructivo.
- `GET` debe ser una operación segura de lectura y no debería eliminar recursos.
- La acción debería expresarse principalmente mediante el **método HTTP**, no mediante el nombre de la URL.

### 2. Rutas corregidas

| Operación | Método | Ruta recomendada |
|---|---|---|
| Obtener todas las tareas | `GET` | `/api/v1/tareas` |
| Crear una tarea | `POST` | `/api/v1/tareas` |
| Reemplazar una tarea completa | `PUT` | `/api/v1/tareas/:id` |
| Actualizar parcialmente una tarea | `PATCH` | `/api/v1/tareas/:id` |
| Eliminar una tarea | `DELETE` | `/api/v1/tareas/:id` |

Opcionalmente, para obtener una tarea individual:

```ts
app.get("/api/v1/tareas/:id", obtenerTareaPorId);
```

La idea es que `/tareas` representa el recurso y que el método HTTP expresa la operación.

---

## EJERCICIO 2 — Falsa validación con tipos TypeScript

### 1. ¿Por qué `as CrearTareaDto` no valida en runtime?

Porque TypeScript realiza comprobaciones principalmente durante el desarrollo/compilación. Los tipos de TypeScript **no existen como validadores automáticos cuando el programa está ejecutándose**.

Esta línea:

```ts
const datos = req.body as CrearTareaDto;
```

no transforma ni comprueba `req.body`. Solo le indica al compilador:

> “Tratá este valor como si fuera un `CrearTareaDto`”.

Por lo tanto, el cliente todavía puede enviar:

```json
{}
```

o:

```json
{
  "titulo": 123
}
```

y la aserción no impedirá que el valor llegue al servicio.

### 2. Fallos posibles

Pueden ocurrir, entre otros:

- errores de ejecución al utilizar propiedades inexistentes;
- `TypeError` al ejecutar métodos de `string` sobre un número o `undefined`;
- almacenamiento de datos inválidos;
- incumplimiento de reglas de negocio;
- errores más profundos en Service o Repository;
- respuestas `500` por errores que deberían haberse detectado como errores de entrada.

Ejemplo:

```ts
datos.titulo.trim();
```

fallará si `titulo` es `123` o no existe.

Importante: un JSON **sintácticamente malformado** normalmente será rechazado por `express.json()` antes de llegar al controlador, habitualmente con un `400`. Los ejemplos `{}` y `{"titulo":123}` son JSON sintácticamente válidos, pero no cumplen el DTO.

---

## EJERCICIO 3 — Validación manual del DTO

### 1. ¿Por qué se usa `422`?

`400 Bad Request` se utiliza apropiadamente cuando la petición no puede interpretarse correctamente, por ejemplo cuando el cuerpo no tiene la forma básica esperada.

En cambio, `422 Unprocessable Content` resulta adecuado cuando el contenido puede interpretarse como JSON pero **no cumple las reglas semánticas de la aplicación**.

Por ejemplo:

```json
{
  "titulo": "A",
  "prioridad": "urgente"
}
```

es JSON válido, pero:

- el título no satisface la longitud mínima;
- la prioridad no pertenece al conjunto permitido.

Por eso el código diferencia:

```ts
throw new AppError(400, "INVALID_BODY", ...);
```

de:

```ts
throw new AppError(422, "INVALID_TITLE", ...);
throw new AppError(422, "INVALID_PRIORITY", ...);
```

### 2. ¿Qué pasa con `{"titulo":" AB ","prioridad":"alta"}`?

**Falla la validación.**

El código evalúa:

```ts
objeto.titulo.trim().length < 3
```

El valor:

```text
" AB "
```

al aplicar `trim()` se convierte en:

```text
"AB"
```

Su longitud es `2`.

Entonces se cumple:

```ts
2 < 3
```

y se lanza:

```ts
new AppError(
  422,
  "INVALID_TITLE",
  "El título debe tener al menos tres caracteres"
);
```

---

## EJERCICIO 4 — PUT vs PATCH

### 1. `PUT /api/v1/tareas/5` con `{"completada": true}`

`PUT` representa normalmente el **reemplazo completo** del estado del recurso en la URI indicada.

El controlador hace:

```ts
const { titulo, prioridad, completada } = req.body;
```

Por lo tanto:

```ts
titulo === undefined;
prioridad === undefined;
completada === true;
```

y luego intenta reemplazar la entidad con:

```ts
{
  titulo: undefined,
  prioridad: undefined,
  completada: true
}
```

Esto puede borrar información, dejar un recurso incompleto o provocar una validación/error.

Si el cliente solamente quiere cambiar `completada`, el método apropiado sería:

```http
PATCH /api/v1/tareas/5
```

con:

```json
{
  "completada": true
}
```

### 2. Idempotencia de PUT y POST

Una operación es **idempotente** cuando repetir exactamente la misma petición varias veces produce el mismo estado final que realizarla una sola vez.

`PUT` es idempotente por semántica HTTP.

Por ejemplo, ejecutar varias veces:

```http
PUT /api/v1/tareas/5
```

con la misma representación debería dejar la tarea 5 siempre en el mismo estado.

`POST`, en cambio, no garantiza idempotencia. Si se repite:

```http
POST /api/v1/tareas
```

el servidor podría crear una tarea nueva en cada ejecución.

---

## EJERCICIO 5 — Parámetros de ruta

### 1. `GET /api/v1/tareas/abc`

Se ejecuta:

```ts
const id = Number("abc");
```

y el resultado es:

```ts
NaN
```

Luego:

```ts
Number.isInteger(NaN)
```

es `false`.

Por lo tanto se lanza:

```ts
new AppError(
  400,
  "INVALID_ID",
  "El identificador no es válido"
);
```

La API debería responder con HTTP `400`.

### 2. ¿Por qué validar un entero positivo?

Porque permite rechazar entradas inválidas **antes de acceder a la capa de servicio**.

Así:

- el Service recibe un valor dentro de su contrato;
- se evita consultar Repository/BDD con identificadores absurdos;
- se separa un ID inválido (`400`) de un ID válido pero inexistente (`404`);
- se reduce lógica defensiva duplicada en capas internas.

---

## EJERCICIO 6 — Middleware centralizado de errores

### 1. ¿Por qué comprobar `instanceof AppError`?

Porque `AppError` representa errores **controlados y esperados** por la aplicación.

Por ejemplo:

- recurso no encontrado;
- datos inválidos;
- ID inválido;
- conflicto de negocio.

En esos casos es razonable confiar en propiedades definidas por la propia aplicación:

```ts
error.status
error.code
error.message
error.details
```

Un error desconocido no debería tratarse automáticamente como un error controlado, porque podría provenir de:

- la base de datos;
- una librería;
- un bug;
- un acceso a `undefined`;
- un fallo del sistema.

Por eso el resto se normaliza como:

```http
500 Internal Server Error
```

### 2. ¿Por qué no devolver stack traces?

Porque pueden exponer información interna sensible:

- nombres y rutas de archivos;
- estructura del proyecto;
- nombres de librerías;
- consultas;
- detalles de infraestructura;
- datos de conexión;
- implementación interna.

Además, la API debería ofrecer al cliente un **contrato estable**, no detalles accidentales de implementación.

Es correcto registrar internamente:

```ts
console.error(error);
```

pero responder externamente:

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Ocurrió un error interno"
  }
}
```

---

## EJERCICIO 7 — Acoplamiento e inyección de dependencias

### 1. Problema del constructor actual

La clase:

```ts
constructor() {
  const repository = new TareasRepository();
  this.service = new TareasService(repository);
}
```

queda directamente acoplada a implementaciones concretas.

El Controller:

- decide qué Repository usar;
- crea el Service;
- administra la construcción de dependencias.

Eso dificulta:

- sustituir Repository;
- reutilizar el Controller;
- cambiar persistencia;
- hacer pruebas unitarias;
- inyectar mocks o stubs.

### 2. Refactor con inyección por constructor

```ts
export class TareasController {
  constructor(
    private readonly service: TareasService
  ) {}

  public obtenerTodas = (_req: Request, res: Response) => {
    const data = this.service.obtenerTodas();

    res.status(200).json({ data });
  };
}
```

La construcción se realiza fuera del Controller:

```ts
const repository = new TareasRepository();
const service = new TareasService(repository);
const controller = new TareasController(service);

router.get("/", controller.obtenerTodas);
```

En una prueba se puede reemplazar el servicio real por un mock:

```ts
const serviceMock = {
  obtenerTodas: () => [
    {
      id: 1,
      titulo: "Prueba",
      prioridad: "alta",
      completada: false,
      fechaCreacion: "2026-01-01T00:00:00.000Z"
    }
  ]
};

const controller = new TareasController(
  serviceMock as TareasService
);
```

Una implementación todavía más desacoplada utilizaría una interfaz para el Service en lugar de depender de la clase concreta.

---

## EJERCICIO 8 — Paginación

### 1. `?page=3&limit=5`

```ts
page = 3;
limit = 5;
```

Entonces:

```ts
start = (3 - 1) * 5;
start = 10;
```

y:

```ts
end = 10 + 5;
end = 15;
```

Se ejecutará:

```ts
todasLasTareas.slice(10, 15);
```

`slice` toma los elementos desde el índice `10` inclusive hasta el `15` exclusivo.

### 2. `?page=-2&limit=5000`

Para `page`:

```ts
Math.max(-2, 1)
```

da:

```ts
1
```

Para `limit`:

```ts
Math.max(5000, 1)
```

da `5000`, y luego:

```ts
Math.min(5000, 100)
```

da:

```ts
100
```

Resultado:

```ts
page = 1;
limit = 100;
```

Esto establece:

- página mínima: `1`;
- límite mínimo: `1`;
- límite máximo: `100`.

Nota adicional: el fragmento no obliga a que `page` y `limit` sean enteros. Para una validación más estricta convendría comprobar también `Number.isInteger(...)`.

---

## EJERCICIO 9 — Violación de arquitectura por capas

### 1. Responsabilidades mezcladas

La ruta está realizando simultáneamente:

**Router**
- define la ruta HTTP.

**Controller**
- interpreta `req.params`;
- construye la respuesta HTTP.

**Repository**
- consulta directamente:

```ts
baseDeDatosMemoria.find(...)
```

**Service**
- ejecuta una regla de negocio:

```ts
tarea.vistas = (tarea.vistas || 0) + 1;
```

También maneja directamente el caso de recurso inexistente.

Por lo tanto, el código saltea la separación entre:

```text
Router
  ↓
Controller
  ↓
Service
  ↓
Repository
```

### 2. Responsabilidad de Router y Controller

**Router**

Debería limitarse principalmente a:

- declarar método y URL;
- aplicar middleware;
- asociar la ruta con el Controller.

Ejemplo:

```ts
router.get("/:id", controller.obtenerPorId);
```

**Controller**

Debería:

- recibir la petición HTTP;
- extraer y validar parámetros de transporte;
- invocar al Service;
- devolver la respuesta HTTP.

Ejemplo:

```ts
public obtenerPorId = (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const tarea = this.service.obtenerPorId(id);

  res.status(200).json({ data: tarea });
};
```

La búsqueda corresponde al Repository y la actualización de `vistas` corresponde al Service.

---

## EJERCICIO 10 — OpenAPI y contratos

### 1. JSON inválido según el contrato

Petición:

```json
{
  "titulo": "A",
  "prioridad": "urgente"
}
```

viola dos reglas:

```yaml
titulo:
  minLength: 3
```

porque `"A"` tiene longitud `1`.

Y:

```yaml
prioridad:
  enum: [baja, media, alta]
```

porque `"urgente"` no pertenece al conjunto permitido.

Según el contrato mostrado, corresponde:

```http
422 Unprocessable Content
```

Causa: el JSON puede interpretarse correctamente, pero sus datos no cumplen las restricciones semánticas del esquema.

### 2. OpenAPI vs Swagger

**OpenAPI** es la especificación estándar utilizada para describir APIs HTTP de forma estructurada.

Permite definir, entre otras cosas:

- rutas;
- métodos;
- parámetros;
- cuerpos;
- esquemas;
- respuestas;
- seguridad.

**Swagger** es el nombre histórico asociado a la especificación original y, actualmente, sobre todo a un ecosistema de herramientas que trabaja con documentos OpenAPI, por ejemplo:

- Swagger UI;
- Swagger Editor;
- Swagger Codegen.

En resumen:

```text
OpenAPI = especificación/contrato.
Swagger = conjunto/ecosistema de herramientas asociado a OpenAPI.
```

---

## EJERCICIO 11 — Breaking changes y versionado

### 1. ¿Por qué es breaking?

Un cliente existente puede tener código como:

```ts
const id = response.data.id;
const prioridad = response.data.prioridad;
```

Si la nueva API devuelve:

```json
{
  "data": {
    "nivelPrioridad": "alta",
    "metadata": {
      "id": 15
    }
  }
}
```

las rutas anteriores dejan de existir:

```ts
response.data.id
response.data.prioridad
```

Esto puede romper frontends, aplicaciones móviles e integraciones ya desplegadas.

Por eso es una modificación incompatible o **breaking change**.

### 2. Nueva URL

La nueva versión debería exponerse, siguiendo el esquema del ejercicio, en:

```http
GET /api/v2/tareas/15
```

La versión existente debería conservarse temporalmente:

```http
GET /api/v1/tareas/15
```

para no romper inmediatamente a los clientes actuales.

---

## EJERCICIO 12 — `Location` y envelope `data`

### 1. Propósito de `Location`

Después de crear exitosamente:

```http
POST /api/v1/tareas
```

la respuesta:

```ts
response.location(
  `/api/v1/tareas/${tarea.id}`
)
```

informa la URI del recurso recién creado.

Por ejemplo:

```http
Location: /api/v1/tareas/42
```

El cliente sabe entonces dónde puede consultar ese recurso:

```http
GET /api/v1/tareas/42
```

### 2. ¿Por qué `{ data: tarea }`?

Usar:

```json
{
  "data": {
    "...": "..."
  }
}
```

crea una estructura consistente y extensible.

En el futuro puede agregarse información adicional sin modificar la forma de `data`:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "total": 200
  }
}
```

También facilita mantener un contrato uniforme entre respuestas individuales, colecciones, paginación y metadatos.

No es una obligación fundamental de REST, sino una convención de diseño útil.

---

## EJERCICIO 13 — Repositorio e inmutabilidad

### 1. Riesgo de la Opción A

```ts
return this.tareas;
```

devuelve la referencia al mismo arreglo interno del Repository.

Entonces:

```ts
repo.obtenerTodasA().pop();
```

ejecuta `pop()` directamente sobre el arreglo almacenado internamente.

Un consumidor externo podría:

- borrar elementos;
- agregar elementos;
- reordenarlos;
- alterar el estado interno del Repository sin utilizar sus métodos oficiales.

Eso rompe el encapsulamiento.

### 2. Solución con spread

```ts
return [...this.tareas];
```

crea un **nuevo arreglo**.

Entonces:

```ts
const resultado = repo.obtenerTodasB();

resultado.pop();
```

solo modifica `resultado`, no:

```ts
this.tareas
```

Importante: es una **copia superficial**. Los objetos `Tarea` dentro de ambos arrays siguen siendo las mismas referencias.

Por ejemplo:

```ts
repo.obtenerTodasB()[0].titulo = "Modificado";
```

todavía podría modificar el objeto interno.

Para una inmutabilidad más fuerte habría que devolver copias de cada objeto, objetos `readonly` u otra estrategia.

---

## EJERCICIO 14 — cURL

### 1. Función de `-i`

La opción:

```bash
-i
```

hace que `curl` muestre también los **encabezados HTTP de la respuesta**.

Por ejemplo:

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/v1/tareas/42
```

además del cuerpo JSON.

Es especialmente útil para verificar:

- código HTTP;
- `Content-Type`;
- `Location`;
- otros headers.

### 2. ¿Qué pasa sin `Content-Type: application/json`?

`express.json()` analiza cuerpos cuya petición coincide con el tipo JSON esperado.

Si se envía el cuerpo con `-d` pero sin:

```http
Content-Type: application/json
```

`express.json()` normalmente no lo procesará como JSON.

Por lo tanto, si ningún otro middleware lo establece o procesa, el Controller no recibirá el objeto esperado y `req.body` será típicamente:

```ts
undefined
```

La validación de entrada debería entonces rechazar la petición.

---

## EJERCICIO 15 — Identificadores y campos generados por el servidor

### 1. ¿Por qué no están en `CrearTareaDto`?

`CrearTareaDto` describe solamente los datos que el cliente está autorizado a aportar para crear una tarea:

```ts
{
  titulo,
  prioridad
}
```

En cambio, `Tarea` representa la entidad completa almacenada por el sistema.

Los demás campos son controlados por el servidor:

**`id`**

Identifica de manera única el recurso. No debería depender de un valor arbitrario enviado por el cliente.

**`completada`**

Puede tener un estado inicial determinado por la aplicación, por ejemplo:

```ts
false
```

**`fechaCreacion`**

Debe reflejar cuándo el sistema creó realmente el recurso.

Separar DTO de entidad evita que el cliente controle campos internos.

### 2. ¿Dónde generar `id` y `fechaCreacion`?

En el enfoque esperado por este ejercicio, el **Repository/capa de persistencia** debe ser responsable de generar o recibir de la BDD el identificador al persistir la entidad.

Ejemplo simplificado:

```ts
export class TareasRepository {
  private tareas: Tarea[] = [];
  private siguienteId = 1;

  crear(dto: CrearTareaDto): Tarea {
    const tarea: Tarea = {
      id: this.siguienteId++,
      titulo: dto.titulo,
      prioridad: dto.prioridad,
      completada: false,
      fechaCreacion: new Date().toISOString()
    };

    this.tareas.push(tarea);

    return { ...tarea };
  }
}
```

La razón principal es que los campos generados por el sistema deben ser **confiables y consistentes**.

El cliente no debería poder enviar:

```json
{
  "id": 999999,
  "fechaCreacion": "1900-01-01"
}
```

y alterar la identidad o la auditoría temporal del sistema.

Matiz arquitectónico: en sistemas más complejos, `fechaCreacion` puede ser una regla de dominio generada en el Service, mientras que `id` suele pertenecer claramente a persistencia/BDD. Pero, según el enfoque y el título de este ejercicio, la respuesta esperada es que la generación se resuelva en la capa de persistencia y no en el Controller ni en el cliente HTTP.

---

# Resumen de conceptos clave

| Concepto | Idea principal |
|---|---|
| REST | URLs orientadas a recursos; métodos HTTP expresan la acción |
| TypeScript | Los tipos no validan automáticamente datos externos en runtime |
| DTO | Define el contrato de entrada/salida, no reemplaza validación |
| `400` | Petición estructuralmente/sintácticamente inválida |
| `422` | Contenido interpretable pero semánticamente inválido |
| `PUT` | Reemplazo; semánticamente idempotente |
| `PATCH` | Modificación parcial |
| `POST` | Creación/acción; no garantiza idempotencia |
| Router | Declara rutas y middleware |
| Controller | Adapta HTTP y llama al Service |
| Service | Reglas de negocio |
| Repository | Acceso/persistencia de datos |
| DI | Reduce acoplamiento y facilita mocks |
| OpenAPI | Contrato formal de la API |
| Swagger | Ecosistema de herramientas alrededor de OpenAPI |
| `Location` | URI del recurso recién creado |
| Spread | Protege la referencia del array, pero hace copia superficial |
| `express.json()` | Procesa cuerpos JSON cuando el `Content-Type` corresponde |
