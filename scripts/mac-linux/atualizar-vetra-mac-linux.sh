#!/usr/bin/env bash
# Updates Vetra on macOS and Linux: asks the running Vetra which version is the newest, makes a backup of the database,
# pulls the new image, restarts the app and waits for it. If the new version does not answer, it goes back to the one
# that was running. Usage: atualizar-vetra-mac-linux.sh [version] [--yes]
set -euo pipefail
cd "$(dirname "$0")/../.."

port="${VETRA_PORT:-4720}"
# How many times (2 seconds apart) to ask whether the app answers before giving up.
wait_tries="${VETRA_WAIT_TRIES:-90}"
backups_to_keep=5
target=""
assume_yes="no"
for argument in "$@"; do
  case "$argument" in
    --yes|-y) assume_yes="yes" ;;
    *) target="$argument" ;;
  esac
done

stop_with() {
  echo
  echo "$1"
  exit 1
}

json_field() { # json_field <json> <name>: a text or true/false of a flat JSON, without needing jq
  printf '%s' "$1" | sed -n "s/.*\"$2\":\"\{0,1\}\([^\",}]*\)\"\{0,1\}.*/\1/p"
}

wait_for_vetra() {
  for _ in $(seq 1 "$wait_tries"); do
    if curl -fs -m 3 "http://127.0.0.1:${port}/api/profile" >/dev/null 2>&1; then return 0; fi
    sleep 2
  done
  return 1
}

set_env_version() { # remembers the version in .env, so the next start does not change it
  if grep -qE '^#? *VETRA_VERSION=' .env; then
    sed -i.bak -E "s|^#? *VETRA_VERSION=.*|VETRA_VERSION=\"$1\"|" .env && rm -f .env.bak
  else
    printf '\nVETRA_VERSION="%s"\n' "$1" >> .env
  fi
}

command -v docker >/dev/null 2>&1 || stop_with "O Docker Desktop nao esta instalado. Instale em https://www.docker.com/products/docker-desktop e rode este arquivo de novo."
docker info >/dev/null 2>&1 || stop_with "O Docker nao esta aberto. Abra o Docker Desktop, espere ele terminar de iniciar e rode este arquivo de novo."
[ -f .env ] || stop_with "Nao achei o arquivo .env. Rode o iniciar-vetra pelo menos uma vez antes de atualizar."
[ ! -f Dockerfile ] || stop_with "Esta pasta tem o codigo-fonte do Vetra. Para atualizar, rode 'git pull' e depois o iniciar-vetra."

# The version that is running, and the newest one: the Vetra that is running is the one that knows (it compares them).
info="$(curl -fs -m 15 "http://127.0.0.1:${port}/api/updates?refresh=true" 2>/dev/null || true)"
current="$(json_field "$info" currentVersion)"
if [ -z "$target" ]; then
  [ -n "$info" ] || stop_with "Nao consegui falar com o Vetra. Abra o Vetra (iniciar-vetra) e rode este arquivo de novo, ou diga a versao: atualizar-vetra-mac-linux.sh X.Y.Z"
  [ "$(json_field "$info" checkFailed)" != "true" ] || stop_with "Nao consegui verificar se ha versao nova. Confira a internet e tente de novo."
  if [ "$(json_field "$info" hasUpdate)" != "true" ]; then
    echo "Voce ja esta na versao mais recente (${current})."
    exit 0
  fi
  target="$(json_field "$info" latestVersion)"
fi
if [ -z "$current" ]; then
  current="$(docker inspect --format '{{index .Config.Labels "org.opencontainers.image.version"}}' "$(docker compose -f compose.yaml --profile app ps -q app)" 2>/dev/null || true)"
fi

printf '%s' "$target" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$' || stop_with "A versao '${target}' nao parece uma versao (use algo como 0.2.0)."
[ -n "$current" ] || stop_with "Nao consegui descobrir a versao instalada, e sem ela nao da para voltar atras se der problema. Abra o Vetra e tente de novo."
[ "$current" != "$target" ] || { echo "Voce ja esta na versao ${target}."; exit 0; }

echo "O Vetra vai ser atualizado de ${current} para ${target}."
echo "Ele fica fora do ar por alguns instantes. Antes, um backup do banco e guardado na pasta backups."
if [ "$assume_yes" != "yes" ]; then
  read -r -p "Continuar? (s/N) " answer
  case "$answer" in s|S|sim|SIM) ;; *) echo "Nada foi alterado."; exit 0 ;; esac
fi

# 1. Pull the new image first: if it cannot be had, nothing is touched and no backup is made for nothing.
echo "Baixando a versao ${target}..."
VETRA_VERSION="$target" docker compose -f compose.yaml --profile app pull app || stop_with "Nao consegui baixar a versao ${target}. O Vetra continua como estava."

# 2. Backup. Nothing is touched if it fails. The dump must fail loudly (a pipe into gzip would hide its failure and leave an
# empty file) and is checked inside the container for the line pg_dump writes at the end of a complete dump.
mkdir -p backups
backup="backups/vetra-$(date +%Y%m%d-%H%M%S)-v${current}.sql.gz"
docker compose -f compose.yaml up -d --wait db >/dev/null 2>&1 || stop_with "Nao consegui iniciar o banco para o backup. Nada foi alterado."
docker compose -f compose.yaml exec -T db sh -c 'set -e; pg_dump -U dev -f /tmp/vetra-backup.sql vetra; gzip -f /tmp/vetra-backup.sql; gunzip -c /tmp/vetra-backup.sql.gz | tail -n 5 | grep -q "PostgreSQL database dump complete"' || stop_with "O backup do banco falhou. Nada foi alterado."
docker compose -f compose.yaml cp db:/tmp/vetra-backup.sql.gz "$backup" >/dev/null || stop_with "Nao consegui guardar o backup. Nada foi alterado."
docker compose -f compose.yaml exec -T db rm -f /tmp/vetra-backup.sql /tmp/vetra-backup.sql.gz >/dev/null 2>&1 || true
if [ ! -s "$backup" ] || ! gzip -t "$backup" 2>/dev/null; then
  rm -f "$backup"
  stop_with "O backup do banco saiu vazio ou quebrado. Nada foi alterado."
fi
echo "Backup guardado em ${backup}"
# shellcheck disable=SC2012
ls -1t backups/vetra-*.sql.gz 2>/dev/null | tail -n +$((backups_to_keep + 1)) | while read -r old; do rm -f "$old"; done

# 3. Swap the app and wait for it.
echo "Trocando o Vetra pela versao ${target}..."
VETRA_VERSION="$target" docker compose -f compose.yaml --profile app up -d --pull never --no-build --force-recreate --no-deps app \
  && wait_for_vetra && { set_env_version "$target"; echo; echo "Pronto! O Vetra foi atualizado para a versao ${target}."; exit 0; }

# 4. It did not start: back to the version that was running.
echo
echo "A versao ${target} nao iniciou. Voltando para a ${current}..."
VETRA_VERSION="$current" docker compose -f compose.yaml --profile app up -d --pull never --no-build --force-recreate --no-deps app || true
if wait_for_vetra; then
  set_env_version "$current"
  stop_with "O Vetra voltou para a versao ${current}. A ${target} nao foi instalada. O backup antes da troca esta em ${backup} (as mudancas que a versao nova tenha feito no banco podem ter ficado; ele cobre esse caso)."
fi
stop_with "O Vetra nao voltou sozinho. Seus dados estao guardados no backup ${backup}. Rode o iniciar-vetra ou peca ajuda, informando esta mensagem."
