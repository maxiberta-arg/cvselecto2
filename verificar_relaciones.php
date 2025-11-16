<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->bootstrap();

try {
    echo "=== VERIFICACIÓN DE RELACIONES ENTRE MODELOS ===\n\n";
    
    // Verificar usuarios con datos relacionados
    $usuarioEmpresa = \App\Models\User::where('rol', 'empresa')->first();
    if ($usuarioEmpresa) {
        echo "✅ Usuario Empresa encontrado: {$usuarioEmpresa->email}\n";
        
        $empresa = $usuarioEmpresa->empresa;
        if ($empresa) {
            echo "✅ Relación User->Empresa: OK\n";
            echo "   Empresa: {$empresa->razon_social}\n";
        } else {
            echo "❌ Relación User->Empresa: ROTA\n";
        }
    }
    
    $usuarioCandidato = \App\Models\User::where('rol', 'candidato')->first();
    if ($usuarioCandidato) {
        echo "✅ Usuario Candidato encontrado: {$usuarioCandidato->email}\n";
        
        $candidato = $usuarioCandidato->candidato;
        if ($candidato) {
            echo "✅ Relación User->Candidato: OK\n";
            echo "   Candidato: {$candidato->nombre} {$candidato->apellido}\n";
        } else {
            echo "❌ Relación User->Candidato: ROTA\n";
        }
    }
    
    echo "\n=== VERIFICACIÓN DE POSTULACIONES ===\n";
    
    $postulaciones = \App\Models\Postulacion::with(['candidato', 'busquedaLaboral'])->get();
    foreach($postulaciones as $postulacion) {
        echo "Postulación ID {$postulacion->id}:\n";
        
        if ($postulacion->candidato) {
            echo "  ✅ Candidato: {$postulacion->candidato->nombre}\n";
        } else {
            echo "  ❌ Candidato: NO ENCONTRADO\n";
        }
        
        if ($postulacion->busquedaLaboral) {
            echo "  ✅ Búsqueda: {$postulacion->busquedaLaboral->titulo}\n";
        } else {
            echo "  ❌ Búsqueda: NO ENCONTRADA\n";
        }
        
        echo "  Estado: {$postulacion->estado}\n\n";
    }
    
    echo "=== VERIFICACIÓN DE EMPRESA-CANDIDATOS ===\n";
    
    $empresaCandidatos = \App\Models\EmpresaCandidato::count();
    echo "Registros en empresa_candidatos: {$empresaCandidatos}\n";
    
    if ($empresaCandidatos == 0) {
        echo "⚠️  PROBLEMA: No hay registros en tabla empresa_candidatos\n";
        echo "   Esto puede afectar el sistema de evaluaciones\n";
    }
    
    echo "\n=== VERIFICACIÓN DE EVALUACIONES ===\n";
    
    $evaluaciones = \App\Models\Evaluacion::count();
    echo "Evaluaciones en sistema: {$evaluaciones}\n";
    
    if ($evaluaciones == 0) {
        echo "⚠️  Sin evaluaciones para testing\n";
        echo "   Recomendación: Ejecutar EvaluacionSeeder\n";
    }
    
    echo "\n=== INTEGRIDAD DE DATOS ===\n";
    
    // Verificar usuarios huérfanos
    $usuariosSinRol = \App\Models\User::whereNull('rol')->count();
    echo "Usuarios sin rol: {$usuariosSinRol}\n";
    
    // Verificar empresas sin usuario
    $empresasSinUser = \App\Models\Empresa::whereNotExists(function($query) {
        $query->select(DB::raw(1))
              ->from('users')
              ->whereColumn('users.id', 'empresas.user_id');
    })->count();
    echo "Empresas sin usuario: {$empresasSinUser}\n";
    
    // Verificar candidatos sin usuario
    $candidatosSinUser = \App\Models\Candidato::whereNotExists(function($query) {
        $query->select(DB::raw(1))
              ->from('users')
              ->whereColumn('users.id', 'candidatos.user_id');
    })->count();
    echo "Candidatos sin usuario: {$candidatosSinUser}\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}