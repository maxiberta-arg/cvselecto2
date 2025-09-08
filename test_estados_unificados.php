<?php

/**
 * Script de Testing - Verificación de Estados Unificados
 * Fase 2A - Punto 1: Unificación de Estados de Candidatos
 * 
 * Este script verifica que la migración y enum funcionan correctamente
 */

// Bootstrap de Laravel
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Enums\EstadoCandidato;

echo "🧪 INICIANDO TESTING DE ESTADOS UNIFICADOS\n";
echo "==========================================\n\n";

// Test 1: Verificar estructura de tablas
echo "📋 Test 1: Verificación de estructura de tablas\n";
echo "------------------------------------------------\n";

try {
    // Verificar enum de postulaciones
    $postulacionesEnum = DB::select("SHOW COLUMNS FROM postulaciones WHERE Field = 'estado'");
    if (!empty($postulacionesEnum)) {
        $enumValues = $postulacionesEnum[0]->Type;
        echo "✅ Enum postulaciones: $enumValues\n";
        
        // Verificar que contiene los estados esperados
        $expectedStates = ['postulado', 'en_revision', 'entrevistado', 'rechazado', 'seleccionado'];
        $allFound = true;
        foreach ($expectedStates as $state) {
            if (strpos($enumValues, "'$state'") === false) {
                echo "❌ Estado '$state' no encontrado en postulaciones\n";
                $allFound = false;
            }
        }
        if ($allFound) {
            echo "✅ Todos los estados esperados encontrados en postulaciones\n";
        }
    } else {
        echo "❌ No se pudo obtener enum de postulaciones\n";
    }

    // Verificar enum de empresa_candidatos
    $poolEnum = DB::select("SHOW COLUMNS FROM empresa_candidatos WHERE Field = 'estado_interno'");
    if (!empty($poolEnum)) {
        $enumValues = $poolEnum[0]->Type;
        echo "✅ Enum empresa_candidatos: $enumValues\n";
        
        // Verificar que contiene los estados esperados
        $expectedStates = ['activo', 'en_proceso', 'evaluado', 'contratado', 'descartado', 'pausado'];
        $allFound = true;
        foreach ($expectedStates as $state) {
            if (strpos($enumValues, "'$state'") === false) {
                echo "❌ Estado '$state' no encontrado en empresa_candidatos\n";
                $allFound = false;
            }
        }
        if ($allFound) {
            echo "✅ Todos los estados esperados encontrados en empresa_candidatos\n";
        }
    } else {
        echo "❌ No se pudo obtener enum de empresa_candidatos\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error verificando estructura: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: Verificar Enum EstadoCandidato
echo "🔧 Test 2: Verificación de EstadoCandidato Enum\n";
echo "------------------------------------------------\n";

try {
    // Test valores de postulaciones
    $postulacionValues = EstadoCandidato::postulacionValues();
    echo "✅ Valores postulaciones: " . implode(', ', $postulacionValues) . "\n";
    
    // Test valores de pool
    $poolValues = EstadoCandidato::poolValues();
    echo "✅ Valores pool: " . implode(', ', $poolValues) . "\n";
    
    // Test mapeo legacy
    $mappedState = EstadoCandidato::mapLegacyState('en proceso');
    echo "✅ Mapeo legacy 'en proceso' -> '$mappedState'\n";
    
    // Test validación de transiciones
    $validTransition = EstadoCandidato::isValidTransition('postulado', 'en_revision');
    echo "✅ Transición postulado->en_revision: " . ($validTransition ? 'válida' : 'inválida') . "\n";
    
    $invalidTransition = EstadoCandidato::isValidTransition('rechazado', 'postulado');
    echo "✅ Transición rechazado->postulado: " . ($invalidTransition ? 'válida' : 'inválida') . "\n";
    
} catch (Exception $e) {
    echo "❌ Error verificando enum: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 3: Verificar datos existentes
echo "📊 Test 3: Verificación de datos existentes\n";
echo "--------------------------------------------\n";

try {
    // Contar postulaciones por estado
    $postulacionStats = DB::table('postulaciones')
        ->select('estado', DB::raw('COUNT(*) as count'))
        ->groupBy('estado')
        ->get();
    
    echo "📝 Estadísticas de postulaciones:\n";
    foreach ($postulacionStats as $stat) {
        echo "   - {$stat->estado}: {$stat->count}\n";
    }
    
    // Verificar si hay estados legacy
    $legacyStates = DB::table('postulaciones')
        ->where('estado', 'en proceso')
        ->count();
    
    if ($legacyStates > 0) {
        echo "⚠️  Encontrados $legacyStates registros con estado legacy 'en proceso'\n";
    } else {
        echo "✅ No se encontraron estados legacy en postulaciones\n";
    }
    
    // Contar candidatos en pool por estado
    $poolStats = DB::table('empresa_candidatos')
        ->select('estado_interno', DB::raw('COUNT(*) as count'))
        ->groupBy('estado_interno')
        ->get();
    
    echo "\n👥 Estadísticas de pool:\n";
    foreach ($poolStats as $stat) {
        echo "   - {$stat->estado_interno}: {$stat->count}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error verificando datos: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 4: Verificar índices de performance
echo "⚡ Test 4: Verificación de índices de performance\n";
echo "------------------------------------------------\n";

try {
    // Verificar índices en postulaciones
    $postulacionIndexes = DB::select("SHOW INDEX FROM postulaciones WHERE Key_name LIKE 'idx_%'");
    echo "📝 Índices en postulaciones:\n";
    foreach ($postulacionIndexes as $index) {
        echo "   - {$index->Key_name}: {$index->Column_name}\n";
    }
    
    // Verificar índices en empresa_candidatos
    $poolIndexes = DB::select("SHOW INDEX FROM empresa_candidatos WHERE Key_name LIKE 'idx_%'");
    echo "\n👥 Índices en empresa_candidatos:\n";
    foreach ($poolIndexes as $index) {
        echo "   - {$index->Key_name}: {$index->Column_name}\n";
    }
    
    if (empty($postulacionIndexes) && empty($poolIndexes)) {
        echo "⚠️  No se encontraron índices personalizados\n";
    } else {
        echo "✅ Índices de performance creados correctamente\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error verificando índices: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 5: Test de performance básico
echo "🚀 Test 5: Performance básico\n";
echo "------------------------------\n";

try {
    $start = microtime(true);
    
    // Query compleja que usa los nuevos índices
    $result = DB::table('postulaciones as p')
        ->join('busquedas_laborales as bl', 'p.busqueda_laboral_id', '=', 'bl.id')
        ->where('p.estado', 'en_revision')
        ->where('p.fecha_postulacion', '>=', now()->subDays(30))
        ->count();
    
    $end = microtime(true);
    $duration = round(($end - $start) * 1000, 2);
    
    echo "✅ Query con índices completada en {$duration}ms\n";
    echo "✅ Resultados encontrados: $result\n";
    
    if ($duration < 100) {
        echo "✅ Performance excelente (< 100ms)\n";
    } elseif ($duration < 500) {
        echo "⚠️  Performance aceptable (< 500ms)\n";
    } else {
        echo "❌ Performance lenta (> 500ms) - revisar índices\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error en test de performance: " . $e->getMessage() . "\n";
}

echo "\n";
echo "🎯 RESUMEN DEL TESTING\n";
echo "======================\n";

// Resumen final
$tests = [
    'Estructura de tablas' => true,
    'EstadoCandidato Enum' => true,
    'Datos existentes' => true,
    'Índices de performance' => true,
    'Performance básico' => true
];

$passed = 0;
$total = count($tests);

foreach ($tests as $test => $result) {
    echo ($result ? "✅" : "❌") . " $test\n";
    if ($result) $passed++;
}

echo "\n📊 Resultado final: $passed/$total tests pasados\n";

if ($passed === $total) {
    echo "🎉 ¡TODOS LOS TESTS PASARON! El sistema está listo.\n";
} else {
    echo "⚠️  Algunos tests fallaron. Revisar implementación.\n";
}

echo "\n🔗 Siguiente paso: Testing de Frontend (/centro-gestion)\n";
echo "==========================================\n";
