# language: es
Característica: Administración de productos
  Como responsable del catálogo
  quiero crear, consultar, modificar y eliminar productos
  para mantener actualizada la oferta disponible.

  Escenario: Crear un producto válido
    Cuando creo el producto "Notebook" con precio 950000 y stock 5
    Entonces la respuesta tiene código 201
    Y el producto devuelto tiene nombre "Notebook"

  Escenario: Rechazar un producto con nombre demasiado corto
    Cuando creo el producto "ab" con precio 100 y stock 1
    Entonces la respuesta tiene código 422
    Y el error tiene código "NOMBRE_INVALIDO"

  Escenario: Buscar un producto por id
    Dado que existe el producto "Notebook" con precio 950000 y stock 5
    Cuando consulto el producto 1
    Entonces la respuesta tiene código 200
    Y el producto devuelto tiene nombre "Notebook"

  Escenario: Consultar un producto inexistente
    Cuando consulto el producto 99
    Entonces la respuesta tiene código 404
    Y el error tiene código "PRODUCTO_INEXISTENTE"

  Escenario: Consultar un id inválido
    Cuando consulto el producto "abc"
    Entonces la respuesta tiene código 400
    Y el error tiene código "ID_INVALIDO"

  Escenario: Modificar parcialmente el stock
    Dado que existe el producto "Notebook" con precio 950000 y stock 5
    Cuando cambio el stock del producto 1 a 20
    Entonces la respuesta tiene código 200
    Y el producto devuelto tiene stock 20

  Escenario: Buscar productos por nombre
    Dado que existe el producto "Notebook" con precio 950000 y stock 5
    Y que existe el producto "Mouse inalámbrico" con precio 25000 y stock 3
    Cuando busco productos con el texto "mou"
    Entonces la respuesta tiene código 200
    Y la lista devuelta contiene únicamente "Mouse inalámbrico"

  Escenario: Eliminar un producto existente
    Dado que existe el producto "Notebook" con precio 950000 y stock 5
    Cuando elimino el producto 1
    Entonces la respuesta tiene código 204
    Cuando consulto el producto 1
    Entonces la respuesta tiene código 404
