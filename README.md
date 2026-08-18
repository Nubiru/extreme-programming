# Programación Extrema y Desarrollo Guiado por Pruebas

Tecnicatura Universitaria en Desarrollo Full Stack · tercer año · segundo cuatrimestre.

Repositorio único para las dos materias del mismo docente: la teoría de XP y el
backend sobre el que se aplica TDD.

## Contenido

| Ruta | Qué es |
| ---- | ------ |
| `backend/unidad-1/` | Servidor HTTP en TypeScript. Historia de inscripciones desarrollada con TDD, 57 pruebas Vitest y 16 escenarios Cucumber |
| `backend/unidad-1/BITACORA-TDD.md` | Evidencia del ciclo rojo-verde-refactor, prueba de mutación y lectura de cobertura |
| `curaduria-unidad1.md` | Curaduría de las cuatro fuentes en español y guión de exposición de la Unidad 1 |
| `curaduria-unidad1.html` | La misma curaduría, generada desde el `.md` |
| `TDD-to-backend.md` | Consigna del docente: la kata de `suma` con Vitest |
| `Planificacion_*.docx`, `Guia_Docente_*.docx`, `Clase 1_*.docx` | Documentos de cátedra |

## Cómo correr el backend

```bash
cd backend/unidad-1
npm ci               # instala exactamente lo que fija el lock

npm start            # servidor en http://localhost:3000
npm run verificar    # tipos + pruebas + aceptación, lo mismo que corre CI
```

Requiere Node.js 22.18 o superior: ejecuta TypeScript sin compilar.

Detalle de endpoints, decisiones técnicas y limitaciones en
[`backend/unidad-1/README.md`](backend/unidad-1/README.md).

## Los dos niveles de prueba

| | Vitest | Cucumber |
|---|---|---|
| Pregunta | ¿La unidad hace lo que diseñé? | ¿El sistema cumple lo acordado? |
| Archivos | `src/**/*.test.ts` | `features/**/*.feature` |
| Comando | `npm test` | `npm run aceptacion` |

Conviven sin conflicto: distinto glob, distinta biblioteca de aserciones y hooks
etiquetados para que sólo los escenarios `@api` levanten un servidor.

## Integración continua

`.github/workflows/ci.yml` ejecuta en cada push y pull request: instalación con
bloqueo, verificación de tipos, pruebas, escenarios de aceptación y cobertura.
El reporte de cobertura queda como artefacto de la corrida.

## Material de cátedra excluido

`AgilePG_SPA.pdf` (Guía Práctica de Ágil, PMI / Agile Alliance) está en
`.gitignore` por ser material con copyright. Para incluirlo en un repositorio
privado, quitar la línea del `.gitignore` y ejecutar `git add -f AgilePG_SPA.pdf`.

## Uso de IA declarado

Parte del andamiaje de pruebas, el refactor y la documentación se desarrollaron
con asistencia de Claude Code. La evidencia de ejecución está registrada en
`BITACORA-TDD.md` y es reproducible con `npm run verificar`.
