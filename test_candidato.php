<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "=== TESTING CANDIDATO CREATION ===\n";
    
    // Simular datos del request
    $data = [
        'name' => 'Juan Test',
        'email' => 'juan.test@example.com',
        'telefono' => '1234567890'
    ];
    
    echo "Data to create: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
    
    \DB::beginTransaction();
    
    // Crear usuario primero
    echo "Creating user...\n";
    $user = \App\Models\User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => bcrypt('temporal123'),
        'email_verified_at' => now()
    ]);
    
    echo "User created with ID: " . $user->id . "\n";
    
    // Preparar datos para candidato
    $candidatoData = [
        'user_id' => $user->id,
        'telefono' => $data['telefono'],
        'apellido' => '-' // Valor por defecto
    ];
    
    echo "Candidato data: " . json_encode($candidatoData, JSON_PRETTY_PRINT) . "\n";
    
    // Crear candidato
    echo "Creating candidato...\n";
    $candidato = \App\Models\Candidato::create($candidatoData);
    
    echo "Candidato created with ID: " . $candidato->id . "\n";
    
    \DB::commit();
    
    echo "SUCCESS: Candidato creation completed!\n";
    
} catch (\Exception $e) {
    \DB::rollBack();
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
    echo "Stack Trace:\n" . $e->getTraceAsString() . "\n";
}
