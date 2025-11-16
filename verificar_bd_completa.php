<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->bootstrap();

try {
    // Obtener listado de tablas
    $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
    
    echo "=== TABLAS EN BASE DE DATOS ===\n";
    foreach($tables as $table) {
        echo "✅ {$table->name}\n";
    }
    
    echo "\n=== VERIFICACIÓN DE RELACIONES ===\n";
    
    // Verificar Foreign Keys
    $fks = DB::select("SELECT sql FROM sqlite_master WHERE type='table' AND sql LIKE '%FOREIGN KEY%'");
    echo "Tablas con Foreign Keys: " . count($fks) . "\n";
    
    echo "\n=== DATOS ACTUALES ===\n";
    echo "Users: " . \App\Models\User::count() . "\n";
    echo "Empresas: " . \App\Models\Empresa::count() . "\n";
    echo "Candidatos: " . \App\Models\Candidato::count() . "\n";
    echo "Búsquedas: " . \App\Models\BusquedaLaboral::count() . "\n";
    echo "Postulaciones: " . \App\Models\Postulacion::count() . "\n";
    echo "Evaluaciones: " . \App\Models\Evaluacion::count() . "\n";
    echo "EmpresaCandidatos: " . \App\Models\EmpresaCandidato::count() . "\n";
    
    echo "\n=== VERIFICACIÓN DE SEEDERS ===\n";
    
    // Verificar usuarios con roles
    $userRoles = \App\Models\User::select('rol', DB::raw('count(*) as total'))
                                 ->groupBy('rol')
                                 ->get();
    
    echo "Distribución de roles:\n";
    foreach($userRoles as $role) {
        echo "  {$role->rol}: {$role->total}\n";
    }
    
    // Verificar empresas con datos completos
    $empresasCompletas = \App\Models\Empresa::whereNotNull('razon_social')
                                           ->whereNotNull('cuit')
                                           ->count();
    echo "Empresas con datos completos: {$empresasCompletas}\n";
    
    // Verificar candidatos con datos completos
    $candidatosCompletos = \App\Models\Candidato::whereNotNull('nombre')
                                               ->whereNotNull('apellido')
                                               ->count();
    echo "Candidatos con datos completos: {$candidatosCompletos}\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}