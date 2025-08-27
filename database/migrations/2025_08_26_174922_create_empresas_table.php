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
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            // Relación uno a uno con users
            $table->unsignedBigInteger('user_id')->unique()->comment('Referencia al usuario');
            $table->string('razon_social');
            $table->string('cuit')->unique();
            $table->string('telefono')->nullable();
            $table->string('direccion')->nullable();
            $table->boolean('verificada')->default(false);
            $table->text('descripcion')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
