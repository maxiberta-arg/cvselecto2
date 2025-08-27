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
        Schema::create('postulaciones', function (Blueprint $table) {
            $table->id();
            // Relación muchos a uno con búsquedas laborales y candidatos
            $table->unsignedBigInteger('busqueda_id');
            $table->unsignedBigInteger('candidato_id');
            $table->enum('estado', ['postulado', 'en proceso', 'rechazado', 'seleccionado'])->default('postulado');
            $table->date('fecha_postulacion')->nullable();
            $table->timestamps();

            $table->foreign('busqueda_id')->references('id')->on('busquedas_laborales')->onDelete('cascade');
            $table->foreign('candidato_id')->references('id')->on('candidatos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    // Eliminar primero las tablas hijas
    Schema::dropIfExists('entrevistas');
    Schema::dropIfExists('postulaciones');
    }
};
