<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Educacion
 * Representa un registro educativo de un candidato.
 */
class Educacion extends Model
{
    // Especificar el nombre correcto de la tabla
    protected $table = 'educaciones';

    // Relación muchos a uno con Candidato
    public function candidato()
    {
        return $this->belongsTo(Candidato::class);
    }
}
