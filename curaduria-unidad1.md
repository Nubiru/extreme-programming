# Cuatro fuentes y un guión

**Curaduría de contenidos en español y guión de exposición — Unidad 1, Fundamentos de Programación Extrema.** Semanas 1–2 · 8 h · Clases 1 y 2 · Evaluación: análisis de caso + mapa valor–principio–práctica.

## Criterio

La unidad cubre cuatro cosas: qué se valora en agilidad, qué principios se derivan, qué es XP, dónde se ubica XP. Ninguna fuente hace las cuatro.

- **Manifiesto y Principios** — fuente primaria, traducción oficial, firmada por Kent Beck: el puente hacia XP.
- **Lean Mind** — única síntesis completa y en español de *Extreme Programming Explained*.
- **Guía Práctica** — lo que las otras no tienen: ciclos de vida y nomenclador español de las prácticas.

| Qué necesita la unidad | Manifiesto | Principios | Lean Mind | Guía Práctica |
|---|---|---|---|---|
| Qué se valora en agilidad | Sí | Parcial | No | Sí |
| Los doce principios ágiles | No | Sí | No | Sí |
| Valores de XP | No | No | Sí | Sólo listados |
| Principios de XP | No | No | Sí | Sólo listados |
| Prácticas de XP | No | No | Sí | Sí · en español |
| Dónde se ubica XP | No | No | Parcial | Sí |
| Predictivo vs. adaptativo | Implícito | Implícito | No | Sí |

## Las cuatro fuentes

### 1. Manifiesto por el Desarrollo Ágil de Software

*Agile Manifesto · traducción oficial de Ángel Medinilla, Andrés Giné y Esther Gómez · 2001*

`Estudiante · obligatoria` — <https://agilemanifesto.org/iso/es/manifesto.html> · 3 min

**Qué dice**

> Estamos descubriendo formas mejores de desarrollar software tanto por nuestra propia experiencia como ayudando a terceros. A través de este trabajo hemos aprendido a valorar:
> **Individuos e interacciones** sobre procesos y herramientas
> **Software funcionando** sobre documentación extensiva
> **Colaboración con el cliente** sobre negociación contractual
> **Respuesta ante el cambio** sobre seguir un plan
> Esto es, aunque valoramos los elementos de la derecha, valoramos más los de la izquierda.

Firman diecisiete personas: Kent Beck (autor de XP), Ward Cunningham (deuda técnica), Ron Jeffries y Martin Fowler. XP no es una lectura posterior del Manifiesto: estaba en la sala.

**Uso didáctico**

Lectura dialogada. Toda la carga está en la última oración: el Manifiesto no niega los elementos de la derecha, los **ordena**. Sin ella se leen como cuatro rechazos —el malentendido a desactivar.

La traducción oficial usa «sobre», que admite leerse como «en lugar de». PMI resuelve la misma línea como «más que»: menos elegante, más exacta. Ambas al pizarrón.

**Consigna · individual, 10 min**

1. Reescribir los cuatro pares con «más que», y luego con «en lugar de».
2. Elegir el par donde el cambio más altera el sentido y explicarlo en dos oraciones.
3. Nombrar una situación donde el elemento de la *derecha* deba ganar.

El punto 3 separa comprensión de repetición. Si nadie encuentra un caso —contrato de obra pública, auditoría regulatoria, integración con un tercero— la lectura fue superficial.

> ADVERTENCIA — No define agilidad, no explica prácticas, no menciona XP. Cuarenta palabras que sostienen la unidad y se agotan en un minuto si no se interrogan.

### 2. Principios del Manifiesto Ágil

*Agile Manifesto · traducción oficial · doce principios*

`Estudiante · obligatoria` — <https://agilemanifesto.org/iso/es/principles.html> · 5 min

**Qué dice** — Doce principios, introducidos por «Seguimos estos principios». Sin numerar ni agrupar en el original; la agrupación es decisión de cátedra.

| # | Principio (texto oficial, abreviado) | Grupo |
|---|---|---|
| 1 | Satisfacer al cliente mediante la entrega temprana y continua de software con valor. | A · Valor y entrega |
| 2 | Aceptamos que los requisitos cambien, incluso en etapas tardías. | B · Cambio y simplicidad |
| 3 | Entregamos software funcional frecuentemente, entre dos semanas y dos meses. | A · Valor y entrega |
| 4 | Responsables de negocio y desarrolladores trabajamos juntos de forma cotidiana. | C · Personas |
| 5 | Individuos motivados: darles entorno, apoyo y confianza. | C · Personas |
| 6 | La conversación cara a cara es el método más eficiente de comunicar. | C · Personas |
| 7 | El software funcionando es la medida principal de progreso. | A · Valor y entrega |
| 8 | Desarrollo sostenible: ritmo constante de forma indefinida. | D · Sostenibilidad |
| 9 | La atención continua a la excelencia técnica y al buen diseño mejora la Agilidad. | B · Cambio y simplicidad |
| 10 | La simplicidad, o el arte de maximizar la cantidad de trabajo no realizado, es esencial. | B · Cambio y simplicidad |
| 11 | Las mejores arquitecturas, requisitos y diseños emergen de equipos auto-organizados. | C · Personas |
| 12 | A intervalos regulares el equipo reflexiona sobre cómo ser más efectivo y ajusta. | D · Sostenibilidad |

**Uso didáctico**

Asignar un grupo por equipo y pedir evidencias concretas en un equipo XP. La palabra que trabaja es «evidencia»: no se acepta «se comunican mejor», sí «el registro de rotación muestra que los cuatro tocaron el módulo de pagos esta semana». El principio afirma; la práctica lo vuelve observable; la evidencia se mira.

La matriz completa está en Puente entre las fuentes. No repartirla antes: es la respuesta.

**Consigna · equipos de 3–4, 25 min**

1. Por cada principio del grupo, una práctica de XP que lo haga observable.
2. Por cada par, una **evidencia verificable**: artefacto, registro, métrica o conducta que un tercero constate sin preguntar.
3. El principio más difícil de evidenciar, y por qué.

El punto 3 suele caer en el 5 y el 11 —motivación y auto-organización—: los que ninguna herramienta certifica.

> ADVERTENCIA — El principio 6 supone colocación física. Con equipos distribuidos la pregunta no es si «sigue vigente», sino qué propiedad conservar —ancho de banda, sincronía, señales no verbales— y con qué medio.

### 3. Extreme Programming: valores, principios y prácticas

*Lean Mind · 28/04/2023 · síntesis de Extreme Programming Explained, de Kent Beck*

`Estudiante · guiada` — <https://leanmind.es/es/blog/extreme-programming-valores-principios-practicas> · 20 min

**Qué dice**

Desarma la caricatura del programador encerrado escribiendo a velocidad extrema, y planta la tesis de Beck:

> XP es mi intento de reconciliar humanidad y productividad en mi práctica de desarrollo de software, y compartir esa reconciliación. — Kent Beck

Sigue la anécdota de Beck aprendiendo a conducir: su madre le suelta el volante, el auto se va al arcén, ella corrige y le dice que conducir no es llevar el auto en la dirección correcta, sino **prestar atención constantemente, haciendo una pequeña corrección aquí y otra allá**. Estar atento, adaptarse, cambiar. La mejor metáfora del feedback corto: contarla tal cual.

**Cinco valores** — comunicación, simplicidad, feedback, coraje, respeto. Dos énfasis: la mayoría de los problemas vienen de falta de comunicación y no de conocimiento técnico; el **respeto es el más importante** —sin él XP no funciona.

**Catorce principios** — humanidad, economía, beneficio mutuo, auto-similitud, mejora, diversidad, reflexión, flujo, oportunidad, redundancia, fracaso, calidad, pasos pequeños, responsabilidad aceptada. Existen para «reducir el nivel de abstracción y hacer de puente entre valores y prácticas». Tres merecen tiempo de clase:

- **Calidad** — «Los proyectos no avanzan más rápido aceptando una calidad menor y no van más lento por tener mayor calidad.» Engancha con la Consigna 2 de la Clase 1.
- **Pasos pequeños** — mejor cinco pasos de coste 5 que uno de coste 20: el riesgo de llegar al punto equivocado es demasiado grande. Es el argumento de diseño detrás de TDD, tres unidades antes.
- **Responsabilidad aceptada** — «no puede ser asignada, sólo aceptada». Con ella viene la autoridad.

**Trece prácticas primarias y diez corolarias.** Las corolarias sólo tras afianzar las primarias: sin un ratio de errores cercano a cero, el despliegue diario es peligroso. Al pizarrón:

> Si las prácticas no están respaldadas por valores, estas se pudren.

**Uso didáctico**

Único panorama a la vez específico de XP y enteramente en español. Lectura guiada, no libre: quien lo lee sin consigna se queda con la lista de prácticas, la parte menos importante.

La guía fuerza los dos sentidos: dado un valor, qué práctica lo encarna; dada una práctica, qué valor la sostiene y qué se rompe sin él. El artículo modela el segundo —«practicamos pair programming porque valoramos la comunicación y el feedback rápido»— y sirve de muestra.

**Consigna · lectura guiada, en pareja**

1. Tres filas de *valor → principio → práctica → qué se rompe sin el valor*, con prácticas de secciones distintas.
2. El artículo afirma que el respeto es el valor más importante y el beneficio mutuo el principio más importante. Argumentar a favor o en contra de una, con un caso.
3. Una práctica que el equipo ya use sin llamarla por su nombre.

> ADVERTENCIA — Conserva los títulos en inglés (*Sit Together*, *Slack*, *Ten-Minute Build*): resolverlo con el nomenclador antes de asignarlo. Es además una síntesis personal declarada —«quedan muchos conceptos en el libro que no he podido explicar aquí»—: el estudiante cita el artículo, no a Beck.

### 4. Guía Práctica de Ágil

*PMI y Agile Alliance · 2017 · ISBN 978-1-62825-414-3 · edición en español*

`Docente · ampliación` — archivo de cátedra AgilePG_SPA.pdf · 182 pp. · cuatro pasajes

**§2.1, p. 7 — Trabajo definible vs. alta incertidumbre.** Encuadra el problema antes de nombrar la solución.

> Los proyectos de alta incertidumbre exhiben altas tasas de cambio, complejidad y riesgo. Estas características pueden presentar problemas para los enfoques predictivos tradicionales que apuntan a determinar la mayor parte de los requisitos al inicio, y a controlar los cambios a través de un proceso de solicitud de cambio. En cambio, los enfoques ágiles fueron creados para explorar la viabilidad en ciclos cortos, y adaptarse rápidamente en función de la evaluación y la retroalimentación.

**§2.2, Gráfico 2-3, p. 10.** Respalda el tercer movimiento del guión:

> Ágil es una mentalidad definida por valores, guiada por principios y que se manifiesta a través de muchas prácticas diferentes. Los profesionales practicantes de ágil seleccionan prácticas basadas en sus necesidades.

**Gráfico 2-4, p. 11.** Lean como conjunto mayor; ágil y Kanban adentro; XP junto a Scrum, Crystal, FDD, DSDM y AUP. Responde «¿dónde entra XP?».

**§3.1, Tabla 3-1, pp. 18–19.** Material del contraste predictivo/adaptativo de la Clase 1.

| Enfoque | Requisitos | Actividades | Entrega | Meta |
|---|---|---|---|---|
| **Predictivo** | Fijos | Una vez para todo el proyecto | Entrega única | Gestionar costos |
| **Iterativo** | Dinámicos | Repetidas hasta que esté correcto | Entrega única | Corrección de la solución |
| **Incremental** | Dinámicos | Una vez por incremento | Entregas frecuentes más pequeñas | Velocidad |
| **Ágil** | Dinámicos | Repetidas hasta que esté correcto | Entregas pequeñas frecuentes | Valor para el cliente mediante entregas frecuentes y retroalimentación |

Ningún ciclo de vida es perfecto para todos: cada proyecto cae en un continuo entre frecuencia de entrega y grado de cambio. Ese matiz evita caricaturizar la cascada.

**Recuadro p. 20.** Desarma la idea errónea que la unidad debe trabajar:

> Un ingrediente clave a recordar acerca de los ciclos de vida es que cada uno de ellos comparte el elemento de planificación. Lo que diferencia a un ciclo de vida no es si se hace la planificación, sino cuánta planificación se hace y cuándo.

**§A3.3 y Tabla A3-2, p. 102.** Define XP como «un método de desarrollo de software basado en ciclos frecuentes», nombre que viene de «destilar una determinada mejor práctica hasta su forma más pura y sencilla, y aplicarla continuamente a lo largo de todo el proyecto». La tabla clasifica las prácticas en cuatro áreas —organizacional, técnica, planificación, integración—, primarias y secundarias, en español.

**§5.2.7, p. 55.** Prácticas técnicas «muchas de las cuales provienen de la eXtreme Programming»: integración continua, prueba a todos los niveles, ATDD, TDD y BDD, spikes. Anuncia hacia dónde va la materia.

**Uso didáctico** — Consulta docente. Al aula llegan dos materiales: la tabla de ciclos de vida proyectada y el nomenclador.

> ADVERTENCIA — Guía de dirección de proyectos, no de ingeniería: despacha TDD en tres líneas y nada dice de casos de prueba, dobles ni refactorización; las unidades 3–5 no se apoyan en ella. Su traducción del Manifiesto no es la oficial («más que» en vez de «sobre»): con estudiantes se usa agilemanifesto.org. El PDF no se sube al campus; se proyectan las tablas citándolas.

## Puente entre las fuentes

### De principio ágil a evidencia observable

Ninguna fuente cruza los doce principios con las prácticas de XP. Ese cruce es el trabajo de la unidad; esta es la clave de corrección.

| # | Principio ágil | Práctica de XP que lo hace observable | Evidencia verificable |
|---|---|---|---|
| 1 | Entrega temprana y continua de valor | Ciclo semanal · Despliegue incremental · Integración continua | Historial de releases fechado; un incremento accesible al cliente cada semana |
| 2 | Aceptar cambios incluso tardíos | Diseño incremental · Refactorización · Prueba a priori | Un commit que cambia una regla de negocio con la suite verde, y un diff pequeño y localizado |
| 3 | Entregas frecuentes de software funcional | Ciclo semanal · Construcción de 10 minutos | Duración medida del build en CI; días entre etiquetas de versión |
| 4 | Negocio y desarrollo trabajan juntos a diario | Equipo completo · Participación real del cliente · Historias | Historias refinadas con el cliente presente; criterios acordados antes de implementar |
| 5 | Individuos motivados, con entorno y confianza | Responsabilidad aceptada · Holgura · Continuidad del equipo | Tareas tomadas y no asignadas; holgura declarada en el compromiso; rotación baja |
| 6 | Conversación cara a cara como medio principal | Sentarse juntos · Programación en pares · Espacio informativo | Registro de rotación de parejas; tablero que da el estado sin preguntar |
| 7 | El software funcionando mide el progreso | Integración continua · Prueba a priori | Estado del pipeline como dato de avance; historias cumplidas, no porcentajes de tareas |
| 8 | Ritmo constante sostenible | Ritmo constante · Holgura | Horas efectivas contra comprometidas; sin picos al cierre de iteración |
| 9 | Excelencia técnica y buen diseño | Refactorización · Diseño incremental · Código compartido | Commits de refactor sin cambio de conducta, con suite verde antes y después |
| 10 | Simplicidad: maximizar el trabajo no realizado | Diseño incremental · Historias pequeñas | Alcance recortado y registrado; sin código especulativo |
| 11 | Equipos auto-organizados | Código compartido · Equipo completo | Cualquiera modifica cualquier módulo; revisiones cruzadas |
| 12 | Reflexión periódica y ajuste | Ciclo semanal · Ciclo trimestral · Análisis de causa raíz | Acta con una acción medible y su responsable; causa raíz de un defecto registrada |

**Cómo corregir** — Se califica la última columna, no la tercera. Asociar principio y práctica es memoria; proponer una evidencia constatable exige haber entendido qué cambia en el trabajo. Se acepta otra práctica si la evidencia la sostiene.

### Nomenclador

Del inglés del artículo al español de la Guía Práctica (Tabla A3-2). Se reparte junto con la lectura de Lean Mind.

| Título en el artículo | Nombre en español | Área | Tipo |
|---|---|---|---|
| Sit Together | **Sentarse juntos** | Organizacional | Primaria |
| Whole Team | **Equipo completo** | Organizacional | Primaria |
| Informative Workspace | **Espacio de trabajo informativo** | Organizacional | Primaria |
| Energized Work | **Ritmo constante** | Organizacional | Secundaria en PMI · primaria en el artículo |
| Pair Programming | **Programación en pares** | Técnica | Primaria |
| Test-First Programming | **Programación de prueba a priori** | Técnica · Integración | Primaria |
| Incremental Design | **Diseño incremental** | Técnica | Primaria |
| Stories | **Historias de usuarios** | Planificación | Primaria |
| Weekly Cycle | **Ciclo semanal** | Planificación | Primaria |
| Quarterly Cycle | **Ciclo trimestral** | Planificación | Primaria |
| Slack | **Holgura** | Planificación | Primaria |
| Ten-Minute Build | **Construcción de 10 minutos** | Integración | Primaria |
| Continuous Integration | **Integración continua** | Integración | Primaria |
| Real Customer Involvement | **Participación real del cliente** | Organizacional | Corolaria |
| Team Continuity | **Continuidad del equipo** | Organizacional | Corolaria |
| Shared Code | **Código compartido / propiedad colectiva** | Técnica | Corolaria |
| Code and Tests | **Documentación a partir de código y pruebas** | Técnica | Corolaria |
| Root-Cause Analysis | **Análisis de causa raíz** | Planificación | Corolaria |
| Shrinking Teams | **Equipos en disminución** | Planificación | Corolaria |
| Negotiated Scope Contract | **Alcance del contrato negociado** | Planificación | Corolaria |
| Incremental Deployment | **Despliegue incremental** | Integración | Corolaria |
| Single Code Base | **Base de código única** | Integración | Corolaria |
| Daily Deployment | **Despliegue diario** | Integración | Corolaria |

**Tres discrepancias a anticipar.** La Guía Práctica suma *Refactorización*, *Pago por uso* y *Reuniones diarias de pie*, que el artículo no lista aparte. Ubica *Ritmo constante* entre las secundarias, donde el artículo lo trata como primario. Y clasifica la prueba a priori en dos áreas. Son dos recortes de la misma familia: decirlo enseña más que ocultarlo.

## Guión desarrollado

**Clase 1 · exposición · 45 minutos.** Cinco movimientos sobre los cinco puntos del guión sugerido. Minutos acumulativos dentro del bloque.

### 00–08 · El proyecto que no anda

No se abre con una definición sino con Mercatienda, ya diagnosticado en los primeros veinticinco minutos: se leen los seis síntomas como el parte de un equipo real.

**Idea a instalar:** ninguno de los seis es un problema de talento. Son problemas de **sistema de trabajo**: cuándo se entera el equipo de que algo está mal, y cuánto cuesta corregirlo entonces.

**Pizarrón:** los seis síntomas en columna, con una columna vacía a la derecha para el movimiento 3.

**Cierre:** «¿Cuál de estos seis empeora si el equipo trabaja más horas?». La respuesta —todos— es el primer argumento de la clase.

### 08–16 · Construir la definición desde el problema, y ubicar XP

Recién ahora se nombra la agilidad, y como respuesta. §2.1: hay trabajo definible, con procedimientos que ya funcionaron, y trabajo de alta incertidumbre, que exige explorar en ciclos cortos y adaptarse según la retroalimentación. El software de producto vive en el segundo.

Lectura dialogada del **Manifiesto**, deteniéndose en la última oración. Los falsos dilemas se abren acá y se retoman en el movimiento 4.

Se ubica XP con el Gráfico 2-4 y se da la definición corta:

> eXtreme Programming es un método de desarrollo de software basado en ciclos frecuentes. El nombre se basa en la filosofía de destilar una determinada mejor práctica hasta su forma más pura y sencilla, y aplicarla continuamente a lo largo de todo el proyecto. — Guía Práctica, §A3.3

**No saltear:** Kent Beck firma el Manifiesto. XP no deriva de él ni lo precede; son contemporáneos, y XP es la parte de esa conversación que se ocupó de las prácticas técnicas.

**Cierre:** «Si el nombre viene de llevar una buena práctica a su forma más pura y aplicarla siempre, ¿qué práctica que ya usan a veces valdría la pena llevar al extremo?».

### 16–28 · Tres niveles conectados

Movimiento central, sostenido por el Gráfico 2-3: ágil es una mentalidad **definida** por valores, **guiada** por principios y **manifestada** en prácticas.

| Nivel | Función | Contenido |
|---|---|---|
| **1 · Valores** | Orientan | Comunicación, simplicidad, feedback, coraje, respeto. No se observan directamente. |
| **2 · Principios** | Traducen | Bajan la abstracción y hacen de puente. Calidad, pasos pequeños, beneficio mutuo, redundancia. |
| **3 · Prácticas** | Vuelven observable | Pares, prueba a priori, integración continua, ciclo semanal. |

El nivel intermedio es el que se saltea siempre y el que hace falta. Ejemplo del artículo: documento o conversación, ¿qué comunica mejor? Depende del contexto y de los principios; el de **humanidad** señala que la conversación satisface además la necesidad de conexión, y por eso XP la prefiere. Sin el principio, la elección parece arbitraria.

Dos cadenas completas, en ambos sentidos:

- **Feedback → pasos pequeños → prueba a priori.** Si el ciclo de corrección es largo, el error se descubre tarde. Cinco pasos de coste 5 antes que uno de coste 20.
- **Pares → redundancia → comunicación y coraje.** Duplicar el coste por tarea sólo tiene sentido si el desastre que evita cuesta más. Y sin respeto, la pareja es vigilancia.

Se vuelve al pizarrón y se completa la columna vacía: por cada síntoma, qué práctica lo ataca y qué valor la sostiene.

**Cierre:** «¿Qué pasa con una práctica cuando el equipo olvida por qué la hace?». Se pudre.

### 28–38 · Ejemplos y contraejemplos

Los contraejemplos delimitan mejor que los ejemplos.

| Situación | ¿Es XP? | Qué falta |
|---|---|---|
| Despliega tres veces por día, sin pruebas automatizadas, revisando a mano | No | Rapidez sin feedback. La velocidad no da información: el equipo se entera tarde y con usuarios adentro. |
| 4.000 pruebas, 90 % de cobertura, cada persona dueña de su módulo | No | Pruebas sin colaboración. Sin código compartido no hay propiedad colectiva. |
| Iteraciones semanales y demo cada viernes, sin refactorizar nunca | No | Ritmo sin calidad interna. El coste del cambio vuelve a crecer y la iteración semanal se hace incumplible. |
| Pares obligatorios ocho horas por día, sin holgura y con horas extra | No | Práctica sin principio. Se aplica la forma y se violan ritmo constante y humanidad: el par se vuelve agotamiento compartido. |
| Ciclo semanal, criterios acordados con el cliente, pares rotando, build de ocho minutos, refactor bajo suite verde | **Sí** | Los tres niveles presentes: prácticas, principios que las explican, valores que las sostienen. |

**Cierre:** «Los cuatro primeros tienen prácticas de XP. ¿Por qué ninguno es XP?». Porque XP es un sistema, y las prácticas aisladas no se sostienen entre sí.

### 38–45 · El criterio de coherencia

Se cierra con la regla que rige el resto de la materia: **una práctica se evalúa por el aprendizaje y la calidad que produce en el sistema de trabajo**, no por su cumplimiento. De ahí, tres preguntas aplicables a cualquier práctica:

1. ¿Qué información nueva le da al equipo, y en cuánto tiempo?
2. ¿Qué pasa con el coste del próximo cambio después de aplicarla?
3. ¿Qué valor la sostiene, y qué se rompe si ese valor falta?

Se anticipa el recorrido: la Unidad 2 toma las prácticas de colaboración y planificación; las unidades 3–5 convierten la prueba a priori en el ciclo de TDD. La lista de §5.2.7 muestra que la materia entera cabe en la última fila de la Tabla A3-2.

**Pase al taller:** se entrega el ticket de salida y se pasa al bloque de análisis en equipos.

## El caso de apertura: Mercatienda

Se entrega impreso al comenzar, sin más contexto que este. **Mercatienda** es un comercio electrónico de indumentaria: cinco personas, nueve meses de desarrollo, presión por lanzar antes de la temporada. Seis síntomas reportados.

| # | Síntoma | Principio comprometido | Práctica que lo ataca |
|---|---|---|---|
| 1 | En la segunda semana el cliente pide cambiar la pasarela de pagos por otra con menores comisiones, justo cuando se estaban por terminar las pruebas finales. | 2 · Aceptar el cambio | Diseño incremental, prueba a priori, refactorización |
| 2 | Los defectos aparecen en la semana de pruebas previa al lanzamiento. En el último hito fueron treinta y uno. | 7 · Software funcionando como medida | Prueba a priori, integración continua, build de 10 minutos |
| 3 | Una sola persona entiende el módulo de stock. Está de licencia dos semanas y nadie toca ese código. | 11 · Equipos auto-organizados | Código compartido, pares, equipo completo |
| 4 | La última salida a producción fue hace once semanas. Hay cuarenta días de trabajo «terminado» sin desplegar. | 1 y 3 · Entrega temprana y frecuente | Ciclo semanal, despliegue incremental y diario |
| 5 | Integrar la rama de checkout lleva dos días y rompe funcionalidades ya probadas. | 9 · Excelencia técnica | Integración continua, base de código única, prueba a priori |
| 6 | Las dos últimas semanas de cada hito se trabajan once horas por día. Dos personas renunciaron este año. | 8 · Ritmo sostenible | Ritmo constante, holgura, continuidad del equipo |

**Uso** — Las dos últimas columnas no se entregan: son la clave de corrección del bloque de análisis. El caso alimenta también la Consigna 3 de la Clase 1, «El dilema del cliente», que es el síntoma 1 desarrollado.

**Variante para el taller** — La propuesta mínima de dos semanas se construye sobre este caso: qué entregar primero, cómo validarlo, qué aprender antes de comprometer el resto. La restricción que lo hace interesante: la primera entrega debe ser funcional para un usuario real, no una capa técnica completa.

## Falsos dilemas y cómo desarmarlos

| Lo que se escucha | Respuesta | Fuente |
|---|---|---|
| «Ágil es no planificar» | Todos los ciclos de vida planifican. Cambia cuánta planificación y cuándo, no si la hay. Cuatro prácticas primarias de XP son de planificación. | Guía Práctica, p. 20 y Tabla A3-2 |
| «Ágil es no documentar» | El Manifiesto valora software funcionando *sobre* documentación extensiva, y aclara que también valora lo de la derecha. *Code and Tests* no elimina la documentación: la mueve a donde no se desactualiza. | Manifiesto · Lean Mind |
| «Ágil es no diseñar» | El diseño incremental es práctica primaria, no omisión. Se empieza con un diseño mínimo y se evoluciona según aparecen necesidades. | Lean Mind · Principio 9 |
| «Ágil es no tener procesos ni herramientas» | El primer par dice *sobre*, no *sin*. XP prescribe integración continua, build de diez minutos y batería de pruebas: es más exigente que lo que reemplaza. | Manifiesto · Tabla A3-2 |
| «Bajar la calidad para llegar a la fecha» | Los proyectos no avanzan más rápido con menor calidad ni más lento con mayor. Y la calidad no es sólo económica: las personas necesitan un trabajo del que sentirse orgullosas. | Lean Mind, *Quality* |
| «XP es Scrum con otro nombre» | Scrum define roles, eventos y artefactos de gestión; XP define además prácticas de ingeniería que Scrum no prescribe. Se combinan con frecuencia. | Guía Práctica, Gráfico 2-4 y §A3.3 |
| «Sirve para startups, no para proyectos serios» | El criterio es el grado de incertidumbre y la frecuencia de entrega, no el tamaño de la empresa. Requisitos fijos y bajo riesgo se sirven mejor de un ciclo predictivo. La discusión honesta es dónde cae el proyecto en el continuo. | Guía Práctica, Tabla 3-1 y Gráfico 3-1 |

## Evidencias de la unidad

| Momento | Evidencia | Qué se mira |
|---|---|---|
| Clase 1 · inicio | Diagnóstico individual sobre Mercatienda: dos riesgos y una respuesta | Línea de base sin calificación. Sirve para armar parejas y ver quién trae vocabulario ágil. |
| Clase 1 · análisis | Matriz síntoma – principio | Que el vínculo esté justificado, no adivinado. Se acepta más de un principio por síntoma si se argumenta. |
| Clase 1 · taller | Borrador de iteración de dos semanas | Que la primera entrega sea funcional para un usuario, y que estén dichos cómo se valida y qué se aprende primero. |
| Clase 1 · cierre | Ticket de salida | La segunda mitad de la frase. Sin un límite nombrado, XP se entendió como consigna y no como sistema. |
| Clase 2 | Informe de análisis de caso | Uso correcto de los tres niveles, evidencias observables y al menos un contraejemplo propio. |
| Unidad 1 | Mapa valor – principio – práctica | Cadenas completas. Se penaliza el mapa que salta el nivel de principios. |

**Ticket de salida** — cinco minutos, sin apuntes, con nombre: «XP sería útil en Mercatienda porque…» / «XP no resolvería por sí sola…»

## Referencias

- Beck, K. *et al.* (2001). **Manifiesto por el Desarrollo Ágil de Software.** Trad. Ángel Medinilla, Andrés Giné y Esther Gómez. <https://agilemanifesto.org/iso/es/manifesto.html>
- Beck, K. *et al.* (2001). **Principios del Manifiesto Ágil.** <https://agilemanifesto.org/iso/es/principles.html>
- Lean Mind (28/04/2023). **Valores, Principios y Prácticas. Extreme Programming Explained.** <https://leanmind.es/es/blog/extreme-programming-valores-principios-practicas>
- PMI y Agile Alliance (2017). **Guía Práctica de Ágil.** ISBN 978-1-62825-414-3. Pasajes citados: §2.1 (p. 7), §2.2 y Gráficos 2-3 y 2-4 (pp. 8–11), §3.1, Tabla 3-1 y Gráfico 3-1 (pp. 18–20), §5.2.7 (p. 55), §A3.3 y Tabla A3-2 (p. 102).
- Lectura de fondo, no asignada: Beck, K. y Andres, C. (2004). *Extreme Programming Explained: Embrace Change*, 2.ª ed. Addison-Wesley.

---

*Los textos del Manifiesto se reproducen íntegros conforme a su nota de copyright. Los pasajes de la Guía Práctica de Ágil se citan con sección y página; el PDF no se redistribuye.*
