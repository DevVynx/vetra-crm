# AUXILIAR of iniciar-vetra-windows.bat: it is not opened on its own, the .bat calls it. Its name does not start
# with "iniciar-vetra" on purpose, so nobody mistakes it for the file to open.
# Starts Vetra for someone who doesn't program: checks Docker, makes the .env the first time,
# starts the services, waits until Vetra answers and opens the browser.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Stop-WithMessage($message) {
  Write-Host ""
  Write-Host $message -ForegroundColor Yellow
  exit 1
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Stop-WithMessage "O Docker Desktop nao esta instalado. Instale em https://www.docker.com/products/docker-desktop e rode este arquivo de novo."
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  Stop-WithMessage "O Docker Desktop nao esta aberto. Abra o Docker Desktop, espere ele terminar de iniciar e rode este arquivo de novo."
}

# The .env is made once, from the example, with a key of its own for WhatsApp.
$envFile = Join-Path $root ".env"
$example = Join-Path $root ".env.example"
if (-not (Test-Path $envFile)) {
  Write-Host "Primeiro uso: criando a configuracao..."
  $text = [IO.File]::ReadAllText($example)
} else {
  $text = [IO.File]::ReadAllText($envFile)
}
if ($text -match 'WAHA_API_KEY="change-me"') {
  $bytes = New-Object byte[] 24
  [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $key = ([Convert]::ToBase64String($bytes) -replace '[^a-zA-Z0-9]', '')
  $text = $text -replace 'WAHA_API_KEY="change-me"', ('WAHA_API_KEY="' + $key + '"')
  [IO.File]::WriteAllText($envFile, $text, (New-Object Text.UTF8Encoding $false))
}

$port = 4720
if ($text -match '(?m)^VETRA_PORT="?(\d+)"?') { $port = [int]$Matches[1] }

Write-Host "Iniciando o Vetra. Na primeira vez isso demora alguns minutos..."
# The database and WhatsApp are started (and waited for) first and are left alone if nothing changed.
# The app is always made again: a container kept from an earlier run can point to a network that
# Docker has since replaced, and then it does not start ("network not found").
docker compose -f compose.yaml up -d --wait db waha
if ($LASTEXITCODE -ne 0) {
  Stop-WithMessage "Nao consegui iniciar o Vetra. Confira se o Docker Desktop esta funcionando e tente de novo."
}
docker compose -f compose.yaml --profile app up -d --build --force-recreate --no-deps app
if ($LASTEXITCODE -ne 0) {
  Stop-WithMessage "Nao consegui iniciar o Vetra. Confira se o Docker Desktop esta funcionando e tente de novo."
}

$address = "http://localhost:$port"
Write-Host "Esperando o Vetra responder..."
$ready = $false
for ($i = 0; $i -lt 90; $i++) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$port/api/profile" -TimeoutSec 3
    if ($response.StatusCode -eq 200) { $ready = $true; break }
  } catch { }
  Start-Sleep -Seconds 2
}
if (-not $ready) {
  Stop-WithMessage "O Vetra demorou para responder. Veja o que aconteceu com: docker compose -f compose.yaml logs app"
}

Write-Host ""
Write-Host "O Vetra esta rodando em $address" -ForegroundColor Green
Start-Process $address
