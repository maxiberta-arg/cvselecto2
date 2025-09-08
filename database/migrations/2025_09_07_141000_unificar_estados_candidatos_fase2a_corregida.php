<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * FASE 2A - Unificación de Estados de Candidatos (Corregida)
     * 
     * Esta migración normaliza los estados de manera segura:
     * 1. Primero mapea estados legacy a estados válidos actuales
     * 2. Luego actualiza los enums según sea necesario
     */
    public function up(): void
    {
        echo "🔄 Iniciando unificación de estados FASE 2A...\n";
        
        // PASO 1: Expandir ENUM de postulaciones para incluir nuevos estados
        $this->expandirEnumPostulaciones();
        
        // PASO 2: Normalizar estados legacy en postulaciones
        $this->normalizarEstadosPostulaciones();
        
        // PASO 3: Normalizar estados legacy en empresa_candidatos  
        $this->normalizarEstadosPool();
        
        // PASO 4: Crear índices para performance
        $this->crearIndicesEstados();
        
        echo "✅ Unificación de estados completada exitosamente\n";
    }

    /**
     * Expande el ENUM de postulaciones para incluir todos los estados del sistema unificado
     */
    private function expandirEnumPostulaciones(): void
    {
        echo "🔄 Expandiendo ENUM de postulaciones...\n";
        
        // Modificar el ENUM para incluir todos los estados del sistema unificado
        DB::statement("ALTER TABLE postulaciones MODIFY COLUMN estado ENUM(
            'postulado',
            'en_revision', 
            'entrevista',
            'seleccionado',
            'rechazado',
            'en_proceso',
            'contratado',
            'en_pool',
            'activo',
            'descartado',
            'pausado',
            'en proceso'
        ) NOT NULL DEFAULT 'postulado'");
        
        echo "  ✅ ENUM expandido exitosamente\n";
    }

    /**
     * Normaliza estados legacy en tabla postulaciones usando mapeo seguro
     */
    private function normalizarEstadosPostulaciones(): void
    {
        echo "🔄 Normalizando estados en tabla postulaciones...\n";
        
        // Verificar estados actuales antes de mapear
        $estadosActuales = DB::table('postulaciones')
            ->select('estado', DB::raw('COUNT(*) as count'))
            ->groupBy('estado')
            ->get();
            
        echo "Estados encontrados en postulaciones:\n";
        foreach ($estadosActuales as $estado) {
            echo "  - {$estado->estado}: {$estado->count} registros\n";
        }
        
        // Mapeo seguro de estados legacy a estados válidos actuales del enum
        $mapeoEstados = [
            'en proceso' => 'en_revision',    // Mapea a estado válido EN_REVISION
            'en_proceso' => 'en_proceso',     // Ya válido como EN_PROCESO
            'preseleccionado' => 'seleccionado', // Ya válido como SELECCIONADO
            'rechazada' => 'rechazado',       // Normalizar género -> RECHAZADO
            'contratada' => 'contratado',     // Normalizar género -> CONTRATADO
        ];
        
        foreach ($mapeoEstados as $estadoLegacy => $estadoNuevo) {
            $updated = DB::table('postulaciones')
                ->where('estado', $estadoLegacy)
                ->update(['estado' => $estadoNuevo]);
                
            if ($updated > 0) {
                echo "  ✅ Mapeado '$estadoLegacy' -> '$estadoNuevo' ({$updated} registros)\n";
            }
        }
    }

    /**
     * Normaliza estados en tabla empresa_candidatos
     */
    private function normalizarEstadosPool(): void
    {
        echo "🔄 Normalizando estados en tabla empresa_candidatos...\n";
        
        // Verificar si la tabla existe
        if (!Schema::hasTable('empresa_candidatos')) {
            echo "  ⚠️  Tabla empresa_candidatos no existe, saltando...\n";
            return;
        }
        
        // La tabla usa 'estado_interno' en lugar de 'estado'
        if (!Schema::hasColumn('empresa_candidatos', 'estado_interno')) {
            echo "  ⚠️  Columna estado_interno no existe, saltando...\n";
            return;
        }
        
        // Verificar estados actuales
        $estadosActuales = DB::table('empresa_candidatos')
            ->select('estado_interno', DB::raw('COUNT(*) as count'))
            ->groupBy('estado_interno')
            ->get();
            
        echo "Estados encontrados en empresa_candidatos.estado_interno:\n";
        foreach ($estadosActuales as $estado) {
            echo "  - {$estado->estado_interno}: {$estado->count} registros\n";
        }
        
        // Mapeo similar para pool de candidatos usando estados válidos del enum
        $mapeoEstados = [
            'activo' => 'activo',             // Ya válido como ACTIVO
            'inactivo' => 'pausado',          // Mapea a PAUSADO
            'evaluando' => 'en_proceso',      // Mapea a EN_PROCESO
            'preseleccionado' => 'seleccionado', // Mapea a SELECCIONADO
            'disponible' => 'en_pool',        // Mapea a EN_POOL
        ];
        
        foreach ($mapeoEstados as $estadoLegacy => $estadoNuevo) {
            $updated = DB::table('empresa_candidatos')
                ->where('estado_interno', $estadoLegacy)
                ->update(['estado_interno' => $estadoNuevo]);
                
            if ($updated > 0) {
                echo "  ✅ Mapeado '$estadoLegacy' -> '$estadoNuevo' ({$updated} registros)\n";
            }
        }
    }

    /**
     * Crear índices para mejorar performance de consultas por estado
     */
    private function crearIndicesEstados(): void
    {
        echo "🔄 Creando índices para estados...\n";
        
        // Índice en postulaciones.estado si no existe
        if (!$this->indexExists('postulaciones', 'postulaciones_estado_index')) {
            Schema::table('postulaciones', function (Blueprint $table) {
                $table->index('estado', 'postulaciones_estado_index');
            });
            echo "  ✅ Índice creado en postulaciones.estado\n";
        }
        
        // Índice en empresa_candidatos.estado_interno si la tabla existe
        if (Schema::hasTable('empresa_candidatos') && 
            Schema::hasColumn('empresa_candidatos', 'estado_interno') &&
            !$this->indexExists('empresa_candidatos', 'empresa_candidatos_estado_interno_index')) {
            Schema::table('empresa_candidatos', function (Blueprint $table) {
                $table->index('estado_interno', 'empresa_candidatos_estado_interno_index');
            });
            echo "  ✅ Índice creado en empresa_candidatos.estado_interno\n";
        }
    }

    /**
     * Verifica si un índice existe en una tabla
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $indexes = DB::select("SHOW INDEXES FROM {$table}");
        foreach ($indexes as $index) {
            if ($index->Key_name === $indexName) {
                return true;
            }
        }
        return false;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "🔄 Revirtiendo unificación de estados...\n";
        
        // Revertir mapeos de estados usando estados legacy
        DB::table('postulaciones')
            ->where('estado', 'en_revision')
            ->update(['estado' => 'en proceso']);
            
        // Eliminar índices
        if (Schema::hasTable('postulaciones')) {
            Schema::table('postulaciones', function (Blueprint $table) {
                $table->dropIndex('postulaciones_estado_index');
            });
        }
        
        if (Schema::hasTable('empresa_candidatos')) {
            Schema::table('empresa_candidatos', function (Blueprint $table) {
                $table->dropIndex('empresa_candidatos_estado_interno_index');
            });
        }
        
        echo "✅ Rollback completado\n";
    }
};
