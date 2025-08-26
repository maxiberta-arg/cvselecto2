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
        // Seeder de postulación vinculando candidato y búsqueda laboral
        $candidato = \App\Models\Candidato::first();
        $busqueda = \App\Models\BusquedaLaboral::first();
        if ($candidato && $busqueda) {
            \App\Models\Postulacion::create([
                'busqueda_id' => $busqueda->id,
                'candidato_id' => $candidato->id,
                'estado' => 'postulado',
                'fecha_postulacion' => now(),
            ]);
        }
    }
}
