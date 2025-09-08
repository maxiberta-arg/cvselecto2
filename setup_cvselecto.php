<?php

// Script para configurar CVSelecto desde cero
// Ejecutar desde: php setup_cvselecto.php

echo "🚀 CONFIGURANDO CVSELECTO DESDE CERO\n";
echo "=====================================\n\n";

// Verificar que estamos en el directorio correcto
if (!file_exists('artisan')) {
    die("❌ Error: Ejecuta este script desde el directorio raíz del proyecto Laravel\n");
}

// 1. Verificar configuración
echo "1️⃣ Verificando configuración...\n";
if (!file_exists('.env')) {
    echo "❌ Archivo .env no encontrado\n";
    exit(1);
}

// 2. Limpiar y recrear base de datos
echo "2️⃣ Recreando base de datos...\n";
$output = shell_exec('php artisan migrate:fresh --force 2>&1');
echo $output . "\n";

// 3. Ejecutar seeders
echo "3️⃣ Poblando base de datos...\n";
$output = shell_exec('php artisan db:seed --force 2>&1');
echo $output . "\n";

// 4. Verificar estado
echo "4️⃣ Verificando estado...\n";
$output = shell_exec('php artisan migrate:status 2>&1');
echo $output . "\n";

echo "\n✅ CONFIGURACIÓN COMPLETADA\n";
echo "=====================================\n";
echo "🔑 CREDENCIALES DE ACCESO:\n\n";
echo "👨‍💼 ADMIN:\n";
echo "   Email: admin@test.com\n";
echo "   Password: admin123\n\n";
echo "🏢 EMPRESA:\n";
echo "   Email: empresa@test.com\n";
echo "   Password: empresa123\n\n";
echo "👤 CANDIDATO:\n";
echo "   Email: candidato@test.com\n";
echo "   Password: candidato123\n\n";
echo "🌐 Servidor: php artisan serve\n";
echo "📱 Frontend: cd frontend && npm start\n";
echo "=====================================\n";

?>
