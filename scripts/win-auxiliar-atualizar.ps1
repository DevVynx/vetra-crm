# AUXILIAR of atualizar-vetra-windows.bat: it is not opened on its own, the .bat calls it.
# Asks the running Vetra which version is the newest, makes a backup of the database, pulls the new image, restarts the
# app and waits for it. If the new version does not answer, it goes back to the one that was running.
param(
  [string]$Version = "",
  [switch]$Yes
)
# Not "Stop": docker writes its progress to the error output, and PowerShell would take every line for a failure. Each
# command is checked by its exit code instead.
$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$port = if ($env:VETRA_PORT) { $env:VETRA_PORT } else { 4720 }
$backupsToKeep = 5
# How many times (2 seconds apart) to ask whether the app answers before giving up.
$waitTries = if ($env:VETRA_WAIT_TRIES) { [int]$env:VETRA_WAIT_TRIES } else { 90 }
$composeArgs = @("compose", "-f", "compose.yaml")
$appArgs = @("--profile", "app")
$appUp = @("up", "-d", "--pull", "never", "--no-build", "--force-recreate", "--no-deps", "app")

function Stop-WithMessage($message) {
  Write-Host ""
  Write-Host $message -ForegroundColor Yellow
  exit 1
}

function Wait-ForVetra {
  for ($i = 0; $i -lt $waitTries; $i++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$port/api/profile" -TimeoutSec 3
      if ($response.StatusCode -eq 200) { return $true }
    } catch { }
    Start-Sleep -Seconds 2
  }
  return $false
}

# Remembers the version in .env, so the next start does not change it.
function Set-EnvVersion($version) {
  $envFile = Join-Path $root ".env"
  $text = [IO.File]::ReadAllText($envFile)
  if ($text -match '(?m)^#? *VETRA_VERSION=') {
    $text = $text -replace '(?m)^#? *VETRA_VERSION=.*', ('VETRA_VERSION="' + $version + '"')
  } else {
    $text = $text.TrimEnd() + "`nVETRA_VERSION=`"$version`"`n"
  }
  [IO.File]::WriteAllText($envFile, $text, (New-Object Text.UTF8Encoding $false))
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Stop-WithMessage "O Docker Desktop nao esta instalado. Instale em https://www.docker.com/products/docker-desktop e rode este arquivo de novo."
}
docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Stop-WithMessage "O Docker Desktop nao esta aberto. Abra o Docker Desktop, espere ele terminar de iniciar e rode este arquivo de novo."
}
if (-not (Test-Path (Join-Path $root ".env"))) {
  Stop-WithMessage "Nao achei o arquivo .env. Rode o iniciar-vetra pelo menos uma vez antes de atualizar."
}
if (Test-Path (Join-Path $root "Dockerfile")) {
  Stop-WithMessage "Esta pasta tem o codigo-fonte do Vetra. Para atualizar, rode 'git pull' e depois o iniciar-vetra."
}

# The version that is running, and the newest one: the Vetra that is running is the one that knows (it compares them).
$info = $null
try { $info = Invoke-RestMethod -UseBasicParsing -Uri "http://127.0.0.1:$port/api/updates?refresh=true" -TimeoutSec 15 } catch { }
$current = if ($info) { [string]$info.currentVersion } else { "" }
$target = $Version
if (-not $target) {
  if (-not $info) {
    Stop-WithMessage "Nao consegui falar com o Vetra. Abra o Vetra (iniciar-vetra) e rode este arquivo de novo, ou diga a versao: atualizar-vetra-windows.bat 0.2.0"
  }
  if ($info.checkFailed) {
    Stop-WithMessage "Nao consegui verificar se ha versao nova. Confira a internet e tente de novo."
  }
  if (-not $info.hasUpdate) {
    Write-Host "Voce ja esta na versao mais recente ($current)."
    exit 0
  }
  $target = [string]$info.latestVersion
}
if (-not $current) {
  $appId = (docker @composeArgs @appArgs ps -q app 2>$null)
  if ($appId) { $current = (docker inspect --format '{{index .Config.Labels "org.opencontainers.image.version"}}' $appId 2>$null) }
}

if ($target -notmatch '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$') {
  Stop-WithMessage "A versao '$target' nao parece uma versao (use algo como 0.2.0)."
}
if (-not $current) {
  Stop-WithMessage "Nao consegui descobrir a versao instalada, e sem ela nao da para voltar atras se der problema. Abra o Vetra e tente de novo."
}
if ($current -eq $target) {
  Write-Host "Voce ja esta na versao $target."
  exit 0
}

Write-Host "O Vetra vai ser atualizado de $current para $target."
Write-Host "Ele fica fora do ar por alguns instantes. Antes, um backup do banco e guardado na pasta backups."
if (-not $Yes) {
  $answer = Read-Host "Continuar? (s/N)"
  if ($answer -notmatch '^(s|sim)$') {
    Write-Host "Nada foi alterado."
    exit 0
  }
}

# 1. Pull the new image first: if it cannot be had, nothing is touched and no backup is made for nothing.
Write-Host "Baixando a versao $target..."
$env:VETRA_VERSION = $target
docker @composeArgs @appArgs pull app
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Nao consegui baixar a versao $target. O Vetra continua como estava." }

# 2. Backup. Nothing is touched if it fails. The dump must fail loudly (a pipe into gzip would hide its failure and leave an
# empty file) and is checked inside the container for the line pg_dump writes at the end of a complete dump.
$backupDir = Join-Path $root "backups"
New-Item -ItemType Directory -Force -Path $backupDir -ErrorAction Stop | Out-Null
$backup = Join-Path $backupDir ("vetra-{0}-v{1}.sql.gz" -f (Get-Date -Format "yyyyMMdd-HHmmss"), $current)
docker @composeArgs up -d --wait db *> $null
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Nao consegui iniciar o banco para o backup. Nada foi alterado." }
docker @composeArgs exec -T db sh -c 'set -e; pg_dump -U dev -f /tmp/vetra-backup.sql vetra; gzip -f /tmp/vetra-backup.sql; gunzip -c /tmp/vetra-backup.sql.gz | tail -n 5 | grep -q "PostgreSQL database dump complete"'
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "O backup do banco falhou. Nada foi alterado." }
docker @composeArgs cp db:/tmp/vetra-backup.sql.gz $backup *> $null
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Nao consegui guardar o backup. Nada foi alterado." }
docker @composeArgs exec -T db rm -f /tmp/vetra-backup.sql /tmp/vetra-backup.sql.gz *> $null
if ((-not (Test-Path $backup)) -or ((Get-Item $backup).Length -lt 20)) {
  Remove-Item -Force -ErrorAction SilentlyContinue $backup
  Stop-WithMessage "O backup do banco saiu vazio ou quebrado. Nada foi alterado."
}
Write-Host "Backup guardado em backups\$(Split-Path -Leaf $backup)"
Get-ChildItem -Path $backupDir -Filter "vetra-*.sql.gz" | Sort-Object LastWriteTime -Descending |
  Select-Object -Skip $backupsToKeep | Remove-Item -Force

# 3. Swap the app and wait for it.
Write-Host "Trocando o Vetra pela versao $target..."
docker @composeArgs @appArgs @appUp
if (($LASTEXITCODE -eq 0) -and (Wait-ForVetra)) {
  Set-EnvVersion $target
  Write-Host ""
  Write-Host "Pronto! O Vetra foi atualizado para a versao $target." -ForegroundColor Green
  exit 0
}

# 4. It did not start: back to the version that was running.
Write-Host ""
Write-Host "A versao $target nao iniciou. Voltando para a $current..." -ForegroundColor Yellow
$env:VETRA_VERSION = $current
docker @composeArgs @appArgs @appUp
if (Wait-ForVetra) {
  Set-EnvVersion $current
  Stop-WithMessage "O Vetra voltou para a versao $current. A $target nao foi instalada. O backup antes da troca esta em backups\$(Split-Path -Leaf $backup) (as mudancas que a versao nova tenha feito no banco podem ter ficado; ele cobre esse caso)."
}
Stop-WithMessage "O Vetra nao voltou sozinho. Seus dados estao guardados no backup backups\$(Split-Path -Leaf $backup). Rode o iniciar-vetra ou peca ajuda, informando esta mensagem."
