<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\EstadoCandidato;

/**
 * Modelo Evaluacion
 * 
 * Representa una evaluación detallada de un candidato por parte de una empresa.
 * Extiende la funcionalidad básica de puntuación en EmpresaCandidato
 * proporcionando un sistema de evaluación estructurado y configurable.
 * 
 * @version 1.0.0
 * @since Fase 2A - Punto 3
 */
class Evaluacion extends Model
{
    use HasFactory;

    protected $table = 'evaluaciones';

    protected $fillable = [
        'empresa_candidato_id',
        'evaluador_id',
        'nombre_evaluacion',
        'tipo_evaluacion',
        'criterios_evaluacion',
        'puntuaciones',
        'puntuacion_total',
        'comentarios_generales',
        'recomendaciones',
        'estado_evaluacion',
        'fecha_inicio',
        'fecha_completada',
        'tiempo_evaluacion_minutos',
        'metadatos'
    ];

    protected $casts = [
        'criterios_evaluacion' => 'array',
        'puntuaciones' => 'array',
        'metadatos' => 'array',
        'fecha_inicio' => 'datetime',
        'fecha_completada' => 'datetime',
        'puntuacion_total' => 'decimal:2'
    ];

    // Estados posibles de una evaluación
    public const ESTADOS_EVALUACION = [
        'pendiente' => 'Pendiente',
        'en_progreso' => 'En Progreso', 
        'completada' => 'Completada',
        'revisada' => 'Revisada',
        'aprobada' => 'Aprobada',
        'rechazada' => 'Rechazada'
    ];

    // Tipos de evaluación disponibles
    public const TIPOS_EVALUACION = [
        'tecnica' => 'Evaluación Técnica',
        'competencias' => 'Evaluación de Competencias',
        'cultural' => 'Evaluación Cultural/Fit',
        'entrevista' => 'Evaluación de Entrevista',
        'integral' => 'Evaluación Integral',
        'personalizada' => 'Evaluación Personalizada'
    ];

    // Criterios de evaluación predefinidos por tipo
    public const CRITERIOS_PREDEFINIDOS = [
        'tecnica' => [
            'conocimientos_tecnicos' => ['peso' => 40, 'descripcion' => 'Conocimientos técnicos específicos'],
            'experiencia_practica' => ['peso' => 30, 'descripcion' => 'Experiencia práctica aplicada'],
            'capacidad_resolucion' => ['peso' => 20, 'descripcion' => 'Capacidad de resolución de problemas'],
            'actualizacion_tecnologica' => ['peso' => 10, 'descripcion' => 'Actualización tecnológica']
        ],
        'competencias' => [
            'comunicacion' => ['peso' => 25, 'descripcion' => 'Habilidades de comunicación'],
            'liderazgo' => ['peso' => 20, 'descripcion' => 'Capacidad de liderazgo'],
            'trabajo_equipo' => ['peso' => 25, 'descripcion' => 'Trabajo en equipo'],
            'adaptabilidad' => ['peso' => 15, 'descripcion' => 'Capacidad de adaptación'],
            'proactividad' => ['peso' => 15, 'descripcion' => 'Iniciativa y proactividad']
        ],
        'cultural' => [
            'valores_empresa' => ['peso' => 35, 'descripcion' => 'Alineación con valores empresariales'],
            'cultura_organizacional' => ['peso' => 30, 'descripcion' => 'Fit cultural organizacional'],
            'motivacion' => ['peso' => 20, 'descripcion' => 'Motivación y compromiso'],
            'crecimiento_profesional' => ['peso' => 15, 'descripcion' => 'Potencial de crecimiento']
        ]
    ];

    /**
     * Relación con EmpresaCandidato
     */
    public function empresaCandidato()
    {
        return $this->belongsTo(EmpresaCandidato::class);
    }

    /**
     * Relación con User (evaluador)
     */
    public function evaluador()
    {
        return $this->belongsTo(User::class, 'evaluador_id');
    }

    /**
     * Relación con Candidato a través de EmpresaCandidato
     */
    public function candidato()
    {
        return $this->hasOneThrough(
            Candidato::class,
            EmpresaCandidato::class,
            'id',
            'id',
            'empresa_candidato_id',
            'candidato_id'
        );
    }

    /**
     * Relación con Empresa a través de EmpresaCandidato
     */
    public function empresa()
    {
        return $this->hasOneThrough(
            Empresa::class,
            EmpresaCandidato::class,
            'id',
            'id',
            'empresa_candidato_id',
            'empresa_id'
        );
    }

    /**
     * Scope para evaluaciones completadas
     */
    public function scopeCompletadas($query)
    {
        return $query->where('estado_evaluacion', 'completada');
    }

    /**
     * Scope para evaluaciones pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('estado_evaluacion', 'pendiente');
    }

    /**
     * Scope para evaluaciones por tipo
     */
    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo_evaluacion', $tipo);
    }

    /**
     * Calcular puntuación total basada en criterios y pesos
     */
    public function calcularPuntuacionTotal()
    {
        if (empty($this->criterios_evaluacion) || empty($this->puntuaciones)) {
            return 0;
        }

        $puntuacionTotal = 0;
        $pesoTotal = 0;

        foreach ($this->criterios_evaluacion as $criterio => $config) {
            $peso = $config['peso'] ?? 0;
            $puntuacion = $this->puntuaciones[$criterio] ?? 0;
            
            $puntuacionTotal += ($puntuacion * $peso / 100);
            $pesoTotal += $peso;
        }

        return $pesoTotal > 0 ? round($puntuacionTotal, 2) : 0;
    }

    /**
     * Obtener criterios predefinidos por tipo
     */
    public static function getCriteriosPorTipo($tipo)
    {
        return self::CRITERIOS_PREDEFINIDOS[$tipo] ?? [];
    }

    /**
     * Verificar si la evaluación está completa
     */
    public function estaCompleta()
    {
        return $this->estado_evaluacion === 'completada' && 
               !empty($this->puntuaciones) && 
               $this->fecha_completada !== null;
    }

    /**
     * Marcar evaluación como completada
     */
    public function marcarComoCompletada()
    {
        $this->update([
            'estado_evaluacion' => 'completada',
            'fecha_completada' => now(),
            'puntuacion_total' => $this->calcularPuntuacionTotal(),
            'tiempo_evaluacion_minutos' => $this->fecha_inicio ? 
                now()->diffInMinutes($this->fecha_inicio) : null
        ]);
    }

    /**
     * Obtener resumen de la evaluación
     */
    public function getResumenAttribute()
    {
        return [
            'puntuacion_total' => $this->puntuacion_total,
            'estado' => $this->estado_evaluacion,
            'tipo' => $this->tipo_evaluacion,
            'completada' => $this->estaCompleta(),
            'criterios_evaluados' => count($this->puntuaciones ?? []),
            'tiempo_evaluacion' => $this->tiempo_evaluacion_minutos
        ];
    }
}
