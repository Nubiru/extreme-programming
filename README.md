# Programación Extrema y Desarrollo Guiado por Pruebas

Tecnicatura Universitaria en Desarrollo Full Stack · tercer año · segundo cuatrimestre.

Repositorio único para las dos materias del mismo docente: la teoría de XP y el
backend sobre el que se aplica TDD. Todo lo del curso de backend vive en
`backend/`: una carpeta por unidad con su proyecto, y el material de cátedra en
`backend/material/`.

## Contenido

| Ruta | Qué es |
| ---- | ------ |
| `backend/unidad-1/` | Servidor HTTP en TypeScript. Desarrollado con TDD: 64 pruebas Vitest y 23 escenarios Cucumber |
| `backend/unidad-1/BITACORA-TDD.md` | Evidencia del ciclo rojo-verde-refactor, prueba de mutación y lectura de cobertura |
| `backend/unidad-1/CICLO-SOLICITUD-RESPUESTA.md` | Diagramas del recorrido de una solicitud, del árbol de códigos de estado y de las capas |
| `backend/unidad-1/demo/` | Demostración con analizador de paquetes: script, guion de clase y transcripción |
| `backend/unidad-2/` | API REST en capas (Express 5 + TypeScript + SQLite) con CRUD de productos y pedidos: 39 pruebas Vitest y 14 escenarios Cucumber |
| `backend/unidad-2/BITACORA-TDD.md` | Evidencia del ciclo rojo-verde-refactor de la búsqueda `GET /productos?q=` |
| `backend/material/` | Documentos de cátedra de la materia backend: planificación, secuencias didácticas, apuntes de las unidades 1 y 2, cuestionario y planilla de actividades |
| `curaduria-unidad1.md` | Curaduría de las cuatro fuentes en español y guión de exposición de la Unidad 1 |
| `curaduria-unidad1.html` | La misma curaduría, generada desde el `.md` |
| `analisis/ANALISIS-SMART-SHOPPER.md` | Análisis del repositorio ajeno [Cas0570/Smart-Shopper](https://github.com/Cas0570/Smart-Shopper) bajo XP y arquitectura backend |
| `TDD-to-backend.md` | Consigna del docente: la kata de `suma` con Vitest |
| `Planificacion_*.docx`, `Guia_Docente_*.docx`, `Clase 1_*.docx` | Documentos de cátedra de la materia XP |

## Para entender cómo está hecho

Una explicación visual del recorrido completo de una solicitud —las capas, los
códigos de estado, `HEAD` y cómo se construyó con TDD—, pensada para quien tenga
que rendir la unidad:

**[Anatomía de una solicitud HTTP](https://claude.ai/code/artifact/6e1e7891-93e7-4f01-bdd7-9e9071c287d4)**

En el repositorio, lo mismo por escrito:
[`CICLO-SOLICITUD-RESPUESTA.md`](backend/unidad-1/CICLO-SOLICITUD-RESPUESTA.md)
(diagramas) y [`BITACORA-TDD.md`](backend/unidad-1/BITACORA-TDD.md) (el ciclo de
trabajo, con la salida real de cada corrida).

## Cómo correr el backend

Cada unidad es un proyecto independiente con el mismo juego de scripts:

```bash
cd backend/unidad-1     # o backend/unidad-2
npm ci                  # instala exactamente lo que fija el lock

npm start               # servidor en http://localhost:3000
npm run verificar       # tipos + pruebas + aceptación, lo mismo que corre CI
```

Requiere Node.js 22.18 o superior: ejecuta TypeScript sin compilar.

| Unidad | Qué construye | Detalle |
| ------ | ------------- | ------- |
| 1 | Servidor HTTP a mano sobre `node:http`: rutas, códigos de estado, ciclo solicitud-respuesta | [`backend/unidad-1/README.md`](backend/unidad-1/README.md) |
| 2 | API REST versionada en `/api/v1` con capas (rutas, controlador, servicio, repositorio), SQLite nativo e inyección por constructores | [`backend/unidad-2/README.md`](backend/unidad-2/README.md) |

## Caso de estudio: Smart Shopper

Clonamos y auditamos una PWA ajena —[`Cas0570/Smart-Shopper`](https://github.com/Cas0570/Smart-Shopper),
commit `3d768e1`— para discutir en equipo qué tiene de XP, qué le falta de backend
y hasta dónde podría escalar.

**[Smart Shopper bajo XP](https://claude.ai/code/artifact/ef904b90-8a96-4abf-8fc6-262d00e96ba9)**
— el informe para la discusión. Lo mismo por escrito en
[`analisis/ANALISIS-SMART-SHOPPER.md`](analisis/ANALISIS-SMART-SHOPPER.md).

El clon de trabajo no se versiona (está en `.gitignore`). Se reconstruye con:

```bash
git clone https://github.com/Cas0570/Smart-Shopper.git "analisis/smart-shopper"
```

## Los dos niveles de prueba

| | Vitest | Cucumber |
|---|---|---|
| Pregunta | ¿La unidad hace lo que diseñé? | ¿El sistema cumple lo acordado? |
| Archivos | `src/**/*.test.ts` | `features/**/*.feature` |
| Comando | `npm test` | `npm run aceptacion` |

Conviven sin conflicto: distinto glob, distinta biblioteca de aserciones y hooks
etiquetados para que sólo los escenarios `@api` levanten un servidor.

## Integración continua

`.github/workflows/ci.yml` ejecuta en cada push y pull request, una vez por
unidad (`backend/unidad-1` y `backend/unidad-2`): instalación con bloqueo,
verificación de tipos, pruebas y escenarios de aceptación. Para la unidad 1
además corre la cobertura y publica el reporte como artefacto de la corrida.

## Material de cátedra excluido

`AgilePG_SPA.pdf` (Guía Práctica de Ágil, PMI / Agile Alliance) está en
`.gitignore` por ser material con copyright. Para incluirlo en un repositorio
privado, quitar la línea del `.gitignore` y ejecutar `git add -f AgilePG_SPA.pdf`.

## Uso de IA declarado

Parte del andamiaje de pruebas, el refactor y la documentación se desarrollaron
con asistencia de Claude Code. La evidencia de ejecución está registrada en la
`BITACORA-TDD.md` de cada unidad y es reproducible con `npm run verificar`.
