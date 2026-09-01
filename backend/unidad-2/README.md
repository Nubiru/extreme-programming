# Unidad 2 — API CRUD modular (productos y pedidos)

API HTTP en TypeScript + Express, reestructurada según la **arquitectura por capas
del punto 7** del material de la unidad: Router → Controller → Service → Repository,
con entidades, DTO validados, errores uniformes e inyección de dependencias.

- **Entidades nuevas:** `Producto` y `Pedido` (un pedido referencia a un producto).
- **Persistencia:** SQLite mediante el módulo nativo `node:sqlite` (archivo `datos.db`;
  las pruebas usan `:memory:`).
- **Pruebas:** Vitest con repositorios simulados y datos mock (servicios),
  Supertest sobre la app completa (contrato HTTP) y aceptación con **Cucumber /
  Gherkin en español** (`features/*.feature`). La búsqueda `?q=` se desarrolló
  con **TDD**; el proceso está documentado en `BITACORA-TDD.md`.

## Estructura (formato del punto 7)

```
src/
├── app.ts                     # arma la aplicación Express (recibe los servicios)
├── server.ts                  # raíz de composición: SQLite → repos → servicios → app
├── comun/
│   └── validar-id.ts          # validación del parámetro de ruta :id
├── db/
│   └── database.ts            # conexión SQLite y esquema
├── errors/
│   └── app-error.ts           # error de aplicación (status, code, message, details)
├── middlewares/
│   ├── error-handler.ts       # manejo centralizado de errores
│   └── not-found.ts           # 404 para rutas desconocidas
├── pruebas/
│   └── repositorios-simulados.ts  # mocks y datos mock para pruebas unitarias
├── productos/
│   ├── producto.ts            # entidad
│   ├── productos.dto.ts       # DTO de entrada + validaciones
│   ├── productos.routes.ts    # router
│   ├── productos.controller.ts
│   ├── productos.service.ts
│   ├── productos.repository.ts    # interfaz + implementación SQLite
│   └── productos.service.test.ts
├── pedidos/                   # mismas capas para la segunda entidad
└── app.test.ts                # pruebas de contrato HTTP (Supertest + SQLite :memory:)
```

## Comandos

```bash
npm install
npm run dev     # servidor con recarga en http://localhost:3000
npm start       # servidor
npm run check   # verificación de tipos
npm test        # 39 pruebas (Vitest: unitarias con mocks + contrato HTTP)
npm run aceptacion  # 14 escenarios Gherkin en español (Cucumber)
npm run verificar   # tipos + Vitest + aceptación
```

Variables: `PORT` (puerto, 3000) y `DB_PATH` (archivo SQLite, `datos.db`).

> Los scripts de ejecución usan `--experimental-transform-types` porque las clases
> emplean *parameter properties* (`constructor(private readonly ...)`), que el modo
> strip-only de Node 22 no admite.

## Endpoints (`/api/v1`)

| Método   | Ruta             | Éxito | Errores        |
| -------- | ---------------- | ----- | -------------- |
| `GET`    | `/productos` (admite `?q=texto`) | 200 | — |
| `GET`    | `/productos/:id` | 200   | 400, 404       |
| `POST`   | `/productos`     | 201 + `Location` | 400, 422 |
| `PUT`    | `/productos/:id` | 200   | 400, 404, 422  |
| `PATCH`  | `/productos/:id` | 200   | 400, 404, 422  |
| `DELETE` | `/productos/:id` | 204   | 400, 404       |
| `GET`    | `/pedidos`       | 200   | —              |
| `GET`    | `/pedidos/:id`   | 200   | 400, 404       |
| `POST`   | `/pedidos`       | 201 + `Location` | 400, 422 |
| `PATCH`  | `/pedidos/:id`   | 200   | 400, 404, 422  |
| `DELETE` | `/pedidos/:id`   | 204   | 400, 404       |

Un pedido se crea en estado `pendiente` y solo sobre un producto existente con
stock suficiente (regla de negocio en el servicio). Con `PATCH` puede cambiarse
`cantidad` o `estado` (`pendiente` → `enviado` → `entregado`). En pedidos el
reemplazo total (`PUT`) no se expone: el producto y la fecha de un pedido no se
reescriben; `PUT` queda demostrado en productos.

Respuestas: éxito `{ "data": ... }`, error `{ "error": { "code", "message", "details" } }`.

### Ejemplos

```bash
curl -i -X POST -H 'Content-Type: application/json' \
  -d '{"nombre":"Notebook","precio":950000,"stock":5}' \
  http://localhost:3000/api/v1/productos

curl -i -X POST -H 'Content-Type: application/json' \
  -d '{"productoId":1,"cantidad":2}' \
  http://localhost:3000/api/v1/pedidos

curl -i http://localhost:3000/api/v1/pedidos/1     # búsqueda por id
```

## Matriz de pruebas (cubierta por `npm test`)

| Caso                                | Resultado esperado |
| ----------------------------------- | ------------------ |
| Crear con datos válidos             | 201 + `Location` + recurso |
| Crear sin campo requerido           | 422                |
| Crear con JSON mal formado          | 400                |
| Consultar id existente              | 200                |
| Consultar id inexistente            | 404                |
| Consultar id inválido (`abc`)       | 400                |
| Reemplazar (`PUT`) producto         | 200                |
| Modificar campo válido (`PATCH`)    | 200                |
| Modificar con valor inválido        | 422                |
| Eliminar recurso existente          | 204 (y luego 404)  |
| Pedido de producto inexistente      | 422                |
| Pedido sin stock suficiente         | 422                |
| Búsqueda `?q=` con y sin coincidencias | 200 solo coincidencias / lista vacía |
| Ruta desconocida                    | 404 uniforme       |

Los mismos casos, contados como historias de usuario, están en Gherkin:
`features/productos.feature` y `features/pedidos.feature` (con `# language: es`),
con pasos en `features/pasos/` y la app levantada sobre SQLite `:memory:` en
`features/soporte/mundo.ts`.
