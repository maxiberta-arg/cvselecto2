<?php
echo "Verificando conexión a base de datos...\n";

try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=cvselecto', 'root', '');
    echo "✅ Conexión a base de datos exitosa\n";
    
    // Verificar tablas
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "📊 Tablas encontradas: " . count($tables) . "\n";
    
    // Verificar usuarios
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $userCount = $stmt->fetchColumn();
    echo "👥 Usuarios en base de datos: " . $userCount . "\n";
    
    if ($userCount > 0) {
        $stmt = $pdo->query("SELECT name, email, rol FROM users");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "\n📋 Lista de usuarios:\n";
        foreach ($users as $user) {
            echo "  - {$user['name']} ({$user['email']}) - Rol: {$user['rol']}\n";
        }
    }
    
    // Verificar empresas
    $stmt = $pdo->query("SELECT COUNT(*) FROM empresas");
    $empresaCount = $stmt->fetchColumn();
    echo "\n🏢 Empresas en base de datos: " . $empresaCount . "\n";
    
    // Verificar candidatos
    $stmt = $pdo->query("SELECT COUNT(*) FROM candidatos");
    $candidatoCount = $stmt->fetchColumn();
    echo "🧑‍💼 Candidatos en base de datos: " . $candidatoCount . "\n";
    
} catch (PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
}
?>
