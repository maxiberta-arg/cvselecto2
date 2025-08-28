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
            // Campos para creación manual desde empresas
            $table->enum('nivel_educacion', ['secundario', 'terciario', 'universitario', 'posgrado'])->nullable()->after('cv_path');
            $table->integer('experiencia_anos')->nullable()->unsigned()->after('nivel_educacion');
            $table->enum('disponibilidad', ['inmediata', '1_semana', '15_dias', '1_mes', '2_meses'])->nullable()->default('inmediata')->after('experiencia_anos');
            $table->enum('modalidad_preferida', ['presencial', 'remoto', 'hibrido'])->nullable()->default('presencial')->after('disponibilidad');
            $table->decimal('pretension_salarial', 10, 2)->nullable()->after('modalidad_preferida');
            $table->string('linkedin_url')->nullable()->after('pretension_salarial');
            $table->string('portfolio_url')->nullable()->after('linkedin_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidatos', function (Blueprint $table) {
            $table->dropColumn([
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
