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
        Schema::create('entrevistas', function (Blueprint $table) {
            $table->id();
            // Relación muchos a uno con postulaciones
            $table->unsignedBigInteger('postulacion_id');
            $table->dateTime('fecha');
            $table->enum('modalidad', ['virtual', 'presencial']);
            $table->enum('resultado', ['aprobado', 'rechazado', 'pendiente'])->default('pendiente');
            $table->text('observaciones')->nullable();
            $table->timestamps();

            $table->foreign('postulacion_id')->references('id')->on('postulaciones')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entrevistas');
    }
};
