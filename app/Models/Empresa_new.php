<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

/**
 * Modelo Empresa
 * Representa una empresa en el sistema CVSelecto.
 */
class Empresa extends Model
{
    /**
     * Atributos que se pueden asignar masivamente
     */
    protected $fillable = [
        'user_id',
        'razon_social',
        'cuit',
        'telefono',
        'direccion',
        'descripcion',
        'logo_path',
        'sitio_web',
        'linkedin_url',
        'estado_verificacion',
        'sector',
        'tamaño_empresa',
        'año_fundacion',
        'email_contacto',
        'persona_contacto',
        'verificada_at',
        'notas_verificacion'
    ];

    /**
     * Atributos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'verificada' => 'boolean',
        'verificada_at' => 'datetime',
        'año_fundacion' => 'integer',
        'tamaño_empresa' => 'integer'
    ];

    /**
     * Accessor para logo_path - construye URL completa
     */
    protected function logoPath(): Attribute
    {
        return Attribute::make(
            get: fn (string $value = null) => $value ? 
                (str_starts_with($value, 'http') ? $value : url($value)) : 
                null,
        );
    }

    /**
     * Scope para empresas verificadas
     */
    public function scopeVerificadas($query)
    {
        return $query->where('estado_verificacion', 'verificada');
    }

    /**
     * Scope para empresas pendientes de verificación
     */
    public function scopePendientes($query)
    {
        return $query->where('estado_verificacion', 'pendiente');
    }

    /**
     * Verifica si la empresa está verificada
     */
    public function estaVerificada(): bool
    {
        return $this->estado_verificacion === 'verificada';
    }

    /**
     * Verifica si la empresa puede publicar ofertas
     */
    public function puedePublicarOfertas(): bool
    {
        return in_array($this->estado_verificacion, ['verificada']);
    }

    /**
     * Verifica si la empresa puede acceder al sistema pero con limitaciones
     */
    public function tieneAccesoLimitado(): bool
    {
        return in_array($this->estado_verificacion, ['pendiente', 'suspendida']);
    }

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
