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
        
        // Generar CUITs válidos para empresas
        $cuits = [
            '30-12345678-9',
            '30-23456789-0', 
            '30-34567890-1',
            '30-45678901-2',
            '30-56789012-3'
        ];
        
        $sectores = [
            'Tecnología', 
            'Salud', 
            'Educación', 
            'Financiero', 
            'Retail', 
            'Manufacturas', 
            'Servicios', 
            'Construcción'
        ];
        
        // Obtener usuarios con rol empresa
        $empresaUsers = \App\Models\User::where('rol', 'empresa')
                                       ->orderBy('id')
                                       ->limit(5)
                                       ->get();
        
        foreach ($empresaUsers as $index => $user) {
            \App\Models\Empresa::create([
                'user_id' => $user->id,
                'razon_social' => $faker->company . ' S.A.',
                'cuit' => $cuits[$index] ?? $faker->numerify('30-########-#'),
                'telefono' => $faker->phoneNumber,
                'direccion' => $faker->address,
                'descripcion' => $faker->realText(200),
                'estado_verificacion' => $faker->randomElement(['verificada', 'pendiente', 'verificada']),
                'sector' => $faker->randomElement($sectores),
                'tamaño_empresa' => $faker->numberBetween(10, 500),
                'año_fundacion' => $faker->numberBetween(1990, 2020),
                'email_contacto' => $faker->companyEmail,
                'persona_contacto' => $faker->name,
                'sitio_web' => 'https://www.' . $faker->domainName,
                'linkedin_url' => 'https://linkedin.com/company/' . $faker->slug,
                'verificada_at' => $faker->boolean(70) ? $faker->dateTimeBetween('-1 year', 'now') : null,
                'notas_verificacion' => $faker->boolean(30) ? $faker->sentence : null,
            ]);
        }
    }
}
