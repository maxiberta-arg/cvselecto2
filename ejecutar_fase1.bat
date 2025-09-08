cd "c:\Proyectos\Tesis MaxiBerta"
echo "Ejecutando migración..."
php artisan migrate
echo "Ejecutando verificación..."
php test_fase1_extension_modelo.php
pause
