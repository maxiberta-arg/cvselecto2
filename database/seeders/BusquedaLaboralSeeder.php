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
        // Seeder de búsqueda laboral vinculada a la empresa ejemplo
        $empresa = \App\Models\Empresa::where('razon_social', 'Empresa Ejemplo S.A.')->first();
        if ($empresa) {
            \App\Models\BusquedaLaboral::create([
                'empresa_id' => $empresa->id,
                'titulo' => 'Desarrollador Backend',
                'descripcion' => 'Buscamos desarrollador con experiencia en Laravel.',
                'requisitos' => 'Laravel, MySQL, Git',
                'estado' => 'abierta',
                'fecha_publicacion' => now(),
                'fecha_cierre' => null,
            ]);
        }
    }
}
