<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Empresa
 * Representa una empresa en el sistema CVSelecto.
 */
class Empresa extends Model
{
    // Relación uno a uno con User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación uno a muchos con BusquedaLaboral
    public function busquedasLaborales()
    {
        return $this->hasMany(BusquedaLaboral::class, 'empresa_id');
    }
}
