<?php

require_once 'vendor/autoload.php';

echo "=== TEST: Verificación de Logo de Empresa ===\n";
echo "Fecha: " . date('Y-m-d H:i:s') . "\n\n";

// Test 1: Verificar empresa con logo
echo "✓ Test 1: Empresas con logo en BD\n";
try {
    $empresasConLogo = App\Models\Empresa::whereNotNull('logo_path')->get(['id', 'razon_social', 'logo_path', 'user_id']);
    
    echo "  - Empresas encontradas con logo: " . $empresasConLogo->count() . "\n";
    
    foreach ($empresasConLogo as $empresa) {
        echo "    • ID: {$empresa->id}\n";
        echo "      Razón Social: {$empresa->razon_social}\n";
        echo "      User ID: {$empresa->user_id}\n";
        echo "      Logo Path (BD): {$empresa->logo_path}\n";
        
        // Verificar si el archivo físicamente existe
        $rutaArchivo = storage_path('app/public' . str_replace('/storage', '', $empresa->logo_path));
        if (file_exists($rutaArchivo)) {
            echo "      ✓ Archivo existe físicamente\n";
            echo "      Tamaño: " . round(filesize($rutaArchivo) / 1024, 2) . " KB\n";
        } else {
            echo "      ✗ Archivo NO existe: $rutaArchivo\n";
        }
        
        // Verificar URL completa construida
        $urlCompleta = url($empresa->logo_path);
        echo "      URL completa: {$urlCompleta}\n";
        
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "  ✗ Error: " . $e->getMessage() . "\n";
}

// Test 2: Simular respuesta de API
echo "✓ Test 2: Simulación de respuesta API\n";
try {
    $empresa = App\Models\Empresa::whereNotNull('logo_path')->first();
    
    if ($empresa) {
        echo "  - Empresa de prueba: {$empresa->razon_social}\n";
        
        // Simular lo que hace el controlador
        if ($empresa->logo_path && !str_starts_with($empresa->logo_path, 'http')) {
            $empresa->logo_path = url($empresa->logo_path);
        }
        
        echo "  - Logo path original: " . App\Models\Empresa::find($empresa->id)->logo_path . "\n";
        echo "  - Logo path procesado: {$empresa->logo_path}\n";
        
        // Verificar accesibilidad
        $headers = @get_headers($empresa->logo_path);
        if ($headers && strpos($headers[0], '200') !== false) {
            echo "  ✓ URL accesible (HTTP 200)\n";
        } else {
            echo "  ✗ URL NO accesible\n";
            echo "  Headers recibidos: " . ($headers ? implode(' | ', $headers) : 'ninguno') . "\n";
        }
        
    } else {
        echo "  ✗ No se encontró empresa con logo\n";
    }
    
} catch (Exception $e) {
    echo "  ✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Diagnóstico ===\n";
echo "Si el archivo existe físicamente pero la URL no es accesible,\n";
echo "el problema está en la configuración del servidor web.\n";
echo "Verifique que el enlace simbólico storage esté bien configurado.\n";

echo "\n" . str_repeat("=", 60) . "\n";
echo "Test completado: " . date('Y-m-d H:i:s') . "\n";
echo str_repeat("=", 60) . "\n";
