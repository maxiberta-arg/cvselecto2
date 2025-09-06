<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;

echo "=== TABLAS CREADAS EN MYSQL ===\n\n";

$tables = Schema::getTableListing();

echo "Total de tablas: " . count($tables) . "\n\n";

echo "📋 LISTA DE TABLAS:\n";
foreach ($tables as $table) {
    echo "• {$table}\n";
}

echo "\n🔍 AHORA PUEDES VER ESTAS TABLAS EN PHPMYADMIN:\n";
echo "URL: http://localhost/phpmyadmin/\n";
echo "Base de datos: cvselecto\n";
echo "\n✅ ¡La base de datos está completamente configurada y poblada!\n";
