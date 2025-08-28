<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== TESTING CANDIDATO CONTROLLER ===\n";

try {
    // Simular request data exactamente como viene del frontend
    $requestData = [
        'name' => 'Carlos Mendoza',
        'email' => 'carlos@test.com',
        'telefono' => '123456789',
        'nivel_educacion' => 'universitario',
        'experiencia_anos' => 3,
        'disponibilidad' => 'inmediata',
        'modalidad_preferida' => 'hibrido',
        'pretension_salarial' => 50000
    ];
    
    echo "Datos de entrada: " . json_encode($requestData, JSON_PRETTY_PRINT) . "\n\n";
    
    // Crear una instancia del request
    $request = new \App\Http\Requests\StoreCandidatoRequest();
    $request->setContainer(app());
    $request->replace($requestData);
    
    // Crear instancia del controlador
    $controller = new \App\Http\Controllers\Api\CandidatoController();
    
    // Ejecutar el método store
    echo "Ejecutando store...\n";
    $response = $controller->store($request);
    
    echo "Respuesta: " . $response->getContent() . "\n";
    echo "Código HTTP: " . $response->getStatusCode() . "\n";
    
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . " Línea: " . $e->getLine() . "\n";
    echo "Stack Trace:\n" . $e->getTraceAsString() . "\n";
}
