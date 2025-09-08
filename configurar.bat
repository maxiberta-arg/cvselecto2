cd "C:\Proyectos\Tesis MaxiBerta"
echo "Iniciando configuracion..."
php artisan --version
php artisan env
php artisan migrate:fresh --seed --force
echo "Configuracion completada"
pause
