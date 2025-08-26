<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Modelo User
 * Representa a un usuario del sistema (candidato, empresa o admin).
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        // Se pueden agregar más campos según necesidades
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relación uno a uno con Candidato
    public function candidato()
    {
        return $this->hasOne(Candidato::class);
    }

    // Relación uno a uno con Empresa
    public function empresa()
    {
        return $this->hasOne(Empresa::class);
    }
}
