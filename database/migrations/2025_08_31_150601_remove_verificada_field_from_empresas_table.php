<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Elimina el campo legacy 'verificada' y migra datos a 'estado_verificacion'
     */
    public function up(): void
    {
        // Primero migrar datos existentes si es necesario
        DB::statement("
            UPDATE empresas 
            SET estado_verificacion = CASE 
                WHEN verificada = 1 THEN 'verificada'
                ELSE 'pendiente'
            END 
            WHERE estado_verificacion IS NULL OR estado_verificacion = 'pendiente'
        ");

        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn('verificada');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->boolean('verificada')->default(false)->after('direccion');
        });
        
        // Restaurar datos desde estado_verificacion
        DB::statement("
            UPDATE empresas 
            SET verificada = CASE 
                WHEN estado_verificacion = 'verificada' THEN 1
                ELSE 0
            END
        ");
    }
};
