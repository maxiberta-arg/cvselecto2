<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo BusquedaLaboral
 * Representa una búsqueda laboral publicada por una empresa.
 */
class BusquedaLaboral extends Model
{
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
