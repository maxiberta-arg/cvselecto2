<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== PRUEBA DE API POOL ===\n";

// Hacer login
$login_data = [
    'email' => 'empresa@test.com',
    'password' => 'empresa123'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/login');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($login_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$login_result = json_decode($response, true);

if (isset($login_result['token'])) {
    echo "✅ Login exitoso\n";
    echo "Token: " . substr($login_result['token'], 0, 20) . "...\n";
    
    $token = $login_result['token'];
    
    // Probar endpoint pool-candidatos
    $ch2 = curl_init();
    curl_setopt($ch2, CURLOPT_URL, 'http://localhost:8000/api/pool-candidatos');
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    
    $pool_response = curl_exec($ch2);
    $http_code = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    
    echo "📊 Respuesta pool-candidatos:\n";
    echo "Código HTTP: $http_code\n";
    
    if ($http_code == 200) {
        $pool_data = json_decode($pool_response, true);
        if ($pool_data['success']) {
            echo "✅ Pool cargado exitosamente\n";
            echo "Candidatos: " . count($pool_data['data']['data']) . "\n";
        }
    } else {
        echo "❌ Error en pool: $pool_response\n";
    }
    
    curl_close($ch2);
} else {
    echo "❌ Error en login: $response\n";
}

curl_close($ch);
echo "=== FIN DE LA PRUEBA ===\n";
