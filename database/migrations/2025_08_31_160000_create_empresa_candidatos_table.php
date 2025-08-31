<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('empresa_candidatos', function (Blueprint $table) {
            $table->id();
            
            // Relaciones
            $table->foreignId('empresa_id')->constrained()->onDelete('cascade');
            $table->foreignId('candidato_id')->constrained()->onDelete('cascade');
            
            // Metadatos específicos de la empresa para este candidato
            $table->enum('origen', ['postulacion', 'manual', 'importacion', 'referido'])
                  ->default('manual')
                  ->comment('Cómo llegó el candidato a la empresa');
            
            $table->enum('estado_interno', ['activo', 'en_proceso', 'contratado', 'descartado', 'pausado'])
                  ->default('activo')
                  ->comment('Estado del candidato en el pool empresarial');
            
            $table->json('tags')->nullable()
                  ->comment('Etiquetas personalizadas de la empresa para este candidato');
            
            $table->decimal('puntuacion_empresa', 3, 1)->nullable()
                  ->comment('Calificación interna de la empresa (0.0 - 10.0)');
            
            $table->text('notas_privadas')->nullable()
                  ->comment('Notas internas de la empresa sobre el candidato');
            
            $table->timestamp('fecha_incorporacion')->nullable()
                  ->comment('Cuándo se agregó al pool empresarial');
            
            $table->timestamp('ultimo_contacto')->nullable()
                  ->comment('Última interacción con el candidato');
            
            $table->json('historial_estados')->nullable()
                  ->comment('Historial de cambios de estado interno');
            
            $table->timestamps();
            
            // Índices para optimización
            $table->index(['empresa_id', 'estado_interno']);
            $table->index(['empresa_id', 'origen']);
            $table->index(['empresa_id', 'puntuacion_empresa']);
            $table->index('fecha_incorporacion');
            
            // Restricción única: un candidato solo puede estar una vez en el pool de una empresa
            $table->unique(['empresa_id', 'candidato_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresa_candidatos');
    }
};
