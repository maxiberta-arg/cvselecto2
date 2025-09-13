@echo off
echo.
echo ========================================
echo  CVSelecto - Verificacion Rapida
echo ========================================
echo.

echo Cambiando al directorio del proyecto...
cd /d "c:\Proyectos\Tesis MaxiBerta"

echo.
echo 1. Verificando archivos clave...
if exist "artisan" (
    echo   [OK] artisan encontrado
) else (
    echo   [ERROR] artisan no encontrado
)

if exist "composer.json" (
    echo   [OK] composer.json encontrado
) else (
    echo   [ERROR] composer.json no encontrado
)

if exist "app\Models\Evaluacion.php" (
    echo   [OK] Modelo Evaluacion encontrado
) else (
    echo   [ERROR] Modelo Evaluacion no encontrado
)

if exist "database\seeders\EvaluacionSeeder.php" (
    echo   [OK] EvaluacionSeeder encontrado
) else (
    echo   [ERROR] EvaluacionSeeder no encontrado
)

echo.
echo 2. Verificando/creando base de datos...
if not exist "database\database.sqlite" (
    echo   Creando archivo database.sqlite...
    echo. > "database\database.sqlite"
)
echo   [OK] database.sqlite presente

echo.
echo 3. Ejecutando comandos Laravel...
echo   Ejecutando migraciones...
php artisan migrate:fresh
echo.
echo   Ejecutando seeders...
php artisan db:seed

echo.
echo ========================================
echo  CREDENCIALES DE TESTING
echo ========================================
echo.
echo ADMINISTRADOR:
echo   Email: admin@test.com
echo   Password: admin123
echo.
echo EMPRESA:
echo   Email: empresa@test.com
echo   Password: empresa123
echo.
echo CANDIDATO:
echo   Email: candidato@test.com
echo   Password: candidato123
echo.
echo ========================================
echo  COMANDOS PARA INICIAR
echo ========================================
echo.
echo Backend: php artisan serve --host=127.0.0.1 --port=8000
echo Frontend: cd frontend ^&^& npm run dev
echo.
echo URLs:
echo   Backend: http://127.0.0.1:8000
echo   Frontend: http://localhost:3002
echo.
echo ========================================
echo  VERIFICACION COMPLETADA
echo ========================================
echo.
pause
