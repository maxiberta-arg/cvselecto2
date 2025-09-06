<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Empresa;
use App\Models\Candidato;
use App\Models\BusquedaLaboral;
use App\Models\Postulacion;
use App\Models\EmpresaCandidato;

echo "=== ANÁLISIS DE RELACIONES Y DATOS ===\n\n";

// Verificar relaciones
$empresa = Empresa::first();
if ($empresa) {
    echo "🏢 EMPRESA: {$empresa->razon_social}\n";
    echo "- Candidatos en pool: " . $empresa->candidatos()->count() . "\n";
    echo "- Búsquedas laborales: " . $empresa->busquedasLaborales()->count() . "\n";
    echo "- Usuario asociado: " . ($empresa->user ? $empresa->user->email : 'No tiene') . "\n\n";
} else {
    echo "❌ No hay empresas en la base de datos\n\n";
}

$candidato = Candidato::first();
if ($candidato) {
    echo "👨‍💼 CANDIDATO: {$candidato->nombre} {$candidato->apellido}\n";
    echo "- Postulaciones: " . $candidato->postulaciones()->count() . "\n";
    echo "- En pools de empresas: " . $candidato->empresas()->count() . "\n";
    echo "- Usuario asociado: " . ($candidato->user ? $candidato->user->email : 'No tiene') . "\n\n";
} else {
    echo "❌ No hay candidatos en la base de datos\n\n";
}

// Verificar consistencia de datos
echo "📊 VERIFICACIÓN DE CONSISTENCIA:\n";

// Candidatos sin user
$candidatosSinUser = Candidato::whereNull('user_id')->count();
echo "- Candidatos sin usuario: {$candidatosSinUser}\n";

// Empresas sin user
$empresasSinUser = Empresa::whereNull('user_id')->count();
echo "- Empresas sin usuario: {$empresasSinUser}\n";

// Postulaciones huérfanas (sin candidato o sin búsqueda)
$postulacionesHuerfanas = Postulacion::whereDoesntHave('candidato')
    ->orWhereDoesntHave('busquedaLaboral')->count();
echo "- Postulaciones huérfanas: {$postulacionesHuerfanas}\n";

// Búsquedas sin empresa
$busquedasHuerfanas = BusquedaLaboral::whereDoesntHave('empresa')->count();
echo "- Búsquedas sin empresa: {$busquedasHuerfanas}\n";

// Pool empresarial
$registrosPool = EmpresaCandidato::count();
echo "- Registros en pool empresarial: {$registrosPool}\n";

echo "\n=== ANÁLISIS FUNCIONAL ===\n";

// Distribución de estados de postulaciones
echo "📊 ESTADOS DE POSTULACIONES:\n";
$estadosPostulaciones = Postulacion::selectRaw('estado, COUNT(*) as count')
    ->groupBy('estado')
    ->get();

foreach ($estadosPostulaciones as $estado) {
    echo "- {$estado->estado}: {$estado->count}\n";
}

// Estados de búsquedas
echo "\n📋 ESTADOS DE BÚSQUEDAS:\n";
$estadosBusquedas = BusquedaLaboral::selectRaw('estado, COUNT(*) as count')
    ->groupBy('estado')
    ->get();

foreach ($estadosBusquedas as $estado) {
    echo "- {$estado->estado}: {$estado->count}\n";
}

// Verificación de empresa verificada
echo "\n🏢 ESTADOS DE EMPRESAS:\n";
$estadosEmpresas = Empresa::selectRaw('estado_verificacion, COUNT(*) as count')
    ->groupBy('estado_verificacion')
    ->get();

foreach ($estadosEmpresas as $estado) {
    echo "- {$estado->estado_verificacion}: {$estado->count}\n";
}
