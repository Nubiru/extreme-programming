# Bitácora TDD — búsqueda de productos por nombre

Evidencia del proceso rojo → verde → refactor. Reproducible con `npm run verificar`.

**Historia.** Como responsable del catálogo quiero buscar productos por texto en
el nombre (`GET /api/v1/productos?q=texto`) para encontrarlos sin recorrer toda
la lista.

## Secuencia seguida

| # | Fase | Qué se hizo | Resultado observado |
|---|------|-------------|---------------------|
| 1 | Rojo | Se escribieron **antes de implementar**: dos pruebas unitarias del servicio (`productos.service.test.ts`), una prueba de contrato HTTP (`app.test.ts`) y un escenario Gherkin ("Buscar productos por nombre", `features/productos.feature`) | Vitest: `3 failed | 36 passed` · Cucumber: `14 scenarios (13 passed, 1 failed)` |
| 2 | Verde | Implementación mínima: `ProductosService.obtenerTodos(q?)` filtra por `includes` en minúsculas; el controlador lee `request.query.q` solo si es string | Vitest: `39 passed` · Cucumber: `14 scenarios (14 passed)` · `tsc` sin errores |
| 3 | Refactor | No hizo falta: el filtro quedó en el servicio (regla de aplicación), el controlador solo traduce HTTP | Suite completa en verde |

## Salida de la fase roja (evidencia)

```
× filtra por texto en el nombre, sin distinguir mayúsculas
× con un texto que no coincide devuelve una lista vacía
× GET con ?q= filtra por nombre → 200 solo con coincidencias
AssertionError: expected [ { id: 1, …(4) }, { id: 2, …(4) } ] to have a length of 1 but got 2
Tests  3 failed | 36 passed (39)

14 scenarios (13 passed, 1 failed)
85 steps (84 passed, 1 failed)
```

Las pruebas fallaban por la razón correcta: la API respondía 200 pero ignoraba
`q` y devolvía la colección completa.

## Decisiones

- **Dónde vive el filtro:** en el servicio, no en el controlador (el controlador
  solo traduce HTTP) ni en el repositorio (la unidad usa el repositorio como
  acceso a datos simple; si la colección creciera, el filtro bajaría a SQL con
  `WHERE nombre LIKE ?`).
- **`q` no es obligatorio:** sin `q` la conducta anterior se conserva; las 36
  pruebas previas siguieron en verde durante todo el ciclo (red de seguridad).
- **Tres niveles de prueba para la misma conducta:** unitaria con repositorio
  simulado y datos mock, contrato HTTP con Supertest + SQLite `:memory:`, y
  aceptación Gherkin en español (Cucumber) contra la aplicación completa.

## Sobre el resto de la suite

El CRUD inicial de productos y pedidos se construyó con las pruebas escritas
junto al código (no test-first); esta historia es la desarrollada estrictamente
con TDD. Las pruebas de aceptación Gherkin (`features/*.feature`) cubren las
historias de ambas entidades y corren con `npm run aceptacion`.
