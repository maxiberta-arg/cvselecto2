<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TestingEvaluacionesSeeder extends Seeder
{
    /**
     * Crear evaluaciones de testing para varios EmpresaCandidato
     */
    public function run(): void
    {
        $this->command->info('🌱 Iniciando TestingEvaluacionesSeeder...');

        // Obtener algunos empresa_candidatos existentes
        $empresaCandidatos = \App\Models\EmpresaCandidato::take(10)->get();

        if ($empresaCandidatos->isEmpty()) {
            $this->command->info('⚠️ No se encontraron registros en empresa_candidatos. Ejecuta seeders previos.');
            return;
        }

        DB::beginTransaction();
        try {
            foreach ($empresaCandidatos as $ec) {
                // determinar evaluador: preferir user admin, si no usar el user de la empresa
                $admin = \App\Models\User::where('rol', 'admin')->first();
                $evaluadorId = $admin ? $admin->id : ($ec->empresa->user_id ?? null);

                // 1) Evaluación pendiente
                \App\Models\Evaluacion::create([
                    'empresa_candidato_id' => $ec->id,
                    'evaluador_id' => $evaluadorId,
                    'nombre_evaluacion' => 'Evaluación automática (pendiente)',
                    'tipo_evaluacion' => 'integral',
                    'criterios_evaluacion' => [
                        'experiencia_tecnica' => ['peso' => 30, 'descripcion' => 'Exp. técnica'],
                        'comunicacion' => ['peso' => 20, 'descripcion' => 'Comunicación'],
                        'fit_cultural' => ['peso' => 25, 'descripcion' => 'Fit cultural'],
                        'motivacion' => ['peso' => 25, 'descripcion' => 'Motivación']
                    ],
                    'estado_evaluacion' => 'pendiente',
                    'metadatos' => ['origen' => 'testing']
                ]);

                // 2) Evaluación en progreso
                \App\Models\Evaluacion::create([
                    'empresa_candidato_id' => $ec->id,
                    'evaluador_id' => $evaluadorId,
                    'nombre_evaluacion' => 'Evaluación en progreso',
                    'tipo_evaluacion' => 'tecnica',
                    'criterios_evaluacion' => [
                        'conocimientos_tecnicos' => ['peso' => 50, 'descripcion' => 'Tecnical'],
                        'resolucion_problemas' => ['peso' => 50, 'descripcion' => 'Resolución']
                    ],
                    'estado_evaluacion' => 'en_progreso',
                    'fecha_inicio' => now()->subMinutes(30),
                    'metadatos' => ['origen' => 'testing']
                ]);

                // 3) Evaluación completada
                $evaluacionCompletada = \App\Models\Evaluacion::create([
                    'empresa_candidato_id' => $ec->id,
                    'evaluador_id' => $evaluadorId,
                    'nombre_evaluacion' => 'Evaluación completada',
                    'tipo_evaluacion' => 'integral',
                    'criterios_evaluacion' => [
                        'experiencia_tecnica' => ['peso' => 40, 'descripcion' => 'Exp. técnica'],
                        'comunicacion' => ['peso' => 30, 'descripcion' => 'Comunicación'],
                        'fit_cultural' => ['peso' => 30, 'descripcion' => 'Fit cultural']
                    ],
                    'puntuaciones' => [
                        'experiencia_tecnica' => 80,
                        'comunicacion' => 75,
                        'fit_cultural' => 70
                    ],
                    'puntuacion_total' => 76.5,
                    'estado_evaluacion' => 'completada',
                    'fecha_inicio' => now()->subHours(2),
                    'fecha_completada' => now()->subHours(1),
                    'metadatos' => ['origen' => 'testing']
                ]);

                // Actualizar puntuación en empresa_candidato si corresponde (si es evaluación más reciente)
                try {
                    $ec->update([
                        'puntuacion_empresa' => $evaluacionCompletada->puntuacion_total,
                        'ultimo_contacto' => now()
                    ]);
                } catch (\Exception $e) {
                    // no crítico
                }
            }

            DB::commit();
            $this->command->info('✅ TestingEvaluacionesSeeder completado.');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error en TestingEvaluacionesSeeder: ' . $e->getMessage());
        }
    }
}
