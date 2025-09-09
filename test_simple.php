<?php
/**
 * Test simple y directo del sistema
 */

echo "🧪 TESTING DIRECTO DE ENDPOINTS\n";
echo "==============================\n\n";

// Test básico del servidor
$response = @file_get_contents('http://127.0.0.1:8000/api/test');

if ($response !== false) {
    echo "✅ Servidor Laravel OPERATIVO\n";
    $data = json_decode($response, true);
    echo "   Mensaje: " . ($data['message'] ?? 'N/A') . "\n";
    echo "   Timestamp: " . ($data['timestamp'] ?? 'N/A') . "\n\n";
} else {
    echo "❌ Servidor Laravel NO RESPONDE\n\n";
}

// Verificar archivos frontend
echo "📁 VERIFICANDO ARCHIVOS FRONTEND:\n";

$frontend_files = [
    'frontend/src/services/postulacionEvaluacionService.js',
    'frontend/src/components/EvaluacionesPostulacion.js',
    'frontend/src/components/BadgeEvaluacion.js',
    'frontend/src/components/TabPostulaciones.js',
    'frontend/src/views/EmpresaDashboard.js'
];

foreach ($frontend_files as $file) {
    if (file_exists($file)) {
        echo "✅ $file\n";
    } else {
        echo "❌ $file - NO ENCONTRADO\n";
    }
}

echo "\n🎯 SISTEMA LISTO PARA TESTING MANUAL\n";
echo "=====================================\n";
echo "Backend: http://127.0.0.1:8000\n";
echo "Frontend: http://localhost:3002\n";

?>
