#!/usr/bin/env bash
#
# Una conversación completa entre un cliente y un servidor, contada paso a paso
# y capturada para verla después en Wireshark.
#
# A diferencia de captura-http.sh —que dispara 21 llamadas seguidas— acá cada
# paso está separado del anterior por una pausa y anunciado en la propia captura
# con una marca: antes de cada paso el cliente pide
#
#     GET /eco?paso=03&titulo=agrega-un-elemento-por-la-url
#
# Como la URL viaja en texto plano dentro del paquete, esa línea aparece en el
# listado de Wireshark y funciona como índice de la clase.
#
#   ./demo/conversacion.sh              captura + conversación (pide sudo)
#   ./demo/conversacion.sh --sin-captura   sólo la conversación, sin sudo
#   PAUSA=0 ./demo/conversacion.sh      sin esperas entre pasos
#
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SALIDA="$RAIZ/demo/salida"
PUERTO="${PORT:-3000}"
ANFITRION="127.0.0.1"
PAUSA="${PAUSA:-1.2}"
CAPTURAR="sí"
[[ "${1:-}" == "--sin-captura" ]] && CAPTURAR="no"

if [[ "$(id -u)" == "0" ]] || id -nG | grep -qw wireshark; then SUDO=""; else SUDO="sudo"; fi

mkdir -p "$SALIDA"
TRANSCRIPCION="$SALIDA/conversacion.txt"
CAPTURA="$SALIDA/conversacion.pcapng"
: > "$TRANSCRIPCION"

base="http://$ANFITRION:$PUERTO"
pid_servidor=""
pid_captura=""

limpiar() {
  [[ -n "$pid_captura"  ]] && $SUDO kill -INT "$pid_captura" 2>/dev/null || true
  [[ -n "$pid_servidor" ]] && kill "$pid_servidor" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap limpiar EXIT

registrar() { printf '%s\n' "$*" | tee -a "$TRANSCRIPCION"; }

# Devuelve los argumentos tal como habría que escribirlos en la terminal: sin
# esto, la transcripción muestra  -d {"elemento":42}  y no se puede copiar.
citar() {
  local pieza salida=""
  for pieza in "$@"; do
    if [[ "$pieza" =~ ^[A-Za-z0-9_@%+=:,./-]+$ ]]; then
      salida+="$pieza "
    else
      salida+="'${pieza//\'/\'\\''}' "
    fi
  done
  printf '%s' "${salida% }"
}

# Convierte un título en algo que se lea bien dentro de una URL.
rotular() {
  printf '%s' "$1" \
    | tr 'ÁÉÍÓÚáéíóúÑñ' 'AEIOUaeiouNn' \
    | tr '[:upper:] ' '[:lower:]-' \
    | tr -cd 'a-z0-9-'
}

# Deja una marca en la captura: no le pide nada al servidor, sólo escribe el
# título del paso en un lugar donde Wireshark lo muestre.
marcar() {
  curl -s -o /dev/null "$base/eco?paso=$1&titulo=$(rotular "$2")" || true
}

paso() {
  local numero="$1" titulo="$2" mirar="$3"
  shift 3

  marcar "$numero" "$titulo"

  registrar ""
  registrar "╭───────────────────────────────────────────────────────────────"
  registrar "│ PASO $numero · $titulo"
  registrar "│ En la captura: $mirar"
  registrar "│"
  registrar "│ \$ curl $(citar "$@")"
  registrar "╰───────────────────────────────────────────────────────────────"
  curl -sS "$@" 2>&1 | sed 's/\r$//' | tee -a "$TRANSCRIPCION"
  registrar ""
  sleep "$PAUSA"
}

# ── Servidor ──────────────────────────────────────────────────────────────────
if ss -ltn 2>/dev/null | grep -q ":$PUERTO[[:space:]]"; then
  echo "El puerto $PUERTO ya está ocupado. Cerrá ese proceso o usá PORT=3001 $0" >&2
  exit 1
fi

registrar "Conversación entre un cliente (curl) y un servidor (node) en $base"
registrar "Cada paso queda anunciado en la captura como  GET /eco?paso=NN&titulo=..."
PORT="$PUERTO" node "$RAIZ/src/servidor.ts" >"$SALIDA/servidor.log" 2>&1 &
pid_servidor=$!

for _ in $(seq 1 40); do
  kill -0 "$pid_servidor" 2>/dev/null || { echo "El servidor no arrancó:" >&2; cat "$SALIDA/servidor.log" >&2; exit 1; }
  curl -s -o /dev/null "$base/salud" && break
  sleep 0.25
done

# ── Captura ───────────────────────────────────────────────────────────────────
if [[ "$CAPTURAR" == "sí" ]]; then
  [[ -n "$SUDO" ]] && sudo -v
  if command -v tshark >/dev/null; then
    $SUDO tshark -i lo -f "tcp port $PUERTO" -w "$CAPTURA" -q >"$SALIDA/captura.log" 2>&1 &
    pid_captura=$!
    registrar "Capturando con tshark · interfaz lo · filtro «tcp port $PUERTO»"
  elif command -v tcpdump >/dev/null; then
    $SUDO tcpdump -i lo -s 0 -w "$CAPTURA" "tcp port $PUERTO" >"$SALIDA/captura.log" 2>&1 &
    pid_captura=$!
    registrar "Capturando con tcpdump · interfaz lo"
  else
    registrar "Sin tshark ni tcpdump: la conversación corre igual, sin captura."
  fi
  sleep 1.5
fi

# ── La conversación ───────────────────────────────────────────────────────────
registrar ""
registrar "══════════════════════════════════════════════════════════════════"
registrar " Primera parte · el cliente se presenta y mira qué hay"
registrar "══════════════════════════════════════════════════════════════════"

paso 01 "El cliente pregunta si el servidor está vivo" \
  "los tres paquetes del saludo TCP —SYN, SYN-ACK, ACK— antes del primer texto HTTP" \
  -i "$base/salud"

paso 02 "Pregunta qué hay guardado en el vector" \
  "la respuesta dice total 0: todavía no se guardó nada" \
  -i "$base/vector"

registrar ""
registrar "══════════════════════════════════════════════════════════════════"
registrar " Segunda parte · el POST y su efecto"
registrar "══════════════════════════════════════════════════════════════════"

paso 03 "Agrega un elemento mandándolo en el cuerpo" \
  "el paquete lleva la línea POST y, más abajo, el JSON en texto plano" \
  -i -X POST -H "Content-Type: application/json" \
  -d '{"elemento":"hola"}' "$base/vector"

paso 04 "Vuelve a preguntar qué hay en el vector" \
  "total pasó de 0 a 1: eso es lo que hizo el POST" \
  -i "$base/vector"

registrar ""
registrar "══════════════════════════════════════════════════════════════════"
registrar " Tercera parte · por dónde puede viajar un dato"
registrar "══════════════════════════════════════════════════════════════════"

paso 05 "Agrega otro elemento, ahora escrito en la propia URL" \
  "el dato se lee en la columna Info del listado, sin abrir el paquete" \
  -i -X POST "$base/vector?elemento=desdeLaUrl"

paso 06 "Agrega el número 42 en el cuerpo, con tipo" \
  "la respuesta dice tipo numero; el paso anterior decía tipo texto" \
  -i -X POST -H "Content-Type: application/json" \
  -d '{"elemento":42}' "$base/vector"

paso 07 "Pide el eco del mensaje para ver dónde viajó cada dato" \
  "una sola respuesta muestra método, ruta, consulta, encabezados y cuerpo" \
  -i -X POST -H "Content-Type: application/json" -H "X-Materia: backend" \
  -d '{"elemento":"en el cuerpo"}' "$base/eco?elemento=en-la-url&otro=dato"

registrar ""
registrar "══════════════════════════════════════════════════════════════════"
registrar " Cuarta parte · consultar, filtrar y equivocarse"
registrar "══════════════════════════════════════════════════════════════════"

paso 08 "Pide un elemento puntual por su posición" \
  "la posición viaja en la ruta, no en la consulta: identifica un recurso" \
  -i "$base/vector/0"

paso 09 "Filtra el vector con un parámetro de consulta" \
  "la consulta no identifica un recurso: lo filtra. total sigue en 3" \
  -i "$base/vector?contiene=desde"

paso 10 "Intenta guardar un elemento vacío" \
  "400: el servidor entendió el mensaje y lo rechazó por su contenido" \
  -i -X POST -H "Content-Type: application/json" \
  -d '{"elemento":"   "}' "$base/vector"

paso 11 "Pide una posición que no existe" \
  "404: la ruta es válida, el elemento no está" \
  -i "$base/vector/99"

registrar ""
registrar "══════════════════════════════════════════════════════════════════"
registrar " Quinta parte · deshacer y despedirse"
registrar "══════════════════════════════════════════════════════════════════"

paso 12 "Vacía el vector" \
  "204: respuesta sin cuerpo. En la captura no hay JSON detrás de los encabezados" \
  -i -X DELETE "$base/vector"

paso 13 "Comprueba que quedó vacío, y de paso reutiliza la conexión" \
  "dos solicitudes HTTP dentro de un mismo saludo TCP: keep-alive" \
  -i "$base/vector" "$base/salud"

# ── Cierre ────────────────────────────────────────────────────────────────────
sleep 1
limpiar
trap - EXIT

registrar ""
registrar "Transcripción: $TRANSCRIPCION"

if [[ -f "$CAPTURA" ]]; then
  $SUDO chown "$(id -u):$(id -g)" "$CAPTURA" 2>/dev/null || true
  registrar "Captura:       $CAPTURA"

  if command -v tshark >/dev/null; then
    registrar ""
    registrar "── La conversación completa, tal como quedó en la captura ─────────"
    tshark -r "$CAPTURA" -Y http -T fields \
      -e frame.number -e frame.time_relative -e tcp.stream \
      -e http.request.method -e http.request.uri -e http.response.code \
      -E header=y -E separator='  ' 2>/dev/null | tee -a "$TRANSCRIPCION"
  fi

  registrar ""
  registrar "Abrilo con:  wireshark $CAPTURA"
  registrar ""
  registrar "Filtros para proyectar en clase:"
  registrar "  http.request.uri contains \"paso=\"   el índice: sólo las marcas de cada paso"
  registrar "  http.request.method == \"POST\"        sólo los POST"
  registrar "  frame contains \"hola\"                cualquier paquete que contenga esa palabra"
  registrar "  tcp.stream == 3                      una conversación TCP completa"
fi
