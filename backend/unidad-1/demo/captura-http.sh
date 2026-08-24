#!/usr/bin/env bash
#
# Demostración de la Unidad 1: levanta el servidor, ejercita el contrato HTTP con
# `curl -i` y captura el tráfico con un analizador de paquetes para poder abrirlo
# después en Wireshark.
#
#   ./demo/captura-http.sh              captura + solicitudes (pide sudo)
#   ./demo/captura-http.sh --sin-captura   sólo las solicitudes (no necesita sudo)
#
# Deja en demo/salida/:
#   trafico.pcapng   captura para abrir con Wireshark
#   sesion.txt       transcripción de las solicitudes y respuestas
#
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SALIDA="$RAIZ/demo/salida"
PUERTO="${PORT:-3000}"
ANFITRION="127.0.0.1"
CAPTURAR="sí"
[[ "${1:-}" == "--sin-captura" ]] && CAPTURAR="no"

# Capturar paquetes es una operación privilegiada. Si el usuario pertenece al
# grupo «wireshark» —opción que ofrece el instalador del paquete— dumpcap ya tiene
# los permisos necesarios y no hace falta sudo.
if [[ "$(id -u)" == "0" ]] || id -nG | grep -qw wireshark; then
  SUDO=""
else
  SUDO="sudo"
fi

mkdir -p "$SALIDA"
TRANSCRIPCION="$SALIDA/sesion.txt"
CAPTURA="$SALIDA/trafico.pcapng"
: > "$TRANSCRIPCION"

pid_servidor=""
pid_captura=""

limpiar() {
  [[ -n "$pid_captura"  ]] && $SUDO kill -INT "$pid_captura" 2>/dev/null || true
  [[ -n "$pid_servidor" ]] && kill "$pid_servidor" 2>/dev/null || true
  wait 2>/dev/null || true
}
trap limpiar EXIT

# Escribe en pantalla y en la transcripción a la vez.
registrar() { printf '%s\n' "$*" | tee -a "$TRANSCRIPCION"; }

# Ejecuta un `curl`, mostrando primero el comando y después la respuesta cruda.
llamar() {
  local titulo="$1"; shift
  registrar ""
  registrar "───────────────────────────────────────────────────────────────"
  registrar "▶ $titulo"
  registrar "\$ curl $*"
  registrar ""
  curl -sS "$@" 2>&1 | sed 's/\r$//' | tee -a "$TRANSCRIPCION"
  registrar ""
}

base="http://$ANFITRION:$PUERTO"

# ── 1. Servidor ────────────────────────────────────────────────────────────────
# Dos procesos no pueden escuchar el mismo puerto. Si estuviera ocupado, `node`
# terminaría con EADDRINUSE y `curl` le hablaría al proceso ajeno sin avisar:
# la demostración mostraría la conducta de otro programa. Por eso se verifica antes.
if ss -ltn 2>/dev/null | grep -q ":$PUERTO[[:space:]]"; then
  echo "El puerto $PUERTO ya está ocupado por otro proceso. Cerralo o usá PORT=3001 $0" >&2
  exit 1
fi

registrar "Servidor: node src/servidor.ts en $base"
PORT="$PUERTO" node "$RAIZ/src/servidor.ts" >"$SALIDA/servidor.log" 2>&1 &
pid_servidor=$!

for _ in $(seq 1 40); do
  kill -0 "$pid_servidor" 2>/dev/null || { echo "El servidor no arrancó:" >&2; cat "$SALIDA/servidor.log" >&2; exit 1; }
  curl -s -o /dev/null "$base/salud" && break
  sleep 0.25
done

# ── 2. Captura ─────────────────────────────────────────────────────────────────
if [[ "$CAPTURAR" == "sí" ]]; then
  # Pedir la contraseña ahora, no cuando el proceso ya esté en segundo plano.
  [[ -n "$SUDO" ]] && sudo -v
  if command -v tshark >/dev/null; then
    $SUDO tshark -i lo -f "tcp port $PUERTO" -w "$CAPTURA" -q >"$SALIDA/captura.log" 2>&1 &
    pid_captura=$!
    registrar "Capturando con tshark en la interfaz lo, filtro «tcp port $PUERTO»"
  elif command -v tcpdump >/dev/null; then
    $SUDO tcpdump -i lo -s 0 -w "$CAPTURA" "tcp port $PUERTO" >"$SALIDA/captura.log" 2>&1 &
    pid_captura=$!
    registrar "Capturando con tcpdump en la interfaz lo, filtro «tcp port $PUERTO»"
  else
    registrar "Sin tshark ni tcpdump instalados: se ejecutan las solicitudes sin capturar."
  fi
  sleep 1.5
fi

# ── 3. Guion de solicitudes ────────────────────────────────────────────────────
registrar ""
registrar "==============================================================="
registrar " Unidad 1 · sección 7 — casos de prueba de la consigna"
registrar "==============================================================="

llamar "GET /salud — el endpoint de estado responde 200 y JSON" \
  -i "$base/salud"

llamar "GET /ruta-inexistente — una ruta desconocida responde 404, no 200" \
  -i "$base/ruta-inexistente"

registrar ""
registrar "==============================================================="
registrar " Endpoints agregados en esta unidad"
registrar "==============================================================="

llamar "GET /hora — segundo endpoint pedido por la consigna" \
  -i "$base/hora"

llamar "GET /estudiantes/42 — parámetro de ruta: identifica un recurso" \
  -i "$base/estudiantes/42"

llamar "GET /estudiantes/42?detalle=completo — la consulta no cambia el recurso" \
  -i "$base/estudiantes/42?detalle=completo"

llamar "GET /estudiantes/999 — 404: el recurso no existe" \
  -i "$base/estudiantes/999"

llamar "GET /estudiantes/abc — 400: la solicitud está mal formada" \
  -i "$base/estudiantes/abc"

llamar "GET /materias — colección con el cupo calculado" \
  -i "$base/materias"

registrar ""
registrar "==============================================================="
registrar " Métodos: HEAD, OPTIONS y el método equivocado"
registrar "==============================================================="

llamar "HEAD /salud — mismos encabezados que GET, sin cuerpo" \
  -I "$base/salud"

llamar "HEAD /materias — anuncia Content-Length sin transferir el cuerpo" \
  -I "$base/materias"

llamar "GET /materias (sólo encabezados) — el mismo Content-Length, ahora sí con cuerpo" \
  -i -o /dev/null -D - "$base/materias"

llamar "HEAD /ruta-inexistente — 404 también sin cuerpo" \
  -I "$base/ruta-inexistente"

llamar "OPTIONS /materias — 204 y el encabezado Allow" \
  -i -X OPTIONS "$base/materias"

llamar "DELETE /materias — 405: la ruta existe, la operación no" \
  -i -X DELETE "$base/materias"

llamar "GET /inscripciones — 405: esa ruta sólo admite POST" \
  -i "$base/inscripciones"

registrar ""
registrar "==============================================================="
registrar " POST: creación, validación y conflicto"
registrar "==============================================================="

llamar "POST /inscripciones — 201 Created y encabezado Location" \
  -i -X POST -H "Content-Type: application/json" \
  -d '{"estudianteId":1,"materia":"algoritmos"}' "$base/inscripciones"

llamar "POST /inscripciones repetido — 409: entiendo la solicitud, el estado no la admite" \
  -i -X POST -H "Content-Type: application/json" \
  -d '{"estudianteId":1,"materia":"algoritmos"}' "$base/inscripciones"

llamar "POST con JSON inválido — 400: no puedo interpretar la solicitud" \
  -i -X POST -H "Content-Type: application/json" \
  -d '{ esto no es json' "$base/inscripciones"

llamar "POST de un estudiante inactivo — 409 con el motivo en el cuerpo" \
  -i -X POST -H "Content-Type: application/json" \
  -d '{"estudianteId":42,"materia":"algoritmos"}' "$base/inscripciones"

llamar "GET /estudiantes/1/inscripciones — el efecto del POST es observable" \
  -i "$base/estudiantes/1/inscripciones"

registrar ""
registrar "==============================================================="
registrar " Una conexión TCP, varias solicitudes HTTP (keep-alive)"
registrar "==============================================================="

llamar "Dos solicitudes reutilizando la misma conexión" \
  -i "$base/salud" "$base/hora"

# ── 4. Cierre y resumen de la captura ──────────────────────────────────────────
sleep 1
limpiar
trap - EXIT

registrar ""
registrar "Transcripción: $TRANSCRIPCION"

if [[ -f "$CAPTURA" ]] && command -v tshark >/dev/null; then
  $SUDO chown "$(id -u):$(id -g)" "$CAPTURA" 2>/dev/null || true
  registrar "Captura:       $CAPTURA"
  registrar ""
  registrar "── Resumen HTTP de la captura ─────────────────────────────────"
  tshark -r "$CAPTURA" -Y http -T fields \
    -e frame.number -e ip.src -e tcp.srcport -e ip.dst -e tcp.dstport \
    -e http.request.method -e http.request.uri -e http.response.code \
    -E header=y -E separator=' ' 2>/dev/null | tee -a "$TRANSCRIPCION"
  registrar ""
  registrar "Abrilo con:  wireshark $CAPTURA"
elif [[ -f "$CAPTURA" ]]; then
  $SUDO chown "$(id -u):$(id -g)" "$CAPTURA" 2>/dev/null || true
  registrar "Captura:       $CAPTURA  (abrir con Wireshark)"
fi
