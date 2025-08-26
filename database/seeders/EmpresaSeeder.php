<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EmpresaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder de empresa vinculada al usuario Empresa Ejemplo
        $user = \App\Models\User::where('email', 'contacto@empresa.com')->first();
        if ($user) {
            \App\Models\Empresa::create([
                'user_id' => $user->id,
                'razon_social' => 'Empresa Ejemplo S.A.',
                'cuit' => '30-12345678-9',
                'telefono' => '1144556677',
                'direccion' => 'Av. Siempreviva 742',
                'verificada' => true,
                'descripcion' => 'Empresa dedicada a la tecnología.',
            ]);
        }
    }
}
