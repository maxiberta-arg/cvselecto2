<#
.SYNOPSIS
  Deploy seguro para staging (Windows PowerShell).

USO
  Ejecutar desde la raíz del repo:
    .\scripts\deploy_staging_safe.ps1 -Branch master

Notas:
- Hace backups locales en `scripts/backups/` (git bundle + .env + storage/public zip si existen).
- No incluye backup de la base de datos (requiere credenciales y mysqldump). Hacer backup DB manualmente si es necesario.
#>

param(
    [string]$Branch = "master",
    [switch]$SkipFrontend
)

function FailExit($msg) {
    Write-Error $msg
    exit 1
}

Write-Host "Starting safe deploy (branch: $Branch)" -ForegroundColor Cyan

# Verify we are in project root (artisan present)
if (-not (Test-Path -Path "./artisan")) {
    FailExit 'No se encontró `artisan`. Ejecutá este script desde la raíz del proyecto.'
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupDir = "scripts/backups"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "Creando backup de git (bundle)..."
try {
    git bundle create "$backupDir/repo-$timestamp.bundle" --all 2>&1 | Out-Null
} catch {
    Write-Warning "git bundle falló: $_";
}

if (Test-Path -Path ".env") {
    Write-Host "Guardando copia de .env..."
    Copy-Item -Path ".env" -Destination "$backupDir/.env.$timestamp" -Force
}

foreach ($d in @('storage', 'public')) {
    if (Test-Path -Path $d) {
        $zipPath = "$backupDir/${d}-$timestamp.zip"
        Write-Host "Comprimiendo $d → $zipPath"
        try {
            Compress-Archive -Path $d -DestinationPath $zipPath -Force
        } catch {
            Write-Warning "Compress-Archive falló para $d: $_"
        }
    }
}

Write-Host "Actualizando código desde origin/$Branch..."
git fetch --all || FailExit 'git fetch falló'
git reset --hard "origin/$Branch" || FailExit 'git reset falló'

Write-Host "Instalando dependencias PHP (composer)..."
composer install --no-dev --no-interaction --optimize-autoloader 2>&1 | Write-Host
if ($LASTEXITCODE -ne 0) { FailExit 'composer install falló' }

Write-Host "Ejecutando migraciones (php artisan migrate --force)..."
php artisan migrate --force 2>&1 | Write-Host
if ($LASTEXITCODE -ne 0) { FailExit 'php artisan migrate falló' }

Write-Host "Cache config y optimizaciones..."
php artisan config:cache 2>&1 | Write-Host
php artisan optimize 2>&1 | Write-Host

if (-not $SkipFrontend) {
    if (-not (Test-Path -Path "./frontend/package.json")) {
        Write-Warning "No se encontró frontend/package.json — se omite build frontend"
    } else {
        Write-Host "Construyendo frontend (npm ci && npm run build)..."
        Push-Location "frontend"
        npm ci 2>&1 | Write-Host
        if ($LASTEXITCODE -ne 0) { Pop-Location; FailExit 'npm ci falló' }
        npm run build 2>&1 | Write-Host
        if ($LASTEXITCODE -ne 0) { Pop-Location; FailExit 'npm run build falló' }
        Pop-Location
    }
} else {
    Write-Host "Se omitió build frontend (SkipFrontend)."
}

# Try restart IIS (Windows) — if command not found, print instruction
try {
    Write-Host "Reiniciando IIS (iisreset)..."
    iisreset /restart 2>&1 | Write-Host
} catch {
    Write-Warning "iisreset no disponible o falló. Si estás en Linux reiniciá nginx/php-fpm manualmente."
}

Write-Host "Deploy finalizado. Verificá logs y endpoints críticos." -ForegroundColor Green

Write-Host "Backups creados en: $backupDir"

exit 0
