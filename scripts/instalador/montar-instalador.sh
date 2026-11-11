#!/usr/bin/env bash
# Builds the installer package (dist/vetra-instalador.zip): what someone needs to run Vetra without the source code.
# The release workflow runs it, so the package never drifts from the repository. It does not build or publish anything.
set -euo pipefail
cd "$(dirname "$0")/../.."

out="dist/instalador"
rm -rf dist
mkdir -p "$out/scripts/windows" "$out/scripts/mac-linux"

cp compose.yaml LICENSE README.md "$out/"
cp scripts/instalador/env.example "$out/.env.example"
cp scripts/windows/* "$out/scripts/windows/"
cp scripts/mac-linux/* "$out/scripts/mac-linux/"

# The package fixes the version it was made for (the update script changes it later). Without a version, as in a local
# run, the line stays commented and the latest is used.
if [ -n "${VETRA_VERSION:-}" ]; then
  sed -i.bak -E "s|^# *VETRA_VERSION=.*|VETRA_VERSION=\"${VETRA_VERSION}\"|" "$out/.env.example"
  rm -f "$out/.env.example.bak"
  grep -q "^VETRA_VERSION=\"${VETRA_VERSION}\"" "$out/.env.example" || { echo "The version was not written in .env.example." >&2; exit 1; }
fi

# The package has no Dockerfile on purpose: that is how the launcher knows to pull the image instead of building it.
if [ -e "$out/Dockerfile" ]; then
  echo "The package must not contain the Dockerfile." >&2
  exit 1
fi

if command -v zip >/dev/null 2>&1; then
  (cd "$out" && zip -qr ../vetra-instalador.zip .)
else
  # Without zip (Windows Git Bash, for instance). Written this way so the dotfiles (.env.example) go in too.
  py=""
  for candidate in python3 python py; do
    if "$candidate" -c "" >/dev/null 2>&1; then py="$candidate"; break; fi
  done
  [ -n "$py" ] || { echo "Neither zip nor Python was found." >&2; exit 1; }
  "$py" - <<'PY'
import os, zipfile
root = "dist/instalador"
with zipfile.ZipFile("dist/vetra-instalador.zip", "w", zipfile.ZIP_DEFLATED) as archive:
    for folder, _, files in os.walk(root):
        for name in files:
            path = os.path.join(folder, name)
            archive.write(path, os.path.relpath(path, root))
PY
fi
echo "dist/vetra-instalador.zip"
