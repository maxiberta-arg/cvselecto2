<?php

namespace Database\Factories;

use App\Models\Evaluacion;
use App\Models\EmpresaCandidato;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Factory para generar datos de prueba de Evaluaciones
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Evaluacion>
 */
class EvaluacionFactory extends Factory
{
    protected $model = Evaluacion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tipoEvaluacion = $this->faker->randomElement(array_keys(Evaluacion::TIPOS_EVALUACION));
        $criterios = Evaluacion::getCriteriosPorTipo($tipoEvaluacion);
        
        // Generar puntuaciones aleatorias para cada criterio
        $puntuaciones = [];
        foreach ($criterios as $criterio => $config) {
            $puntuaciones[$criterio] = $this->faker->numberBetween(60, 100);
        }

        $fechaInicio = $this->faker->dateTimeBetween('-30 days', '-1 day');
        $estadoEvaluacion = $this->faker->randomElement(array_keys(Evaluacion::ESTADOS_EVALUACION));
        
        return [
            'empresa_candidato_id' => EmpresaCandidato::factory(),
            'evaluador_id' => User::factory(),
            'nombre_evaluacion' => $this->faker->words(3, true) . ' - Evaluación',
            'tipo_evaluacion' => $tipoEvaluacion,
            'criterios_evaluacion' => $criterios,
            'puntuaciones' => $estadoEvaluacion === 'completada' ? $puntuaciones : null,
            'puntuacion_total' => $estadoEvaluacion === 'completada' ? 
                $this->faker->numberBetween(65, 95) : null,
            'comentarios_generales' => $this->faker->paragraph(3),
            'recomendaciones' => $this->faker->sentence(10),
            'estado_evaluacion' => $estadoEvaluacion,
            'fecha_inicio' => $fechaInicio,
            'fecha_completada' => $estadoEvaluacion === 'completada' ? 
                $this->faker->dateTimeBetween($fechaInicio, 'now') : null,
            'tiempo_evaluacion_minutos' => $estadoEvaluacion === 'completada' ? 
                $this->faker->numberBetween(30, 180) : null,
            'metadatos' => [
                'version_sistema' => '1.0.0',
                'ip_evaluador' => $this->faker->ipv4(),
                'user_agent' => $this->faker->userAgent(),
                'configuracion_personalizada' => $this->faker->boolean()
            ]
        ];
    }

    /**
     * Estado: Evaluación completada
     */
    public function completada(): static
    {
        return $this->state(function (array $attributes) {
            $fechaInicio = $this->faker->dateTimeBetween('-7 days', '-1 day');
            $fechaCompletada = $this->faker->dateTimeBetween($fechaInicio, 'now');
            
            // Generar puntuaciones para criterios
            $criterios = $attributes['criterios_evaluacion'] ?? [];
            $puntuaciones = [];
            foreach ($criterios as $criterio => $config) {
                $puntuaciones[$criterio] = $this->faker->numberBetween(70, 100);
            }
            
            return [
                'estado_evaluacion' => 'completada',
                'fecha_inicio' => $fechaInicio,
                'fecha_completada' => $fechaCompletada,
                'puntuaciones' => $puntuaciones,
                'puntuacion_total' => $this->faker->numberBetween(75, 95),
                'tiempo_evaluacion_minutos' => $this->faker->numberBetween(45, 120),
            ];
        });
    }

    /**
     * Estado: Evaluación pendiente
     */
    public function pendiente(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'estado_evaluacion' => 'pendiente',
                'fecha_inicio' => null,
                'fecha_completada' => null,
                'puntuaciones' => null,
                'puntuacion_total' => null,
                'tiempo_evaluacion_minutos' => null,
            ];
        });
    }

    /**
     * Estado: Evaluación en progreso
     */
    public function enProgreso(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'estado_evaluacion' => 'en_progreso',
                'fecha_inicio' => $this->faker->dateTimeBetween('-2 days', 'now'),
                'fecha_completada' => null,
                'puntuaciones' => null,
                'puntuacion_total' => null,
                'tiempo_evaluacion_minutos' => null,
            ];
        });
    }

    /**
     * Tipo: Evaluación técnica
     */
    public function tecnica(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'tipo_evaluacion' => 'tecnica',
                'nombre_evaluacion' => 'Evaluación Técnica - ' . $this->faker->words(2, true),
                'criterios_evaluacion' => Evaluacion::getCriteriosPorTipo('tecnica'),
            ];
        });
    }

    /**
     * Tipo: Evaluación de competencias
     */
    public function competencias(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'tipo_evaluacion' => 'competencias',
                'nombre_evaluacion' => 'Evaluación de Competencias - ' . $this->faker->words(2, true),
                'criterios_evaluacion' => Evaluacion::getCriteriosPorTipo('competencias'),
            ];
        });
    }
}
