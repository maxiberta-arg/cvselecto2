@echo off
echo.
echo ==========================================
echo  CVSelecto - Correccion de Errores
echo ==========================================
echo.

cd /d "c:\Proyectos\Tesis MaxiBerta"

echo 1. Configurando base de datos SQLite...
echo DB_CONNECTION=sqlite > .env.tmp
echo # DB_HOST=127.0.0.1 >> .env.tmp
echo # DB_PORT=3306 >> .env.tmp
echo # DB_DATABASE=cvselecto >> .env.tmp
echo # DB_USERNAME=root >> .env.tmp
echo # DB_PASSWORD= >> .env.tmp
echo APP_NAME=Laravel >> .env.tmp
echo APP_ENV=local >> .env.tmp
echo APP_KEY=base64:TMEKexL7dprhUD6v/TtiCTHqzG70pTc+l7Di3+gbob0= >> .env.tmp
echo APP_DEBUG=true >> .env.tmp
echo APP_URL=http://localhost:8000 >> .env.tmp
move .env.tmp .env
echo [OK] Configuracion SQLite aplicada

echo.
echo 2. Creando archivo de base de datos...
if not exist "database\database.sqlite" (
    echo. > "database\database.sqlite"
    echo [OK] Archivo database.sqlite creado
) else (
    echo [OK] Archivo ya existe
)

echo.
echo 3. Limpiando cache...
php artisan config:clear
php artisan cache:clear

echo.
echo 4. Ejecutando migraciones...
php artisan migrate:fresh
if %errorlevel%==0 (
    echo [OK] Migraciones exitosas
) else (
    echo [ERROR] Fallo en migraciones
)

echo.
echo ==========================================
echo  PROCESO COMPLETADO
echo ==========================================
echo.
echo Para iniciar el sistema:
echo   php artisan serve --host=127.0.0.1 --port=8000
echo.
pause
