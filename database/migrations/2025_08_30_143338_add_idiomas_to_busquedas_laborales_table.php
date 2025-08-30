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
            $table->text('idiomas')->nullable()->after('nivel_educativo')->comment('Idiomas requeridos en formato JSON');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('busquedas_laborales', function (Blueprint $table) {
            $table->dropColumn('idiomas');
        });
    }
};
