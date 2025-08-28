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
        Schema::table('postulaciones', function (Blueprint $table) {
            $table->text('notas_empresa')->nullable()->after('fecha_postulacion');
            $table->decimal('puntuacion', 3, 1)->nullable()->after('notas_empresa');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('postulaciones', function (Blueprint $table) {
            $table->dropColumn(['notas_empresa', 'puntuacion']);
        });
    }
};
