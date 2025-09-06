<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Empresa;
use App\Models\Candidato;
use App\Models\Postulacion;
use App\Models\BusquedaLaboral;

echo "=== ESTADO ACTUAL DE LA BASE DE DATOS ===\n\n";

echo "📊 CONTEOS:\n";
echo "Users: " . User::count() . "\n";
echo "Empresas: " . Empresa::count() . "\n";
echo "Candidatos: " . Candidato::count() . "\n";
echo "Búsquedas Laborales: " . BusquedaLaboral::count() . "\n";
echo "Postulaciones: " . Postulacion::count() . "\n\n";

echo "👥 USUARIOS EXISTENTES:\n";
User::all()->each(function($user) {
    echo "• {$user->email} ({$user->rol}) - {$user->name}\n";
});

echo "\n🏢 EMPRESAS EXISTENTES:\n";
Empresa::with('user')->get()->each(function($empresa) {
    echo "• {$empresa->razon_social} - Estado: {$empresa->estado_verificacion}\n";
    echo "  Usuario: {$empresa->user->email}\n";
});

echo "\n👨‍💼 CANDIDATOS EXISTENTES:\n";
if (Candidato::count() > 0) {
    Candidato::with('user')->get()->each(function($candidato) {
        echo "• {$candidato->nombre} {$candidato->apellido}\n";
        if ($candidato->user) {
            echo "  Usuario: {$candidato->user->email}\n";
        }
    });
} else {
    echo "No hay candidatos en la base de datos.\n";
}

echo "\n📋 BÚSQUEDAS LABORALES:\n";
if (BusquedaLaboral::count() > 0) {
    BusquedaLaboral::with('empresa')->get()->each(function($busqueda) {
        echo "• {$busqueda->titulo} - {$busqueda->estado}\n";
        echo "  Empresa: {$busqueda->empresa->razon_social}\n";
    });
} else {
    echo "No hay búsquedas laborales en la base de datos.\n";
}

echo "\n📨 POSTULACIONES:\n";
if (Postulacion::count() > 0) {
    Postulacion::with(['candidato', 'busquedaLaboral'])->get()->each(function($postulacion) {
        echo "• Candidato: {$postulacion->candidato->nombre} {$postulacion->candidato->apellido}\n";
        echo "  Búsqueda: {$postulacion->busquedaLaboral->titulo}\n";
        echo "  Estado: {$postulacion->estado}\n";
    });
} else {
    echo "No hay postulaciones en la base de datos.\n";
}
