<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ExperienciaSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_AR');
        $candidatos = \App\Models\Candidato::all();
        foreach ($candidatos as $candidato) {
            $num = rand(1, 3);
            for ($i = 0; $i < $num; $i++) {
                \App\Models\Experiencia::create([
                    'candidato_id' => $candidato->id,
                    'empresa' => $faker->company,
                    'puesto' => $faker->jobTitle,
                    'fecha_inicio' => $faker->date('Y-m-d', '-10 years'),
                    'fecha_fin' => $faker->optional()->date('Y-m-d', '-1 years'),
                    'descripcion' => $faker->sentence,
                ]);
            }
        }
    }
}
