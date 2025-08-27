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
            $table->text('bio')->nullable()->comment('Biografía profesional del candidato');
            $table->text('habilidades')->nullable()->comment('Habilidades técnicas y blandas');
            $table->string('linkedin')->nullable()->comment('URL del perfil LinkedIn');
            $table->string('experiencia_resumida')->nullable()->comment('Resumen de experiencia laboral');
            $table->string('educacion_resumida')->nullable()->comment('Resumen de educación');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidatos', function (Blueprint $table) {
            $table->dropColumn([
                'bio',
                'habilidades', 
                'linkedin',
                'experiencia_resumida',
                'educacion_resumida'
            ]);
        });
    }
};
