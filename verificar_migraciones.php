<?php

/**
 * Script de verificación de migraciones de CVSelecto
 * Ejecutar con: php verificar_migraciones.php
 */

echo "🔍 VERIFICANDO ESTRUCTURA DE MIGRACIONES\n";
echo "=======================================\n\n";

// Verificar que estamos en el directorio correcto
if (!file_exists('artisan')) {
    die("❌ Error: Ejecuta este script desde el directorio raíz del proyecto Laravel\n");
}

$migrationPath = 'database/migrations/';
$migrations = glob($migrationPath . '*.php');

echo "📁 Migraciones encontradas: " . count($migrations) . "\n\n";

// Ordenar migraciones por timestamp
sort($migrations);

$coreEntities = [
    'users' => false,
    'empresas' => false,
    'candidatos' => false,
    'busquedas_laborales' => false,
    'postulaciones' => false,
    'experiencias' => false,
    'educacions' => false,
    'entrevistas' => false,
];

foreach ($migrations as $migration) {
    $filename = basename($migration);
    echo "✓ " . $filename . "\n";
    
    // Verificar entidades core
    foreach ($coreEntities as $entity => $found) {
        if (str_contains($filename, $entity) && str_contains($filename, 'create')) {
            $coreEntities[$entity] = true;
        }
    }
}

echo "\n📊 VERIFICACIÓN DE ENTIDADES CORE:\n";
echo "==================================\n";

$allFound = true;
foreach ($coreEntities as $entity => $found) {
    $status = $found ? "✅" : "❌";
    echo "$status $entity\n";
    if (!$found) $allFound = false;
}

echo "\n📋 RESUMEN:\n";
echo "===========\n";

if ($allFound) {
    echo "✅ Todas las entidades core están presentes\n";
    echo "✅ El proyecto está listo para migrar\n";
} else {
    echo "❌ Faltan algunas entidades core\n";
    echo "⚠️  Revisar migraciones antes de continuar\n";
}

echo "\n🔧 COMANDOS SUGERIDOS:\n";
echo "======================\n";
echo "php artisan migrate:fresh --seed --force\n";
echo "php artisan serve\n";

?>
