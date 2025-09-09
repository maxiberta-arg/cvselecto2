<?php

// Test simple de integración
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "TEST DE INTEGRACIÓN SIMPLE\n";
echo "=========================\n\n";

// 1. Verificar que las clases se pueden instanciar
try {
    $postulacion = new App\Models\Postulacion();
    echo "✅ Modelo Postulacion: OK\n";
} catch (Exception $e) {
    echo "❌ Modelo Postulacion: {$e->getMessage()}\n";
}

try {
    $empresaCandidato = new App\Models\EmpresaCandidato();
    echo "✅ Modelo EmpresaCandidato: OK\n";
} catch (Exception $e) {
    echo "❌ Modelo EmpresaCandidato: {$e->getMessage()}\n";
}

try {
    $evaluacion = new App\Models\Evaluacion();
    echo "✅ Modelo Evaluacion: OK\n";
} catch (Exception $e) {
    echo "❌ Modelo Evaluacion: {$e->getMessage()}\n";
}

// 2. Verificar métodos nuevos
$postulacion = new App\Models\Postulacion();

$metodos = [
    'obtenerOCrearEmpresaCandidato',
    'puedeGenerarEvaluacion',
    'generarEvaluacionSiProcede'
];

foreach ($metodos as $metodo) {
    if (method_exists($postulacion, $metodo)) {
        echo "✅ Método $metodo: Existe\n";
    } else {
        echo "❌ Método $metodo: No existe\n";
    }
}

// 3. Contar registros
try {
    $totalPostulaciones = App\Models\Postulacion::count();
    $totalEvaluaciones = App\Models\Evaluacion::count();
    echo "\n📊 Postulaciones: $totalPostulaciones\n";
    echo "📊 Evaluaciones: $totalEvaluaciones\n";
} catch (Exception $e) {
    echo "❌ Error al contar: {$e->getMessage()}\n";
}

echo "\n🎉 Test completado\n";
