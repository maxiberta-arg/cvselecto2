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
        $faker = \Faker\Factory::create('es_AR');
        $candidatoUsers = \App\Models\User::orderBy('id', 'desc')->limit(20)->get();
        foreach ($candidatoUsers as $user) {
            \App\Models\Candidato::create([
                'user_id' => $user->id,
                'apellido' => $faker->lastName,
                'fecha_nacimiento' => $faker->date('Y-m-d', '-18 years'),
                'telefono' => $faker->phoneNumber,
                'direccion' => $faker->address,
                'cv_path' => null,
            ]);
        }
    }
}
