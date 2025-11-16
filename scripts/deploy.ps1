Param(
    [string]$Branch = 'master'
)

Write-Host "Deploy script iniciado. Rama: $Branch"

# Este script asume que ya tenés las variables de entorno configuradas en el servidor
# y que se ejecuta con permisos apropiados.

try {
    Set-Location -Path "$PSScriptRoot\.."
    Write-Host "Directorio actual: $(Get-Location)"

    Write-Host "Haciendo git fetch..."
    git fetch --all
    git checkout $Branch
    git pull origin $Branch

    Write-Host "Instalando dependencias PHP (sin dev) y optimizando autoload..."
    composer install --no-dev --optimize-autoloader

    Write-Host "Ejecutando migraciones (FORCE)..."
    php artisan migrate --force

    Write-Host "Cacheando configuración y rutas..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache

    Write-Host "Limpiando caches anteriores..."
    php artisan optimize:clear

    Write-Host "Build frontend (opcional)"
    cd frontend
    npm ci
    npm run build
    cd ..

    Write-Host "Deploy completado. Por favor reiniciar webserver si es necesario."
} catch {
    Write-Error "Error durante el deploy: $_"
    exit 1
}
<#
  deploy.ps1
  Script de ejemplo para ejecutar en servidor de producción (PowerShell).
  ADVERTENCIA: Ajustar según el entorno (Linux/Windows) y permisos.
#>

param(
  [string]$Branch = 'master'
)

Write-Host "Iniciando deploy de CVSelecto en branch: $Branch"

# 1) Obtener última versión
git fetch --all
git checkout $Branch
git pull origin $Branch

# 2) Dependencias PHP
composer install --no-dev --optimize-autoloader

# 3) Migraciones y caches
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4) Limpieza/optimize
php artisan optimize:clear

Write-Host "Deploy finalizado. Verificar servicios web (nginx/apache) y php-fpm según corresponda."

Write-Host "Verificar endpoint de health: curl http://localhost/api/health"
