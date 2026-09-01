# language: es
Característica: Gestión de pedidos
  Como encargado de ventas
  quiero registrar pedidos sobre productos del catálogo
  para que solo se venda lo que existe y tiene stock.

  Antecedentes:
    Dado que existe el producto "Notebook" con precio 950000 y stock 5

  Escenario: Crear un pedido válido
    Cuando pido 2 unidades del producto 1
    Entonces la respuesta tiene código 201
    Y el pedido devuelto está en estado "pendiente"

  Escenario: Rechazar un pedido de un producto inexistente
    Cuando pido 1 unidades del producto 99
    Entonces la respuesta tiene código 422
    Y el error tiene código "PRODUCTO_INEXISTENTE"

  Escenario: Rechazar un pedido sin stock suficiente
    Cuando pido 50 unidades del producto 1
    Entonces la respuesta tiene código 422
    Y el error tiene código "STOCK_INSUFICIENTE"

  Escenario: Buscar un pedido por id
    Dado que ya pedí 2 unidades del producto 1
    Cuando consulto el pedido 1
    Entonces la respuesta tiene código 200
    Y el pedido devuelto está en estado "pendiente"

  Escenario: Avanzar el estado de un pedido
    Dado que ya pedí 2 unidades del producto 1
    Cuando cambio el estado del pedido 1 a "enviado"
    Entonces la respuesta tiene código 200
    Y el pedido devuelto está en estado "enviado"

  Escenario: Rechazar un estado desconocido
    Dado que ya pedí 2 unidades del producto 1
    Cuando cambio el estado del pedido 1 a "perdido"
    Entonces la respuesta tiene código 422
    Y el error tiene código "ESTADO_INVALIDO"
