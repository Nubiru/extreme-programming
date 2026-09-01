# **Guía de Ejercicios Prácticos: Análisis de Código, Diagnóstico y Diseño de APIs REST con Express & TypeScript**

**Materia:** Programación Backend (Tecnicatura Universitaria en Desarrollo Full Stack)  
**Basado en:** Documento Docente \- Unidad 2: Diseño e Implementación de APIs  
**Objetivo:** Evaluar la comprensión del código, la identificación de errores de arquitectura REST, validación de datos, manejo centralizado de errores, TypeScript y diseño de endpoints.

## ---

**Instrucciones generales**

> * Analiza detenidamente los fragmentos de código TypeScript/Express provistos en cada ejercicio.  
> * Responde cada una de las preguntas asociadas fundamentando con los conceptos técnicos vistos en la materia (Principios REST, DTO, Manejo de Errores, Inyección de Dependencias, HTTP, etc.).  
> * En caso de identificar errores o fallas de diseño, propone el fragmento de código corregido o la alternativa técnica recomendada.

### ---

**EJERCICIO 1: Diseño de Rutas y Métodos HTTP (Infracción de Principios REST)**

Un desarrollador redactó el siguiente conjunto de rutas en Express para gestionar un recurso de tareas:  
app.get("/api/v1/obtenerTodasLasTareas", (req, res) \=\> { /\* ... \*/ });  
app.post("/api/v1/crearNuevaTarea", (req, res) \=\> { /\* ... \*/ });  
app.post("/api/v1/modificarTarea/:id", (req, res) \=\> { /\* ... \*/ });  
app.get("/api/v1/eliminarTarea/:id", (req, res) \=\> { /\* ... \*/ });  
**Preguntas:**

> 1. ¿Qué principios de diseño de REST están siendo violados en estas definiciones de rutas?  
> 2. Reescribe la tabla de rutas aplicando las buenas prácticas de diseño REST orientadas a recursos recomendadas en el documento docente.

### ---

**EJERCICIO 2: Asunción Falsa de Validación con Tipos de TypeScript**

Observa la siguiente implementación de un controlador para la creación de tareas:  
import { Request, Response } from 'express';  
import { CrearTareaDto } from './tarea.dto';

export function crearTareaController(req: Request, res: Response) {  
    const datos \= req.body as CrearTareaDto;   
      
    // El desarrollador asume que 'datos' ya tiene la estructura válida de CrearTareaDto  
    const nuevaTarea \= tareasService.crear(datos);  
    return res.status(201).json({ data: nuevaTarea });  
}  
**Preguntas:**

> 1. ¿Por qué la aserción de tipo as CrearTareaDto NO garantiza la validez de los datos recibidos en runtime?  
> 2. ¿Qué vulnerabilidades o fallos en ejecución pueden ocurrir si el cliente envía un JSON malformado o incompleto (ej. {} o {"titulo": 123})?

### ---

**EJERCICIO 3: Implementación de Función de Validación Manual DTO**

El siguiente código valida los datos de entrada para la creación de una tarea:  
function validarCrearTarea(datos: unknown): CrearTareaDto {  
    if (typeof datos \!== "object" || datos \=== null) {  
        throw new AppError(400, "INVALID\_BODY", "El cuerpo debe ser un objeto JSON");  
    }  
    const objeto \= datos as Record\<string, unknown\>;  
      
    if (typeof objeto.titulo \!== "string" || objeto.titulo.trim().length \< 3\) {  
        throw new AppError(422, "INVALID\_TITLE", "El título debe tener al menos tres caracteres");  
    }  
      
    const prioridades \= \["baja", "media", "alta"\];  
    if (typeof objeto.prioridad \!== "string" || \!prioridades.includes(objeto.prioridad)) {  
        throw new AppError(422, "INVALID\_PRIORITY", "La prioridad no es válida");  
    }  
      
    return {  
        titulo: objeto.titulo.trim(),  
        prioridad: objeto.prioridad as CrearTareaDto\["prioridad"\]  
    };  
}  
**Preguntas:**

> 1. ¿Por qué se utiliza el código de estado HTTP 422 Unprocessable Content para el título/prioridad en lugar de un código 400 Bad Request?  
> 2. ¿Qué ocurriría si se envía un JSON como {"titulo": " AB ", "prioridad": "alta"}? ¿Pasa o falla la validación? Justifica evaluando el código.

### ---

**EJERCICIO 4: Semántica de Actualización: PUT vs PATCH**

Un servicio expone dos endpoints para modificar recursos existentes:  
// Endpoint A  
app.put("/api/v1/tareas/:id", (req, res) \=\> {  
    const { titulo, prioridad, completada } \= req.body;  
    const tareaActualizada \= service.reemplazar(Number(req.params.id), { titulo, prioridad, completada });  
    res.status(200).json({ data: tareaActualizada });  
});

// Endpoint B  
app.patch("/api/v1/tareas/:id", (req, res) \=\> {  
    const cambios \= req.body;  
    const tareaModificada \= service.actualizarParcial(Number(req.params.id), cambios);  
    res.status(200).json({ data: tareaModificada });  
});  
**Preguntas:**

> 1. Si el cliente envía a PUT /api/v1/tareas/5 únicamente el cuerpo {"completada": true}, ¿cuál es el comportamiento esperado según la especificación HTTP REST y qué problema ocurre con la entidad?  
> 2. Explica el concepto de idempotencia en el contexto de las operaciones PUT y POST.

### ---

**EJERCICIO 5: Conversión e Interpretación de Parámetros de Ruta**

Analiza la extracción del parámetro ID en el siguiente controlador:  
app.get("/api/v1/tareas/:id", (req, res) \=\> {  
    const id \= Number(req.params.id);  
      
    if (\!Number.isInteger(id) || id \<= 0\) {  
        throw new AppError(400, "INVALID\_ID", "El identificador no es válido");  
    }  
      
    const tarea \= service.obtenerPorId(id);  
    res.status(200).json({ data: tarea });  
});  
**Preguntas:**

> 1. ¿Qué valor toma la variable id y qué respuesta devuelve la API si el cliente realiza una petición a GET /api/v1/tareas/abc?  
> 2. ¿Por qué se valida que el ID sea un entero positivo mayor a cero antes de invocar la capa de servicio?

### ---

**EJERCICIO 6: Middleware Centralizado de Errores**

Considera la siguiente implementación del middleware de manejo global de errores:  
export const errorHandler: ErrorRequestHandler \= (error, \_request, response, \_next) \=\> {  
    if (error instanceof AppError) {  
        response.status(error.status).json({  
            error: { code: error.code, message: error.message, details: error.details }  
        });  
        return;  
    }  
      
    console.error(error);  
    response.status(500).json({  
        error: { code: "INTERNAL\_ERROR", message: "Ocurrió un error interno" }  
    });  
};  
**Preguntas:**

> 1. ¿Por qué es fundamental filtrar por error instanceof AppError antes de retornar la respuesta?  
> 2. ¿Por qué NO se deben retornar el stack trace (traza de pila) ni detalles técnicos de errores no controlados (como un fallo de conexión a BDD) en la respuesta JSON enviada al cliente final?

### ---

**EJERCICIO 7: Acoplamiento Directo vs. Inyección de Dependencias**

Un estudiante escribió la siguiente clase para su controlador:  
export class TareasController {  
    private service: TareasService;

    constructor() {  
        const repository \= new TareasRepository();  
        this.service \= new TareasService(repository);  
    }

    public obtenerTodas \= (\_req: Request, res: Response) \=\> {  
        const data \= this.service.obtenerTodas();  
        res.status(200).json({ data });  
    }  
}  
**Preguntas:**

> 1. ¿Qué problema de acoplamiento presenta la instanciación interna con new TareasRepository() y new TareasService() dentro del constructor?  
> 2. Refactoriza la clase TareasController aplicando Inyección de Dependencias por constructor y explica cómo facilita esto la realización de pruebas unitarias con mocks.

### ---

**EJERCICIO 8: Paginación y Cálculo de Offsets**

Analiza el siguiente fragmento del servicio para consultar una colección paginada:  
const page \= Math.max(Number(request.query.page) || 1, 1);  
const limit \= Math.min(  
    Math.max(Number(request.query.limit) || 10, 1),  
    100  
);

const start \= (page \- 1\) \* limit;  
const end \= start \+ limit;

const tareasPaginadas \= todasLasTareas.slice(start, end);  
**Preguntas:**

> 1. Si el cliente realiza una petición con los parámetros ?page=3\&limit=5, ¿cuáles serán los valores de start y end en el método slice?  
> 2. ¿Qué efecto tienen las funciones Math.max y Math.min si el cliente envía valores negativos o muy elevados como ?page=-2\&limit=5000?

### ---

**EJERCICIO 9: Violación de la Arquitectura por Capas**

Observa la siguiente ruta implementada por un desarrollador:  
router.get("/:id", async (req, res) \=\> {  
    const id \= Number(req.params.id);  
    // Acceso directo a la fuente de datos global/memoria  
    const tarea \= baseDeDatosMemoria.find(t \=\> t.id \=== id);  
      
    if (\!tarea) {  
        return res.status(404).json({ error: "No encontrada" });  
    }  
      
    // Regla de negocio ejecutada directamente en la ruta  
    tarea.vistas \= (tarea.vistas || 0\) \+ 1;  
      
    res.status(200).json({ data: tarea });  
});  
**Preguntas:**

> 1. Identifica las responsabilidades mezcladas en este bloque de código y menciona qué capas de la arquitectura modular (Router, Controller, Service, Repository) se están omitiendo o salteando.  
> 2. Indica cuál debería ser la única responsabilidad del Router y del Controller en este flujo.

### ---

**EJERCICIO 10: Especificación OpenAPI (YAML) y Contratos**

Examina el siguiente fragmento de documentación OpenAPI 3.2.0:  
paths:  
  /tareas:  
    post:  
      summary: Crear una tarea  
      requestBody:  
        required: true  
        content:  
          application/json:  
            schema:  
              type: object  
              required: \[titulo, prioridad\]  
              properties:  
                titulo:  
                  type: string  
                  minLength: 3  
                prioridad:  
                  type: string  
                  enum: \[baja, media, alta\]  
      responses:  
        "201":  
          description: Tarea creada  
        "422":  
          description: Datos inválidos  
**Preguntas:**

> 1. Según este contrato OpenAPI, ¿qué respuesta debe retornar la API si un cliente envía el JSON {"titulo": "A", "prioridad": "urgente"}? Indique el código de estado HTTP y la causa.  
> 2. ¿Qué diferencia fundamental existe entre OpenAPI y Swagger?

### ---

**EJERCICIO 11: Modificación Incompatible y Versionado de APIs**

Un equipo tiene desplegada la versión 1 de su API con la siguiente estructura de respuesta en GET /api/v1/tareas/15:  
// Respuesta Versión 1  
{  
  "data": {  
    "id": 15,  
    "titulo": "Preparar TP",  
    "prioridad": "alta"  
  }  
}  
Para la nueva entrega, deciden renombrar la propiedad prioridad a nivelPrioridad y mover el id dentro de un subobjeto metadata.  
**Preguntas:**

> 1. ¿Por qué este cambio constituye una "modificación breaking" (incompatible) para las aplicaciones cliente (frontend/mobile) existentes?  
> 2. ¿Cómo se debe estructurar la URL del nuevo endpoint según las buenas prácticas de versionado de APIs explicadas en la unidad?

### ---

**EJERCICIO 12: Implementación de Encabezados y Estructura de Respuesta DTO**

Considera la creación exitosa de un recurso en Express:  
router.post("/", (request, response) \=\> {  
    const dto \= validarCrearTarea(request.body);  
    const tarea \= service.crear(dto);  
    response.location(\`/api/v1/tareas/${tarea.id}\`).status(201).json({ data: tarea });  
});  
**Preguntas:**

> 1. ¿Cuál es el propósito del encabezado HTTP Location asignado en la respuesta a una petición POST exitosa?  
> 2. ¿Por qué se recomienda envolver la entidad devuelta dentro de un objeto con la propiedad data (ej. { data: tarea }) en lugar de retornar la entidad directamente en la raíz de la respuesta JSON?

### ---

**EJERCICIO 13: Repositorio en Memoria e Inmutabilidad**

Analiza el método obtenerTodas del siguiente Repositorio en memoria:  
export class TareasRepository {  
    private readonly tareas: Tarea\[\] \= \[\];

    // Opción A  
    obtenerTodasA(): Tarea\[\] {  
        return this.tareas;  
    }

    // Opción B  
    obtenerTodasB(): Tarea\[\] {  
        return \[...this.tareas\];  
    }  
}  
**Preguntas:**

> 1. ¿Qué riesgo de seguridad/encapsulamiento tiene la **Opción A** si un servicio o controlador modifica el arreglo devuelto (ej. haciendo repo.obtenerTodasA().pop())?  
> 2. ¿Cómo soluciona la **Opción B** este problema mediante el operador de propagación (spread operator)?

### ---

**EJERCICIO 14: Pruebas Manuales con cURL**

Dado el siguiente comando cURL preparado para probar la API:  
curl \-i \\  
  \-X POST \\  
  \-H "Content-Type: application/json" \\  
  \-d '{"titulo":"Estudiar API","prioridad":"alta"}' \\  
  http://localhost:3000/api/v1/tareas  
**Preguntas:**

> 1. ¿Qué función cumple la opción \-i en el comando curl?  
> 2. ¿Qué ocurre si se omite el encabezado \-H "Content-Type: application/json" cuando el backend utiliza el middleware express.json()? ¿Qué valor tendrá req.body?

### ---

**EJERCICIO 15: Generación Autónoma de Identificadores en la Capa de Persistencia**

Observa los tipos TypeScript definidos para la aplicación:  
export interface CrearTareaDto {  
    titulo: string;  
    prioridad: "baja" | "media" | "alta";  
}

export interface Tarea {  
    id: number;  
    titulo: string;  
    prioridad: "baja" | "media" | "alta";  
    completada: boolean;  
    fechaCreacion: string;  
}  
**Preguntas:**

> 1. ¿Por qué el campo id, completada y fechaCreacion están ausentes en la interfaz CrearTareaDto pero presentes en la interfaz Tarea?  
> 2. ¿En qué capa del sistema (Controller, Service o Repository) se deben generar el id y la fechaCreacion al registrar una nueva tarea, y por qué no deben ser provistos por el cliente HTTP?