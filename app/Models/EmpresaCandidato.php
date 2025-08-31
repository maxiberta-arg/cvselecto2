<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

/**
 * Modelo EmpresaCandidato
 * Representa la relación many-to-many entre empresas y candidatos
 * con datos adicionales específicos del pool empresarial
 */
class EmpresaCandidato extends Model
{
    use HasFactory;
    
    protected $table = 'empresa_candidatos';

    protected $fillable = [
        'empresa_id',
        'candidato_id',
        'origen',
        'estado_interno',
        'tags',
        'puntuacion_empresa',
        'notas_privadas',
        'fecha_incorporacion',
        'ultimo_contacto',
        'historial_estados'
    ];

    protected $casts = [
        'tags' => 'array',
        'historial_estados' => 'array',
        'fecha_incorporacion' => 'datetime',
        'ultimo_contacto' => 'datetime',
        'puntuacion_empresa' => 'decimal:1'
    ];

    // Estados internos válidos
    public const ESTADOS_INTERNOS = [
        'activo' => 'Activo',
        'en_proceso' => 'En Proceso',
        'contratado' => 'Contratado',
        'descartado' => 'Descartado',
        'pausado' => 'Pausado'
    ];

    // Orígenes válidos
    public const ORIGENES = [
        'postulacion' => 'Postulación',
        'manual' => 'Carga Manual',
        'importacion' => 'Importación',
        'referido' => 'Referido'
    ];

    // Relación con Empresa
    public function empresa()
    {
        return $this->belongsTo(Empresa::class);
    }

    // Relación con Candidato
    public function candidato()
    {
        return $this->belongsTo(Candidato::class);
    }

    // Scopes para filtrado
    public function scopeActivos($query)
    {
        return $query->where('estado_interno', 'activo');
    }

    public function scopePorOrigen($query, $origen)
    {
        return $query->where('origen', $origen);
    }

    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado_interno', $estado);
    }

    public function scopeConPuntuacion($query, $minima = null, $maxima = null)
    {
        $query = $query->whereNotNull('puntuacion_empresa');
        
        if ($minima !== null) {
            $query = $query->where('puntuacion_empresa', '>=', $minima);
        }
        
        if ($maxima !== null) {
            $query = $query->where('puntuacion_empresa', '<=', $maxima);
        }
        
        return $query;
    }

    // Métodos de utilidad
    public function agregarTag($tag)
    {
        $tags = $this->tags ?? [];
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $this->tags = $tags;
            $this->save();
        }
    }

    public function quitarTag($tag)
    {
        $tags = $this->tags ?? [];
        $tags = array_filter($tags, function($t) use ($tag) {
            return $t !== $tag;
        });
        $this->tags = array_values($tags);
        $this->save();
    }

    public function cambiarEstado($nuevoEstado, $observaciones = null)
    {
        $estadoAnterior = $this->estado_interno;
        
        // Validar que el estado es válido
        if (!array_key_exists($nuevoEstado, self::ESTADOS_INTERNOS)) {
            throw new \InvalidArgumentException("Estado interno no válido: $nuevoEstado");
        }

        $this->estado_interno = $nuevoEstado;
        
        // Actualizar historial
        $historial = $this->historial_estados ?? [];
        $historial[] = [
            'estado_anterior' => $estadoAnterior,
            'estado_nuevo' => $nuevoEstado,
            'fecha' => now()->toISOString(),
            'observaciones' => $observaciones
        ];
        $this->historial_estados = $historial;
        
        $this->save();
    }

    public function actualizarContacto()
    {
        $this->ultimo_contacto = now();
        $this->save();
    }

    // Getter para estado formateado
    public function getEstadoFormateadoAttribute()
    {
        return self::ESTADOS_INTERNOS[$this->estado_interno] ?? $this->estado_interno;
    }

    // Getter para origen formateado
    public function getOrigenFormateadoAttribute()
    {
        return self::ORIGENES[$this->origen] ?? $this->origen;
    }
}