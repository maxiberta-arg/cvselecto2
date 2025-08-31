<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Agregar índices para optimizar performance en consultas frecuentes
     */
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            // Índice para estado de verificación (consultas frecuentes)
            $table->index('estado_verificacion', 'idx_empresas_estado_verificacion');
            
            // Índice para sector (filtros)
            $table->index('sector', 'idx_empresas_sector');
            
            // Índice compuesto para búsquedas por estado y fecha
            $table->index(['estado_verificacion', 'created_at'], 'idx_empresas_estado_fecha');
        });

        Schema::table('busquedas_laborales', function (Blueprint $table) {
            // Índice para empresa_id y estado (consultas más frecuentes)
            $table->index(['empresa_id', 'estado'], 'idx_busquedas_empresa_estado');
            
            // Índice para estado (filtros globales)
            $table->index('estado', 'idx_busquedas_estado');
            
            // Índice para fechas de publicación (ordenamiento)
            $table->index('fecha_publicacion', 'idx_busquedas_fecha_publicacion');
            
            // Índice para modalidad (filtros frecuentes)
            $table->index('modalidad', 'idx_busquedas_modalidad');
            
            // Índice para ubicación (búsquedas geográficas)
            $table->index('ubicacion', 'idx_busquedas_ubicacion');
        });

        Schema::table('postulaciones', function (Blueprint $table) {
            // Índice compuesto para busquedas por empresa
            $table->index(['busqueda_id', 'estado'], 'idx_postulaciones_busqueda_estado');
            
            // Índice para candidato_id (vista de candidato)
            $table->index('candidato_id', 'idx_postulaciones_candidato');
            
            // Índice para fecha de postulación (ordenamiento)
            $table->index('fecha_postulacion', 'idx_postulaciones_fecha');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropIndex('idx_empresas_estado_verificacion');
            $table->dropIndex('idx_empresas_sector');
            $table->dropIndex('idx_empresas_estado_fecha');
        });

        Schema::table('busquedas_laborales', function (Blueprint $table) {
            $table->dropIndex('idx_busquedas_empresa_estado');
            $table->dropIndex('idx_busquedas_estado');
            $table->dropIndex('idx_busquedas_fecha_publicacion');
            $table->dropIndex('idx_busquedas_modalidad');
            $table->dropIndex('idx_busquedas_ubicacion');
        });

        Schema::table('postulaciones', function (Blueprint $table) {
            $table->dropIndex('idx_postulaciones_busqueda_estado');
            $table->dropIndex('idx_postulaciones_candidato');
            $table->dropIndex('idx_postulaciones_fecha');
        });
    }
};
