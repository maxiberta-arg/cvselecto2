<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder de usuarios: candidatos, empresas y admin
        \App\Models\User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@cvselecto.com',
            'password' => bcrypt('admin123'),
            // tipo y estado se agregan en migration si corresponde
        ]);

        \App\Models\User::create([
            'name' => 'Juan Candidato',
            'email' => 'juan.candidato@cvselecto.com',
            'password' => bcrypt('password'),
        ]);

        \App\Models\User::create([
            'name' => 'Empresa Ejemplo',
            'email' => 'contacto@empresa.com',
            'password' => bcrypt('empresa123'),
        ]);
    }
}
