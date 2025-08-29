<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Crear usuario empresa de prueba
    $user = \App\Models\User::create([
        'name' => 'Empresa Test',
        'email' => 'empresa@test.com',
        'password' => bcrypt('123456'),
        'rol' => 'empresa'
    ]);

    echo "Usuario creado: " . $user->email . "\n";

    // Crear empresa asociada
    $empresa = \App\Models\Empresa::create([
        'user_id' => $user->id,
        'razon_social' => 'Empresa Test S.A.',
        'cuit' => '20123456789',
        'telefono' => '1234567890',
        'direccion' => 'Calle Falsa 123, Buenos Aires',
        'descripcion' => 'Empresa de prueba para testing de funcionalidades. Esta descripción tiene más de 50 caracteres para cumplir con las validaciones del sistema.',
        'sector' => 'Tecnología',
        'estado_verificacion' => 'verificada'
    ]);

    echo "Empresa creada: " . $empresa->razon_social . "\n";

    // Crear candidato de prueba
    $userCandidato = \App\Models\User::create([
        'name' => 'Juan Pérez',
        'email' => 'candidato@test.com',
        'password' => bcrypt('123456'),
        'rol' => 'candidato'
    ]);

    $candidato = \App\Models\Candidato::create([
        'user_id' => $userCandidato->id,
        'apellido' => 'Pérez',
        'telefono' => '1123456789',
        'direccion' => 'Av. Corrientes 1234',
        'bio' => 'Candidato de prueba con experiencia en desarrollo web. Busco nuevas oportunidades laborales.',
        'habilidades' => 'JavaScript, React, PHP, Laravel',
        'linkedin' => 'https://linkedin.com/in/juan-perez',
        'experiencia_resumida' => 'Desarrollador Full Stack con 3 años de experiencia.',
        'educacion_resumida' => 'Licenciado en Sistemas'
    ]);

    echo "Candidato creado: " . $userCandidato->name . "\n";

    // Crear búsqueda laboral
    $busqueda = \App\Models\BusquedaLaboral::create([
        'empresa_id' => $empresa->id,
        'titulo' => 'Desarrollador React Senior',
        'descripcion' => 'Buscamos desarrollador React con experiencia en proyectos grandes.',
        'ubicacion' => 'Buenos Aires',
        'tipo_empleo' => 'tiempo_completo',
        'salario_min' => 150000,
        'salario_max' => 250000,
        'requisitos' => 'React, JavaScript, Node.js',
        'beneficios' => 'Obra social, vacaciones',
        'estado' => 'activa'
    ]);

    echo "Búsqueda creada: " . $busqueda->titulo . "\n";

    // Crear postulación
    $postulacion = \App\Models\Postulacion::create([
        'candidato_id' => $candidato->id,
        'busqueda_id' => $busqueda->id,
        'mensaje' => 'Me interesa esta posición',
        'estado' => 'postulado'
    ]);

    echo "Postulación creada\n";

    echo "\n=== CREDENCIALES DE PRUEBA ===\n";
    echo "Empresa: empresa@test.com / 123456\n";
    echo "Candidato: candidato@test.com / 123456\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
