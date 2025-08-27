<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class EntrevistaSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_AR');
        $postulaciones = \App\Models\Postulacion::all();
        foreach ($postulaciones as $postulacion) {
            if ($faker->boolean(60)) { // 60% de postulaciones tienen entrevista
                \App\Models\Entrevista::create([
                    'postulacion_id' => $postulacion->id,
                    'fecha' => $faker->dateTimeBetween('-6 months', '+1 month'),
                    'modalidad' => $faker->randomElement(['virtual', 'presencial']),
                    'resultado' => $faker->randomElement(['aprobado', 'rechazado', 'pendiente']),
                    'observaciones' => $faker->optional()->sentence,
                ]);
            }
        }
    }
}
