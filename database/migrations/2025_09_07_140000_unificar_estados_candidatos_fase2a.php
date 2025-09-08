<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Enums\EstadoCandidato;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * FASE 2A - Unificación de Estados de Candidatos
     * 
     * Esta migración normaliza los estados inconsistentes entre
     * las tablas 'postulaciones' y 'empresa_candidatos', aplicando
     * el nuevo sistema unificado de estados definido en EstadoCandidato enum.
     */
    public function up(): void
    {
        // PASO 1: Normalizar estados en tabla postulaciones
        $this->normalizarEstadosPostulaciones();
        
        // PASO 2: Actualizar enum en tabla postulaciones
        $this->actualizarEnumPostulaciones();
        
        // PASO 3: Normalizar estados en tabla empresa_candidatos
        $this->normalizarEstadosPool();
        
        // PASO 4: Actualizar enum en tabla empresa_candidatos
        $this->actualizarEnumPool();
        
        // PASO 5: Crear índices para performance
        $this->crearIndicesEstados();
    }

    /**
     * Normaliza estados legacy en tabla postulaciones
     */
    private function normalizarEstadosPostulaciones(): void
    {
        echo "🔄 Normalizando estados en tabla postulaciones...\n";
        
        // Mapear 'en proceso' -> 'en_revision' para consistencia
        DB::table('postulaciones')
            ->where('estado', 'en proceso')
            ->update(['estado' => 'en_revision']);
            
        echo "✅ Estados en postulaciones normalizados\n";
    }
    
    /**
     * Actualiza el enum de la tabla postulaciones
     */
    private function actualizarEnumPostulaciones(): void
    {
        echo "🔄 Actualizando enum en tabla postulaciones...\n";
        
        // Obtener estados válidos para postulaciones
        $estadosPostulacion = "'" . implode("','", EstadoCandidato::postulacionValues()) . "'";
        
        // Modificar columna estado en postulaciones
        DB::statement("ALTER TABLE postulaciones 
                      MODIFY COLUMN estado ENUM({$estadosPostulacion}) 
                      NOT NULL DEFAULT 'postulado'");
                      
        echo "✅ Enum de postulaciones actualizado\n";
    }
    
    /**
     * Normaliza estados en tabla empresa_candidatos
     */
    private function normalizarEstadosPool(): void
    {
        echo "🔄 Normalizando estados en tabla empresa_candidatos...\n";
        
        // No hay cambios necesarios aquí ya que los estados ya usan underscore
        // Pero verificamos consistencia
        $estadosInconsistentes = DB::table('empresa_candidatos')
            ->whereNotIn('estado_interno', EstadoCandidato::poolValues())
            ->count();
            
        if ($estadosInconsistentes > 0) {
            echo "⚠️  Encontrados {$estadosInconsistentes} estados inconsistentes en pool\n";
            
            // Mapear cualquier estado inconsistente a 'activo'
            DB::table('empresa_candidatos')
                ->whereNotIn('estado_interno', EstadoCandidato::poolValues())
                ->update(['estado_interno' => 'activo']);
        }
        
        echo "✅ Estados en pool normalizados\n";
    }
    
    /**
     * Actualiza el enum de la tabla empresa_candidatos
     */
    private function actualizarEnumPool(): void
    {
        echo "🔄 Actualizando enum en tabla empresa_candidatos...\n";
        
        // Obtener estados válidos para pool
        $estadosPool = "'" . implode("','", EstadoCandidato::poolValues()) . "'";
        
        // Modificar columna estado_interno en empresa_candidatos
        DB::statement("ALTER TABLE empresa_candidatos 
                      MODIFY COLUMN estado_interno ENUM({$estadosPool}) 
                      NOT NULL DEFAULT 'activo'");
                      
        echo "✅ Enum de pool actualizado\n";
    }
    
    /**
     * Crear índices adicionales para performance
     */
    private function crearIndicesEstados(): void
    {
        echo "🔄 Creando índices de performance...\n";
        
        Schema::table('postulaciones', function (Blueprint $table) {
            // Índice compuesto para búsquedas frecuentes
            if (!$this->indexExists('postulaciones', 'idx_postulaciones_estado_fecha')) {
                $table->index(['estado', 'fecha_postulacion'], 'idx_postulaciones_estado_fecha');
            }
        });
        
        Schema::table('empresa_candidatos', function (Blueprint $table) {
            // Índice compuesto para filtros de pool
            if (!$this->indexExists('empresa_candidatos', 'idx_pool_empresa_estado_fecha')) {
                $table->index(['empresa_id', 'estado_interno', 'fecha_incorporacion'], 'idx_pool_empresa_estado_fecha');
            }
        });
        
        echo "✅ Índices de performance creados\n";
    }
    
    /**
     * Verifica si un índice existe
     */
    private function indexExists(string $table, string $indexName): bool
    {
        $indexes = DB::select("SHOW INDEX FROM {$table} WHERE Key_name = ?", [$indexName]);
        return count($indexes) > 0;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        echo "🔄 Revirtiendo unificación de estados...\n";
        
        // Revertir enum de postulaciones al estado original
        DB::statement("ALTER TABLE postulaciones 
                      MODIFY COLUMN estado ENUM('postulado','en proceso','rechazado','seleccionado') 
                      NOT NULL DEFAULT 'postulado'");
        
        // Revertir 'en_revision' -> 'en proceso'
        DB::table('postulaciones')
            ->where('estado', 'en_revision')
            ->update(['estado' => 'en proceso']);
            
        // Revertir enum de pool al estado original
        DB::statement("ALTER TABLE empresa_candidatos 
                      MODIFY COLUMN estado_interno ENUM('activo','en_proceso','contratado','descartado','pausado') 
                      NOT NULL DEFAULT 'activo'");
        
        // Eliminar índices creados
        Schema::table('postulaciones', function (Blueprint $table) {
            $table->dropIndex('idx_postulaciones_estado_fecha');
        });
        
        Schema::table('empresa_candidatos', function (Blueprint $table) {
            $table->dropIndex('idx_pool_empresa_estado_fecha');
        });
        
        echo "✅ Reversión completada\n";
    }
};
