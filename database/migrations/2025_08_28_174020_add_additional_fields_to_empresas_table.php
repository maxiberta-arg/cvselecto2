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
        Schema::table('empresas', function (Blueprint $table) {
            $table->string('logo_path')->nullable()->comment('Ruta del logo de la empresa');
            $table->string('sitio_web')->nullable()->comment('URL del sitio web corporativo');
            $table->string('linkedin_url')->nullable()->comment('URL del perfil de LinkedIn');
            $table->enum('estado_verificacion', ['pendiente', 'verificada', 'rechazada'])->default('pendiente')->comment('Estado de verificación empresarial');
            $table->timestamp('fecha_verificacion')->nullable()->comment('Fecha de verificación');
            $table->text('notas_verificacion')->nullable()->comment('Notas del proceso de verificación');
            $table->string('sector')->nullable()->comment('Sector empresarial');
            $table->integer('empleados_cantidad')->nullable()->comment('Cantidad aproximada de empleados');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn([
                'logo_path',
                'sitio_web', 
                'linkedin_url',
                'estado_verificacion',
                'fecha_verificacion',
                'notas_verificacion',
                'sector',
                'empleados_cantidad'
            ]);
        });
    }
};
