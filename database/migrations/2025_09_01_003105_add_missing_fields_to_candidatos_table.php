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
            // Verificar y agregar campos que pueden faltar
            if (!Schema::hasColumn('candidatos', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (!Schema::hasColumn('candidatos', 'habilidades')) {
                $table->text('habilidades')->nullable();
            }
            if (!Schema::hasColumn('candidatos', 'linkedin')) {
                $table->string('linkedin')->nullable();
            }
            if (!Schema::hasColumn('candidatos', 'experiencia_resumida')) {
                $table->text('experiencia_resumida')->nullable();
            }
            if (!Schema::hasColumn('candidatos', 'educacion_resumida')) {
                $table->text('educacion_resumida')->nullable();
            }
            if (!Schema::hasColumn('candidatos', 'nivel_educacion')) {
                $table->string('nivel_educacion')->nullable();
            }
            if (!Schema::hasColumn('candidatos', 'experiencia_anos')) {
                $table->integer('experiencia_anos')->nullable();
            }
            if (!Schema::hasColumn('candidatos', 'disponibilidad')) {
                $table->string('disponibilidad')->default('inmediata');
            }
            if (!Schema::hasColumn('candidatos', 'modalidad_preferida')) {
                $table->string('modalidad_preferida')->default('presencial');
            }
            if (!Schema::hasColumn('candidatos', 'pretension_salarial')) {
                $table->decimal('pretension_salarial', 10, 2)->nullable();
            }
            if (!Schema::hasColumn('candidatos', 'linkedin_url')) {
                $table->string('linkedin_url')->nullable();
            }
            if (!Schema::hasColumn('candidatos', 'portfolio_url')) {
                $table->string('portfolio_url')->nullable();
            }
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
                'educacion_resumida',
                'nivel_educacion',
                'experiencia_anos',
                'disponibilidad',
                'modalidad_preferida',
                'pretension_salarial',
                'linkedin_url',
                'portfolio_url'
            ]);
        });
    }
};
