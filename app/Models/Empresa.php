<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Rules\CuitArgentino;

/**
 * Modelo Empresa
 * Representa una empresa en el sistema CVSelecto.
 */
class Empresa extends Model
{
    use HasFactory;

    /**
     * Campos asignables en masa
     */
    protected $fillable = [
        'user_id',
        'razon_social',
        'cuit',
        'telefono',
        'direccion',
        'verificada', // Mantener por compatibilidad
        'descripcion',
        'logo_path',
        'sitio_web',
        'linkedin_url',
        'estado_verificacion',
        'fecha_verificacion',
        'notas_verificacion',
        'sector',
        'empleados_cantidad'
    ];

    /**
     * Campos que deben ser tratados como fechas
     */
    protected $casts = [
        'verificada' => 'boolean',
        'fecha_verificacion' => 'datetime',
        'empleados_cantidad' => 'integer'
    ];

    /**
     * Relación uno a uno con User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relación uno a muchos con BusquedaLaboral
     */
    public function busquedasLaborales()
    {
        return $this->hasMany(BusquedaLaboral::class, 'empresa_id');
    }

    /**
     * Accessor: URL completa del logo
     */
    public function getLogoUrlAttribute()
    {
        if (!$this->logo_path) {
            return null;
        }
        
        return str_starts_with($this->logo_path, 'http') 
            ? $this->logo_path 
            : url($this->logo_path);
    }

    /**
     * Accessor: Verificar si empresa está verificada
     */
    public function getEsVerificadaAttribute()
    {
        return $this->estado_verificacion === 'verificada' || $this->verificada === true;
    }

    /**
     * Accessor: Puede publicar ofertas
     */
    public function getPuedePublicarAttribute()
    {
        return $this->es_verificada;
    }

    /**
     * Accessor: Estado para mostrar en UI
     */
    public function getEstadoDisplayAttribute()
    {
        return match($this->estado_verificacion) {
            'pendiente' => 'Verificación Pendiente',
            'verificada' => 'Empresa Verificada',
            'rechazada' => 'Verificación Rechazada',
            default => 'No Verificada'
        };
    }

    /**
     * Mutator: Formatear CUIT al guardarlo
     */
    public function setCuitAttribute($value)
    {
        // Guardar solo números
        $this->attributes['cuit'] = preg_replace('/[^0-9]/', '', $value);
    }

    /**
     * Accessor: Mostrar CUIT formateado
     */
    public function getCuitFormateadoAttribute()
    {
        return CuitArgentino::formatCuit($this->cuit);
    }

    /**
     * Scope: Solo empresas verificadas
     */
    public function scopeVerificadas($query)
    {
        return $query->where('estado_verificacion', 'verificada')
                    ->orWhere('verificada', true);
    }

    /**
     * Scope: Empresas pendientes de verificación
     */
    public function scopePendientesVerificacion($query)
    {
        return $query->where('estado_verificacion', 'pendiente');
    }
}
