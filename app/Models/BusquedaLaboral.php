<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo BusquedaLaboral
 * Representa una búsqueda laboral publicada por una empresa.
 */
class BusquedaLaboral extends Model
{
    // Especificar el nombre correcto de la tabla
    protected $table = 'busquedas_laborales';

    // Campos que pueden ser asignados masivamente
    protected $fillable = [
        'empresa_id',
        'titulo',
        'descripcion',
        'requisitos',
        'beneficios',
        'salario_min',
        'salario_max',
        'moneda',
        'modalidad',
        'ubicacion',
        'experiencia_requerida',
        'nivel_educativo',
        'idiomas',
        'tipo_contrato',
        'jornada_laboral',
        'estado',
        'fecha_publicacion',
        'fecha_cierre'
    ];

    // Casting de fechas
    protected $casts = [
        'fecha_publicacion' => 'date',
        'fecha_cierre' => 'date',
        'salario_min' => 'decimal:2',
        'salario_max' => 'decimal:2',
        'experiencia_requerida' => 'integer'
    ];

    // Relación muchos a uno con Empresa
    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    // Relación uno a muchos con Postulacion
    public function postulaciones()
    {
        return $this->hasMany(Postulacion::class, 'busqueda_id');
    }
}
