@echo off
echo Solucion Rapida - CVSelecto
echo ===========================

cd /d "c:\Proyectos\Tesis MaxiBerta"

echo 1. Configurando SQLite...
echo DB_CONNECTION=sqlite > .env.new
echo APP_NAME=Laravel >> .env.new
echo APP_ENV=local >> .env.new
echo APP_KEY=base64:TMEKexL7dprhUD6v/TtiCTHqzG70pTc+l7Di3+gbob0= >> .env.new
echo APP_DEBUG=true >> .env.new
echo APP_URL=http://localhost:8000 >> .env.new
move .env.new .env

echo 2. Creando base de datos...
echo. > database\database.sqlite

echo 3. Migraciones...
php artisan migrate:fresh

echo 4. Seeders basicos...
php artisan db:seed --class=TestingUserSeeder

echo.
echo Credenciales:
echo admin@test.com / admin123
echo empresa@test.com / empresa123 
echo candidato@test.com / candidato123
echo.
echo Iniciar: php artisan serve
pause
