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
        $faker = \Faker\Factory::create('es_AR');
        $empresaUsers = \App\Models\User::orderBy('id')->limit(10)->get();
        foreach ($empresaUsers as $user) {
            \App\Models\Empresa::create([
                'user_id' => $user->id,
                'razon_social' => $faker->company,
                'cuit' => $faker->unique()->numerify('30-########-#'),
                'telefono' => $faker->phoneNumber,
                'direccion' => $faker->address,
                'verificada' => $faker->boolean(80),
                'descripcion' => $faker->catchPhrase,
            ]);
        }
    }
}
