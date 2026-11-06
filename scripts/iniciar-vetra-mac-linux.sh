#!/usr/bin/env bash
# Starts Vetra on macOS and Linux: checks Docker, makes the .env the first time, starts the
# services, waits until Vetra answers and opens the browser.
set -euo pipefail
cd "$(dirname "$0")/.."

stop_with() {
  echo
  echo "$1"
  exit 1
}

command -v docker >/dev/null 2>&1 || stop_with "O Docker Desktop nao esta instalado. Instale em https://www.docker.com/products/docker-desktop e rode este arquivo de novo."
docker info >/dev/null 2>&1 || stop_with "O Docker nao esta aberto. Abra o Docker Desktop, espere ele terminar de iniciar e rode este arquivo de novo."

if [ ! -f .env ]; then
  echo "Primeiro uso: criando a configuracao..."
  cp .env.example .env
fi
if grep -q 'WAHA_API_KEY="change-me"' .env; then
  key="$(openssl rand -hex 24)"
  sed -i.bak "s|WAHA_API_KEY=\"change-me\"|WAHA_API_KEY=\"${key}\"|" .env && rm -f .env.bak
fi

port=4720

# With the source next to the scripts (a clone) the app is built here; without it (the installer package) the
# image already built is pulled.
if [ -f Dockerfile ]; then
  app_image_args="--build"
else
  app_image_args="--pull always --no-build"
fi
# The pinned WAHA image is for amd64 only (the arm one is not verified yet).
case "$(uname -m)" in
  arm64|aarch64) export WAHA_IMAGE="devlikeapro/waha:arm" ;;
esac

echo "Iniciando o Vetra. Na primeira vez isso demora alguns minutos..."
# The database and WhatsApp are started (and waited for) first and are left alone if nothing changed.
# The app is always made again: a container kept from an earlier run can point to a network that
# Docker has since replaced, and then it does not start ("network not found").
docker compose -f compose.yaml up -d --wait db waha || stop_with "Nao consegui iniciar o Vetra. Confira se o Docker esta funcionando e tente de novo."
docker compose -f compose.yaml --profile app up -d $app_image_args --force-recreate --no-deps app || stop_with "Nao consegui iniciar o Vetra. Confira se o Docker esta funcionando e tente de novo."

address="http://localhost:${port}"
echo "Esperando o Vetra responder..."
for _ in $(seq 1 90); do
  if curl -fs -m 3 "http://127.0.0.1:${port}/api/profile" >/dev/null 2>&1; then
    echo
    echo "O Vetra esta rodando em ${address}"
    (command -v open >/dev/null 2>&1 && open "${address}") || (command -v xdg-open >/dev/null 2>&1 && xdg-open "${address}") || true
    exit 0
  fi
  sleep 2
done
stop_with "O Vetra demorou para responder. Veja o que aconteceu com: docker compose -f compose.yaml logs app"
