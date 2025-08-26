<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Entrevista
 * Representa una entrevista asociada a una postulación.
 */
class Entrevista extends Model
{
    // Relación muchos a uno con Postulacion
    public function postulacion()
    {
        return $this->belongsTo(Postulacion::class);
    }
}
