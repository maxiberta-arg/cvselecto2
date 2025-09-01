<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CANDIDATOS ===\n";
$candidatos = App\Models\Candidato::with('user')->get();
foreach($candidatos as $c) {
    echo "ID: {$c->id} | Nombre: " . ($c->nombre ?: 'NULL') . " | User: " . ($c->user ? $c->user->name : 'NULL') . " | User ID: " . ($c->user_id ?: 'NULL') . "\n";
}

echo "\n=== POSTULACIONES PARA BUSQUEDA 22 ===\n";
$postulaciones = App\Models\Postulacion::with(['candidato', 'candidato.user'])->where('busqueda_id', 22)->get();
foreach($postulaciones as $p) {
    echo "Postulacion ID: {$p->id} | Candidato ID: {$p->candidato_id} | Estado: {$p->estado}\n";
    if($p->candidato) {
        echo "  - Candidato Nombre: " . ($p->candidato->nombre ?: 'NULL') . "\n";
        echo "  - User Name: " . ($p->candidato->user ? $p->candidato->user->name : 'NULL') . "\n";
    }
    echo "\n";
}
