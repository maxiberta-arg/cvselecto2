@echo off
echo Prueba Simple - Solo Migraciones
echo =================================

cd /d "c:\Proyectos\Tesis MaxiBerta"

echo 1. Verificando archivo SQLite...
if not exist "database\database.sqlite" (
    echo. > "database\database.sqlite"
    echo [OK] Archivo creado
) else (
    echo [OK] Archivo existe
)

echo.
echo 2. Limpiando cache...
php artisan config:clear
php artisan cache:clear

echo.
echo 3. Solo migraciones (sin seeders)...
php artisan migrate:fresh

echo.
echo 4. Solo TestingUserSeeder...
php artisan db:seed --class=TestingUserSeeder

echo Listo para probar!
pause
