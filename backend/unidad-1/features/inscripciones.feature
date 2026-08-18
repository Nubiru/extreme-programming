# language: es
@api
Característica: Inscripción de estudiantes en materias
  Como coordinador de carrera
  quiero inscribir estudiantes en las materias que ofrece la facultad
  para controlar el cupo disponible y la condición de cada estudiante.

  # Datos de partida (repositorio en memoria, uno nuevo por escenario):
  #   Estudiantes  1 Ana Pérez (activa) · 7 Lucía Fernández (activa) · 42 Juan Gómez (inactivo)
  #   Materias     "algoritmos" con cupo 2 · "bases" con cupo 1

  Escenario: Un estudiante activo se inscribe en una materia con cupo
    Cuando inscribo al estudiante 1 en la materia "algoritmos"
    Entonces la respuesta tiene código 201
    Y la inscripción registrada corresponde al estudiante 1 en "algoritmos"
    Y la materia "algoritmos" queda con 1 cupo disponible

  Escenario: La inscripción queda visible en el legajo del estudiante
    Dado que el estudiante 1 ya está inscripto en "algoritmos"
    Cuando consulto las inscripciones del estudiante 1
    Entonces la respuesta tiene código 200
    Y el legajo contiene 1 inscripción en "algoritmos"

  # Agregado tras la prueba de mutación: sin este escenario, contar mal los cupos
  # (sumar inscripciones de otras materias) sólo lo detectaba la prueba unitaria.
  Escenario: El cupo de una materia no se ve afectado por inscripciones en otra
    Dado que el estudiante 1 ya está inscripto en "bases"
    Entonces la materia "algoritmos" queda con 2 cupos disponibles
    Y la materia "bases" queda con 0 cupos disponibles

  Escenario: Un estudiante inactivo no puede inscribirse
    Cuando inscribo al estudiante 42 en la materia "algoritmos"
    Entonces la respuesta tiene código 409
    Y el mensaje de error es "El estudiante no está activo"
    Y la materia "algoritmos" queda con 2 cupos disponibles

  Escenario: No se admite inscribirse dos veces en la misma materia
    Dado que el estudiante 1 ya está inscripto en "algoritmos"
    Cuando inscribo al estudiante 1 en la materia "algoritmos"
    Entonces la respuesta tiene código 409
    Y el mensaje de error es "El estudiante ya está inscripto en esta materia"

  Escenario: Una materia sin cupo rechaza nuevas inscripciones
    Dado que el estudiante 1 ya está inscripto en "bases"
    Cuando inscribo al estudiante 7 en la materia "bases"
    Entonces la respuesta tiene código 409
    Y el mensaje de error es "La materia no tiene cupo disponible"

  Escenario: No se puede inscribir a un estudiante que no existe
    Cuando inscribo al estudiante 999 en la materia "algoritmos"
    Entonces la respuesta tiene código 404
    Y el mensaje de error es "Estudiante no encontrado"

  Escenario: No se puede inscribir en una materia fuera de la oferta
    Cuando inscribo al estudiante 1 en la materia "quimica"
    Entonces la respuesta tiene código 404
    Y el mensaje de error es "Materia no encontrada"

  Escenario: El contrato exige el identificador del estudiante
    Cuando envío la siguiente solicitud de inscripción:
      """
      { "materia": "algoritmos" }
      """
    Entonces la respuesta tiene código 400
    Y el mensaje de error es "El campo estudianteId debe ser un número entero"

  Escenario: El contrato exige la materia
    Cuando envío la siguiente solicitud de inscripción:
      """
      { "estudianteId": 1 }
      """
    Entonces la respuesta tiene código 400
    Y el mensaje de error es "El campo materia es obligatorio"

  Escenario: Un cuerpo mal formado se rechaza antes de tocar el dominio
    Cuando envío la siguiente solicitud de inscripción:
      """
      { esto no es json
      """
    Entonces la respuesta tiene código 400
    Y el mensaje de error es "El cuerpo no es JSON válido"
