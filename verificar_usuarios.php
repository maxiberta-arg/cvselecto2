<?php

require_once 'vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Empresa;
use App\Models\Candidato;

echo "=== VERIFICACIÓN DE USUARIOS EN LA BASE DE DATOS ===\n\n";

try {
    // Verificar conexión a la base de datos
    echo "Verificando conexión a la base de datos...\n";
    
    // Contar usuarios
    $totalUsuarios = User::count();
    echo "Total de usuarios en la base de datos: {$totalUsuarios}\n\n";
    
    if ($totalUsuarios === 0) {
        echo "❌ LA BASE DE DATOS ESTÁ VACÍA - NO HAY USUARIOS\n";
        echo "NECESITAS EJECUTAR LOS SEEDERS PRIMERO\n\n";
        echo "Ejecuta estos comandos:\n";
        echo "php artisan migrate:fresh\n";
        echo "php artisan db:seed\n";
        exit;
    }
    
    // Verificar usuarios específicos de testing
    echo "=== USUARIOS DE TESTING ===\n";
    
    $testUsers = [
        'admin@test.com',
        'empresa@test.com', 
        'candidato@test.com'
    ];
    
    foreach ($testUsers as $email) {
        $user = User::where('email', $email)->first();
        if ($user) {
            echo "✅ {$email} - EXISTE\n";
            echo "   - ID: {$user->id}\n";
            echo "   - Nombre: {$user->name}\n";
            echo "   - Tipo: {$user->tipo_usuario}\n";
            echo "   - Password hasheado: " . substr($user->password, 0, 20) . "...\n";
            
            // Verificar si tiene empresa o candidato asociado
            if ($user->tipo_usuario === 'empresa') {
                $empresa = Empresa::where('user_id', $user->id)->first();
                if ($empresa) {
                    echo "   - Empresa: {$empresa->nombre}\n";
                } else {
                    echo "   - ❌ NO TIENE EMPRESA ASOCIADA\n";
                }
            } elseif ($user->tipo_usuario === 'candidato') {
                $candidato = Candidato::where('user_id', $user->id)->first();
                if ($candidato) {
                    echo "   - Candidato: {$candidato->nombre} {$candidato->apellido}\n";
                } else {
                    echo "   - ❌ NO TIENE CANDIDATO ASOCIADO\n";
                }
            }
            echo "\n";
        } else {
            echo "❌ {$email} - NO EXISTE\n";
        }
    }
    
    // Mostrar todos los usuarios existentes
    echo "\n=== TODOS LOS USUARIOS ===\n";
    $users = User::all();
    foreach ($users as $user) {
        echo "• {$user->email} ({$user->tipo_usuario}) - {$user->name}\n";
    }
    
    // Verificar empresas
    echo "\n=== EMPRESAS ===\n";
    $empresas = Empresa::with('user')->get();
    echo "Total empresas: " . $empresas->count() . "\n";
    foreach ($empresas as $empresa) {
        echo "• {$empresa->nombre} - Usuario: {$empresa->user->email}\n";
    }
    
    // Verificar candidatos
    echo "\n=== CANDIDATOS ===\n";
    $candidatos = Candidato::with('user')->get();
    echo "Total candidatos: " . $candidatos->count() . "\n";
    foreach ($candidatos->take(5) as $candidato) {
        echo "• {$candidato->nombre} {$candidato->apellido} - Usuario: {$candidato->user->email}\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stacktrace: " . $e->getTraceAsString() . "\n";
}
