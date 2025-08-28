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
        'estado',
        'fecha_publicacion',
        'fecha_cierre'
    ];

    // Casting de fechas
    protected $casts = [
        'fecha_publicacion' => 'date',
        'fecha_cierre' => 'date',
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
