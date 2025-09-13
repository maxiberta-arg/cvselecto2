@echo off
echo Creando archivo database.sqlite...
cd "c:\Proyectos\Tesis MaxiBerta\database"
echo. > database.sqlite
echo Archivo database.sqlite creado exitosamente.
echo.
echo Ejecutando migraciones...
cd ..
php artisan migrate:fresh --seed
echo.
echo Proceso completado.
pause
