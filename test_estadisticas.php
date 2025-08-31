<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== PRUEBA ESTADÍSTICAS POOL ===\n";

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
    $token = $login_result['token'];
    
    // Probar endpoint estadísticas
    $ch2 = curl_init();
    curl_setopt($ch2, CURLOPT_URL, 'http://localhost:8000/api/pool-candidatos/estadisticas');
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    
    $stats_response = curl_exec($ch2);
    $http_code = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    
    echo "📊 Respuesta estadísticas:\n";
    echo "Código HTTP: $http_code\n";
    
    if ($http_code == 200) {
        $stats_data = json_decode($stats_response, true);
        if ($stats_data['success']) {
            echo "✅ Estadísticas cargadas exitosamente\n";
            echo "Total candidatos: " . $stats_data['data']['total_candidatos'] . "\n";
            echo "Activos: " . $stats_data['data']['activos'] . "\n";
        }
    } else {
        echo "❌ Error en estadísticas: $stats_response\n";
    }
    
    curl_close($ch2);
}

curl_close($ch);
echo "=== FIN DE LA PRUEBA ===\n";
