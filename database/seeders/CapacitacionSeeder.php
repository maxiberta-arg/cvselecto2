<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CapacitacionSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_AR');
        $candidatos = \App\Models\Candidato::all();
        for ($i = 0; $i < 15; $i++) {
            $candidato = $candidatos->random();
            \App\Models\Educacion::create([
                'candidato_id' => $candidato->id,
                'titulo' => $faker->randomElement(['Lic. en Sistemas', 'Tecnicatura en Programación', 'Ingeniería Industrial', 'MBA', 'Curso Fullstack', 'Diplomatura en RRHH']),
                'institucion' => $faker->company,
                'fecha_inicio' => $faker->date('Y-m-d', '-10 years'),
                'fecha_fin' => $faker->optional()->date('Y-m-d', '-1 years'),
                'descripcion' => $faker->sentence,
            ]);
        }
    }
}
