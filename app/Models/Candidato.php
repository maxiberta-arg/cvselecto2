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
        'nombre',
        'apellido',
        'email',
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

    // Relación many-to-many con Empresas a través de EmpresaCandidato
    public function empresas()
    {
        return $this->belongsToMany(Empresa::class, 'empresa_candidatos')
                    ->withPivot([
                        'origen',
                        'estado_interno', 
                        'tags',
                        'puntuacion_empresa',
                        'notas_privadas',
                        'fecha_incorporacion',
                        'ultimo_contacto',
                        'historial_estados'
                    ])
                    ->withTimestamps();
    }

    // Relación directa con tabla pivot
    public function empresaCandidatos()
    {
        return $this->hasMany(EmpresaCandidato::class);
    }

    // Método de utilidad para verificar si está en el pool de una empresa
    public function estaEnPoolDe(Empresa $empresa)
    {
        return $this->empresas()->where('empresa_id', $empresa->id)->exists();
    }

    // Obtener datos del pool para una empresa específica
    public function datosPoolPara(Empresa $empresa)
    {
        return $this->empresas()
                    ->where('empresa_id', $empresa->id)
                    ->first()
                    ->pivot ?? null;
    }
}
