<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PostulacionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_AR');
        $candidatos = \App\Models\Candidato::all();
        $busquedas = \App\Models\BusquedaLaboral::all();
        for ($i = 0; $i < 50; $i++) {
            $candidato = $candidatos->random();
            $busqueda = $busquedas->random();
            \App\Models\Postulacion::create([
                'busqueda_id' => $busqueda->id,
                'candidato_id' => $candidato->id,
                'estado' => $faker->randomElement(['postulado', 'en proceso', 'rechazado', 'seleccionado']),
                'fecha_postulacion' => $faker->dateTimeBetween('-1 year', 'now'),
            ]);
        }
    }
}
