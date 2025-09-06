<?php

require_once 'vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Empresa;
use App\Models\Candidato;
use Illuminate\Support\Facades\Hash;

echo "=== CREANDO USUARIOS DE TESTING ===\n\n";

try {
    // Limpiar usuarios existentes
    User::truncate();
    Empresa::truncate();
    Candidato::truncate();
    
    echo "✅ Tablas limpiadas\n\n";
    
    // Crear usuario admin
    $admin = User::create([
        'name' => 'Administrador Sistema',
        'email' => 'admin@test.com',
        'password' => Hash::make('123456'),
        'tipo_usuario' => 'admin',
        'email_verified_at' => now()
    ]);
    echo "✅ Usuario admin creado: admin@test.com / 123456\n";
    
    // Crear usuario empresa
    $userEmpresa = User::create([
        'name' => 'Empresa Test',
        'email' => 'empresa@test.com',
        'password' => Hash::make('123456'),
        'tipo_usuario' => 'empresa',
        'email_verified_at' => now()
    ]);
    
    // Crear empresa asociada
    $empresa = Empresa::create([
        'user_id' => $userEmpresa->id,
        'nombre' => 'Empresa Testing SA',
        'descripcion' => 'Empresa de pruebas para el sistema',
        'industria' => 'Tecnología',
        'tamano' => 'mediana',
        'ubicacion' => 'Buenos Aires, Argentina',
        'sitio_web' => 'https://www.empresatest.com',
        'telefono' => '+54 11 1234-5678'
    ]);
    echo "✅ Usuario empresa creado: empresa@test.com / 123456\n";
    echo "   - Empresa: {$empresa->nombre} (ID: {$empresa->id})\n";
    
    // Crear usuario candidato
    $userCandidato = User::create([
        'name' => 'Juan Pérez',
        'email' => 'candidato@test.com',
        'password' => Hash::make('123456'),
        'tipo_usuario' => 'candidato',
        'email_verified_at' => now()
    ]);
    
    // Crear candidato asociado
    $candidato = Candidato::create([
        'user_id' => $userCandidato->id,
        'nombre' => 'Juan',
        'apellido' => 'Pérez',
        'fecha_nacimiento' => '1990-05-15',
        'telefono' => '+54 11 9876-5432',
        'ubicacion' => 'CABA, Argentina',
        'resumen_profesional' => 'Desarrollador con 5 años de experiencia en tecnologías web',
        'estado_laboral' => 'buscando_activamente'
    ]);
    echo "✅ Usuario candidato creado: candidato@test.com / 123456\n";
    echo "   - Candidato: {$candidato->nombre} {$candidato->apellido} (ID: {$candidato->id})\n";
    
    // Crear algunos usuarios adicionales para pruebas
    for ($i = 1; $i <= 3; $i++) {
        $userEmp = User::create([
            'name' => "Empresa {$i}",
            'email' => "empresa{$i}@test.com",
            'password' => Hash::make('123456'),
            'tipo_usuario' => 'empresa',
            'email_verified_at' => now()
        ]);
        
        Empresa::create([
            'user_id' => $userEmp->id,
            'nombre' => "Empresa Testing {$i} SA",
            'descripcion' => "Empresa de pruebas número {$i}",
            'industria' => ['Tecnología', 'Salud', 'Educación'][$i-1],
            'tamano' => ['pequeña', 'mediana', 'grande'][$i-1],
            'ubicacion' => 'Buenos Aires, Argentina',
            'sitio_web' => "https://www.empresa{$i}.com",
            'telefono' => "+54 11 1234-567{$i}"
        ]);
    }
    
    for ($i = 1; $i <= 5; $i++) {
        $userCand = User::create([
            'name' => "Candidato {$i}",
            'email' => "candidato{$i}@test.com",
            'password' => Hash::make('123456'),
            'tipo_usuario' => 'candidato',
            'email_verified_at' => now()
        ]);
        
        Candidato::create([
            'user_id' => $userCand->id,
            'nombre' => "Candidato",
            'apellido' => "Test {$i}",
            'fecha_nacimiento' => '199' . $i . '-01-01',
            'telefono' => "+54 11 9876-543{$i}",
            'ubicacion' => 'CABA, Argentina',
            'resumen_profesional' => "Profesional con experiencia en el área {$i}",
            'estado_laboral' => 'buscando_activamente'
        ]);
    }
    
    echo "\n=== RESUMEN ===\n";
    echo "Total usuarios: " . User::count() . "\n";
    echo "Total empresas: " . Empresa::count() . "\n";
    echo "Total candidatos: " . Candidato::count() . "\n";
    
    echo "\n=== CREDENCIALES DE ACCESO ===\n";
    echo "Admin: admin@test.com / 123456\n";
    echo "Empresa: empresa@test.com / 123456\n";
    echo "Candidato: candidato@test.com / 123456\n";
    echo "\nTodos los usuarios adicionales también usan la contraseña: 123456\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stacktrace: " . $e->getTraceAsString() . "\n";
}
