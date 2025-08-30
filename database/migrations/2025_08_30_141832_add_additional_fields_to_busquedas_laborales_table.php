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
        Schema::table('busquedas_laborales', function (Blueprint $table) {
            // Información de salario
            $table->text('beneficios')->nullable()->after('requisitos');
            $table->decimal('salario_min', 10, 2)->nullable()->after('beneficios');
            $table->decimal('salario_max', 10, 2)->nullable()->after('salario_min');
            $table->enum('moneda', ['ARS', 'USD', 'EUR'])->default('ARS')->after('salario_max');
            
            // Información de modalidad y ubicación
            $table->enum('modalidad', ['presencial', 'remoto', 'hibrido'])->nullable()->after('moneda');
            $table->string('ubicacion')->nullable()->after('modalidad');
            
            // Requisitos específicos
            $table->integer('experiencia_requerida')->nullable()->comment('Años de experiencia')->after('ubicacion');
            $table->enum('nivel_educativo', ['sin_estudios', 'primario', 'secundario', 'terciario', 'universitario', 'posgrado'])->nullable()->after('experiencia_requerida');
            
            // Tipo de empleo
            $table->enum('tipo_contrato', ['indefinido', 'temporal', 'por_proyecto', 'freelance', 'pasantia'])->nullable()->after('nivel_educativo');
            $table->enum('jornada_laboral', ['completa', 'media', 'por_horas', 'flexible'])->nullable()->after('tipo_contrato');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('busquedas_laborales', function (Blueprint $table) {
            $table->dropColumn([
                'beneficios', 'salario_min', 'salario_max', 'moneda',
                'modalidad', 'ubicacion', 'experiencia_requerida', 
                'nivel_educativo', 'tipo_contrato', 'jornada_laboral'
            ]);
        });
    }
};
