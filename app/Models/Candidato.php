<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo Candidato
 * Representa a un candidato en el sistema CVSelecto.
 */
class Candidato extends Model
{
    protected $fillable = [
        'user_id',
        'apellido', 
        'fecha_nacimiento', 
        'telefono', 
        'direccion', 
        'cv_path', 
        'avatar',
        'bio',
        'habilidades',
        'linkedin',
        'experiencia_resumida',
        'educacion_resumida',
        // Nuevos campos para creación manual
        'nivel_educacion',
        'experiencia_anos',
        'disponibilidad',
        'modalidad_preferida',
        'pretension_salarial',
        'linkedin_url',
        'portfolio_url'
    ];

    // Relación uno a uno con User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relación uno a muchos con Educacion
    public function educaciones()
    {
        return $this->hasMany(Educacion::class);
    }

    // Relación uno a muchos con Experiencia
    public function experiencias()
    {
        return $this->hasMany(Experiencia::class);
    }

    // Relación uno a muchos con Postulacion
    public function postulaciones()
    {
        return $this->hasMany(Postulacion::class);
    }
}
