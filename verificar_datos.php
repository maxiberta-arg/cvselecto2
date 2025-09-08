<?php
require_once __DIR__ . '/vendor/autoload.php';

// Cargar Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    echo "🔍 VERIFICACIÓN DE DATOS DE LA BASE DE DATOS\n";
    echo "============================================\n\n";
    
    // Verificar usuarios
    $usuarios = App\Models\User::count();
    echo "✅ Usuarios creados: {$usuarios}\n";
    
    if ($usuarios > 0) {
        echo "\n📋 LISTA DE USUARIOS:\n";
        $users = App\Models\User::select('id', 'name', 'email', 'rol')->get();
        foreach ($users as $user) {
            echo "  - {$user->name} ({$user->email}) - Rol: {$user->rol}\n";
        }
    }
    
    // Verificar empresas
    $empresas = App\Models\Empresa::count();
    echo "\n✅ Empresas creadas: {$empresas}\n";
    
    // Verificar candidatos
    $candidatos = App\Models\Candidato::count();
    echo "✅ Candidatos creados: {$candidatos}\n";
    
    // Verificar búsquedas laborales
    $busquedas = App\Models\BusquedaLaboral::count();
    echo "✅ Búsquedas laborales creadas: {$busquedas}\n";
    
    // Verificar postulaciones
    $postulaciones = App\Models\Postulacion::count();
    echo "✅ Postulaciones creadas: {$postulaciones}\n";
    
    echo "\n🎉 CONFIGURACIÓN COMPLETADA EXITOSAMENTE\n";
    echo "============================================\n\n";
    
    echo "🔑 CREDENCIALES DE ACCESO:\n\n";
    echo "ADMIN:\n";
    echo "  📧 Email: admin@test.com\n";
    echo "  🔐 Password: admin123\n\n";
    echo "EMPRESA:\n";
    echo "  📧 Email: empresa@test.com\n";
    echo "  🔐 Password: empresa123\n\n";
    echo "CANDIDATO:\n";
    echo "  📧 Email: candidato@test.com\n";
    echo "  🔐 Password: candidato123\n\n";
    
    echo "🚀 Para iniciar el servidor: php artisan serve\n";
    echo "🌐 URL de la aplicación: http://localhost:8000\n";
    
} catch (Exception $e) {
    echo "❌ Error al verificar datos: " . $e->getMessage() . "\n";
    echo "📊 Detalles del error: " . $e->getTraceAsString() . "\n";
}
?>
