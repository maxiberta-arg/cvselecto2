<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Empresa;

echo "=== TODAS LAS EMPRESAS ===\n";
$empresas = Empresa::all(['id', 'razon_social', 'cuit']);
foreach ($empresas as $empresa) {
    $cuitLimpio = preg_replace('/[^0-9]/', '', $empresa->cuit ?? '');
    echo "ID: {$empresa->id}, Razon: {$empresa->razon_social}, CUIT: {$empresa->cuit}, Limpio: {$cuitLimpio}\n";
}

echo "\n=== BUSCANDO CONFLICTO CON 30716353404 ===\n";
$cuitBuscado = '30716353404';
$conflictos = Empresa::get()->filter(function($empresa) use ($cuitBuscado) {
    $cuitLimpio = preg_replace('/[^0-9]/', '', $empresa->cuit ?? '');
    return $cuitLimpio === $cuitBuscado;
});

if ($conflictos->count() > 0) {
    echo "¡CONFLICTO ENCONTRADO!\n";
    foreach ($conflictos as $conflicto) {
        echo "ID: {$conflicto->id}, Razon: {$conflicto->razon_social}, CUIT: {$conflicto->cuit}\n";
    }
} else {
    echo "No se encontró conflicto con el CUIT {$cuitBuscado}\n";
}
