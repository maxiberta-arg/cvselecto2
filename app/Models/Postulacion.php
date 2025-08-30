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
}
