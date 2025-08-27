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
        Schema::create('busquedas_laborales', function (Blueprint $table) {
            $table->id();
            // Relación muchos a uno con empresas
            $table->unsignedBigInteger('empresa_id');
            $table->string('titulo');
            $table->text('descripcion');
            $table->text('requisitos')->nullable();
            $table->enum('estado', ['abierta', 'cerrada', 'pausada'])->default('abierta');
            $table->date('fecha_publicacion')->nullable();
            $table->date('fecha_cierre')->nullable();
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    // Eliminar primero las tablas hijas
    Schema::dropIfExists('postulaciones');
    Schema::dropIfExists('busquedas_laborales');
    }
};
