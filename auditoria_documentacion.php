<?php

$documentos = [
    'SISTEMA_OPERATIVO_COMPLETO.md',
    'AUDITORIA_TECNICA_COMPLETA.md',
    'PLAN_MAESTRO_CVSELECTO.md',
    'INTEGRACION_FINAL_SUMMARY.md',
    'GUIA_TESTING_COMPLETA.md',
    'CONFIGURACION_COMPLETADA.md',
    'CREDENCIALES_TESTING_ACTUALIZADAS.md',
    'FASE2_ANALISIS_COMPLETO_Y_PLAN.md'
];

echo "=== AUDITORÍA DE DOCUMENTACIÓN EXISTENTE ===\n\n";

foreach ($documentos as $doc) {
    $ruta = __DIR__ . '/' . $doc;
    
    if (file_exists($ruta)) {
        $contenido = file_get_contents($ruta);
        $lineas = substr_count($contenido, "\n");
        $tamaño = round(strlen($contenido) / 1024, 2);
        
        echo "✅ {$doc}\n";
        echo "   Tamaño: {$tamaño} KB | Líneas: {$lineas}\n";
        
        // Verificar actualización basada en contenido
        if (strpos($contenido, 'Laravel Framework 12') !== false) {
            echo "   🔄 Actualizado (menciona Laravel 12)\n";
        } elseif (strpos($contenido, '2025') !== false) {
            echo "   📅 Actualizado (fechas 2025)\n";
        } else {
            echo "   ⚠️  Posiblemente desactualizado\n";
        }
        
        // Verificar consistencia técnica
        if (strpos($contenido, 'SQLite') !== false && strpos($contenido, 'MySQL') !== false) {
            echo "   ⚠️  Inconsistencia BD: Menciona SQLite y MySQL\n";
        }
        
        if (strpos($contenido, 'React 18') !== false || strpos($contenido, 'React 19') !== false) {
            echo "   ✅ Menciona versión React actualizada\n";
        }
        
        echo "\n";
    } else {
        echo "❌ {$doc} - NO ENCONTRADO\n\n";
    }
}

echo "=== ANÁLISIS DE CONSISTENCIA ===\n";

// Buscar todos los archivos MD
$archivos = glob('*.md');
$inconsistencias = [];
$datosObsoletos = [];

foreach ($archivos as $archivo) {
    $contenido = file_get_contents($archivo);
    
    // Buscar menciones de versiones inconsistentes
    if (strpos($contenido, 'Laravel 11') !== false && strpos($contenido, 'Laravel 12') !== false) {
        $inconsistencias[] = $archivo . ' - Menciona Laravel 11 y 12';
    }
    
    // Buscar credenciales desactualizadas
    if (strpos($contenido, 'password') !== false && strpos($contenido, 'admin123') === false) {
        if (strpos($contenido, 'admin@test.com') !== false) {
            $datosObsoletos[] = $archivo . ' - Credenciales posiblemente desactualizadas';
        }
    }
    
    // Buscar referencias a MySQL cuando usamos SQLite
    if (strpos($contenido, 'MySQL') !== false && strpos($contenido, 'configurada') !== false) {
        $inconsistencias[] = $archivo . ' - Menciona MySQL pero usamos SQLite';
    }
}

if (!empty($inconsistencias)) {
    echo "\n⚠️  INCONSISTENCIAS DETECTADAS:\n";
    foreach ($inconsistencias as $inc) {
        echo "   - {$inc}\n";
    }
}

if (!empty($datosObsoletos)) {
    echo "\n📊 DATOS POSIBLEMENTE OBSOLETOS:\n";
    foreach ($datosObsoletos as $obs) {
        echo "   - {$obs}\n";
    }
}

echo "\n=== RECOMENDACIONES ===\n";
echo "1. Actualizar referencias de Laravel 11 → Laravel 12\n";
echo "2. Unificar documentación sobre base de datos (SQLite)\n";
echo "3. Verificar y actualizar credenciales en todos los documentos\n";
echo "4. Consolidar guías de testing en un solo documento maestro\n";
echo "5. Eliminar referencias a MySQL en documentos sobre SQLite\n";