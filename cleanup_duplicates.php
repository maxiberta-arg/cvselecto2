<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Empresa;

echo "=== LIMPIEZA DE CUITs DUPLICADOS ===\n";

// Obtener todas las empresas
$empresas = Empresa::all();

// Agrupar por CUIT limpio
$grupos = $empresas->groupBy(function($empresa) {
    return preg_replace('/[^0-9]/', '', $empresa->cuit ?? '');
});

$duplicados = $grupos->filter(function($grupo) {
    return $grupo->count() > 1;
});

if ($duplicados->count() === 0) {
    echo "No se encontraron CUITs duplicados.\n";
    exit(0);
}

echo "CUITs duplicados encontrados:\n\n";

foreach ($duplicados as $cuitLimpio => $empresasConMismoCuit) {
    echo "CUIT: {$cuitLimpio}\n";
    foreach ($empresasConMismoCuit as $empresa) {
        echo "  - ID: {$empresa->id}, Razon: {$empresa->razon_social}, CUIT: {$empresa->cuit}\n";
    }
    
    // Mantener solo la empresa más reciente y borrar las demás
    $empresaReciente = $empresasConMismoCuit->sortByDesc('created_at')->first();
    $empresasABorrar = $empresasConMismoCuit->where('id', '!=', $empresaReciente->id);
    
    echo "  * MANTENIENDO: ID {$empresaReciente->id} (más reciente)\n";
    
    foreach ($empresasABorrar as $empresaABorrar) {
        echo "  * BORRANDO: ID {$empresaABorrar->id}\n";
        // Ejecutar el borrado
        $empresaABorrar->delete();
    }
    echo "\n";
}

echo "NOTA: Para ejecutar realmente el borrado, descomenta la línea 'empresaABorrar->delete()' en el script.\n";
