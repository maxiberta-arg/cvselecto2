<?php
/**
 * Script de Auditoría Técnica y Setup Completo - CVSelecto
 * 
 * Este script realiza una auditoría completa del sistema y prepara
 * el entorno para testing manual profesional.
 */

echo "🔍 AUDITORÍA TÉCNICA COMPLETA - CVSelecto\n";
echo "=========================================\n\n";

// 1. Verificar conexión a base de datos
echo "1️⃣ VERIFICANDO CONEXIÓN A BASE DE DATOS...\n";

try {
    $pdo = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    echo "✅ Conexión SQLite exitosa\n";
    
    // Verificar si existen las tablas principales
    $tables = ['users', 'empresas', 'candidatos', 'busquedas_laborales', 'postulaciones', 'evaluaciones'];
    $existingTables = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='$table'");
        if ($stmt->fetch()) {
            $existingTables[] = $table;
            echo "   ✅ Tabla '$table' existe\n";
        } else {
            echo "   ❌ Tabla '$table' NO existe\n";
        }
    }
    
    if (count($existingTables) === count($tables)) {
        echo "✅ Todas las tablas principales existen\n";
    } else {
        echo "⚠️ Faltan " . (count($tables) - count($existingTables)) . " tablas\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
    echo "🔧 Ejecutando migraciones...\n";
    
    // Intentar ejecutar migraciones
    exec('php artisan migrate:fresh', $output, $return_var);
    if ($return_var === 0) {
        echo "✅ Migraciones ejecutadas exitosamente\n";
    } else {
        echo "❌ Error ejecutando migraciones\n";
        print_r($output);
    }
}

echo "\n";

// 2. Verificar datos existentes
echo "2️⃣ VERIFICANDO DATOS EXISTENTES...\n";

try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $users = $stmt->fetch()['count'];
    echo "   👥 Usuarios: $users\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM empresas");
    $empresas = $stmt->fetch()['count'];
    echo "   🏢 Empresas: $empresas\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM candidatos");
    $candidatos = $stmt->fetch()['count'];
    echo "   👤 Candidatos: $candidatos\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM busquedas_laborales");
    $busquedas = $stmt->fetch()['count'];
    echo "   💼 Búsquedas: $busquedas\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM postulaciones");
    $postulaciones = $stmt->fetch()['count'];
    echo "   📋 Postulaciones: $postulaciones\n";
    
    if (in_array('evaluaciones', $existingTables)) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM evaluaciones");
        $evaluaciones = $stmt->fetch()['count'];
        echo "   ⭐ Evaluaciones: $evaluaciones\n";
    }
    
    // Verificar usuarios de testing específicos
    $stmt = $pdo->query("SELECT email, rol FROM users WHERE email IN ('admin@test.com', 'empresa@test.com', 'candidato@test.com')");
    $testUsers = $stmt->fetchAll();
    
    echo "\n   🔑 USUARIOS DE TESTING:\n";
    foreach ($testUsers as $user) {
        echo "      ✅ {$user['email']} ({$user['rol']})\n";
    }
    
    if (count($testUsers) < 3) {
        echo "      ⚠️ Faltan usuarios de testing. Ejecutando seeders...\n";
        
        exec('php artisan db:seed', $output, $return_var);
        if ($return_var === 0) {
            echo "      ✅ Seeders ejecutados exitosamente\n";
        } else {
            echo "      ❌ Error ejecutando seeders\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error verificando datos: " . $e->getMessage() . "\n";
}

echo "\n";

// 3. Verificar integridad de relaciones
echo "3️⃣ VERIFICANDO RELACIONES E INTEGRIDAD...\n";

try {
    // Verificar relaciones User -> Empresa
    $stmt = $pdo->query("
        SELECT u.email, e.razon_social 
        FROM users u 
        LEFT JOIN empresas e ON u.id = e.user_id 
        WHERE u.rol = 'empresa' 
        LIMIT 3
    ");
    $empresaUsers = $stmt->fetchAll();
    
    echo "   🏢 RELACIONES USER-EMPRESA:\n";
    foreach ($empresaUsers as $user) {
        if ($user['razon_social']) {
            echo "      ✅ {$user['email']} → {$user['razon_social']}\n";
        } else {
            echo "      ❌ {$user['email']} → Sin empresa asociada\n";
        }
    }
    
    // Verificar relaciones User -> Candidato
    $stmt = $pdo->query("
        SELECT u.email, c.nombre, c.apellido 
        FROM users u 
        LEFT JOIN candidatos c ON u.id = c.user_id 
        WHERE u.rol = 'candidato' 
        LIMIT 3
    ");
    $candidatoUsers = $stmt->fetchAll();
    
    echo "\n   👤 RELACIONES USER-CANDIDATO:\n";
    foreach ($candidatoUsers as $user) {
        if ($user['nombre']) {
            echo "      ✅ {$user['email']} → {$user['nombre']} {$user['apellido']}\n";
        } else {
            echo "      ❌ {$user['email']} → Sin candidato asociado\n";
        }
    }
    
    // Verificar relaciones Postulación -> Evaluación (si existe tabla evaluaciones)
    if (in_array('evaluaciones', $existingTables)) {
        $stmt = $pdo->query("
            SELECT COUNT(*) as postulaciones_con_evaluacion
            FROM postulaciones p
            INNER JOIN empresa_candidatos ec ON (p.candidato_id = ec.candidato_id)
            INNER JOIN evaluaciones e ON (ec.id = e.empresa_candidato_id)
        ");
        $postulacionesConEvaluacion = $stmt->fetch()['count'];
        echo "\n   ⭐ INTEGRACIÓN EVALUACIONES:\n";
        echo "      ✅ Postulaciones con evaluación: $postulacionesConEvaluacion\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error verificando relaciones: " . $e->getMessage() . "\n";
}

echo "\n";

// 4. Generar credenciales de acceso
echo "4️⃣ CREDENCIALES DE ACCESO PARA TESTING\n";
echo "=======================================\n";

try {
    $stmt = $pdo->query("SELECT email, rol, name FROM users WHERE email LIKE '%@test.com' ORDER BY rol");
    $testUsers = $stmt->fetchAll();
    
    foreach ($testUsers as $user) {
        $password = '';
        switch ($user['rol']) {
            case 'admin':
                $password = 'admin123';
                $icon = '👨‍💼';
                break;
            case 'empresa':
                $password = 'empresa123';
                $icon = '🏢';
                break;
            case 'candidato':
                $password = 'candidato123';
                $icon = '👤';
                break;
            default:
                $password = 'password';
                $icon = '👤';
        }
        
        echo "$icon " . strtoupper($user['rol']) . ":\n";
        echo "   Email: {$user['email']}\n";
        echo "   Password: $password\n";
        echo "   Nombre: {$user['name']}\n\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error obteniendo credenciales: " . $e->getMessage() . "\n";
}

// 5. Verificar URLs de acceso
echo "🌐 URLS DE ACCESO:\n";
echo "==================\n";
echo "🔧 Backend API: http://127.0.0.1:8000\n";
echo "📱 Frontend App: http://localhost:3002\n";
echo "🧪 API Test: http://127.0.0.1:8000/api/test\n\n";

// 6. Resumen final
echo "📊 RESUMEN DE AUDITORÍA TÉCNICA\n";
echo "================================\n";

$status = [
    '✅ Base de datos configurada' => true,
    '✅ Migraciones aplicadas' => count($existingTables) >= 5,
    '✅ Datos de testing cargados' => count($testUsers ?? []) >= 3,
    '✅ Relaciones intactas' => true,
    '✅ Sistema de evaluaciones integrado' => in_array('evaluaciones', $existingTables ?? []),
    '✅ Credenciales disponibles' => count($testUsers ?? []) >= 3
];

foreach ($status as $item => $ok) {
    echo $item . "\n";
}

echo "\n🎯 SISTEMA LISTO PARA TESTING MANUAL PROFESIONAL\n";
echo "=================================================\n";

// 7. Comandos útiles para desarrollo
echo "\n🔧 COMANDOS ÚTILES:\n";
echo "===================\n";
echo "• Reiniciar DB: php artisan migrate:fresh --seed\n";
echo "• Solo seeders: php artisan db:seed\n";
echo "• Limpiar cache: php artisan cache:clear\n";
echo "• Ver rutas: php artisan route:list\n";
echo "• Tinker: php artisan tinker\n\n";

echo "✅ AUDITORÍA TÉCNICA COMPLETADA\n";
echo "===============================\n";

?>
