<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Postulacion
 * Representa la postulación de un candidato a una búsqueda laboral.
 */
class Postulacion extends Model
{
    // Relación muchos a uno con BusquedaLaboral
    public function busquedaLaboral()
    {
        return $this->belongsTo(BusquedaLaboral::class, 'busqueda_id');
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
