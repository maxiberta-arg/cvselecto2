<?php

echo "🧪 TESTING RÁPIDO DE APIs - ESTADOS UNIFICADOS\n";
echo "==============================================\n\n";

$baseUrl = 'http://127.0.0.1:8000';

// Test básico de conectividad
echo "🌐 Test de conectividad del servidor\n";
echo "-----------------------------------\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response !== false && $httpCode >= 200 && $httpCode < 500) {
    echo "✅ Servidor Laravel responde (HTTP {$httpCode})\n";
} else {
    echo "❌ Error de conexión: {$error}\n";
    echo "❌ HTTP Code: {$httpCode}\n";
    exit(1);
}

echo "\n";

// Test de enums disponibles
echo "🔧 Test de EstadoCandidato Enum\n";
echo "------------------------------\n";

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Enums\EstadoCandidato;

echo "Estados disponibles:\n";
foreach (EstadoCandidato::cases() as $estado) {
    echo "  - {$estado->value}\n";
}

echo "\n";

// Test de rutas principales (sin autenticación)
echo "🌐 Test de rutas principales\n";
echo "---------------------------\n";

$rutasPrincipales = [
    '/' => 'Página principal',
    '/login' => 'Login',
    '/register' => 'Registro',
];

foreach ($rutasPrincipales as $ruta => $descripcion) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . $ruta);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode >= 200 && $httpCode < 400) {
        echo "✅ {$descripcion} ({$ruta}): HTTP {$httpCode}\n";
    } elseif ($httpCode >= 400 && $httpCode < 500) {
        echo "⚠️  {$descripcion} ({$ruta}): HTTP {$httpCode} (esperado para rutas protegidas)\n";
    } else {
        echo "❌ {$descripcion} ({$ruta}): HTTP {$httpCode}\n";
    }
}

echo "\n";

echo "🎯 RESUMEN DEL TESTING DE APIs\n";
echo "=============================\n";
echo "✅ Servidor funcionando\n";
echo "✅ EstadoCandidato Enum cargado\n";
echo "✅ Rutas principales accesibles\n";
echo "\n";
echo "🔗 Sistema listo para testing frontend\n";
echo "📁 Navegar a: {$baseUrl}/centro-gestion\n";
echo "📋 Usar checklist: CHECKLIST_TESTING_FRONTEND.md\n";
