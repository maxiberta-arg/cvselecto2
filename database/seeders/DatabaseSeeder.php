<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Deshabilitar verificación de claves foráneas temporalmente
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        $this->command->info('🌱 Iniciando seeders de CVSelecto...');
        
        // Orden de ejecución respetando dependencias
        $this->call([
            TestingUserSeeder::class,     // Usuarios específicos para testing (incluye User, Empresa, Candidato)
            UserSeeder::class,            // Usuarios adicionales
            EmpresaSeeder::class,         // Empresas adicionales
            CandidatoSeeder::class,       // Candidatos adicionales
            BusquedaLaboralSeeder::class, // Búsquedas (depende de Empresas)
            PostulacionSeeder::class,     // Postulaciones (depende de Candidatos y Búsquedas)
            ExperienciaSeeder::class,     // Experiencias (depende de Candidatos)
            CapacitacionSeeder::class,    // Educación (depende de Candidatos)
            EntrevistaSeeder::class,      // Entrevistas (depende de Postulaciones)
        ]);
        
        // Rehabilitar verificación de claves foráneas
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        $this->command->info('✅ Seeders completados exitosamente!');
        $this->command->line('');
        $this->command->line('🔑 CREDENCIALES DE ACCESO:');
        $this->command->line('');
        $this->command->line('👨‍💼 ADMIN:');
        $this->command->line('   Email: admin@test.com');
        $this->command->line('   Password: admin123');
        $this->command->line('');
        $this->command->line('🏢 EMPRESA:');
        $this->command->line('   Email: empresa@test.com');
        $this->command->line('   Password: empresa123');
        $this->command->line('');
        $this->command->line('👤 CANDIDATO:');
        $this->command->line('   Email: candidato@test.com');
        $this->command->line('   Password: candidato123');
        $this->command->line('');
    }
}
