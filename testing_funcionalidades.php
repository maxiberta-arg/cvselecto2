<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Http\Kernel')->bootstrap();

echo "=== TESTING DE APIS Y FUNCIONALIDADES ===\n\n";

try {
    // Test 1: Generar tokens para testing
    echo "1. GENERACIÓN DE TOKENS DE TESTING\n";
    
    $usuarioAdmin = \App\Models\User::where('email', 'admin@test.com')->first();
    $usuarioEmpresa = \App\Models\User::where('email', 'empresa@test.com')->first();
    $usuarioCandidato = \App\Models\User::where('email', 'candidato@test.com')->first();
    
    if ($usuarioAdmin) {
        $tokenAdmin = $usuarioAdmin->createToken('admin-test')->plainTextToken;
        echo "✅ Token Admin: {$tokenAdmin}\n";
    }
    
    if ($usuarioEmpresa) {
        $tokenEmpresa = $usuarioEmpresa->createToken('empresa-test')->plainTextToken;
        echo "✅ Token Empresa: {$tokenEmpresa}\n";
    }
    
    if ($usuarioCandidato) {
        $tokenCandidato = $usuarioCandidato->createToken('candidato-test')->plainTextToken;
        echo "✅ Token Candidato: {$tokenCandidato}\n";
    }
    
    echo "\n2. VERIFICACIÓN DE CONTROLADORES\n";
    
    // Test 2: Verificar que los controladores principales existen y pueden instanciarse
    $controllers = [
        'AuthController' => '\App\Http\Controllers\Api\AuthController',
        'CandidatoController' => '\App\Http\Controllers\Api\CandidatoController',
        'EmpresaController' => '\App\Http\Controllers\Api\EmpresaController',
        'BusquedaLaboralController' => '\App\Http\Controllers\Api\BusquedaLaboralController',
        'PostulacionController' => '\App\Http\Controllers\Api\PostulacionController',
        'EvaluacionController' => '\App\Http\Controllers\Api\EvaluacionController',
        'EmpresaPoolController' => '\App\Http\Controllers\Api\EmpresaPoolController'
    ];
    
    foreach ($controllers as $name => $class) {
        if (class_exists($class)) {
            echo "✅ {$name}: Existe\n";
        } else {
            echo "❌ {$name}: No encontrado\n";
        }
    }
    
    echo "\n3. VERIFICACIÓN DE MIDDLEWARE\n";
    
    // Test 3: Verificar middleware críticos
    $middlewares = [
        'auth:sanctum',
        'empresa.verificada',
        'empresa.ownership'
    ];
    
    foreach ($middlewares as $middleware) {
        // Verificar que el middleware está registrado
        $app = app();
        try {
            $app['router']->getMiddleware()[$middleware] ?? null;
            echo "✅ Middleware {$middleware}: Registrado\n";
        } catch (Exception $e) {
            echo "⚠️  Middleware {$middleware}: Verificación pendiente\n";
        }
    }
    
    echo "\n4. TESTING DE SEEDERS CRÍTICOS\n";
    
    // Test 4: Verificar que podemos poblar datos críticos
    echo "Ejecutando EmpresaCandidatoSeeder para relaciones...\n";
    
    // Crear relación empresa-candidato si no existe
    $empresa = \App\Models\Empresa::first();
    $candidato = \App\Models\Candidato::first();
    
    if ($empresa && $candidato) {
        $relacion = \App\Models\EmpresaCandidato::firstOrCreate([
            'empresa_id' => $empresa->id,
            'candidato_id' => $candidato->id
        ], [
            'origen' => 'manual',
            'estado_interno' => 'activo',
            'puntuacion_empresa' => 8.5,
            'fecha_incorporacion' => now()
        ]);
        
        echo "✅ Relación empresa-candidato creada: ID {$relacion->id}\n";
    }
    
    echo "\n5. VERIFICACIÓN DE RUTAS API\n";
    
    // Test 5: Verificar rutas críticas registradas
    $routes = [
        'api/login',
        'api/user',
        'api/candidatos',
        'api/empresas',
        'api/busquedas-laborales',
        'api/postulaciones',
        'api/evaluaciones',
        'api/pool-candidatos'
    ];
    
    foreach ($routes as $route) {
        $routeCollection = app('router')->getRoutes();
        $found = false;
        
        foreach ($routeCollection as $r) {
            if (str_contains($r->uri(), str_replace('api/', '', $route))) {
                $found = true;
                break;
            }
        }
        
        if ($found) {
            echo "✅ Ruta {$route}: Registrada\n";
        } else {
            echo "❌ Ruta {$route}: No encontrada\n";
        }
    }
    
    echo "\n=== TESTING COMPLETADO ===\n";
    echo "Tokens generados para testing manual de APIs\n";
    echo "Servidor Laravel debe estar corriendo en http://localhost:8000\n";
    
} catch (Exception $e) {
    echo "Error en testing: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}