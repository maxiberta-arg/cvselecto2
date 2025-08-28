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
        Schema::table('candidatos', function (Blueprint $table) {
            // Primero eliminamos la restricción de clave foránea
            $table->dropForeign(['user_id']);
            
            // Hacemos el campo nullable y removemos unique
            $table->unsignedBigInteger('user_id')->nullable()->change();
            
            // Volvemos a agregar la clave foránea pero sin unique
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidatos', function (Blueprint $table) {
            // Revertir los cambios
            $table->dropForeign(['user_id']);
            $table->unsignedBigInteger('user_id')->unique()->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
