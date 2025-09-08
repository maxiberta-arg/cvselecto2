<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Resource para la entidad Evaluacion
 * 
 * Transforma el modelo de evaluación en una respuesta JSON
 * estructurada para la API.
 */
class EvaluacionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nombre_evaluacion' => $this->nombre_evaluacion,
            'tipo_evaluacion' => $this->tipo_evaluacion,
            'tipo_evaluacion_label' => $this->getTipoEvaluacionLabelAttribute(),
            'estado_evaluacion' => $this->estado_evaluacion,
            'estado_evaluacion_label' => $this->getEstadoEvaluacionLabelAttribute(),
            
            // Información del candidato
            'candidato' => [
                'id' => $this->empresaCandidato->candidato->id,
                'nombre' => $this->empresaCandidato->candidato->nombre,
                'apellido' => $this->empresaCandidato->candidato->apellido,
                'email' => $this->empresaCandidato->candidato->email,
                'telefono' => $this->empresaCandidato->candidato->telefono,
                'experiencia_anos' => $this->empresaCandidato->candidato->experiencia_anos,
            ],

            // Información de la relación empresa-candidato
            'empresa_candidato' => [
                'id' => $this->empresaCandidato->id,
                'estado' => $this->empresaCandidato->estado,
                'puntuacion_cv' => $this->empresaCandidato->puntuacion_cv,
                'fecha_postulacion' => $this->empresaCandidato->created_at?->format('d/m/Y H:i'),
            ],

            // Criterios y puntuaciones
            'criterios_evaluacion' => $this->criterios_evaluacion,
            'puntuaciones' => $this->puntuaciones,
            'puntuacion_total' => $this->puntuacion_total,
            'puntuacion_final' => $this->when(
                $this->estado_evaluacion === 'completada',
                $this->puntuacion_total
            ),

            // Comentarios y feedback
            'comentarios_generales' => $this->comentarios_generales,
            'recomendaciones' => $this->recomendaciones,
            
            // Metadatos adicionales
            'metadatos' => $this->metadatos,
            
            // Información temporal
            'fecha_creacion' => $this->created_at?->format('d/m/Y H:i'),
            'fecha_actualizacion' => $this->updated_at?->format('d/m/Y H:i'),
            'fecha_completada' => $this->when(
                $this->estado_evaluacion === 'completada',
                $this->updated_at?->format('d/m/Y H:i')
            ),

            // Estado de progreso
            'progreso' => $this->calcularProgreso(),
            'completada' => $this->estado_evaluacion === 'completada',
            'en_progreso' => $this->estado_evaluacion === 'en_progreso',
            'pendiente' => $this->estado_evaluacion === 'pendiente',

            // Información de contexto (solo si se solicita)
            'empresa' => $this->whenLoaded('empresaCandidato.empresa', function () {
                return [
                    'id' => $this->empresaCandidato->empresa->id,
                    'nombre' => $this->empresaCandidato->empresa->nombre,
                ];
            }),

            // Estadísticas de la evaluación (solo si se calcula)
            'estadisticas' => $this->when(
                isset($this->estadisticas),
                $this->estadisticas
            ),
        ];
    }

    /**
     * Calcula el progreso de la evaluación
     */
    private function calcularProgreso(): array
    {
        if (!$this->criterios_evaluacion || !$this->puntuaciones) {
            return [
                'porcentaje' => 0,
                'criterios_completados' => 0,
                'total_criterios' => count($this->criterios_evaluacion ?? []),
                'pendientes' => count($this->criterios_evaluacion ?? [])
            ];
        }

        $totalCriterios = count($this->criterios_evaluacion);
        $criteriosCompletados = count(array_filter($this->puntuaciones, function($puntuacion) {
            return $puntuacion !== null && $puntuacion >= 0;
        }));

        $porcentaje = $totalCriterios > 0 ? round(($criteriosCompletados / $totalCriterios) * 100, 1) : 0;

        return [
            'porcentaje' => $porcentaje,
            'criterios_completados' => $criteriosCompletados,
            'total_criterios' => $totalCriterios,
            'pendientes' => $totalCriterios - $criteriosCompletados
        ];
    }

    /**
     * Get additional data that should be returned with the resource array.
     */
    public function with(Request $request): array
    {
        return [
            'meta' => [
                'version' => '1.0',
                'timestamp' => now()->toISOString(),
            ]
        ];
    }

    /**
     * Customize the outgoing response for the resource.
     */
    public function withResponse(Request $request, $response): void
    {
        $response->header('X-Resource-Type', 'Evaluacion');
    }
}
