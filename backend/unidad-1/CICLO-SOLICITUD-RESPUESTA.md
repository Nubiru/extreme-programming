# El ciclo de una solicitud, paso a paso

Diagrama pedido por la rúbrica de la Unidad 1. Todo lo que sigue describe este
servidor, no un ejemplo genérico: los nombres de archivo y de función son los que
están en `src/`.

## 1. Del comando a la respuesta

```mermaid
sequenceDiagram
    autonumber
    participant C as curl (cliente)
    participant SO as Sistema operativo
    participant N as Node.js
    participant A as aplicacion.ts
    participant D as dominio/inscripciones.ts
    participant R as repositorio-en-memoria.ts

    C->>SO: abrir conexión al puerto 3000
    SO-->>C: saludo de tres vías (SYN · SYN-ACK · ACK)
    C->>SO: POST /inscripciones + cuerpo JSON
    SO->>N: bytes ensamblados, entregados al proceso que escucha en 3000
    N->>A: crearAplicacion()(solicitud, respuesta)
    A->>A: método y ruta · ¿la ruta existe? ¿admite el método?
    A->>A: leerJson(solicitud)
    A->>D: validarSolicitud(cuerpo)
    D-->>A: válida / error de forma → 400
    A->>R: estado()
    R-->>A: estudiantes, materias, inscripciones
    A->>D: inscribir(solicitud, estado, fecha)
    D-->>A: aceptada / rechazada + motivo
    A->>R: agregarInscripcion(...)
    A->>N: writeHead(201) · end(JSON)
    N->>SO: respuesta como bytes
    SO->>C: HTTP/1.1 201 Created + Location + cuerpo
```

El dominio nunca ve un objeto de HTTP: recibe datos y devuelve una decisión. La
capa HTTP traduce esa decisión a un código de estado. Por eso las reglas se pueden
probar sin levantar un servidor.

## 2. Cómo decide la capa HTTP qué responder

```mermaid
flowchart TD
    inicio([Llega una solicitud]) --> head{¿El método es HEAD?}
    head -- sí --> comoGet[Se resuelve como GET.<br/>Al final se omite el cuerpo]
    head -- no --> conocida
    comoGet --> conocida{¿La ruta está<br/>en la tabla RUTAS?}
    conocida -- no --> e404[404 Not Found<br/>Recurso no encontrado]
    conocida -- sí --> options{¿El método<br/>es OPTIONS?}
    options -- sí --> e204[204 No Content<br/>Allow: métodos admitidos]
    options -- no --> admite{¿La ruta admite<br/>ese método?}
    admite -- no --> e405[405 Method Not Allowed<br/>Allow: métodos admitidos]
    admite -- sí --> manejador[Manejador de la ruta]
    manejador --> forma{¿La solicitud<br/>se entiende?}
    forma -- no --> e400[400 Bad Request]
    forma -- sí --> existe{¿Existen los<br/>recursos referidos?}
    existe -- no --> e404b[404 Not Found]
    existe -- sí --> reglas{¿Las reglas de negocio<br/>lo permiten?}
    reglas -- no --> e409[409 Conflict]
    reglas -- sí --> ok[200 OK · 201 Created]
```

La diferencia entre los cuatro errores es la pregunta que ya se pudo responder:

| Código | Lo que el servidor pudo determinar |
| ------ | ---------------------------------- |
| `400`  | No entiendo la solicitud: falta un campo o el JSON está roto. |
| `404`  | La entiendo, pero eso que nombrás no existe. |
| `405`  | Existe el recurso, pero no admite esa operación. Va con `Allow`. |
| `409`  | Existe todo y la entiendo, pero el estado actual no la admite. |

## 3. Dónde vive cada cosa

```mermaid
flowchart LR
    subgraph cliente[Cliente]
        curl[curl · navegador · Postman]
    end
    subgraph proceso[Un proceso de Node.js en el puerto 3000]
        direction TB
        servidor["servidor.ts<br/><i>elige el puerto y escucha</i>"]
        app["http/aplicacion.ts<br/><i>traduce HTTP ↔ decisiones</i>"]
        dom["dominio/inscripciones.ts<br/><i>reglas puras, sin HTTP</i>"]
        datos["datos/repositorio-en-memoria.ts<br/><i>persistencia sustituible</i>"]
        servidor --> app --> dom
        app --> datos
    end
    curl -- "solicitud HTTP" --> servidor
    servidor -- "respuesta HTTP" --> curl
```

`servidor.ts` no contiene ninguna conducta: sólo elige el puerto y escucha. Todo lo
demás está en `crearAplicacion()`, que las pruebas usan sin abrir el puerto 3000.
Ese es el motivo del refactor de la primera clase y está en `BITACORA-TDD.md`.

## 4. Las capas por debajo de HTTP

Lo que `curl` envía como una línea de texto viaja encajado en tres sobres:

```mermaid
flowchart TB
    subgraph eth["Trama Ethernet · direcciones MAC · 1500 bytes de carga útil"]
        subgraph ip["Paquete IP · direcciones IP · encabezado ≥ 20 bytes"]
            subgraph tcp["Segmento TCP · puertos, SEQ y ACK · encabezado ≥ 20 bytes"]
                http["Mensaje HTTP<br/>POST /inscripciones HTTP/1.1<br/>Content-Type: application/json<br/><br/>{&quot;estudianteId&quot;:1,...}"]
            end
        end
    end
```

Cada capa agrega su encabezado y trata a la de arriba como carga útil. TCP garantiza
que los bytes lleguen completos y en orden, pero **no dice dónde termina un mensaje**:
eso lo resuelve HTTP con `Content-Length`. Por eso todas las respuestas de este
servidor lo declaran, y por eso `HEAD` puede informar el tamaño sin enviar el cuerpo.

En una captura sobre la interfaz `lo` —cliente y servidor en la misma máquina— la
capa Ethernet no aparece: no hay placa de red de por medio. Para verla hay que
capturar en la placa real, como explica [`demo/GUION-DEMO.md`](demo/GUION-DEMO.md).
