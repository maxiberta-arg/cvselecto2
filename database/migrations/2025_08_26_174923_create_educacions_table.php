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
        Schema::create('educaciones', function (Blueprint $table) {
            $table->id();
            // Relación muchos a uno con candidatos
            $table->unsignedBigInteger('candidato_id');
            $table->string('institucion');
            $table->string('titulo');
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->text('descripcion')->nullable();
            $table->timestamps();

            $table->foreign('candidato_id')->references('id')->on('candidatos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('educacions');
    }
};
