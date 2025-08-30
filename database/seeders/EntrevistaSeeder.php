<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class EntrevistaSeeder extends Seeder
{
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_AR');
        
        // Solo crear entrevistas para postulaciones en estados avanzados
        $postulaciones = \App\Models\Postulacion::whereIn('estado', ['en proceso', 'seleccionado', 'rechazado'])
                                               ->get();
        
        foreach ($postulaciones as $postulacion) {
            // 60% de las postulaciones avanzadas tienen entrevista
            if ($faker->boolean(60)) {
                
                $fechaEntrevista = $faker->dateTimeBetween('-1 month', '+1 week');
                $modalidad = $faker->randomElement(['presencial', 'virtual']);
                
                // Resultado basado en estado de postulación
                $resultado = 'pendiente';
                if ($postulacion->estado === 'seleccionado') $resultado = 'aprobado';
                elseif ($postulacion->estado === 'rechazado') $resultado = 'rechazado';
                
                \App\Models\Entrevista::create([
                    'postulacion_id' => $postulacion->id,
                    'fecha' => $fechaEntrevista,
                    'modalidad' => $modalidad,
                    'resultado' => $resultado,
                    'observaciones' => $faker->sentence(),
                ]);
            }
        }
    }
}
