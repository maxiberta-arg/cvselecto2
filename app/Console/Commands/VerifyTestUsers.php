<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Candidato;
use App\Models\Empresa;

class VerifyTestUsers extends Command
{
    protected $signature = 'test:verify-users';
    protected $description = 'Verificar usuarios de prueba';

    public function handle()
    {
        $this->info("🔍 VERIFICACIÓN DE USUARIOS DE PRUEBA");
        $this->info("======================================");
        
        // Verificar usuarios
        $testEmails = ['admin@test.com', 'empresa@test.com', 'candidato@test.com', 'ana@test.com', 'startup@test.com'];
        
        foreach ($testEmails as $email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $this->info("✅ {$user->name} ({$user->rol}) - {$email}");
                
                if ($user->rol === 'candidato') {
                    $candidato = Candidato::where('user_id', $user->id)->first();
                    if ($candidato) {
                        $this->info("   👤 {$candidato->nombre} {$candidato->apellido}");
                        $this->info("   📧 {$candidato->email}");
                        $edad = $candidato->fecha_nacimiento ? \Carbon\Carbon::parse($candidato->fecha_nacimiento)->age : 'N/A';
                        $this->info("   🎂 {$edad} años");
                        $this->info("   � {$candidato->direccion}");
                        $this->info("   🎓 {$candidato->nivel_educacion}");
                        $this->info("   ⏱️ {$candidato->experiencia_anos} años de experiencia");
                        $this->info("   💰 Pretensión salarial: $" . number_format($candidato->pretension_salarial));
                        $this->info("   📱 Disponibilidad: {$candidato->disponibilidad}");
                        $this->info("   🏢 Modalidad: {$candidato->modalidad_preferida}");
                    }
                } elseif ($user->rol === 'empresa') {
                    $empresa = Empresa::where('user_id', $user->id)->first();
                    if ($empresa) {
                        $this->info("   🏢 {$empresa->razon_social}");
                        $this->info("   📧 {$empresa->email_contacto}");
                        $this->info("   ✅ Estado: {$empresa->estado_verificacion}");
                        $this->info("   🏭 Sector: {$empresa->sector}");
                        $this->info("   👥 Tamaño: {$empresa->tamaño_empresa} empleados");
                    }
                }
                $this->info("");
            } else {
                $this->error("❌ Usuario no encontrado: {$email}");
            }
        }

        // Contar datos relacionados
        $totalUsers = User::count();
        $totalCandidatos = Candidato::count();
        $totalEmpresas = Empresa::count();
        
        $this->info("📊 RESUMEN GENERAL:");
        $this->info("==================");
        $this->info("👤 Usuarios totales: {$totalUsers}");
        $this->info("🧑‍💼 Candidatos: {$totalCandidatos}");
        $this->info("🏢 Empresas: {$totalEmpresas}");
        
        return Command::SUCCESS;
    }
}
