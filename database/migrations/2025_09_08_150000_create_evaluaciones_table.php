<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * FASE 2A - PUNTO 3: Centro de Evaluación
     * 
     * Esta migración crea la tabla 'evaluaciones' que extiende la funcionalidad
     * de evaluación de candidatos más allá de la puntuación básica en empresa_candidatos.
     * 
     * Proporciona un sistema estructurado de evaluación con criterios configurables,
     * múltiples tipos de evaluación y seguimiento detallado del proceso.
     */
    public function up(): void
    {
        Schema::create('evaluaciones', function (Blueprint $table) {
            $table->id();
            
            // Relación con EmpresaCandidato (FK principal)
            $table->foreignId('empresa_candidato_id')
                  ->constrained('empresa_candidatos')
                  ->onDelete('cascade')
                  ->comment('Relación con el candidato en el pool empresarial');
            
            // Evaluador responsable
            $table->foreignId('evaluador_id')
                  ->constrained('users')
                  ->onDelete('restrict')
                  ->comment('Usuario que realiza la evaluación');
            
            // Metadatos de la evaluación
            $table->string('nombre_evaluacion')
                  ->comment('Nombre descriptivo de la evaluación');
                  
            $table->enum('tipo_evaluacion', [
                'tecnica', 
                'competencias', 
                'cultural', 
                'entrevista', 
                'integral', 
                'personalizada'
            ])->comment('Tipo de evaluación realizada');
            
            // Sistema de criterios y puntuación
            $table->json('criterios_evaluacion')
                  ->comment('Criterios de evaluación con pesos y descripciones');
                  
            $table->json('puntuaciones')
                  ->nullable()
                  ->comment('Puntuaciones otorgadas por criterio');
                  
            $table->decimal('puntuacion_total', 5, 2)
                  ->nullable()
                  ->comment('Puntuación total calculada (0.00 - 100.00)');
            
            // Comentarios y recomendaciones
            $table->text('comentarios_generales')
                  ->nullable()
                  ->comment('Comentarios generales del evaluador');
                  
            $table->text('recomendaciones')
                  ->nullable()
                  ->comment('Recomendaciones específicas');
            
            // Estado y seguimiento temporal
            $table->enum('estado_evaluacion', [
                'pendiente',
                'en_progreso', 
                'completada',
                'revisada',
                'aprobada',
                'rechazada'
            ])->default('pendiente')
              ->comment('Estado actual de la evaluación');
            
            $table->timestamp('fecha_inicio')
                  ->nullable()
                  ->comment('Cuando se inició la evaluación');
                  
            $table->timestamp('fecha_completada')
                  ->nullable()
                  ->comment('Cuando se completó la evaluación');
                  
            $table->integer('tiempo_evaluacion_minutos')
                  ->nullable()
                  ->comment('Tiempo total invertido en la evaluación');
            
            // Metadatos adicionales (configuración, contexto, etc.)
            $table->json('metadatos')
                  ->nullable()
                  ->comment('Datos adicionales de configuración y contexto');
            
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index(['empresa_candidato_id', 'estado_evaluacion'], 'idx_evaluaciones_estado');
            $table->index(['evaluador_id', 'fecha_completada'], 'idx_evaluaciones_evaluador');
            $table->index(['tipo_evaluacion', 'puntuacion_total'], 'idx_evaluaciones_tipo_puntuacion');
            $table->index('fecha_completada', 'idx_evaluaciones_fecha_completada');
        });
        
        echo "✅ Tabla 'evaluaciones' creada exitosamente\n";
        echo "📊 Sistema de evaluación avanzado disponible\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluaciones');
        echo "🗑️  Tabla 'evaluaciones' eliminada\n";
    }
};
