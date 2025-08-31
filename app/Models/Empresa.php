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

    // Relación many-to-many con Candidatos a través de EmpresaCandidato
    public function candidatos()
    {
        return $this->belongsToMany(Candidato::class, 'empresa_candidatos')
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

    // Relación directa con tabla pivot para queries más complejas
    public function empresaCandidatos()
    {
        return $this->hasMany(EmpresaCandidato::class);
    }

    // Scopes para candidatos con filtros específicos
    public function candidatosActivos()
    {
        return $this->candidatos()->wherePivot('estado_interno', 'activo');
    }

    public function candidatosPorOrigen($origen)
    {
        return $this->candidatos()->wherePivot('origen', $origen);
    }

    // Métodos de utilidad para el pool de candidatos
    public function agregarCandidatoAlPool(Candidato $candidato, array $datosPool = [])
    {
        // Verificar si ya existe la relación
        $existeRelacion = $this->candidatos()->where('candidato_id', $candidato->id)->exists();
        
        if ($existeRelacion) {
            throw new \Exception('El candidato ya está en el pool de esta empresa');
        }

        // Datos por defecto
        $datosDefecto = [
            'origen' => 'manual',
            'estado_interno' => 'activo',
            'fecha_incorporacion' => now(),
            'tags' => [],
            'historial_estados' => []
        ];

        $datosFinales = array_merge($datosDefecto, $datosPool);

        return $this->candidatos()->attach($candidato->id, $datosFinales);
    }

    public function quitarCandidatoDelPool(Candidato $candidato)
    {
        return $this->candidatos()->detach($candidato->id);
    }

    // Estadísticas del pool
    public function estadisticasPool()
    {
        return $this->empresaCandidatos()
                    ->selectRaw('
                        COUNT(*) as total_candidatos,
                        COUNT(CASE WHEN estado_interno = "activo" THEN 1 END) as activos,
                        COUNT(CASE WHEN estado_interno = "en_proceso" THEN 1 END) as en_proceso,
                        COUNT(CASE WHEN estado_interno = "contratado" THEN 1 END) as contratados,
                        COUNT(CASE WHEN estado_interno = "descartado" THEN 1 END) as descartados,
                        COUNT(CASE WHEN origen = "postulacion" THEN 1 END) as de_postulaciones,
                        COUNT(CASE WHEN origen = "manual" THEN 1 END) as manuales,
                        AVG(puntuacion_empresa) as promedio_puntuacion,
                        COUNT(CASE WHEN puntuacion_empresa IS NOT NULL THEN 1 END) as calificados
                    ')
                    ->first();
    }
}
