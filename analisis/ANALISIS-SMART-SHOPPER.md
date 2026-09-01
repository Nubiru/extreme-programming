# Análisis de Smart Shopper bajo la lente de XP y arquitectura backend

**Repositorio analizado:** [`Cas0570/Smart-Shopper`](https://github.com/Cas0570/Smart-Shopper)
**Commit analizado:** `3d768e1` (24/02/2026) · rama única `main`
**Autor original:** Cas Doorn — proyecto de Associate Degree Software Development (Saxion)
**Fecha del análisis:** 25/08/2026

Documento de trabajo para la discusión de equipo. No es una crítica al autor: es un
caso de estudio. El proyecto está bien construido para lo que se propuso ser, y
justamente por eso sirve — los huecos que tiene son los que la materia quiere que
sepamos ver.

---

## 0. Cómo reproducir este análisis

```bash
git clone https://github.com/Cas0570/Smart-Shopper.git "analisis/smart-shopper"
cd analisis/smart-shopper
npm ci
npx vue-tsc --build     # verificación de tipos
npx vitest run          # 189 pruebas
npm audit
```

**Qué se ejecutó realmente en este análisis:**

| Comando | Resultado |
| ------- | --------- |
| `npm ci` | ✅ instala sin errores (Node 22.21.1) |
| `npx vue-tsc --build` | ✅ salida limpia, cero errores de tipos |
| `npm audit` | ⚠️ **28 vulnerabilidades: 4 críticas, 18 altas, 5 medias, 1 baja** |
| `npx tsx` sobre `categorizeItem` / `parseItemsFromText` | ✅ ejecutado — resultados en §4 |
| `npx vitest run --coverage` | ✅ **189/189 pasan en 5,72 s** — pero la cobertura es **43,91 %** de sentencias y **19,16 %** de ramas |

### La cobertura real

El README anuncia *"189 passing unit tests with comprehensive coverage"*. Las 189
pasan. La cobertura es otra historia:

| Alcance | Sentencias | Ramas | Funciones |
| ------- | ---------- | ----- | --------- |
| **Total del proyecto** | **43,91 %** | **19,16 %** | **33,22 %** |
| `components/` (23 componentes) | 24,14 % | 7,53 % | **3,47 %** |
| `views/` (3 vistas) | **no aparecen en el reporte** | — | — |
| `composables/` | 42,04 % | 36,60 % | 32,63 % |
| `stores/` | 68,04 % | 33,33 % | 76,62 % |

**Cuatro lecturas que hay que llevarse a la discusión:**

1. **`views/` no figura en el reporte.** Coverage sólo lista archivos que algún test
   cargó. `ListDetailView.vue`, `ListsView.vue` y `SettingsView.vue` **nunca fueron
   importados por ninguna prueba**: cobertura efectiva 0 %. Las tres vistas son la
   aplicación.
2. **Las dos funcionalidades de portada están sin probar.** El README declara "41 tests"
   de código de barras y "23 tests" de voz. Pero `useBarcodeScanner.ts` tiene **1,81 %**
   de cobertura y `useSpeechRecognition.ts` **21,97 %**. Lo que sí está probado es la
   *base de datos* de productos (`products.ts` al 97,56 %), no el escáner. Las pruebas
   cubren lo fácil de probar, no lo que la funcionalidad promete.
3. **19,16 % de ramas contra 43,91 % de sentencias.** La distancia entre ambos números es
   el retrato de una suite escrita después: recorre el camino feliz y casi ningún `if`.
4. **`utils/categorization.ts` tiene 100 % de cobertura en las cuatro métricas.** Y es
   exactamente el archivo donde vive el defecto de §4.1 —la cantidad que se descarta—
   sin que ninguna prueba lo note. **No hay demostración más limpia de que cobertura no
   es verificación.** Si en la discusión hay que elegir un solo dato, es éste.

---

## 1. Radiografía del repositorio

### Qué es

Una **PWA offline-first de listas de compras**, hecha en Vue 3 + TypeScript estricto
+ Vite + Tailwind 4, con persistencia local en IndexedDB vía Dexie. Entrada por voz
(Web Speech API), escaneo de códigos de barras (ZXing), autocategorización por
palabras clave, múltiples listas, backup a JSON. Desplegada en Vercel.

### Números

| Métrica | Valor |
| ------- | ----- |
| Líneas en `src/` (`.ts` + `.vue`) | 8.307 |
| Componentes Vue | 23 (13 base/UI, 7 de dominio, 3 vistas) |
| Stores Pinia | 5 (`lists`, `items`, `categories`, `products`, `preferences`) |
| Composables | 7 |
| Archivos de prueba | 16, todos en `src/__tests__/` |
| Bloques `it()` | 189 (todos pasan, 5,72 s) |
| Cobertura de sentencias / ramas | **43,91 % / 19,16 %** |
| Aserciones tautológicas (`expect(true).toBe(true)`) | **8** |
| Pruebas que montan un componente (`mount()`) | **1 archivo de 16** |
| Pruebas E2E | **0** |
| Uso de `any` en `src/` | **0** ← muy bien |
| Llamadas a `console.*` en producción | 54 |
| **Commits en toda la historia** | **3** |
| Ramas | 1 (`main`) |
| Pull requests | 0 |

### Estructura de capas

```
Vistas (.vue)  ──►  Stores Pinia  ──►  Composables useDB  ──►  Dexie/IndexedDB
   3 archivos        5 archivos          1 archivo             1 archivo
```

La separación es real y correcta: `useDB.ts` documenta explícitamente que existe
*"para separar la lógica de base de datos de la lógica de store y mejorar la
testeabilidad"*. Es la decisión arquitectónica más acertada del proyecto y es la
que nos permite proponer un backend sin reescribir la UI (§6).

### Lo que está genuinamente bien hecho

No empecemos por lo que falta. Esto es lo que hay que reconocer y copiar:

1. **`design.md` de 17 KB con Job Stories formales.** Cinco historias en formato
   *"When… I want to… so that…"*, cada una descompuesta en Reglas numeradas
   (1.1, 1.2, 2.1…) con ejemplos Given/Then. Es prácticamente Specification by
   Example. La mayoría de los proyectos de cátedra no llegan a esto.
2. **Trazabilidad historia → prueba en el nombre del archivo.** Cada spec se llama
   `rule-3.1-auto-categorization.spec.ts`. Abrís el archivo y sabés qué criterio de
   aceptación defiende. Es la práctica que más vale la pena robar.
3. **TypeScript estricto, cero `any`.** Y `vue-tsc` pasa limpio.
4. **CI real** en GitHub Actions: matriz Node 20/22, `format:check` → `lint:check` →
   `type-check` → `test:run` → `build`, más un job de cobertura que sube el reporte
   como artefacto.
5. **Husky + lint-staged** en pre-commit. La calidad se defiende antes del push.
6. **Diseño offline-first coherente**, no un agregado: Service Worker con estrategias
   de caché diferenciadas, la app funciona sin red por diseño.

---

## 2. Diagnóstico XP: práctica por práctica

Las doce prácticas de Beck, contra la evidencia del repositorio.

| Práctica XP | Estado | Evidencia concreta |
| ----------- | ------ | ------------------ |
| **Cliente en el sitio** | ❌ Ausente | No hay interlocutor. `design.md` fue escrito una vez y nunca se actualizó |
| **Juego de la planificación** | 🟡 Parcial | Hay plan (`design.md` §"Implementation Scope (24 hours)", 3 días × 8 h) pero **no hay estimaciones por historia, ni velocidad, ni backlog vivo** |
| **Historias de usuario** | ✅ Fuerte | 5 Job Stories con 16 Reglas y ejemplos Given/Then |
| **Entregas pequeñas** | ❌ **Ausente — el hallazgo más grave** | `git rev-list --count HEAD` = **3**. El commit inicial se llama `"Chore: Finalized project upload"`: un volcado único de 8.307 líneas |
| **Ritmo sostenible** | ❌ No evaluable / contraindicado | Un plan de "24 horas" para 8.307 líneas es exactamente lo contrario al ritmo sostenible |
| **Metáfora / diseño simple** | ✅ Bien | Vocabulario de dominio consistente (`list`, `item`, `category`, `product`, `preference`) del `design.md` al esquema Dexie |
| **Propiedad colectiva del código** | ❌ Ausente | Un solo autor, un solo commiter. `.editorconfig`/Prettier preparan el terreno pero no hay equipo |
| **Programación en pares** | ❌ Sin evidencia | Cero `Co-authored-by:` en los 3 commits |
| **Estándares de codificación** | ✅ Fuerte | ESLint 9 + Prettier + `.editorconfig` + pre-commit hook + verificación en CI |
| **Integración continua** | 🟡 Configurada pero nunca ejercitada | `.github/workflows/ci.yml` es sólido; con 3 commits en una rama, corrió 3 veces. CI sin integración frecuente es decorado |
| **Pruebas (TDD)** | 🟡 Hay pruebas, **no hay TDD** | 189 pruebas pasan, pero llegaron todas en el mismo commit que el código: **es imposible distinguir rojo-verde-refactor**. Y la suite lo confirma desde adentro: 43,91 % de cobertura, 19,16 % de ramas, 8 aserciones tautológicas (§4.11, §4.12) |
| **Refactorización** | ❌ Sin evidencia | Ningún commit dice "refactor". Con 3 commits no puede haberla |

### El patrón: seis prácticas dependen del versionado, y el versionado no existe

Entregas pequeñas, integración continua, TDD, refactorización, propiedad colectiva y
programación en pares **no se pueden demostrar sin una historia de commits**. El
repositorio tiene todos los *artefactos* de XP (historias, pruebas, CI, linters) y
**ninguno de los ritmos**. Es XP fotografiado, no XP practicado.

Y esto no es un detalle académico: es exactamente lo que separa "tener tests" de
"hacer TDD". Comparalo con nuestro propio `backend/unidad-1/BITACORA-TDD.md`, donde
cada paso rojo-verde-refactor queda con la salida real de la corrida. Esa bitácora
es la prueba que a Smart Shopper le falta.

### El proyecto se autoevalúa y se reprueba

`design.md` §"Success Criteria" fija sus propios criterios de éxito. Los verificamos:

| Criterio que el propio proyecto se puso | Realidad |
| --- | --- |
| "Todas las Reglas con al menos una prueba automatizada mapeada en `PROGRESS.md`" | ❌ **`PROGRESS.md` no existe**. La matriz de trazabilidad prometida nunca se creó |
| "Especificaciones E2E cubriendo todos los Rule IDs" (Playwright, `tests/e2e/`) | ❌ **0 pruebas E2E**. No existe `tests/`, ni `e2e/`, y Playwright no está en `package.json` |
| "Voz y código de barras con pruebas determinísticas mockeadas en CI" | 🟡 Mockeadas a nivel unitario; nunca en un flujo real |
| "Responsive y accesible en los viewports soportados" | ❌ Sin verificación automática. **5 `aria-label` y 2 `role` en 23 componentes** |
| "Desplegado y accesible para revisión docente" | ✅ Cumplido |

El README además apunta a un directorio `docs/` que no existe, y las instrucciones de
instalación dicen `cd Smart-Shopper/smart-shopper` — un subdirectorio inexistente:
**el README no fue ejecutado por nadie desde cero.**

> **Punto de discusión para el equipo.** Cuando un proyecto define sus propios
> criterios de aceptación y después no los cumple, ¿es un problema de disciplina o
> de que los criterios se escribieron en un momento (planificación) y nadie los
> volvió a mirar? En XP el `PROGRESS.md` sería el *radiador de información*. Sin él,
> el `design.md` se vuelve documentación muerta — el enemigo declarado del manifiesto.

---

## 3. El hueco central: **no hay backend**

Para la materia de backend, éste es *el* hallazgo. Smart Shopper es una aplicación
100 % cliente. No hay servidor, no hay API, no hay autenticación, no hay base de
datos compartida. Vercel sirve archivos estáticos y nada más (`vercel.json` sólo
define `rewrites` a `index.html` y tres cabeceras de seguridad).

Toda la persistencia vive en `IndexedDB` dentro del navegador (`src/db/index.ts`,
Dexie, versión de esquema 2, cinco tablas). Y eso arrastra consecuencias que la app
no puede resolver desde el cliente:

| Consecuencia | Detalle |
| --- | --- |
| **Cero multidispositivo** | La lista del teléfono no existe en la notebook. Para un caso de uso de compras — *dos personas, un hogar, una lista* — esto es una limitación de producto, no técnica |
| **Cero colaboración** | El README dice "Share lists", pero `useShare.ts` sólo genera **texto plano** por Web Share API. El receptor recibe un mensaje, no una lista |
| **Persistencia frágil** | IndexedDB es borrable por el navegador (presión de almacenamiento, modo privado, "limpiar datos del sitio"). El único respaldo es un JSON manual que el usuario debe acordarse de exportar |
| **Base de productos aislada** | Cada usuario reconstruye desde cero su diccionario de códigos de barras. El valor de red — que es *todo* el valor de una base de códigos de barras — se desperdicia |
| **Cero telemetría** | 54 `console.log/error` y ninguno sale del dispositivo. Un error en producción es invisible |
| **La "sincronización" es publicidad** | El README afirma *"Syncs automatically when online (if needed)"*. **No hay código de sincronización en el repositorio.** Es una afirmación sin respaldo |

Y el `.gitignore` conceptual del proyecto es revelador: el `design.md` menciona
*"API mocks for tests"* en el Día 2, pero no hay ninguna API que mockear. El backend
estaba en el plan y desapareció en la ejecución.

> **Punto de discusión.** ¿"Offline-first" fue una decisión de arquitectura o una
> forma elegante de no hacer backend? Son cosas distintas. Offline-first *bien
> entendido* es cliente autónomo **con** sincronización eventual contra un servidor
> (el patrón de Notion, Linear, Figma). Sin servidor no es offline-first: es
> **offline-only**. La distinción vale toda la discusión.

---

## 4. Brechas verificadas: defectos concretos

Todo lo de esta sección se verificó ejecutando el código o leyéndolo con la ruta de
llamada completa. Cada ítem es candidato a una historia de nuestro backlog.

### 4.1 🔴 La cantidad se pierde entera — la funcionalidad es fantasma

`parseItemsFromText()` **borra** las cantidades en vez de extraerlas:

```js
processedInput.replace(/\b\d+\s+(bottles?|cans?|boxes?|bags?|jars?)\s+of\s+/gi, '')
```

Ejecutado:

```
parseItemsFromText('get 2 bottles of milk')  →  ["milk"]        // el 2 desapareció
parseItemsFromText('a dozen eggs and some bread')  →  ["eggs","bread"]   // la docena desapareció
```

Y el `grep` sobre las tres rutas de alta de items en `ListDetailView.vue` (líneas
167, 187, 215, 250) confirma que **`createItem` nunca recibe el parámetro
`quantity`**. Siempre queda en el valor por defecto `1`.

Consecuencia en cascada: el campo `quantity` de `ShoppingItem`, el `× {{ item.quantity }}`
de `CategorySection.vue:80` y el formateo `(${item.quantity})` de `useShare.ts:34`
son **código inalcanzable**. El README promete *"Say 'get 2 bottles of milk' and it
understands"*. Entiende el producto y descarta el número.

> Ninguna de las 189 pruebas detecta esto, porque ninguna afirma sobre la cantidad
> resultante. **Es el ejemplo perfecto de que cobertura no es lo mismo que
> verificación.** Una prueba de mutación lo habría cazado.

### 4.2 🔴 La autocategorización usa `includes()` y produce falsos positivos

`categorizeItem()` recorre un diccionario de palabras clave y devuelve la primera
categoría cuya palabra esté **contenida como subcadena**. Ejecutado realmente:

| Entrada | Categoría asignada | Debería ser | Causa |
| ------- | ------------------ | ----------- | ----- |
| `candy` | `pantry` 🔴 | `snacks` | `"candy".includes("can")` |
| `can opener` | `pantry` 🔴 | `household` | `"can opener".includes("can")` |
| `grape juice` | `produce` 🔴 | `beverages` | `"grape juice".includes("grape")` |
| `peppermint tea` | `produce` 🔴 | `beverages` | `"peppermint tea".includes("pepper")` |
| `sausage roll` | `meat` 🟡 | ambiguo | `"sausage"` gana a `"roll"` |
| `pan` | `other` | — | sin soporte de español |
| `leche` | `other` | — | sin soporte de español |

Dos problemas de diseño encadenados:

- **La prioridad depende del orden de inserción de las claves del objeto.** `pepper`
  está en `produce` *y* en `pantry`; gana `produce` porque se declaró antes. Eso es
  una regla de negocio escondida en el orden de un literal.
- **El diccionario está cableado en inglés dentro del código fuente.** 200 líneas de
  `src/utils/categorization.ts`. No hay i18n, no hay archivo de datos externo, no hay
  forma de cargar reglas sin recompilar y redesplegar.

`parseItemsFromText` sólo separa por `and` en inglés: `"sal y azucar"` devuelve un
único item `["sal y azucar"]`.

### 4.3 🔴 El backup pierde datos — el "restore" no restaura

`useBackup.ts:210` lo admite en un comentario:

```js
const newItem = await itemsStore.createItem(newList.id, item.name, item.category)
// Note: We can't restore exact timestamps or IDs as they're auto-generated
```

Se restauran **tres campos** de los once que tiene `ShoppingItem`. Se pierden en cada
restauración: `id`, `quantity`, `unit`, `addedAt`, `completedAt`, `barcode`, `notes`.

Es decir: **exportar → importar → exportar ≠ el original**. No es un backup, es una
copia parcial. Y hay una inconsistencia interna que lo delata: el *otro* camino de
importación, el de listas sueltas en `ListsView.vue:118-126`, **sí** pasa `quantity`
y `unit`. Dos importadores, dos fidelidades distintas, en el mismo proyecto.

### 4.4 🔴 La importación es destructiva y no transaccional

En modo `replace`, `importBackup()` **borra todo primero** y después escribe, con un
`await` por entidad, sin transacción:

```js
if (!merge) {
  for (const id of listIds) await listsStore.deleteList(id)   // ← ya no hay vuelta atrás
  await productsStore.clearProducts()
  for (const id of categoryIds) await categoriesStore.deleteCategory(id)
}
for (const category of backupData.customCategories) { await ... }
for (const product of backupData.products) { await ... }
for (const list of backupData.lists) { await ... for (const item of listItems) { await ... } }
```

Si algo falla en el medio — pestaña cerrada, cuota de disco, JSON corrupto en el
item 400 de 500 — **el usuario se queda sin los datos viejos y sin los nuevos.** No
hay rollback. Dexie ofrece `db.transaction('rw', ...)` y `bulkAdd()`, y el proyecto
no usa ninguno de los dos en esta ruta.

Además, `validateBackup()` sólo comprueba que los campos sean arreglos: **no valida
un solo elemento**. Un `items: [{}]` pasa la validación.

### 4.5 🟡 El aprendizaje de categorías no se aplica a la voz

En `ListDetailView.vue`, la ruta de texto respeta la preferencia aprendida y la de
voz la ignora:

```js
// línea 166 — entrada por texto
const category = categorizeItem(sanitized, preferredCategory)   // ✅

// línea 249 — entrada por voz
const category = categorizeItem(sanitized)                      // ❌ sin preferencia
```

El usuario corrige "yogur → Postres" escribiendo, y al día siguiente lo dicta y vuelve
a caer en Lácteos. El README promete *"Manual learning — override categories and the
app learns your preferences"*; la promesa se rompe según el método de entrada.

### 4.6 🟡 Consulta rota sobre un índice booleano (código muerto)

`useDB.ts:14-20`:

```js
const getActive = async () => db.lists.where('archived').equals(0).toArray()
const getArchived = async () => db.lists.where('archived').equals(1).toArray()
```

`archived` está declarado `boolean` en la interfaz y se guarda como `true`/`false`.
**IndexedDB no admite booleanos como clave de índice** — no se indexan. La comparación
contra `0`/`1` no puede coincidir nunca: ambos métodos devuelven siempre `[]`.

No explota porque **nadie los llama**: `grep` fuera de `useDB.ts` no encuentra un solo
uso. El store filtra en memoria con `computed`. Es una trampa esperando al próximo
que la use. La corrección canónica es persistir `archived: 0 | 1`.

### 4.7 🟡 El umbral de confianza de voz se calcula y se tira

`useSpeechRecognition.ts:135` captura `confidence`, lo propaga por la interfaz… y
`VoiceInputModal.vue` nunca lo consulta: `confirm()` emite el transcript sin mirarlo.
La Regla 1.4 del `design.md` pide explícitamente *"cuando el reconocimiento devuelve
baja confianza → mostrar un diálogo de confirmación"*. La confirmación existe, pero
es incondicional: el dato que la regla exige como disparador es **campo muerto**.

### 4.8 🟠 28 vulnerabilidades, 4 críticas, y nada que las vigile

`npm audit` reporta 28 (4 críticas, 18 altas). El pipeline de CI **no incluye
`npm audit`**, y no hay Dependabot ni Renovate configurados (`.github/` sólo contiene
`workflows/`). Nadie se entera cuando aparece una nueva.

### 4.9 🟠 Cero pruebas de componente y cero E2E

De 23 componentes Vue, **uno solo se monta en una prueba** (`rule-1.1-voice-input.spec.ts`).
`@vue/test-utils` está instalado y prácticamente sin usar. El reporte de cobertura lo
cuantifica: **3,47 % de las funciones de `components/`** se ejecutan alguna vez, y
`views/` **ni siquiera aparece en el reporte** porque ningún test importa una vista.

`ListDetailView.vue` tiene **567 líneas, 346 de ellas de `<script setup>`** — es el
componente con más lógica del proyecto, es donde viven los defectos de §4.1 y §4.5, y
**no tiene ni una prueba**. Todas las Reglas se verifican contra utilidades y stores;
la capa donde el usuario realmente interactúa está sin cubrir.

`vitest.config.ts` incluso excluye `'e2e/*'` — un directorio que nunca se creó.

### 4.10 🟠 Restos de desarrollo en configuración de producción

`vite.config.ts:11`: `allowedHosts: ['.text99.com']` — un dominio ajeno al proyecto,
sin explicación, versionado. Y `devOptions.enabled: true` deja el Service Worker
activo en desarrollo, lo que es una fuente clásica de "funciona en mi máquina" por
caché obsoleta.

### 4.11 🔴 Cuatro pruebas que se auto-anulan y nunca verifican nada en CI

`rule-1.3-pwa-shortcuts.spec.ts` valida los accesos directos del manifiesto PWA leyendo
`dist/manifest.webmanifest`. Si el archivo no está, la prueba **se aprueba a sí misma**:

```js
if (!fs.existsSync(manifestPath)) {
  console.warn('Build dist/manifest.webmanifest not found. Run "npm run build" first.')
  expect(true).toBe(true)   // ← comentario original: "Pass test if manifest doesn't exist yet"
  return
}
```

Ahora mirá el orden de los pasos en `.github/workflows/ci.yml`:

```
línea 40:  - name: Run unit tests     ← acá corren las pruebas
línea 43:  - name: Build project      ← acá recién se genera dist/
```

**Las pruebas corren antes del build.** `dist/` no existe todavía, así que en CI las
cuatro pruebas de manifiesto toman siempre la rama del cortocircuito. **No han verificado
el manifiesto ni una sola vez en la historia del proyecto**, y siempre salieron en verde.
Se confirma en la corrida local: el `stderr` imprime el warning y el archivo reporta
`✓ 7 tests`.

Arreglo inmediato: invertir el orden en CI y reemplazar el `return` por `expect.fail()`
o `it.skip`. Una prueba que no puede correr debe decirlo, no aprobarse.

### 4.12 🟠 Ocho aserciones que no afirman nada

`grep -c "expect(true).toBe(true)"` devuelve **8** en la suite. Cuatro son las de §4.11.
Las otras cuatro están en `rule-2.2-graceful-degradation.spec.ts` y en
`rule-5.2-share-export.spec.ts`, y son peores porque no tienen ni la excusa del archivo
faltante:

```js
it('should not require network access for core functionality', () => {
  // The app is designed to work offline-first
  // All core features use IndexedDB, not network requests
  expect(true).toBe(true)   // "This test validates the architecture decision"
})

it('should have no cloud-only features that break offline', () => {
  expect(true).toBe(true)   // "Architecture test - app works fully offline"
})
```

Eso no es una prueba: es un **comentario disfrazado de prueba**. No puede fallar nunca,
no ejecuta una línea del código de producción, y sin embargo suma dos al contador de 189
que el README exhibe en una insignia.

El detalle que lo vuelve interesante para la materia: la Regla 2.2 del `design.md`
—*"degradación elegante de funcionalidades"*— **queda formalmente cubierta**. Hay un
archivo `rule-2.2-*.spec.ts`, está en verde, la matriz de trazabilidad daría OK. La
trazabilidad por nombre de archivo, que en §1 elogiamos como la mejor práctica del
proyecto, resulta que se puede satisfacer sin verificar nada.

> **Punto de discusión.** Si automatizamos el chequeo "cada Regla tiene su spec" que
> proponemos en la pregunta 5 del §7, este archivo lo pasaría. ¿Qué le agregamos para
> que no se pueda cumplir con un `expect(true)`? Candidatos: umbral mínimo de cobertura
> por módulo, prueba de mutación sobre los archivos de dominio, o prohibir la tautología
> con una regla de ESLint (`jest/no-standalone-expect`, `vitest/no-conditional-tests`).

---

## 5. Optimizaciones

### 5.1 Rendimiento: N+1 en la pantalla principal

`ListsView.vue:30-36`:

```js
onMounted(async () => {
  await listsStore.loadLists()
  const allLists = [...listsStore.activeLists, ...listsStore.archivedLists]
  await Promise.all(allLists.map((list) => itemsStore.loadItems(list.id)))
})
```

Para dibujar el contador "3 de 12" de cada tarjeta, **carga todos los items de todas
las listas, incluidas las archivadas**, y los deja en memoria. Con 40 listas de 80
items son 3.200 objetos hidratados para mostrar 40 números.

Además, esas N cargas concurrentes escriben todas sobre el mismo `loading` ref: la
primera que termina apaga el spinner mientras las otras siguen corriendo. Es una
condición de carrera visible.

**Arreglo:** un contador agregado. En IndexedDB, `db.items.where('listId').equals(id).count()`
usa el índice y no hidrata objetos. Con backend, es una columna desnormalizada o un
`GROUP BY` — nunca traer las filas.

### 5.2 Duplicación: el mismo bloque `try/catch` catorce veces

Cada acción de cada store repite literalmente:

```js
loading.value = true
error.value = null
try { /* tres líneas útiles */ }
catch (e) { error.value = e instanceof Error ? e.message : 'Failed to X'; console.error(...); throw e }
finally { loading.value = false }
```

Está en `lists.ts` (8 acciones), `items.ts` (7), `categories.ts`, `products.ts`.
Son ~250 líneas de andamiaje idéntico. Un envoltorio único —
`withLoading(mensajeDeError, fn)` — lo reduce a una línea por acción y hace que el
manejo de errores sea consistente por construcción.

**Es exactamente el refactor que XP haría** en cuanto la tercera repetición aparece.
Que sobreviva catorce veces confirma §2: no hubo fase de refactor.

### 5.3 `updateByName` recorre la tabla entera en JavaScript

`useDB.ts:169`:

```js
const itemsToUpdate = await db.items.filter((item) => item.name.toLowerCase().trim() === normalizedName).toArray()
await Promise.all(itemsToUpdate.map((item) => db.items.update(item.id, updates)))
```

`Dexie.filter()` **no usa índice**: descarga toda la tabla y filtra en memoria. Y
después dispara una escritura por fila. Existe un índice `name` en el esquema y no se
aprovecha porque la comparación es sobre el nombre normalizado, que no está
persistido. **Arreglo:** guardar un campo `nameNormalized` indexado y usar
`where('nameNormalized').equals(...).modify(updates)` — una sola operación.

### 5.4 Observabilidad: 54 `console.*` y ninguna estrategia

No hay niveles, no hay contexto estructurado, no sale nada del dispositivo. En el
momento en que exista backend, esto tiene que ser un logger con niveles y correlación
de request. Hoy, un error de un usuario es literalmente inobservable.

### 5.5 Modelo de dominio: un `id` que no es un `id`

`Product` usa el `barcode` como clave primaria. Funciona para una base personal, pero
ata el registro a la identidad de un dato externo que cambia (reetiquetados, EAN vs
UPC, productos sin código). Al mover esto a un servidor multiusuario, el `barcode`
debe ser un índice único y no la clave.

---

## 6. Crecimiento y escalabilidad: la propuesta de backend

Acá es donde el análisis se vuelve constructivo. La buena noticia: **la arquitectura
existente permite agregar backend sin tocar la UI.** La capa `useDB.ts` ya es una
frontera de persistencia. Si se convierte en una interfaz con dos implementaciones,
las vistas y los stores no se enteran.

```
                        HOY                                    PROPUESTO

  Vistas ──► Stores ──► useDB ──► Dexie/IndexedDB     Vistas ──► Stores ──► Repositorio (interfaz)
                                                                                 │
                                                                    ┌────────────┴────────────┐
                                                                    ▼                         ▼
                                                            DexieRepo (local)         ApiRepo (remoto)
                                                                    └────────► Motor de sync ◄────────┘
```

### Etapa 1 — Identidad y sincronización (habilita multidispositivo)

**Historia:** *Como usuario con teléfono y notebook, quiero ver la misma lista en
ambos, para no anotar dos veces.*

- API REST o tRPC sobre Node/TypeScript — mismo lenguaje que el cliente, el equipo no
  cambia de contexto. Fastify o NestJS según cuánta estructura quiera el equipo.
- PostgreSQL. El modelo de `db/index.ts` traduce casi directo: `lists`, `items`,
  `categories`, `products`, `category_preferences`, más `users` y `list_members`.
- Autenticación con tokens: acceso corto + refresh. Passkeys si el equipo quiere
  ambición.
- **El punto difícil, y el que hay que discutir en serio: la sincronización.** Offline-first
  significa que dos dispositivos editan sin coordinación y hay que resolver conflictos.
  Tres opciones, de menor a mayor costo:
  1. **Last-Write-Wins por campo** con `updatedAt`. Simple, entendible, pierde
     ediciones concurrentes. Para una lista de compras, probablemente **suficiente**.
  2. **Registro de operaciones** (`add`, `check`, `remove` con timestamp lógico) que
     el servidor reordena. Más justo, mucho más código.
  3. **CRDTs** (Yjs, Automerge). Convergencia garantizada, sin servidor autoritativo
     para la fusión. Elegante, y probablemente **sobreingeniería** para este dominio.
- **Recomendación:** empezar por LWW por campo. Es la decisión reversible; las otras
  dos no lo son. YAGNI aplicado con criterio.

### Etapa 2 — Colaboración real (multiplica el valor del producto)

**Historia:** *Como pareja que convive, queremos tachar items de la misma lista y
verlo en tiempo real, para no comprar dos veces lo mismo.*

- Compartir por lista con roles (`owner`, `editor`, `viewer`) sobre `list_members`.
- Tiempo real por WebSocket o SSE. SSE alcanza si el cliente ya empuja cambios por
  HTTP, y es sensiblemente más simple de operar.
- Presencia liviana: quién está mirando la lista.
- **Esto convierte "Share lists" de un `mailto` glorificado en la función central del
  producto.** Es el mayor salto de valor de toda la propuesta.

### Etapa 3 — Los datos como activo compartido (aquí escala de verdad)

**Historia:** *Como usuario nuevo, quiero que el escáner reconozca productos que yo
nunca escaneé, para que la app sirva desde el primer día.*

- **Catálogo global de códigos de barras**, alimentado por los aportes de todos y/o
  por Open Food Facts. Hoy cada usuario reconstruye el diccionario desde cero: el
  activo más valioso del producto se tira
  a la basura una vez por usuario.
- **Categorización como servicio.** Sacar las 200 líneas de palabras clave del bundle
  y llevarlas al servidor: reglas versionadas, actualizables sin redesplegar el
  cliente, y — con las correcciones manuales agregadas de todos los usuarios — un
  clasificador que mejora solo. Resuelve de raíz §4.2, incluido el i18n.
- **Sugerencias por historial**: "solés comprar leche los domingos".
- El cliente conserva su caché local: se degrada a la experiencia de hoy cuando no
  hay red. Eso *sí* es offline-first.

### Consideraciones transversales

| Tema | Qué hace falta |
| ---- | -------------- |
| **Validación** | Esquemas Zod compartidos cliente/servidor. Reemplaza el `validateBackup()` superficial de §4.4 y sirve de contrato de la API |
| **Migraciones** | Dexie ya versiona el esquema (`db.version(2)`). El backend necesita lo equivalente: Prisma Migrate o Drizzle, versionado en el repo |
| **Transaccionalidad** | Lo de §4.4 deja de ser opcional. Import, duplicado de lista y borrado en cascada tienen que ser atómicos |
| **Idempotencia** | Un cliente offline reintenta. Cada operación necesita clave de idempotencia o se duplican items al reconectar |
| **Multi-tenancy** | Toda consulta filtrada por usuario/lista. Es la falla de seguridad número uno de este tipo de migración |
| **Límite de tasa** | El endpoint de códigos de barras es abusable por definición |
| **Observabilidad** | Reemplazar los 54 `console.*` por logs estructurados + trazas |
| **Contra-argumento honesto** | Un backend agrega costo de operación, superficie de ataque, GDPR y un punto de falla. **Si la app es de un solo usuario en un solo dispositivo, hoy está bien como está.** La pregunta no es "¿cómo agregamos backend?" sino "¿el producto lo necesita?" — y para listas de compras compartidas en un hogar, la respuesta es claramente sí |

---

## 7. Agenda para la discusión de equipo

Cinco preguntas, cada una con una decisión concreta atrás. Sugerencia: 15 minutos
cada una, sin resolver más de lo que dé el tiempo.

### 1. ¿Tener 189 pruebas es hacer TDD?

Smart Shopper tiene 189 pruebas en verde y **cero evidencia de haberlas escrito
primero**. El dato para poner sobre la mesa: `utils/categorization.ts` tiene **100 % de
cobertura en las cuatro métricas** y contiene el defecto de §4.1 —la cantidad que se
descarta— sin que ninguna prueba lo note. **Si la prueba se escribe después del código,
sólo puede confirmar lo que el código ya hace**, y la cobertura mide precisamente eso.

¿Cómo probamos en *nuestro* repositorio que hicimos TDD? Nuestra respuesta actual es el
`BITACORA-TDD.md`. Segunda pregunta, más incómoda: ¿qué métrica **sí** habría cazado el
defecto? (La prueba de mutación que ya usamos en la Unidad 1 es la candidata obvia.)

### 2. ¿Un commit único puede ser XP?

Seis de las doce prácticas dependen de la historia de versionado. ¿Cuál es el tamaño
mínimo de commit que consideramos "entrega pequeña"? ¿Un ciclo rojo-verde-refactor,
una regla completa, un día?

### 3. Offline-first, ¿arquitectura o excusa?

Ver §3. ¿Dónde está la línea entre "decisión de simplicidad deliberada" (YAGNI, buena
práctica XP) y "evitar la parte difícil"? ¿Cómo se distingue una de otra **desde
afuera**, mirando sólo el repositorio?

### 4. ¿Qué estrategia de sincronización elegimos y cuánto nos podemos equivocar?

LWW, registro de operaciones o CRDT (§6, Etapa 1). XP dice: la decisión más simple
que pueda funcionar, siempre que sea reversible. ¿LWW es reversible? ¿Qué habría que
haber previsto en el esquema desde el día uno para poder cambiar de opinión después?

### 5. ¿Cómo se cierra el hueco entre `design.md` y el código?

El proyecto se puso criterios de éxito y no cumplió tres de cinco (§2), pero nada en
el pipeline se rompió por eso. **CI verifica formato, tipos y pruebas; nadie verifica
que las reglas del `design.md` tengan prueba.** ¿Se puede automatizar? ¿Un chequeo que
falle si una Regla del `design.md` no tiene un `rule-X.Y-*.spec.ts` que le
corresponda? Eso convertiría la trazabilidad en algo ejecutable, no en un `PROGRESS.md`
que nadie actualiza.

**Pero cuidado con la trampa que descubrimos en §4.12:** ese chequeo lo pasaría
`rule-2.2-graceful-degradation.spec.ts`, que son dos `expect(true).toBe(true)` con
comentarios. La trazabilidad por nombre de archivo se satisface sin verificar nada.
¿Qué le agregamos para que no se pueda hacer trampa — cobertura mínima por módulo,
prueba de mutación, una regla de ESLint contra las tautologías?

---

## Apéndice: backlog priorizado

Si mañana tomáramos este repositorio como propio, en este orden:

| # | Trabajo | Por qué primero | Ref. |
| - | ------- | --------------- | ---- |
| 1 | Prueba que falle para `parseItemsFromText('2 bottles of milk')` → cantidad 2; después implementarla | Rojo antes que verde. Reactiva 3 piezas de código muerto | §4.1 |
| 2 | Transacción + `bulkAdd` en `importBackup`, y preservar los 11 campos | Es pérdida de datos del usuario | §4.3, §4.4 |
| 3 | Invertir `build` y `test` en CI; cambiar los cortocircuitos por `expect.fail()` | Cuatro pruebas llevan toda la vida del proyecto sin verificar nada, en verde | §4.11 |
| 4 | Borrar o implementar las 8 aserciones tautológicas | Inflan el contador del README y tapan una Regla entera | §4.12 |
| 5 | `npm audit --audit-level=high` en CI + Dependabot | 4 críticas activas hoy | §4.8 |
| 6 | Pasar `preferredCategory` en la ruta de voz | Una línea, arregla una promesa rota del README | §4.5 |
| 7 | Envoltorio `withLoading` en los stores | ~250 líneas menos, el refactor pendiente | §5.2 |
| 8 | Contadores agregados en la home (`count()` en vez de `toArray()`) | El N+1 escala con el uso | §5.1 |
| 9 | Categorización con coincidencia por palabra + reglas en archivo de datos | Falsos positivos verificados + prepara el i18n | §4.2 |
| 10 | Pruebas de componente para las 3 vistas (0 % de cobertura hoy) | Es donde vive la lógica de interacción y dos de los defectos | §4.9 |
| 11 | Playwright: una E2E por Story (5 en total) | Cumple el criterio de éxito que el propio proyecto se puso | §2 |
| 12 | Etapa 1 del backend: identidad + sync LWW | El salto de valor | §6 |

---

*Análisis elaborado sobre el commit `3d768e1`. Verificación estática y dinámica completa:
`npm ci`, `vue-tsc --build`, `npm audit` y `vitest run --coverage` ejecutados el 25.08.2026.*
