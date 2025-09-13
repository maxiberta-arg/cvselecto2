<?php

// Script de diagnóstico y corrección de errores
echo "🔧 DIAGNÓSTICO Y CORRECCIÓN DE ERRORES\n";
echo "=====================================\n\n";

// 1. Verificar configuración de base de datos
echo "1. Verificando configuración de base de datos...\n";

$env_file = __DIR__ . '/.env';
if (file_exists($env_file)) {
    $env_content = file_get_contents($env_file);
    
    if (strpos($env_content, 'DB_CONNECTION=mysql') !== false) {
        echo "   ❌ Configurado para MySQL, cambiando a SQLite...\n";
        
        $new_content = str_replace(
            ['DB_CONNECTION=mysql', 'DB_HOST=127.0.0.1', 'DB_PORT=3306', 'DB_DATABASE=cvselecto', 'DB_USERNAME=root', 'DB_PASSWORD='],
            ['DB_CONNECTION=sqlite', '# DB_HOST=127.0.0.1', '# DB_PORT=3306', '# DB_DATABASE=cvselecto', '# DB_USERNAME=root', '# DB_PASSWORD='],
            $env_content
        );
        
        file_put_contents($env_file, $new_content);
        echo "   ✅ Configuración cambiada a SQLite\n";
    } else {
        echo "   ✅ Ya configurado para SQLite\n";
    }
} else {
    echo "   ❌ Archivo .env no encontrado\n";
}

// 2. Crear archivo de base de datos SQLite
echo "\n2. Creando archivo de base de datos SQLite...\n";

$db_file = __DIR__ . '/database/database.sqlite';
if (!file_exists($db_file)) {
    touch($db_file);
    echo "   ✅ Archivo database.sqlite creado\n";
} else {
    echo "   ✅ Archivo database.sqlite ya existe\n";
}

// 3. Verificar permisos
echo "\n3. Verificando permisos...\n";

if (is_writable($db_file)) {
    echo "   ✅ Base de datos escribible\n";
} else {
    echo "   ❌ Base de datos no escribible\n";
}

if (is_writable(__DIR__ . '/storage')) {
    echo "   ✅ Directorio storage escribible\n";
} else {
    echo "   ❌ Directorio storage no escribible\n";
}

// 4. Limpiar cache
echo "\n4. Ejecutando comandos de limpieza...\n";

$commands = [
    'php artisan config:clear',
    'php artisan cache:clear',
    'php artisan route:clear',
    'php artisan view:clear'
];

foreach ($commands as $command) {
    echo "   Ejecutando: $command\n";
    exec($command . ' 2>&1', $output, $return_var);
    if ($return_var === 0) {
        echo "     ✅ OK\n";
    } else {
        echo "     ⚠️ Advertencia: " . implode(' ', $output) . "\n";
    }
    $output = [];
}

echo "\n5. Intentando ejecutar migraciones...\n";

exec('php artisan migrate:fresh 2>&1', $output, $return_var);
if ($return_var === 0) {
    echo "   ✅ Migraciones ejecutadas correctamente\n";
    
    echo "\n6. Ejecutando seeders básicos...\n";
    exec('php artisan db:seed --class=TestingUserSeeder 2>&1', $output, $return_var);
    if ($return_var === 0) {
        echo "   ✅ TestingUserSeeder ejecutado\n";
    } else {
        echo "   ❌ Error en TestingUserSeeder: " . implode(' ', $output) . "\n";
    }
    
} else {
    echo "   ❌ Error en migraciones:\n";
    foreach ($output as $line) {
        echo "     $line\n";
    }
}

echo "\n✅ DIAGNÓSTICO COMPLETADO\n";
echo "=========================\n";

echo "\n🔑 CREDENCIALES DE TESTING:\n";
echo "admin@test.com / admin123\n";
echo "empresa@test.com / empresa123\n";
echo "candidato@test.com / candidato123\n";

echo "\n🚀 PARA INICIAR:\n";
echo "php artisan serve --host=127.0.0.1 --port=8000\n";

?>
