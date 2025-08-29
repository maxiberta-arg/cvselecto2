<?php

require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Actualizar contraseñas para testing
$users = [
    'empresa@test.com' => '123456',
    'candidato@test.com' => '123456',
    'admin@cvselecto.com' => '123456'
];

foreach ($users as $email => $password) {
    $user = User::where('email', $email)->first();
    if ($user) {
        $user->password = Hash::make($password);
        $user->save();
        echo "Password updated for {$email}\n";
    } else {
        echo "User {$email} not found\n";
    }
}

echo "Password reset completed!\n";
