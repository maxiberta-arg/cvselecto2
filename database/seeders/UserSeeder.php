<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_AR');

        // Admin
        \App\Models\User::create([
            'name' => 'Admin Principal',
            'email' => 'admin@cvselecto.com',
            'password' => bcrypt('admin123'),
            'rol' => 'admin',
        ]);

        // 10 empresas
        for ($i = 1; $i <= 10; $i++) {
            \App\Models\User::create([
                'name' => $faker->company,
                'email' => $faker->unique()->companyEmail,
                'password' => bcrypt('empresa123'),
                'rol' => 'empresa',
            ]);
        }

        // 19 candidatos + 1 real
        \App\Models\User::create([
            'name' => 'Juan Candidato',
            'email' => 'juan.candidato@cvselecto.com',
            'password' => bcrypt('password'),
            'rol' => 'candidato',
        ]);
        for ($i = 1; $i <= 19; $i++) {
            \App\Models\User::create([
                'name' => $faker->name,
                'email' => $faker->unique()->safeEmail,
                'password' => bcrypt('password'),
                'rol' => 'candidato',
            ]);
        }
    }
}
