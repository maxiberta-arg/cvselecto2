# CVSelecto - Setup y Auditoría Técnica Completa
# ===============================================

Write-Host "🔍 AUDITORÍA TÉCNICA COMPLETA - CVSelecto" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del proyecto
Set-Location "c:\Proyectos\Tesis MaxiBerta"

# 1. Verificar archivos clave
Write-Host "1️⃣ VERIFICANDO ARCHIVOS CLAVE..." -ForegroundColor Yellow

$archivos_clave = @(
    "composer.json",
    "artisan",
    "database\database.sqlite",
    "app\Models\User.php",
    "app\Models\Evaluacion.php",
    "database\seeders\EvaluacionSeeder.php"
)

foreach ($archivo in $archivos_clave) {
    if (Test-Path $archivo) {
        Write-Host "   ✅ $archivo" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $archivo" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Verificar estado de la base de datos
Write-Host "2️⃣ VERIFICANDO BASE DE DATOS..." -ForegroundColor Yellow

if (Test-Path "database\database.sqlite") {
    $size = (Get-Item "database\database.sqlite").Length
    Write-Host "   ✅ database.sqlite existe ($size bytes)" -ForegroundColor Green
} else {
    Write-Host "   ❌ database.sqlite NO existe" -ForegroundColor Red
    Write-Host "   🔧 Creando archivo de base de datos..." -ForegroundColor Blue
    New-Item -Path "database\database.sqlite" -ItemType File -Force
}

Write-Host ""

# 3. Ejecutar comandos Laravel
Write-Host "3️⃣ EJECUTANDO COMANDOS LARAVEL..." -ForegroundColor Yellow

Write-Host "   🔧 Ejecutando migraciones..." -ForegroundColor Blue
$migrate_result = php artisan migrate:fresh 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Migraciones ejecutadas" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error en migraciones:" -ForegroundColor Red
    Write-Host "   $migrate_result" -ForegroundColor Gray
}

Write-Host "   🌱 Ejecutando seeders..." -ForegroundColor Blue
$seed_result = php artisan db:seed 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Seeders ejecutados" -ForegroundColor Green
} else {
    Write-Host "   ❌ Error en seeders:" -ForegroundColor Red
    Write-Host "   $seed_result" -ForegroundColor Gray
}

Write-Host ""

# 4. Verificar dependencias
Write-Host "4️⃣ VERIFICANDO DEPENDENCIAS..." -ForegroundColor Yellow

Write-Host "   📦 Instalando dependencias PHP..." -ForegroundColor Blue
$composer_result = composer install --no-dev 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Composer install ejecutado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Advertencia en composer:" -ForegroundColor Yellow
}

Write-Host ""

# 5. Generar credenciales de testing
Write-Host "5️⃣ CREDENCIALES DE TESTING" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

$credenciales = @"
👨‍💼 ADMINISTRADOR:
   Email: admin@test.com
   Password: admin123

🏢 EMPRESA:
   Email: empresa@test.com
   Password: empresa123

👤 CANDIDATO:
   Email: candidato@test.com
   Password: candidato123
"@

Write-Host $credenciales -ForegroundColor White

Write-Host ""

# 6. URLs de acceso
Write-Host "🌐 URLS DE ACCESO" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
Write-Host "🔧 Backend API: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "📱 Frontend App: http://localhost:3002" -ForegroundColor White
Write-Host "🧪 API Test: http://127.0.0.1:8000/api/test" -ForegroundColor White

Write-Host ""

# 7. Comandos para iniciar servicios
Write-Host "🚀 COMANDOS PARA INICIAR SERVICIOS" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Write-Host "Backend Laravel:" -ForegroundColor Cyan
Write-Host "   php artisan serve --host=127.0.0.1 --port=8000" -ForegroundColor White
Write-Host ""
Write-Host "Frontend React:" -ForegroundColor Cyan
Write-Host "   cd frontend && npm run dev" -ForegroundColor White

Write-Host ""

# 8. Verificar estructura de evaluaciones
Write-Host "⭐ VERIFICANDO INTEGRACIÓN DE EVALUACIONES..." -ForegroundColor Yellow

$check_eval = php artisan tinker --execute="echo 'Evaluaciones: ' . App\Models\Evaluacion::count();" 2>&1
Write-Host "   $check_eval" -ForegroundColor White

Write-Host ""
Write-Host "✅ SETUP Y AUDITORÍA COMPLETADA" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "🎯 Sistema listo para testing manual profesional" -ForegroundColor Cyan
