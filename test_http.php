<?php

echo "=== TESTING HTTP ENDPOINT ===\n";

$url = 'http://localhost:8000/api/candidatos';
$data = [
    'name' => 'Elena Rodriguez',
    'email' => 'elena@test.com',
    'telefono' => '555123456',
    'nivel_educacion' => 'universitario',
    'experiencia_anos' => 2,
    'disponibilidad' => '15_dias'
];

$jsonData = json_encode($data);

echo "URL: $url\n";
echo "Datos: " . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

// Configurar cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);

// Ejecutar request
echo "Enviando request...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    echo "Error cURL: $error\n";
} else {
    echo "Código HTTP: $httpCode\n";
    echo "Respuesta completa:\n$response\n";
}
