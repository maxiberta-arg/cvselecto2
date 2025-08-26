<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CandidatoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder de candidato vinculado al usuario Juan Candidato
        $user = \App\Models\User::where('email', 'juan.candidato@cvselecto.com')->first();
        if ($user) {
            \App\Models\Candidato::create([
                'user_id' => $user->id,
                'apellido' => 'Pérez',
                'fecha_nacimiento' => '1990-05-10',
                'telefono' => '1122334455',
                'direccion' => 'Calle Falsa 123',
                'cv_path' => null,
            ]);
        }
    }
}
