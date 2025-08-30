<?php

// Validador de CUIT argentino
function validarCuitArgentino($cuit) {
    // Limpiar el CUIT
    $cuit = preg_replace('/[^0-9]/', '', $cuit);
    
    if (strlen($cuit) !== 11) {
        return ['valido' => false, 'error' => 'Debe tener 11 dígitos'];
    }
    
    // Algoritmo de validación CUIT argentino
    $multiplicador = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    $suma = 0;
    
    // Calcular suma con multiplicadores
    for ($i = 0; $i < 10; $i++) {
        $suma += intval($cuit[$i]) * $multiplicador[$i];
    }
    
    // Calcular dígito verificador
    $resto = $suma % 11;
    $digitoVerificadorCalculado = 0;
    
    if ($resto === 0) {
        $digitoVerificadorCalculado = 0;
    } elseif ($resto === 1) {
        $digitoVerificadorCalculado = 9;
    } else {
        $digitoVerificadorCalculado = 11 - $resto;
    }
    
    $digitoVerificadorReal = intval($cuit[10]);
    
    return [
        'valido' => $digitoVerificadorReal === $digitoVerificadorCalculado,
        'cuit_enviado' => $cuit,
        'primeros_10' => substr($cuit, 0, 10),
        'digito_enviado' => $digitoVerificadorReal,
        'digito_correcto' => $digitoVerificadorCalculado,
        'cuit_correcto' => substr($cuit, 0, 10) . $digitoVerificadorCalculado
    ];
}

// Probar varios CUITs
$cuits = [
    '20123456789',
    '30718353404', // El actual que funciona
    '27123456789',
    '30123456789'
];

foreach ($cuits as $cuit) {
    echo "=== CUIT: $cuit ===\n";
    $resultado = validarCuitArgentino($cuit);
    
    if ($resultado['valido']) {
        echo "✅ VÁLIDO\n";
    } else {
        echo "❌ INVÁLIDO\n";
        echo "Dígito enviado: {$resultado['digito_enviado']}\n";
        echo "Dígito correcto: {$resultado['digito_correcto']}\n";
        echo "CUIT correcto sería: {$resultado['cuit_correcto']}\n";
    }
    echo "\n";
}
