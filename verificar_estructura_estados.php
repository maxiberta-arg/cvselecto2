<?php

require 'vendor/autoload.php';

$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "🔍 Verificando estructura de tablas...\n\n";

// 1. Verificar tabla postulaciones
echo "📋 TABLA POSTULACIONES:\n";
if (Schema::hasTable('postulaciones')) {
    $columns = DB::select("DESCRIBE postulaciones");
    foreach ($columns as $column) {
        if ($column->Field === 'estado') {
            echo "  - Columna estado: {$column->Type}\n";
            if (strpos($column->Type, 'enum') !== false) {
                preg_match("/enum\((.+)\)/", $column->Type, $matches);
                if (isset($matches[1])) {
                    echo "  - Valores permitidos: {$matches[1]}\n";
                }
            }
        }
    }
    
    $estados = DB::table('postulaciones')
        ->select('estado', DB::raw('COUNT(*) as count'))
        ->groupBy('estado')
        ->get();
    echo "  - Estados actuales:\n";
    foreach ($estados as $estado) {
        echo "    * '{$estado->estado}': {$estado->count} registros\n";
    }
} else {
    echo "  ❌ Tabla no existe\n";
}

echo "\n";

// 2. Verificar tabla empresa_candidatos
echo "� TABLA EMPRESA_CANDIDATOS:\n";
if (Schema::hasTable('empresa_candidatos')) {
    $columns = Schema::getColumnListing('empresa_candidatos');
    echo "  - Columnas: " . implode(', ', $columns) . "\n";
    
    if (Schema::hasColumn('empresa_candidatos', 'estado')) {
        $estados = DB::table('empresa_candidatos')
            ->select('estado', DB::raw('COUNT(*) as count'))
            ->groupBy('estado')
            ->get();
        echo "  - Estados actuales:\n";
        foreach ($estados as $estado) {
            echo "    * '{$estado->estado}': {$estado->count} registros\n";
        }
    } else {
        echo "  ⚠️  No tiene columna 'estado'\n";
    }
} else {
    echo "  ❌ Tabla no existe\n";
}

echo "\nVerificación completada.\n";
