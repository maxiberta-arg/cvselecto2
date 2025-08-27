<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BusquedaLaboralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_AR');
        $empresas = \App\Models\Empresa::all();
        $titulos = ['Desarrollador Backend', 'Desarrollador Frontend', 'QA Tester', 'Analista Funcional', 'Project Manager', 'DevOps', 'Diseñador UX/UI', 'Data Scientist', 'Soporte Técnico', 'Product Owner'];
        for ($i = 0; $i < 20; $i++) {
            $empresa = $empresas->random();
            \App\Models\BusquedaLaboral::create([
                'empresa_id' => $empresa->id,
                'titulo' => $faker->randomElement($titulos),
                'descripcion' => $faker->paragraph,
                'requisitos' => $faker->words(5, true),
                'estado' => $faker->randomElement(['abierta', 'cerrada']),
                'fecha_publicacion' => $faker->dateTimeBetween('-1 year', 'now'),
                'fecha_cierre' => $faker->optional()->dateTimeBetween('now', '+6 months'),
            ]);
        }
    }
}
