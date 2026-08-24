# language: es
@api
Característica: Métodos y encabezados del contrato HTTP
  Como docente que evalúa la Unidad 1
  quiero ver que el servidor use los métodos y códigos de HTTP de forma coherente
  para comprobar que el contrato no depende de la ruta solamente.

  # Estos escenarios son los que se muestran en clase con `curl -i` y se capturan
  # con Wireshark/tshark. Cada uno corresponde a una línea del guion de la demo.

  Escenario: HEAD devuelve los encabezados de GET sin gastar el cuerpo
    Cuando envío una solicitud HEAD a "/salud"
    Entonces la respuesta tiene código 200
    Y la respuesta llega sin cuerpo
    Y el encabezado "content-type" vale "application/json; charset=utf-8"

  Escenario: HEAD anuncia el tamaño que tendría el cuerpo
    Cuando comparo HEAD y GET sobre "/materias"
    Entonces ambas respuestas declaran el mismo Content-Length
    Y sólo la respuesta de GET trae cuerpo

  Escenario: Una ruta inexistente responde 404 también ante HEAD
    Cuando envío una solicitud HEAD a "/ruta-inexistente"
    Entonces la respuesta tiene código 404
    Y la respuesta llega sin cuerpo

  Escenario: OPTIONS informa qué operaciones admite el recurso
    Cuando envío una solicitud OPTIONS a "/materias"
    Entonces la respuesta tiene código 204
    Y el encabezado "allow" vale "GET, HEAD, OPTIONS"
    Y la respuesta llega sin cuerpo

  Esquema del escenario: El método equivocado no es un recurso inexistente
    Cuando envío una solicitud <método> a "<ruta>"
    Entonces la respuesta tiene código 405
    Y el encabezado "allow" vale "<admitidos>"

    Ejemplos:
      | método | ruta            | admitidos         |
      | DELETE | /materias       | GET, HEAD, OPTIONS |
      | PUT    | /salud          | GET, HEAD, OPTIONS |
      | GET    | /inscripciones  | POST, OPTIONS      |
