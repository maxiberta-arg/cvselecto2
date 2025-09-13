<?php

echo "🔧 SCRIPT DE SOLUCIÓN DEFINITIVA - CVSelecto\n";
echo "============================================\n\n";

// Cambiar al directorio del proyecto
chdir('c:\Proyectos\Tesis MaxiBerta');

// 1. Verificar y configurar .env para SQLite
echo "1️⃣ Configurando base de datos SQLite...\n";

$envContent = "APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:TMEKexL7dprhUD6v/TtiCTHqzG70pTc+l7Di3+gbob0=
APP_DEBUG=true
APP_URL=http://localhost:8000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=debug

DB_CONNECTION=sqlite

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=\"hello@example.com\"
MAIL_FROM_NAME=\"\${APP_NAME}\"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME=\"\${APP_NAME}\"
";

file_put_contents('.env', $envContent);
echo "   ✅ Archivo .env configurado para SQLite\n";

// 2. Crear archivo de base de datos
echo "\n2️⃣ Creando archivo de base de datos...\n";

$dbPath = 'database/database.sqlite';
if (!file_exists($dbPath)) {
    touch($dbPath);
    echo "   ✅ Archivo database.sqlite creado\n";
} else {
    echo "   ✅ Archivo database.sqlite ya existe\n";
}

// 3. Limpiar cache
echo "\n3️⃣ Limpiando cache de Laravel...\n";

$cacheCommands = [
    'php artisan config:clear',
    'php artisan cache:clear',
    'php artisan route:clear',
    'php artisan view:clear'
];

foreach ($cacheCommands as $command) {
    echo "   Ejecutando: $command\n";
    exec($command . ' 2>&1', $output, $return);
    if ($return === 0) {
        echo "     ✅ OK\n";
    } else {
        echo "     ⚠️ Advertencia\n";
    }
    $output = [];
}

// 4. Ejecutar migraciones
echo "\n4️⃣ Ejecutando migraciones...\n";

exec('php artisan migrate:fresh 2>&1', $output, $return);
if ($return === 0) {
    echo "   ✅ Migraciones ejecutadas correctamente\n";
    
    // 5. Ejecutar seeder básico
    echo "\n5️⃣ Ejecutando seeder básico...\n";
    
    exec('php artisan db:seed --class=TestingUserSeeder 2>&1', $seedOutput, $seedReturn);
    if ($seedReturn === 0) {
        echo "   ✅ TestingUserSeeder ejecutado correctamente\n";
    } else {
        echo "   ⚠️ Error en TestingUserSeeder:\n";
        foreach ($seedOutput as $line) {
            echo "     $line\n";
        }
    }
    
} else {
    echo "   ❌ Error en migraciones:\n";
    foreach ($output as $line) {
        echo "     $line\n";
    }
}

// 6. Verificar datos
echo "\n6️⃣ Verificando datos...\n";

try {
    $pdo = new PDO('sqlite:database/database.sqlite');
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $userCount = $stmt->fetch()['count'];
    echo "   👥 Usuarios creados: $userCount\n";
    
    if ($userCount > 0) {
        $stmt = $pdo->query("SELECT email, rol FROM users WHERE email LIKE '%@test.com'");
        $testUsers = $stmt->fetchAll();
        echo "\n   🔑 CREDENCIALES DE TESTING:\n";
        foreach ($testUsers as $user) {
            $password = $user['rol'] . '123';
            echo "     {$user['email']} / $password\n";
        }
    }
    
} catch (Exception $e) {
    echo "   ❌ Error verificando datos: " . $e->getMessage() . "\n";
}

echo "\n✅ PROCESO COMPLETADO\n";
echo "=====================\n";
echo "\n🚀 Para iniciar el servidor:\n";
echo "php artisan serve --host=127.0.0.1 --port=8000\n";

?>
