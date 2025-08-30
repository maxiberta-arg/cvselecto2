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
        $busquedas = \App\Models\BusquedaLaboral::where('estado', 'abierta')->get();
        
        // Crear postulaciones específicas para usuarios de prueba
        $candidatoPrueba = \App\Models\Candidato::whereHas('user', function($query) {
            $query->where('email', 'candidato@test.com');
        })->first();
        
        $candidatoBasico = \App\Models\Candidato::whereHas('user', function($query) {
            $query->where('email', 'ana@test.com');
        })->first();
        
        // Postulaciones para candidato de prueba completo
        if ($candidatoPrueba && $busquedas->count() > 0) {
            // Crear varias postulaciones en diferentes estados para el candidato de prueba
            $busquedasSeleccionadas = $busquedas->random(min(6, $busquedas->count()));
            $estados = ['postulado', 'en proceso', 'rechazado', 'seleccionado'];
            
            foreach ($busquedasSeleccionadas as $index => $busqueda) {
                $fechaPostulacion = $faker->dateTimeBetween('-2 months', '-1 week');
                $estado = $estados[$index % count($estados)];
                
                // Calcular puntuación basada en match de skills
                $puntuacion = $this->calcularPuntuacion($candidatoPrueba, $busqueda, $faker);
                
                \App\Models\Postulacion::create([
                    'busqueda_id' => $busqueda->id,
                    'candidato_id' => $candidatoPrueba->id,
                    'estado' => $estado,
                    'fecha_postulacion' => $fechaPostulacion,
                    'puntuacion' => $puntuacion,
                    'notas_empresa' => ($estado !== 'postulado') ? $faker->sentence() : null,
                ]);
            }
        }
        
        // Postulaciones para candidato básico
        if ($candidatoBasico && $busquedas->count() > 0) {
            $busquedasSeleccionadas = $busquedas->random(min(3, $busquedas->count()));
            
            foreach ($busquedasSeleccionadas as $busqueda) {
                $fechaPostulacion = $faker->dateTimeBetween('-1 month', 'now');
                $estado = $faker->randomElement(['postulado', 'en proceso', 'rechazado']);
                
                \App\Models\Postulacion::create([
                    'busqueda_id' => $busqueda->id,
                    'candidato_id' => $candidatoBasico->id,
                    'estado' => $estado,
                    'fecha_postulacion' => $fechaPostulacion,
                    'puntuacion' => $faker->numberBetween(2, 4),
                    'notas_empresa' => ($estado !== 'postulado') ? $faker->sentence() : null,
                ]);
            }
        }
        
        // Crear postulaciones aleatorias para otros candidatos
        $otrosCandidatos = $candidatos->whereNotIn('id', [$candidatoPrueba?->id, $candidatoBasico?->id]);
        
        for ($i = 0; $i < 40; $i++) {
            if ($otrosCandidatos->count() == 0 || $busquedas->count() == 0) break;
            
            $candidato = $otrosCandidatos->random();
            $busqueda = $busquedas->random();
            
            // Evitar postulaciones duplicadas
            $exists = \App\Models\Postulacion::where('candidato_id', $candidato->id)
                                           ->where('busqueda_id', $busqueda->id)
                                           ->exists();
            
            if ($exists) continue;
            
            $fechaPostulacion = $faker->dateTimeBetween('-3 months', 'now');
            $estado = $faker->randomElement(['postulado', 'postulado', 'en proceso', 'seleccionado', 'rechazado']);
            $puntuacion = $this->calcularPuntuacion($candidato, $busqueda, $faker);
            
            \App\Models\Postulacion::create([
                'busqueda_id' => $busqueda->id,
                'candidato_id' => $candidato->id,
                'estado' => $estado,
                'fecha_postulacion' => $fechaPostulacion,
                'puntuacion' => $puntuacion,
                'notas_empresa' => ($estado !== 'postulado') ? $faker->sentence() : null,
            ]);
        }
    }
    
    /**
     * Calcular puntuación de matching entre candidato y búsqueda
     */
    private function calcularPuntuacion($candidato, $busqueda, $faker)
    {
        $puntuacionBase = 3; // Puntuación base
        
        // Bonificar por coincidencias en habilidades
        if ($candidato->habilidades && $busqueda->requisitos) {
            $habilidadesCandidato = strtolower($candidato->habilidades);
            $requisitosBusqueda = strtolower($busqueda->requisitos);
            
            $tecnologias = ['php', 'laravel', 'react', 'javascript', 'mysql', 'python', 'django', 'java'];
            $coincidencias = 0;
            
            foreach ($tecnologias as $tech) {
                if (strpos($habilidadesCandidato, $tech) !== false && strpos($requisitosBusqueda, $tech) !== false) {
                    $coincidencias++;
                }
            }
            
            if ($coincidencias >= 3) $puntuacionBase = 5;
            elseif ($coincidencias >= 2) $puntuacionBase = 4;
            elseif ($coincidencias >= 1) $puntuacionBase = 3;
        }
        
        // Añadir algo de aleatoriedad
        return min(5, max(1, $puntuacionBase + $faker->numberBetween(-1, 1)));
    }
}
