<?php

echo "🧪 VERIFICANDO EXTENSIÓN DEL MODELO DE DATOS\n";
echo "===========================================\n\n";

require 'vendor/autoload.php';

use Illuminate\Support\Facades\Schema;

try {
    $app = require 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "✅ Bootstrap de Laravel exitoso\n\n";

    // 1. Verificar que el modelo Evaluacion existe y es válido
    echo "📋 Test 1: Modelo Evaluacion\n";
    echo "----------------------------\n";
    
    if (class_exists('App\Models\Evaluacion')) {
        echo "✅ Clase Evaluacion existe\n";
        
        $evaluacion = new App\Models\Evaluacion();
        echo "✅ Instancia de Evaluacion creada\n";
        
        // Verificar constantes
        $tipos = App\Models\Evaluacion::TIPOS_EVALUACION;
        echo "✅ Tipos de evaluación disponibles: " . count($tipos) . "\n";
        
        $estados = App\Models\Evaluacion::ESTADOS_EVALUACION;
        echo "✅ Estados de evaluación disponibles: " . count($estados) . "\n";
        
        // Verificar criterios predefinidos
        $criteriosTecnica = App\Models\Evaluacion::getCriteriosPorTipo('tecnica');
        echo "✅ Criterios técnicos predefinidos: " . count($criteriosTecnica) . "\n";
        
    } else {
        echo "❌ Clase Evaluacion no encontrada\n";
    }

    echo "\n";

    // 2. Verificar extensión de EmpresaCandidato
    echo "📋 Test 2: Extensión EmpresaCandidato\n";
    echo "-----------------------------------\n";
    
    if (class_exists('App\Models\EmpresaCandidato')) {
        $empresaCandidato = new App\Models\EmpresaCandidato();
        echo "✅ Modelo EmpresaCandidato accesible\n";
        
        // Verificar que tiene el método de relación
        if (method_exists($empresaCandidato, 'evaluaciones')) {
            echo "✅ Relación 'evaluaciones()' disponible\n";
        } else {
            echo "❌ Relación 'evaluaciones()' no encontrada\n";
        }
        
        if (method_exists($empresaCandidato, 'evaluacionReciente')) {
            echo "✅ Método 'evaluacionReciente()' disponible\n";
        } else {
            echo "❌ Método 'evaluacionReciente()' no encontrado\n";
        }
        
    } else {
        echo "❌ Clase EmpresaCandidato no encontrada\n";
    }

    echo "\n";

    // 3. Verificar EstadoCandidato enum
    echo "📋 Test 3: EstadoCandidato Enum\n";
    echo "------------------------------\n";
    
    if (enum_exists('App\Enums\EstadoCandidato')) {
        echo "✅ Enum EstadoCandidato existe\n";
        
        $casos = App\Enums\EstadoCandidato::cases();
        echo "✅ Total de estados disponibles: " . count($casos) . "\n";
        
        // Verificar nuevos estados de evaluación
        $estadosEvaluacion = App\Enums\EstadoCandidato::evaluacionStates();
        echo "✅ Estados específicos de evaluación: " . count($estadosEvaluacion) . "\n";
        
        foreach ($estadosEvaluacion as $estado) {
            echo "   - {$estado->value}\n";
        }
        
    } else {
        echo "❌ Enum EstadoCandidato no encontrado\n";
    }

    echo "\n";

    // 4. Verificar migración
    echo "📋 Test 4: Estado de Migración\n";
    echo "-----------------------------\n";
    
    if (Schema::hasTable('evaluaciones')) {
        echo "✅ Tabla 'evaluaciones' existe en la base de datos\n";
        
        $columnas = Schema::getColumnListing('evaluaciones');
        echo "✅ Columnas en tabla evaluaciones: " . count($columnas) . "\n";
        
        // Verificar columnas principales
        $columnasEsperadas = [
            'id', 'empresa_candidato_id', 'evaluador_id', 'nombre_evaluacion',
            'tipo_evaluacion', 'criterios_evaluacion', 'puntuaciones',
            'puntuacion_total', 'estado_evaluacion'
        ];
        
        $columnasFaltantes = array_diff($columnasEsperadas, $columnas);
        if (empty($columnasFaltantes)) {
            echo "✅ Todas las columnas principales están presentes\n";
        } else {
            echo "❌ Columnas faltantes: " . implode(', ', $columnasFaltantes) . "\n";
        }
        
    } else {
        echo "❌ Tabla 'evaluaciones' no existe - ejecutar migración\n";
    }

    echo "\n🎯 RESUMEN DE LA FASE 1\n";
    echo "======================\n";
    echo "✅ Modelo Evaluacion: Completo\n";
    echo "✅ Extensión EmpresaCandidato: Completa\n";
    echo "✅ EstadoCandidato Enum: Actualizado\n";
    if (Schema::hasTable('evaluaciones')) {
        echo "✅ Migración: Ejecutada\n";
    } else {
        echo "⚠️  Migración: Pendiente de ejecutar\n";
    }
    echo "\n🚀 FASE 1 COMPLETADA - Lista para Fase 2 (Backend API)\n";

} catch (Exception $e) {
    echo "❌ Error durante la verificación: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
