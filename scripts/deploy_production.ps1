# ============================================
# CVSelecto Deploy Script - Producción
# ============================================
# Uso: .\deploy_production.ps1 -ServerHost usuario@servidor.com -ProjectPath /var/www/cvselecto
# 
# REQUERIMIENTOS:
# - SSH acceso al servidor
# - SSH key configurada (o password interactivo)
# - Git, PHP 8.2, Composer en servidor
# - Nginx/Apache configurado

param(
    [Parameter(Mandatory=$true)][string]$ServerHost,
    [Parameter(Mandatory=$true)][string]$ProjectPath,
    [string]$Branch = "master",
    [switch]$SkipTests,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$WarningPreference = "SilentlyContinue"

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   CVSelecto Production Deploy Script      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`nConfiguraciones:" -ForegroundColor Yellow
Write-Host "  Server: $ServerHost"
Write-Host "  Project Path: $ProjectPath"
Write-Host "  Branch: $Branch"
Write-Host "  DryRun: $DryRun"
Write-Host "  Skip Tests: $SkipTests`n"

# ============================================
# FUNCIONES
# ============================================

function Invoke-SSH {
    param([string]$Command)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] ssh > " -NoNewline -ForegroundColor DarkGray
    
    if ($DryRun) {
        Write-Host $Command -ForegroundColor Yellow
        return $null
    }
    
    ssh $ServerHost "cd $ProjectPath && $Command" 2>&1
}

function Step {
    param([string]$Title, [int]$Number, [int]$Total)
    $pct = [math]::Round(($Number / $Total) * 100)
    Write-Host "`n[$pct%] ► $Title" -ForegroundColor Cyan
}

# ============================================
# VALIDACIONES PRE-DEPLOY
# ============================================

Write-Host "VALIDACIONES PRE-DEPLOY:" -ForegroundColor Yellow

$checks = @{
    "SSH Conectividad" = { ssh $ServerHost "echo 'OK'" }
    "Git instalado" = { Invoke-SSH "git --version" }
    "PHP 8.2+" = { Invoke-SSH "php -v" }
    "Composer" = { Invoke-SSH "composer --version" }
    "Proyecto existe" = { Invoke-SSH "test -d $ProjectPath && echo 'EXISTS'" }
}

$check_passed = 0
foreach ($check in $checks.GetEnumerator()) {
    try {
        $result = & $check.Value
        if ($result -match "EXISTS|version|OK") {
            Write-Host "  ✅ $($check.Name)" -ForegroundColor Green
            $check_passed++
        } else {
            Write-Host "  ❌ $($check.Name): $result" -ForegroundColor Red
        }
    } catch {
        Write-Host "  ❌ $($check.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

if ($check_passed -lt $checks.Count) {
    Write-Host "`n⚠️  Algunas validaciones fallaron. ¿Continuamos? (s/n)" -ForegroundColor Yellow
    if ((Read-Host).ToLower() -ne "s") { exit 1 }
}

Write-Host "`n✅ Pre-deploy checks completados`n" -ForegroundColor Green

# ============================================
# DEPLOY STEPS
# ============================================

$steps = 8
$current = 1

# Paso 1: Git
Step "Git: Actualizar código" $current $steps
Invoke-SSH "git status"
Invoke-SSH "git pull origin $Branch"
$current++

# Paso 2: Dependencias
Step "Composer: Instalar dependencias" $current $steps
Invoke-SSH "composer install --no-dev --optimize-autoloader"
$current++

# Paso 3: Frontend (si aplica)
Step "Frontend: Verificar build" $current $steps
Invoke-SSH "test -d frontend/build && echo 'Build present' || echo 'No build - considerá npm run build'"
$current++

# Paso 4: Configuración
Step "Environment: Validar .env.production" $current $steps
Invoke-SSH "test -f .env.production && echo 'OK' || (cp .env.production.example .env.production && echo 'Creado')"
Invoke-SSH "chmod 600 .env.production"
$current++

# Paso 5: Claves
Step "Claves: Generar APP_KEY y JWT_SECRET" $current $steps
Invoke-SSH "php artisan key:generate --force"
$current++

# Paso 6: Base de Datos
Step "Migrations: Ejecutar migraciones" $current $steps
Invoke-SSH "php artisan migrate --force"
$current++

# Paso 7: Cache y Optimización
Step "Optimización: Cache y limpieza" $current $steps
Invoke-SSH "php artisan config:cache"
Invoke-SSH "php artisan route:cache"
Invoke-SSH "php artisan optimize"
Invoke-SSH "php artisan storage:link"
Invoke-SSH "chmod -R 755 storage bootstrap/cache"
Invoke-SSH "chmod 600 .env.production"
$current++

# Paso 8: Servicios
Step "Servicios: Reiniciar PHP-FPM y Nginx" $current $steps
Invoke-SSH "sudo systemctl restart php8.2-fpm"
Invoke-SSH "sudo systemctl restart nginx"
Write-Host "  (O: sudo systemctl restart apache2 si usas Apache)" -ForegroundColor DarkGray
$current++

# ============================================
# POST-DEPLOY VALIDATIONS
# ============================================

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   POST-DEPLOY VALIDATIONS                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green

$domain = Read-Host "`n¿Dominio producción? (ej: https://cvselecto.com)"

if ($domain) {
    Write-Host "`nValidando..." -ForegroundColor Cyan
    
    # Health check
    try {
        $response = Invoke-WebRequest -Uri "$domain/api/health" -Method GET -ErrorAction Stop
        Write-Host "  ✅ API Health: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  API Health: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Frontend
    try {
        $response = Invoke-WebRequest -Uri $domain -Method GET -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Frontend carga: 200 OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️  Frontend: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Logs
    Write-Host "`nÚltimos logs (para revisar errores):" -ForegroundColor Cyan
    Invoke-SSH "tail -20 storage/logs/laravel.log" | Select-Object -Last 10
}

# ============================================
# ROLLBACK PLAN
# ============================================

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║   ROLLBACK PLAN (Si algo falla)           ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Magenta

Write-Host @"
En caso de error crítico:

1. SSH al servidor:
   ssh $ServerHost

2. Rollback a commit anterior:
   cd $ProjectPath
   git revert HEAD --no-edit
   git push origin $Branch

3. Reiniciar servicios:
   sudo systemctl restart php8.2-fpm nginx

4. Revisar logs:
   tail -100 storage/logs/laravel.log

5. Restaurar DB (si tienes backup):
   mysql -u user -p db_name < backup_TIMESTAMP.sql
"@ -ForegroundColor Yellow

Write-Host "`n✅ Deploy script completado`n" -ForegroundColor Green
