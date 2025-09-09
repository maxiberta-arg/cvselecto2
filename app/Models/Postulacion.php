<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Postulacion
 * Representa la postulación de un candidato a una búsqueda laboral.
 */
class Postulacion extends Model
{
    // Especificar el nombre correcto de la tabla
    protected $table = 'postulaciones';

    // Campos que se pueden llenar masivamente
    protected $fillable = [
        'busqueda_id',
        'candidato_id',
        'estado',
        'fecha_postulacion',
        'notas_empresa',
        'puntuacion'
    ];

    // Relación muchos a uno con BusquedaLaboral
    public function busquedaLaboral()
    {
        return $this->belongsTo(BusquedaLaboral::class, 'busqueda_id');
    }

    // También crear un alias para mantener compatibilidad
    public function busqueda()
    {
        return $this->busquedaLaboral();
    }

    // Relación muchos a uno con Candidato
    public function candidato()
    {
        return $this->belongsTo(Candidato::class);
    }

    // Relación uno a muchos con Entrevista
    public function entrevistas()
    {
        return $this->hasMany(Entrevista::class);
    }

    /**
     * INTEGRACIÓN: Obtener o crear la relación EmpresaCandidato
     * Esta función conecta las postulaciones con el sistema de evaluaciones
     */
    public function obtenerOCrearEmpresaCandidato()
    {
        // Obtener la empresa a través de la búsqueda laboral
        $empresa = $this->busquedaLaboral->empresa;
        
        // Buscar o crear la relación empresa-candidato
        $empresaCandidato = EmpresaCandidato::firstOrCreate(
            [
                'empresa_id' => $empresa->id,
                'candidato_id' => $this->candidato_id
            ],
            [
                'origen' => 'postulacion',
                'estado_interno' => $this->mapearEstadoAEmpresaCandidato($this->estado),
                'fecha_incorporacion' => $this->fecha_postulacion ?? now(),
                'notas_privadas' => $this->notas_empresa,
                'puntuacion_empresa' => $this->puntuacion,
            ]
        );

        return $empresaCandidato;
    }

    /**
     * INTEGRACIÓN: Mapear estados de postulación a estados de EmpresaCandidato
     */
    private function mapearEstadoAEmpresaCandidato($estadoPostulacion)
    {
        $mapeo = [
            'postulado' => 'activo',
            'en_revision' => 'en_proceso', 
            'seleccionado' => 'activo',
            'rechazado' => 'descartado',
            'contratado' => 'contratado',
            'entrevista' => 'en_proceso'
        ];

        return $mapeo[$estadoPostulacion] ?? 'activo';
    }

    /**
     * INTEGRACIÓN: Verificar si puede generar evaluación
     */
    public function puedeGenerarEvaluacion()
    {
        return in_array($this->estado, ['seleccionado', 'en_revision', 'entrevista']);
    }

    /**
     * INTEGRACIÓN: Crear evaluación automáticamente cuando es necesario
     */
    public function generarEvaluacionSiProcede()
    {
        if (!$this->puedeGenerarEvaluacion()) {
            return null;
        }

        $empresaCandidato = $this->obtenerOCrearEmpresaCandidato();
        
        // Verificar si ya tiene una evaluación pendiente o en progreso
        $evaluacionExistente = $empresaCandidato->evaluaciones()
            ->whereIn('estado_evaluacion', ['pendiente', 'en_progreso'])
            ->first();

        if ($evaluacionExistente) {
            return $evaluacionExistente;
        }

        // Crear nueva evaluación
        $evaluacion = $empresaCandidato->evaluaciones()->create([
            'evaluador_id' => $this->busquedaLaboral->empresa->user_id,
            'nombre_evaluacion' => "Evaluación para {$this->busquedaLaboral->titulo}",
            'tipo_evaluacion' => 'integral',
            'criterios_evaluacion' => [
                'experiencia_tecnica' => ['peso' => 30, 'descripcion' => 'Conocimientos técnicos requeridos'],
                'comunicacion' => ['peso' => 20, 'descripcion' => 'Habilidades de comunicación'],
                'fit_cultural' => ['peso' => 25, 'descripcion' => 'Ajuste con la cultura empresarial'],
                'motivacion' => ['peso' => 25, 'descripcion' => 'Motivación e interés en el puesto']
            ],
            'estado_evaluacion' => 'pendiente',
            'metadatos' => [
                'origen' => 'postulacion',
                'postulacion_id' => $this->id,
                'busqueda_titulo' => $this->busquedaLaboral->titulo
            ]
        ]);

        return $evaluacion;
    }

    /**
     * INTEGRACIÓN: Relación con EmpresaCandidato a través de la empresa y candidato
     */
    public function empresaCandidato()
    {
        return $this->hasOneThrough(
            EmpresaCandidato::class,
            BusquedaLaboral::class,
            'id', // Foreign key en BusquedaLaboral
            'empresa_id', // Foreign key en EmpresaCandidato  
            'busqueda_id', // Local key en Postulacion
            'empresa_id' // Local key en BusquedaLaboral
        )->where('empresa_candidatos.candidato_id', $this->candidato_id);
    }

    /**
     * INTEGRACIÓN: Obtener evaluaciones relacionadas con esta postulación
     */
    public function evaluaciones()
    {
        $empresaCandidato = $this->obtenerOCrearEmpresaCandidato();
        return $empresaCandidato->evaluaciones();
    }
}
