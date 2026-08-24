# Guion de la demostración — Unidad 1

Qué se muestra: el endpoint agregado, el contrato HTTP completo con `curl -i`, y el
mismo tráfico visto por debajo con un analizador de paquetes.

El recorrido sigue la sección 7 de la consigna (*Primer servidor HTTP* y sus *casos
de prueba*) y el material sobre [Ethernet, IP, TCP y HTTP](https://www.embedic.com/technology/details/introduction-to-ethernet-ip-tcp-http):
cada capa de la que habla ese texto se señala después en la captura.

---

## 1. Herramientas: qué instalar

`tcpdump` ya viene instalado en el sistema, pero no muestra HTTP con la comodidad de
Wireshark. Todo lo demás está en los repositorios de Ubuntu 24.04 que ya tenés
configurados: no hace falta agregar ningún PPA.

```bash
sudo apt-get update
sudo apt-get install -y wireshark tshark
```

Durante la instalación aparece una pregunta: **«¿Deberían los usuarios no
superusuarios poder capturar paquetes?»**. Respondé **Sí** y después:

```bash
sudo usermod -aG wireshark "$USER"     # aplica al volver a iniciar sesión
```

Sin ese paso, la captura se hace con `sudo` (que es lo que hace el script).

| Programa | Paquete | Versión en el repo | Para qué sirve |
|---|---|---|---|
| **Wireshark** | `wireshark` | 4.2.2 | Interfaz gráfica: el que conviene proyectar en clase. |
| **tshark** | `tshark` | 4.2.2 | El mismo motor, en consola. Es lo que usa el script. |
| **termshark** | `termshark` | 2.4.0 | Interfaz de texto parecida a Wireshark, para una terminal sin escritorio. |
| **tcpdump** | ya instalado | 4.99.4 | Captura mínima. Sirve de reserva si no hay Wireshark. |
| **ngrep** | `ngrep` | 1.47 | `grep` sobre el tráfico: útil para mostrar el texto plano de HTTP. |
| **mitmproxy** | `mitmproxy` | 8.1.1 | Proxy que intercepta y permite modificar solicitudes en vivo. |
| **httpie** | `httpie` | 3.2.2 | Cliente HTTP más legible que `curl` para hacer las llamadas. |

Comprobar que quedó bien instalado:

```bash
tshark --version | head -1
```

---

## 2. Correr la demostración

```bash
cd backend/unidad-1
npm install
./demo/captura-http.sh              # captura + 21 solicitudes (pide sudo)
./demo/captura-http.sh --sin-captura # sólo las solicitudes, sin sudo
```

El script:

1. verifica que el puerto 3000 esté libre — si no, avisa y corta;
2. levanta `node src/servidor.ts`;
3. arranca `tshark` sobre la interfaz `lo` con el filtro `tcp port 3000`;
4. ejecuta el guion de solicitudes con `curl -i`;
5. cierra todo e imprime el resumen HTTP de la captura.

Deja dos archivos en `demo/salida/`:

| Archivo | Contenido |
|---|---|
| `sesion.txt` | Transcripción: cada comando y su respuesta cruda, encabezados incluidos. |
| `trafico.pcapng` | La captura, para abrir con `wireshark demo/salida/trafico.pcapng`. |

---

## 3. Los endpoints

| Método | Ruta | Código | Qué muestra |
|---|---|---|---|
| `GET` | `/salud` | 200 | El endpoint de estado de la sección 7 de la consigna. |
| `GET` | `/hora` | 200 | Fecha en ISO 8601: JSON no tiene tipo fecha. |
| `GET` | `/materias` | 200 | Colección; el cupo se calcula, no se guarda. |
| `GET` | `/estudiantes/:id` | 200 / 404 / 400 | Parámetro de ruta y sus tres desenlaces. |
| `GET` | `/estudiantes/:id/inscripciones` | 200 | Subrecurso: el efecto del `POST` es observable. |
| `POST` | `/inscripciones` | 201 / 400 / 404 / 409 | Creación, con `Location` apuntando al recurso creado. |
| `GET` `POST` `DELETE` | `/vector` | 200 / 201 / 204 / 400 | El efecto de un `POST`, visible con el `GET` siguiente. |
| `GET` | `/vector/:indice` | 200 / 400 / 404 | Un elemento por su posición. |
| todos | `/eco` | 200 | Devuelve el mensaje recibido: dónde viajó cada dato. |
| `HEAD` | cualquier ruta de `GET` | igual que `GET` | Los mismos encabezados, sin cuerpo. |
| `OPTIONS` | cualquier ruta conocida | 204 | Encabezado `Allow` con los métodos admitidos. |
| cualquier otro | ruta conocida | 405 | La ruta existe, la operación no. |
| cualquiera | ruta desconocida | 404 | El caso de prueba de la consigna. |

### Los tres códigos que conviene contrastar

```
GET  /estudiantes/abc   → 400  no entiendo la solicitud
GET  /estudiantes/999   → 404  la entiendo, ese recurso no existe
POST /inscripciones ×2  → 409  la entiendo, el recurso existe, el estado no la admite
DELETE /materias        → 405  el recurso existe, esa operación sobre él no
```

Un `404` para el último caso escondería que la ruta sí existe. Por eso el `405`
viaja con `Allow: GET, HEAD, OPTIONS`: la respuesta dice qué sí se puede hacer.

---

## 4. HEAD: el método que muestra para qué sirve `Content-Length`

```
$ curl -I http://127.0.0.1:3000/materias
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 175          ← el tamaño que tendría el cuerpo
                             ← y no viene ningún cuerpo

$ curl -i -o /dev/null -D - http://127.0.0.1:3000/materias
HTTP/1.1 200 OK
Content-Length: 175          ← el mismo número, ahora con los 175 bytes detrás
```

Esto es exactamente lo que señala el artículo de Ethernet/IP/TCP/HTTP: *TCP no
provee ningún mecanismo para indicar el tamaño del archivo original; eso lo define
el protocolo de aplicación, por ejemplo con el encabezado `Content-Length`*.

El sistema operativo ensambla los segmentos TCP en orden y se los entrega a la
aplicación como un flujo continuo de bytes. Quién decide dónde termina un mensaje
HTTP y empieza el siguiente es el propio HTTP. `HEAD` lo deja a la vista: pide sólo
esa metainformación —tamaño, tipo, fecha— sin transferir el contenido. Es lo que usa
un gestor de descargas para saber cuánto pesa un archivo antes de bajarlo, o una
caché para preguntar si lo que guardó sigue vigente.

En el código, `HEAD` no es una rama aparte:

```ts
const esHead = metodoSolicitado === "HEAD";
const metodo = esHead ? "GET" : metodoSolicitado;   // se resuelve como GET…
...
respuesta.end(esHead ? undefined : serializado);    // …y al final se omite el cuerpo
```

Así ninguna ruta puede quedar con `GET` y sin `HEAD`.

---

## 5. Leer la captura por capas

Abrir `wireshark demo/salida/trafico.pcapng`. Filtros de visualización útiles:

| Filtro | Muestra |
|---|---|
| `tcp.port == 3000` | Todo el diálogo con el servidor. |
| `http` | Sólo las solicitudes y respuestas ya interpretadas. |
| `http.request.method == "HEAD"` | Las tres llamadas `HEAD`. |
| `http.response.code >= 400` | Los errores: 400, 404, 405, 409. |
| `tcp.flags.syn == 1` | Los saludos de tres vías. |

Sobre cualquier paquete: clic derecho → **Follow → TCP Stream** muestra la
conversación completa en texto, solicitud y respuesta una debajo de la otra.

### Las cuatro capas del artículo, en un paquete

Al desplegar un paquete, Wireshark lo muestra encajado una capa dentro de la otra:

```
Frame                    lo que capturó la placa
└─ Ethernet / Loopback   direcciones MAC · comunicación dentro de la red local
   └─ IP                 direcciones IP · enrutamiento entre redes distintas
      └─ TCP             puertos · números SEQ y ACK · entrega confiable
         └─ HTTP         método, ruta, encabezados, cuerpo
```

Cada capa agrega su encabezado adelante y trata a la de arriba como carga útil. Es
la misma figura del artículo: el paquete IP viaja dentro del paquete Ethernet, el
TCP dentro del IP, y el mensaje HTTP dentro del TCP.

**Advertencia honesta sobre la interfaz `lo`.** El servidor y `curl` corren en la
misma computadora, así que el tráfico no sale por la placa de red. En la captura no
hay una trama Ethernet real ni direcciones MAC: Wireshark muestra una capa
*Loopback* que hace de reemplazo. Y el MTU es distinto:

```bash
ip link show lo          # mtu 65536
ip link show wlp0s20f3   # mtu 1500
```

Por eso no se ve la fragmentación en segmentos de ~1460 bytes que describe el
artículo: en `lo` entran 65536 bytes de una vez. Para mostrar una trama Ethernet
auténtica, con MAC de origen y destino y MTU de 1500, hay que capturar en la placa
real mientras se pide algo por HTTP a un servidor externo:

```bash
sudo tshark -i wlp0s20f3 -f "tcp port 80" -w demo/salida/ethernet.pcapng &
curl -s -o /dev/null http://neverssl.com/
```

(Se usa un sitio sin HTTPS a propósito: con TLS el contenido viaja cifrado y en la
captura sólo se ve el handshake, no el mensaje HTTP.)

### El saludo de tres vías

Antes de la primera solicitud aparecen tres paquetes sin datos HTTP:

```
SYN      cliente → servidor    «quiero abrir una conexión»
SYN,ACK  servidor → cliente    «de acuerdo, yo también»
ACK      cliente → servidor    «confirmado»
```

Recién después viaja `GET /salud HTTP/1.1`. El puerto de origen es un número alto
elegido por el sistema; el de destino es 3000, y ese número es lo que le dice al
sistema operativo a qué aplicación entregar los datos ya ensamblados. Al final del
diálogo aparecen `FIN` y `ACK`: el cierre.

### Una conexión TCP, varias solicitudes HTTP

La última llamada del guion es:

```bash
curl -i http://127.0.0.1:3000/salud http://127.0.0.1:3000/hora
```

En la captura las dos solicitudes viajan por **la misma conexión**: un solo saludo
de tres vías y dos pares solicitud/respuesta dentro. Es el `Connection: keep-alive`
de los encabezados, y es lo que el artículo describe como *una misma comunicación
TCP puede incluir varias comunicaciones HTTP*. Para separarlas, el cliente necesita
saber dónde termina cada cuerpo: otra vez `Content-Length`.

### Números SEQ y ACK

Sobre cualquier paquete de datos: `Transmission Control Protocol → Sequence Number`.
Wireshark muestra por defecto los números relativos (1, 51, 226…); el real es un
número aleatorio elegido al abrir la conexión. La diferencia entre el número de un
paquete y el del siguiente es la cantidad de bytes que transportó: el mismo cálculo
del artículo. El `ACK` que vuelve lleva el número del próximo byte esperado.

---

## 6. La conversación narrada

`captura-http.sh` dispara 21 llamadas seguidas: sirve para revisar el contrato, pero
en la captura queda un bloque compacto difícil de seguir. Para explicar en clase hay
un segundo guion:

```bash
./demo/conversacion.sh                 # 13 pasos, con pausa entre uno y otro
./demo/conversacion.sh --sin-captura   # sin sudo
PAUSA=0 ./demo/conversacion.sh         # sin esperas, para una corrida rápida
```

Tres diferencias que lo hacen más legible:

1. **Es un diálogo con principio y final.** El vector arranca vacío, se llena, se
   consulta, se filtra, se equivoca, se vacía. Cada paso se entiende por el anterior.
2. **Hay pausas.** La columna *Time* de Wireshark separa visiblemente un paso del
   siguiente, en vez de mostrar 21 solicitudes en 300 milisegundos.
3. **Cada paso se anuncia dentro de la captura.** Antes de cada uno, el cliente pide:

```
GET /eco?paso=03&titulo=agrega-un-elemento-por-la-url
```

Ese pedido no guarda nada: existe para que el título del paso quede escrito en el
listado de Wireshark. Como la URL viaja en texto plano dentro del paquete, la propia
captura queda indexada.

### Filtros para proyectar

| Filtro | Muestra |
|---|---|
| `http.request.uri contains "paso="` | Sólo las marcas: el índice de la clase, 13 renglones |
| `http.request.method == "POST"` | Sólo los cuatro POST |
| `frame contains "hola"` | Cualquier paquete que contenga esa palabra — la prueba de que HTTP no está cifrado |
| `tcp.stream == 3` | Una conversación TCP completa, del SYN al FIN |

El tercero es el más contundente: escribir `frame contains "hola"` y que aparezca el
paquete demuestra, sin explicar nada, que todo lo que viaja por HTTP se lee tal cual.
Es la mejor introducción a por qué existe HTTPS.

---

## 7. Dónde pueden viajar los datos

La pregunta «¿se puede mandar el dato en la URL?» tiene respuesta corta —sí— y una
larga que conviene mostrar. El servidor acepta el mismo elemento por dos caminos:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
  -d '{"elemento":42}' http://127.0.0.1:3000/vector      # tipo: numero

curl -i -X POST 'http://127.0.0.1:3000/vector?elemento=42'  # tipo: texto
```

**La respuesta dice `tipo`, y ahí está toda la lección**: por la URL todo llega como
texto, porque una URL no tiene tipos. En un cuerpo JSON, `42` es un número y `"42"`
es una cadena. Si vienen los dos, gana el cuerpo.

| Ubicación | Ejemplo | Para qué sirve | Qué cuesta |
|---|---|---|---|
| Ruta | `/vector/0` | Identificar un recurso | — |
| Consulta | `/vector?contiene=cha` | Filtrar, ordenar, paginar | Todo es texto; queda en registros, historial y `Referer` |
| Encabezado | `X-Materia: backend` | Metadatos de la solicitud | No es para datos del recurso |
| Cuerpo | `{"elemento":42}` | Enviar una representación con tipos y estructura | No se ve en la barra del navegador |

Para no explicarlo de memoria, está `/eco`, que devuelve el mensaje tal como llegó:

```bash
curl -s -X POST -H 'X-Materia: backend' -d '{"elemento":"en el cuerpo"}' \
  'http://127.0.0.1:3000/eco?elemento=en-la-url&otro=dato' | python3 -m json.tool
```

Una sola respuesta muestra el método, la ruta, los parámetros de consulta, todos los
encabezados y el cuerpo —crudo y ya interpretado—. Es el paso 07 de la conversación.

---

## 8. Cuando la captura no muestra lo que esperás

El problema más común no es Wireshark: es estar mirando la interfaz equivocada.

**Un pedido desde la misma computadora nunca sale por la placa de red.** El núcleo
ve que la dirección es suya y lo entrega internamente, incluso cuando se usa la
dirección de la red local. Por eso una captura de loopback puede mostrar
`192.168.0.11 → 192.168.0.11`: la dirección de la red, sin red de por medio.

| Quién hace el pedido | Por dónde viaja | Dónde capturar |
|---|---|---|
| La misma máquina | Loopback | `lo` · en Windows, «Adapter for loopback traffic capture» |
| Otro dispositivo (un celular) | La placa de red | `wlp0s20f3` · en Windows, «Wi-Fi» |

En Linux se puede evitar el problema capturando en todas a la vez: `tshark -i any`.
En Windows no existe `any`, pero se pueden seleccionar varias interfaces con
Ctrl+clic en la pantalla inicial de Wireshark. Y hay un truco rápido: cada interfaz
tiene una línea de actividad al costado — hacer el pedido y mirar cuál se mueve.

Si con la interfaz correcta sigue sin aparecer nada, el orden de revisión es:

| Síntoma | Causa | Comprobación |
|---|---|---|
| No aparece nada en ninguna interfaz | El pedido no llega: otra red, o aislamiento de clientes en el Wi-Fi | Probar desde otra máquina de la misma red |
| `SYN` repetidos sin respuesta | El cortafuegos lo descarta | `sudo ufw allow 3000/tcp` · en Windows, permitir Node en redes privadas |
| `SYN` → `RST` | Nadie escucha en esa dirección | `ss -ltn \| grep 3000`: tiene que decir `0.0.0.0:3000`, no `127.0.0.1:3000` |
| El celular muestra un error de conexión segura | El navegador forzó HTTPS al puerto 443 | Escribir `http://` completo en la barra |

Que funcione desde un celular vale el esfuerzo: es la única forma de mostrar en la
captura direcciones de origen y destino distintas, una trama Ethernet de verdad con
sus MAC y el MTU de 1500 bytes del que habla el artículo.

---

## 9. Respuestas rápidas para la defensa

| Pregunta de la consigna | Qué señalar en la demo |
|---|---|
| ¿Por qué una ruta inexistente no debería responder `200`? | `GET /ruta-inexistente` → 404. Un cliente automático sólo mira el código: con `200` guardaría el error como si fuera un dato válido. |
| ¿Qué información contiene una solicitud HTTP? | La primera línea del `Follow TCP Stream`: método, ruta, versión, encabezados y cuerpo. |
| ¿Cuándo un parámetro de ruta y cuándo uno de consulta? | `/estudiantes/42` identifica el recurso; `?detalle=completo` sólo lo modula: se ve que la respuesta es la misma. |
| ¿Qué significa que HTTP no tenga estado? | Las dos solicitudes de la conexión reutilizada son independientes: la segunda no sabe nada de la primera, aunque compartan el mismo túnel TCP. |
| ¿Qué responsabilidad tiene `Content-Type`? | Declara cómo interpretar los bytes. Sin él, `{"estado":"ok"}` es apenas una cadena. |
| ¿Diferencia entre `401` y `403`? | Todavía no hay autenticación en este servidor; se explica por contraste con `405`, que sí está implementado: no sé quién sos / sé quién sos y no podés / el recurso existe pero no admite ese método. |
| ¿Qué función cumple Node.js? | Ejecuta el TypeScript fuera del navegador y le da acceso al puerto: `servidor.listen(3000)`. |
| ¿Qué ventaja aporta TypeScript? | `npm run check` no ejecuta nada y aun así encuentra errores. Pero no valida lo que llega por HTTP: eso lo hace `validarSolicitud`. |
