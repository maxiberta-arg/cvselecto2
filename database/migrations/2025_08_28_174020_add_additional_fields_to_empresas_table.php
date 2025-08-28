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
            // Archivos y multimedia
            $table->string('logo_path')->nullable()->comment('Ruta del logo de la empresa');
            
            // Información web y redes sociales
            $table->string('sitio_web')->nullable()->comment('URL del sitio web corporativo');
            $table->string('linkedin_url')->nullable()->comment('URL del perfil de LinkedIn');
            
            // Estado de verificación mejorado
            $table->enum('estado_verificacion', ['pendiente', 'verificada', 'rechazada', 'suspendida'])
                  ->default('pendiente')
                  ->comment('Estado de verificación de la empresa');
            
            // Campos adicionales para perfil completo
            $table->string('sector')->nullable()->comment('Sector o industria de la empresa');
            $table->integer('tamaño_empresa')->nullable()->comment('Número aproximado de empleados');
            $table->year('año_fundacion')->nullable()->comment('Año de fundación');
            
            // Información de contacto adicional
            $table->string('email_contacto')->nullable()->comment('Email de contacto para candidatos');
            $table->string('persona_contacto')->nullable()->comment('Nombre de la persona de contacto');
            
            // Metadatos de verificación
            $table->timestamp('verificada_at')->nullable()->comment('Fecha de verificación');
            $table->text('notas_verificacion')->nullable()->comment('Notas del proceso de verificación');
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
                'sector',
                'tamaño_empresa',
                'año_fundacion',
                'email_contacto',
                'persona_contacto',
                'verificada_at',
                'notas_verificacion'
            ]);
        });
    }
};
