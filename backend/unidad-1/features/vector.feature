# language: es
@api
Característica: Un vector en memoria para ver qué hace un POST
  Como estudiante de la Unidad 1
  quiero agregar elementos a un vector y volver a consultarlo
  para observar que una solicitud POST produce un efecto que un GET revela.

  # Es el ejemplo más simple posible de lo que hace una base de datos: guardar
  # algo y poder recuperarlo. Cada escenario arranca con el vector vacío.

  Escenario: Lo que se agrega con POST aparece en el GET siguiente
    Cuando agrego el elemento "hola" al vector
    Entonces la respuesta tiene código 201
    Y el encabezado "location" vale "/vector/0"
    Cuando consulto el vector
    Entonces la respuesta tiene código 200
    Y el vector tiene 1 elemento
    Y el elemento 0 del vector es "hola"

  Escenario: El vector conserva el orden en que llegaron los elementos
    Cuando agrego el elemento "primero" al vector
    Y agrego el elemento "segundo" al vector
    Y consulto el vector
    Entonces el vector tiene 2 elementos
    Y el elemento 0 del vector es "primero"
    Y el elemento 1 del vector es "segundo"

  # Contraste con POST /inscripciones, que ante la repetición responde 409:
  # POST no es idempotente, y repetirlo no siempre significa lo mismo.
  Escenario: Repetir el mismo POST agrega dos veces
    Cuando agrego el elemento "hola" al vector
    Y agrego el elemento "hola" al vector
    Entonces la respuesta tiene código 201
    Cuando consulto el vector
    Entonces el vector tiene 2 elementos

  Escenario: El dato también puede viajar en la URL
    Cuando agrego el elemento "desdeLaUrl" al vector por la URL
    Entonces la respuesta tiene código 201
    Y el elemento guardado es del tipo "texto"

  Escenario: Por la URL todo llega como texto; en el cuerpo JSON hay tipos
    Cuando agrego el número 42 al vector
    Entonces el elemento guardado es del tipo "numero"
    Cuando agrego el elemento "42" al vector por la URL
    Entonces el elemento guardado es del tipo "texto"

  Escenario: Un elemento vacío no se guarda
    Cuando agrego el elemento "   " al vector
    Entonces la respuesta tiene código 400
    Y el mensaje de error es "El campo elemento debe ser un texto no vacío o un número"
    Cuando consulto el vector
    Entonces el vector tiene 0 elementos

  Escenario: La consulta filtra sin alterar las posiciones
    Cuando agrego el elemento "hola" al vector
    Y agrego el elemento "Chau" al vector
    Y consulto el vector filtrando por "cha"
    Entonces el vector tiene 1 elemento
    Y el elemento 1 del vector es "Chau"

  Escenario: DELETE vacía el vector
    Cuando agrego el elemento "hola" al vector
    Y vacío el vector
    Entonces la respuesta tiene código 204
    Cuando consulto el vector
    Entonces el vector tiene 0 elementos
