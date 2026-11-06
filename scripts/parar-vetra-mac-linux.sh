#!/usr/bin/env bash
# Stops Vetra for good (containers and network are removed, so it does not come back by itself). The data stays in its volumes (never -v); run iniciar-vetra-mac-linux.sh to start it again.
cd "$(dirname "$0")/.."
docker compose -f compose.yaml --profile app down
echo
echo "O Vetra foi parado. Para iniciar de novo, rode bash scripts/iniciar-vetra-mac-linux.sh"
