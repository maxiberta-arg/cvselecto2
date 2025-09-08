@echo off
echo ===============================================
echo       CONFIGURANDO BASE DE DATOS CVSELECTO
echo ===============================================
echo.

cd "C:\Proyectos\Tesis MaxiBerta"

echo [1/4] Verificando Laravel...
php artisan --version
if errorlevel 1 (
    echo ERROR: Laravel no esta funcionando
    pause
    exit /b 1
)

echo.
echo [2/4] Recreando base de datos...
php artisan migrate:fresh --force
if errorlevel 1 (
    echo ERROR: Fallo en migraciones
    pause
    exit /b 1
)

echo.
echo [3/4] Poblando con datos iniciales...
php artisan db:seed --force
if errorlevel 1 (
    echo ERROR: Fallo en seeders
    pause
    exit /b 1
)

echo.
echo [4/4] Verificando estado...
php artisan migrate:status

echo.
echo ===============================================
echo           CONFIGURACION COMPLETADA
echo ===============================================
echo.
echo CREDENCIALES DE ACCESO:
echo.
echo ADMIN:
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
echo Para iniciar el servidor: php artisan serve
echo ===============================================
pause
