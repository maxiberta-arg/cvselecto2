<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Evaluacion;
use App\Models\EmpresaCandidato;
use App\Models\User;

class EvaluacionSeederSimple extends Seeder
{
    public function run(): void
    {
        $this->command->info('🎯 Creando evaluaciones básicas...');

        // Solo crear si hay datos base
        if (User::count() == 0) {
            $this->command->warn('⚠️ No hay usuarios. Saltando evaluaciones.');
            return;
        }

        // Crear relación básica si no existe
        $user = User::first();
        $empresaCandidato = EmpresaCandidato::first();

        if (!$empresaCandidato && User::count() >= 2) {
            // Crear una relación básica para poder crear evaluaciones
            $empresaCandidato = EmpresaCandidato::create([
                'empresa_id' => 1,
                'candidato_id' => 1,
                'puntuacion' => 85,
                'observaciones' => 'Evaluación de ejemplo',
                'estado' => 'evaluado'
            ]);
        }

        if ($empresaCandidato) {
            // Crear 2 evaluaciones básicas
            Evaluacion::create([
                'empresa_candidato_id' => $empresaCandidato->id,
                'evaluador_id' => $user->id,
                'nombre_evaluacion' => 'Evaluación Técnica Básica',
                'tipo_evaluacion' => 'tecnica',
                'criterios_evaluacion' => json_encode([
                    'tecnico' => ['peso' => 60, 'descripcion' => 'Conocimientos técnicos'],
                    'practico' => ['peso' => 40, 'descripcion' => 'Experiencia práctica']
                ]),
                'puntuaciones' => json_encode(['tecnico' => 85, 'practico' => 80]),
                'puntuacion_total' => 83.0,
                'estado_evaluacion' => 'completada',
                'comentarios_generales' => 'Buen candidato con sólidos conocimientos.',
                'metadatos' => json_encode(['version' => '1.0', 'origen' => 'seeder'])
            ]);

            Evaluacion::create([
                'empresa_candidato_id' => $empresaCandidato->id,
                'evaluador_id' => $user->id,
                'nombre_evaluacion' => 'Evaluación Pendiente',
                'tipo_evaluacion' => 'competencias',
                'criterios_evaluacion' => json_encode([
                    'comunicacion' => ['peso' => 50, 'descripcion' => 'Habilidades de comunicación'],
                    'liderazgo' => ['peso' => 50, 'descripcion' => 'Capacidad de liderazgo']
                ]),
                'estado_evaluacion' => 'pendiente',
                'metadatos' => json_encode(['version' => '1.0', 'origen' => 'seeder'])
            ]);

            $this->command->info('✅ 2 evaluaciones básicas creadas');
        } else {
            $this->command->warn('⚠️ No se pudo crear evaluaciones - falta estructura base');
        }
    }
}
