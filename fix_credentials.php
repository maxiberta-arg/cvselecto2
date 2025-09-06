#!/usr/bin/env php
<?php

require __DIR__.'/vendor/autoload.php';

use Illuminate\Foundation\Application;
use App\Models\User;
use App\Models\Empresa;
use App\Models\Candidato;
use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = new Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== VERIFICANDO Y CREANDO USUARIOS DE TESTING ===\n\n";

try {
    // Verificar y crear Admin
    $admin = User::updateOrCreate(
        ['email' => 'admin@test.com'],
        [
            'name' => 'Admin Testing',
            'password' => Hash::make('admin123'),
            'rol' => 'admin',
            'email_verified_at' => now(),
        ]
    );
    echo "✅ Admin: admin@test.com / admin123\n";

    // Verificar y crear Empresa
    $empresaUser = User::updateOrCreate(
        ['email' => 'empresa@test.com'],
        [
            'name' => 'TechCorp Solutions',
            'password' => Hash::make('empresa123'),
            'rol' => 'empresa',
            'email_verified_at' => now(),
        ]
    );

    $empresa = Empresa::updateOrCreate(
        ['user_id' => $empresaUser->id],
        [
            'razon_social' => 'TechCorp Solutions S.A.',
            'cuit' => '30-71234567-8',
            'telefono' => '+54 11 4567-8900',
            'direccion' => 'Av. Corrientes 1234, CABA',
            'descripcion' => 'Empresa de testing para el sistema',
            'estado_verificacion' => 'verificada',
            'sector' => 'Tecnología',
            'tamaño_empresa' => 125,
            'año_fundacion' => 2012,
            'email_contacto' => 'rrhh@techcorp.com.ar',
            'persona_contacto' => 'María González',
            'sitio_web' => 'https://www.techcorp-solutions.com.ar',
            'verificada_at' => now(),
        ]
    );
    echo "✅ Empresa: empresa@test.com / empresa123\n";
    echo "   - Empresa: {$empresa->razon_social}\n";

    // Verificar y crear Candidato
    $candidatoUser = User::updateOrCreate(
        ['email' => 'candidato@test.com'],
        [
            'name' => 'Juan Carlos Pérez',
            'password' => Hash::make('candidato123'),
            'rol' => 'candidato',
            'email_verified_at' => now(),
        ]
    );

    $candidato = Candidato::updateOrCreate(
        ['user_id' => $candidatoUser->id],
        [
            'nombre' => 'Juan Carlos',
            'apellido' => 'Pérez',
            'email' => 'candidato@test.com',
            'telefono' => '+54 11 9876-5432',
            'fecha_nacimiento' => '1990-05-15',
            'ubicacion' => 'CABA, Buenos Aires, Argentina',
            'resumen_profesional' => 'Desarrollador Full Stack con 5 años de experiencia',
            'estado_laboral' => 'buscando_activamente',
        ]
    );
    echo "✅ Candidato: candidato@test.com / candidato123\n";
    echo "   - Candidato: {$candidato->nombre} {$candidato->apellido}\n";

    echo "\n=== RESUMEN FINAL ===\n";
    echo "Total usuarios: " . User::count() . "\n";
    echo "Total empresas: " . Empresa::count() . "\n";
    echo "Total candidatos: " . Candidato::count() . "\n";

    echo "\n🎯 CREDENCIALES LISTAS PARA USAR:\n";
    echo "• Admin: admin@test.com / admin123\n";
    echo "• Empresa: empresa@test.com / empresa123\n";
    echo "• Candidato: candidato@test.com / candidato123\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
