<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Experiencia
 * Representa una experiencia laboral de un candidato.
 */
class Experiencia extends Model
{
    protected $fillable = [
        'candidato_id',
        'empresa',
        'puesto',
        'fecha_inicio',
        'fecha_fin',
        'descripcion'
    ];

    // Relación muchos a uno con Candidato
    public function candidato()
    {
        return $this->belongsTo(Candidato::class);
    }
}
