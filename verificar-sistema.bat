@echo off
echo ========================================
echo  CVSelecto - Verificacion Final
echo ========================================
echo.

cd /d "c:\Proyectos\Tesis MaxiBerta"

echo 1. Verificando estado de la base de datos...
php -r "
try {
    \$pdo = new PDO('sqlite:database/database.sqlite');
    \$stmt = \$pdo->query('SELECT COUNT(*) as count FROM users');
    \$users = \$stmt->fetch()['count'];
    echo 'Usuarios: ' . \$users . PHP_EOL;
    
    \$stmt = \$pdo->query('SELECT email FROM users WHERE email LIKE \"%@test.com\" LIMIT 3');
    \$testUsers = \$stmt->fetchAll();
    echo 'Usuarios de testing:' . PHP_EOL;
    foreach (\$testUsers as \$user) {
        echo '  - ' . \$user['email'] . PHP_EOL;
    }
    
    echo 'Base de datos: OK' . PHP_EOL;
} catch (Exception \$e) {
    echo 'Error: ' . \$e->getMessage() . PHP_EOL;
}
"

echo.
echo 2. Verificando tablas...
php -r "
try {
    \$pdo = new PDO('sqlite:database/database.sqlite');
    \$tables = ['users', 'empresas', 'candidatos', 'evaluaciones'];
    foreach (\$tables as \$table) {
        \$stmt = \$pdo->query('SELECT COUNT(*) as count FROM ' . \$table);
        \$count = \$stmt->fetch()['count'];
        echo \$table . ': ' . \$count . ' registros' . PHP_EOL;
    }
} catch (Exception \$e) {
    echo 'Error verificando tablas: ' . \$e->getMessage() . PHP_EOL;
}
"

echo.
echo ========================================
echo  ESTADO: SISTEMA OPERATIVO
echo ========================================
echo.
echo Credenciales de acceso:
echo - admin@test.com / admin123
echo - empresa@test.com / empresa123  
echo - candidato@test.com / candidato123
echo.
echo Para iniciar servidor:
echo php artisan serve --host=127.0.0.1 --port=8000
echo.
pause
