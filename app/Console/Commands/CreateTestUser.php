<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Empresa;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateTestUser extends Command
{
    protected $signature = 'create:test-user';
    protected $description = 'Create test user for empresa';

    public function handle()
    {
        // Buscar usuario existente o crear nuevo
        $user = User::firstOrCreate(
            ['email' => 'empresa@test.com'],
            [
                'name' => 'Empresa Test',
                'password' => Hash::make('123456'),
                'rol' => 'empresa'
            ]
        );

        $this->info('✅ Usuario encontrado/creado: ID ' . $user->id);
        $this->info('📧 Email: ' . $user->email);

        // Verificar si ya tiene empresa
        if ($user->empresa) {
            $this->info('✅ Ya tiene empresa: ' . $user->empresa->razon_social);
            return 0;
        }

        // Crear empresa con CUIT único
        $cuitBase = '30-' . str_pad($user->id, 8, '0', STR_PAD_LEFT) . '-' . ($user->id % 10);
        
        $empresa = Empresa::create([
            'user_id' => $user->id,
            'razon_social' => 'Tech Solutions S.A.',
            'cuit' => $cuitBase,
            'telefono' => '+54 11 4567-8900',
            'direccion' => 'Av. Corrientes 1234, CABA, Argentina',
            'descripcion' => 'Somos una empresa de tecnología especializada en desarrollo de software y soluciones digitales innovadoras para empresas de todos los tamaños.',
            'sector' => 'Tecnología',
            'tamaño_empresa' => 25,
            'año_fundacion' => 2015,
            'email_contacto' => 'rrhh@techsolutions.com',
            'persona_contacto' => 'Ana García - HR Manager',
            'sitio_web' => 'https://www.techsolutions.com.ar',
            'linkedin_url' => 'https://linkedin.com/company/tech-solutions-sa',
            'estado_verificacion' => 'verificada'
        ]);

        $this->info('🏢 Empresa creada: ' . $empresa->razon_social);
        $this->info('🆔 CUIT: ' . $empresa->cuit);
        $this->info('🔐 Password: 123456');

        return 0;
    }
}
