<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CandidatoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_AR');
        
        // Obtener usuarios con rol candidato (excluyendo los de testing)
        $candidatoUsers = \App\Models\User::where('rol', 'candidato')
                                         ->whereNotIn('email', ['candidato@test.com', 'ana@test.com'])
                                         ->limit(18)
                                         ->get();
        
        $habilidadesList = [
            'PHP, Laravel, MySQL, JavaScript, HTML, CSS',
            'React, Node.js, MongoDB, Express, Git',
            'Python, Django, PostgreSQL, Docker, AWS',
            'Java, Spring Boot, Hibernate, Maven, JUnit',
            'C#, .NET Core, SQL Server, Entity Framework',
            'Vue.js, Nuxt.js, Firebase, TypeScript',
            'Angular, RxJS, NgRx, Jasmine, Karma',
            'Ruby, Ruby on Rails, Redis, Sidekiq',
            'Go, Gin, GORM, Docker, Kubernetes',
            'Swift, iOS Development, Core Data, Xcode'
        ];
        
        $bioTemplates = [
            'Desarrollador con {experiencia} años de experiencia en {tecnologias}. Passionate about clean code and best practices.',
            'Especialista en {tecnologias} con {experiencia} años de trayectoria en proyectos web.',
            'Full Stack Developer enfocado en {tecnologias}. {experiencia} años creando soluciones escalables.',
            'Programador {tecnologias} con {experiencia} años de experiencia en desarrollo ágil.',
        ];
        
        $experienciaTemplates = [
            '{experiencia} años como Desarrollador en {empresa}',
            'Desarrollador Senior - {empresa} ({experiencia} años)',
            '{experiencia} años de experiencia como Full Stack Developer',
            'Programador con {experiencia} años en {empresa}',
        ];
        
        $educacionOptions = [
            'Ingeniería en Sistemas - Universidad Tecnológica Nacional',
            'Licenciatura en Ciencias de la Computación - UBA',
            'Tecnicatura en Programación - UTN',
            'Ingeniería Informática - UADE',
            'Análisis de Sistemas - Universidad Kennedy',
            'Licenciatura en Sistemas - Universidad del Salvador',
        ];
        
        foreach ($candidatoUsers as $user) {
            $experienciaAnos = $faker->numberBetween(1, 8);
            $tecnologiaPrincipal = $faker->randomElement(['PHP/Laravel', 'React/Node.js', 'Python/Django', 'Java/Spring', 'C#/.NET']);
            $habilidades = $faker->randomElement($habilidadesList);
            
            $bio = str_replace(
                ['{experiencia}', '{tecnologias}'],
                [$experienciaAnos, $tecnologiaPrincipal],
                $faker->randomElement($bioTemplates)
            );
            
            $experiencia = str_replace(
                ['{experiencia}', '{empresa}'],
                [$experienciaAnos, $faker->company],
                $faker->randomElement($experienciaTemplates)
            );
            
            \App\Models\Candidato::create([
                'user_id' => $user->id,
                'apellido' => $faker->lastName,
                'fecha_nacimiento' => $faker->dateTimeBetween('-35 years', '-22 years')->format('Y-m-d'),
                'telefono' => '+54 9 11 ' . $faker->numerify('####-####'),
                'direccion' => $faker->address,
                'linkedin_url' => $faker->boolean(70) ? 'https://linkedin.com/in/' . $faker->slug : null,
                'nivel_educacion' => $faker->randomElement(['secundario', 'terciario', 'universitario', 'posgrado']),
                'experiencia_anos' => $experienciaAnos,
                'disponibilidad' => $faker->randomElement(['inmediata', '1_semana', '15_dias', '1_mes', '2_meses']),
                'modalidad_preferida' => $faker->randomElement(['presencial', 'remoto', 'hibrido']),
                'pretension_salarial' => $faker->numberBetween(800000, 2500000), // En pesos argentinos
                'cv_path' => null, // Se puede agregar lógica para generar CVs ficticios
                'portfolio_url' => $faker->boolean(30) ? 'https://portfolio-' . $faker->slug . '.com' : null,
            ]);
        }
    }
}
