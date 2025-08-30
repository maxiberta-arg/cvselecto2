<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class CapacitacionSeeder extends Seeder
{
    /**
     * Crear registros educativos realistas para candidatos
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_AR');
        $candidatos = \App\Models\Candidato::all();
        
        $instituciones = [
            'Universidad Tecnológica Nacional (UTN)',
            'Universidad de Buenos Aires (UBA)',
            'Universidad Argentina de la Empresa (UADE)',
            'Universidad del Salvador (USAL)',
            'Universidad Kennedy',
            'Instituto Tecnológico de Buenos Aires (ITBA)',
            'Escuela de Educación Técnico Profesional',
            'Codo a Codo - Buenos Aires',
            'Digital House',
            'Acamica',
            'Coderhouse',
            'Udemy',
            'Platzi'
        ];
        
        $carreras = [
            ['titulo' => 'Licenciatura en Sistemas de Información', 'duracion' => 5, 'tipo' => 'universitario'],
            ['titulo' => 'Ingeniería en Sistemas', 'duracion' => 6, 'tipo' => 'universitario'],
            ['titulo' => 'Tecnicatura Superior en Programación', 'duracion' => 3, 'tipo' => 'terciario'],
            ['titulo' => 'Tecnicatura en Análisis de Sistemas', 'duracion' => 3, 'tipo' => 'terciario'],
            ['titulo' => 'Curso Full Stack Development', 'duracion' => 1, 'tipo' => 'curso'],
            ['titulo' => 'Diplomatura en Ciencia de Datos', 'duracion' => 1, 'tipo' => 'curso'],
            ['titulo' => 'Certified Scrum Master', 'duracion' => 0.1, 'tipo' => 'certificacion'],
            ['titulo' => 'AWS Certified Solutions Architect', 'duracion' => 0.2, 'tipo' => 'certificacion'],
        ];
        
        foreach ($candidatos as $candidato) {
            $numEducacion = $faker->numberBetween(1, 4); // Entre 1 y 4 registros educativos
            $fechaBase = $faker->dateTimeBetween('-15 years', '-5 years');
            
            for ($i = 0; $i < $numEducacion; $i++) {
                $carrera = $faker->randomElement($carreras);
                $institucion = $faker->randomElement($instituciones);
                
                // Calcular fechas lógicas
                $duracionAnios = $carrera['duracion'];
                $fechaInicio = $faker->dateTimeBetween('-15 years', '-' . ($duracionAnios + 1) . ' years');
                
                // Determinar si completó o no
                $completo = $faker->boolean(80); // 80% completó
                $fechaFin = $completo 
                    ? $faker->dateTimeBetween($fechaInicio->format('Y-m-d') . ' +' . (int)($duracionAnios * 12) . ' months', $fechaInicio->format('Y-m-d') . ' +' . (int)($duracionAnios * 12 + 12) . ' months')
                    : null;
                
                $estado = $completo ? 'completo' : 
                         ($faker->boolean(60) ? 'en_curso' : 'incompleto');
                
                // Descripción basada en el tipo
                $descripcion = $this->generarDescripcion($carrera['tipo'], $carrera['titulo'], $faker);
                
                \App\Models\Educacion::create([
                    'candidato_id' => $candidato->id,
                    'titulo' => $carrera['titulo'],
                    'institucion' => $institucion,
                    'fecha_inicio' => $fechaInicio,
                    'fecha_fin' => $fechaFin,
                    'descripcion' => $descripcion,
                ]);
            }
        }
        
        // Agregar educación específica para usuarios de prueba
        $this->createEducacionParaUsuariosPrueba($faker, $instituciones, $carreras);
    }
    
    /**
     * Generar descripción según tipo de educación
     */
    private function generarDescripcion($tipo, $titulo, $faker)
    {
        switch ($tipo) {
            case 'universitario':
                return "Carrera universitaria de grado enfocada en " . $faker->randomElement([
                    'desarrollo de software, bases de datos y arquitectura de sistemas',
                    'programación, análisis de sistemas y gestión de proyectos',
                    'tecnologías de la información y metodologías ágiles'
                ]);
                
            case 'terciario':
                return "Formación técnica especializada en " . $faker->randomElement([
                    'programación y desarrollo de aplicaciones',
                    'análisis de sistemas y bases de datos',
                    'desarrollo web y tecnologías modernas'
                ]);
                
            case 'curso':
                return "Curso intensivo de " . $faker->randomElement([
                    'tecnologías web modernas, incluyendo frameworks frontend y backend',
                    'desarrollo full stack con metodologías ágiles',
                    'especialización en herramientas y tecnologías específicas del sector'
                ]);
                
            case 'certificacion':
                return "Certificación profesional que valida conocimientos en " . $faker->randomElement([
                    'mejores prácticas de la industria',
                    'herramientas especializadas y metodologías',
                    'tecnologías cloud y arquitecturas modernas'
                ]);
                
            default:
                return $faker->sentence();
        }
    }
    
    /**
     * Crear educación específica para usuarios de prueba
     */
    private function createEducacionParaUsuariosPrueba($faker, $instituciones, $carreras)
    {
        // Educación para candidato de prueba completo
        $candidatoPrueba = \App\Models\Candidato::whereHas('user', function($query) {
            $query->where('email', 'candidato@test.com');
        })->first();
        
        if ($candidatoPrueba) {
            // Carrera universitaria completa
            \App\Models\Educacion::updateOrCreate([
                'candidato_id' => $candidatoPrueba->id,
                'titulo' => 'Licenciatura en Sistemas de Información'
            ], [
                'institucion' => 'Universidad Tecnológica Nacional (UTN)',
                'fecha_inicio' => '2013-03-01',
                'fecha_fin' => '2018-12-15',
                'descripcion' => 'Carrera universitaria de grado enfocada en desarrollo de software, análisis de sistemas, bases de datos y gestión de proyectos tecnológicos.',
            ]);
            
            // Curso complementario
            \App\Models\Educacion::updateOrCreate([
                'candidato_id' => $candidatoPrueba->id,
                'titulo' => 'Curso Full Stack Development'
            ], [
                'institucion' => 'Digital House',
                'fecha_inicio' => '2019-08-01',
                'fecha_fin' => '2019-12-20',
                'descripcion' => 'Curso intensivo de tecnologías web modernas: PHP/Laravel, React, MySQL, Git y metodologías ágiles.',
            ]);
        }
        
        // Educación para candidato básico
        $candidatoBasico = \App\Models\Candidato::whereHas('user', function($query) {
            $query->where('email', 'ana@test.com');
        })->first();
        
        if ($candidatoBasico) {
            \App\Models\Educacion::updateOrCreate([
                'candidato_id' => $candidatoBasico->id,
                'titulo' => 'Diseño Gráfico'
            ], [
                'institucion' => 'Universidad de Palermo',
                'fecha_inicio' => '2015-03-01',
                'fecha_fin' => '2019-12-15',
                'descripcion' => 'Carrera universitaria en diseño gráfico con especialización en marketing digital y comunicación visual.',
            ]);
        }
    }
}
