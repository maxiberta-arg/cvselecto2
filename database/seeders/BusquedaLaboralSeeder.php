<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BusquedaLaboralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create('es_AR');
        $empresas = \App\Models\Empresa::all();
        
        $ofertas = [
            [
                'titulo' => 'Desarrollador Full Stack Senior',
                'descripcion' => 'Buscamos un desarrollador Full Stack Senior con sólida experiencia en PHP/Laravel y React. Trabajarás en un equipo ágil desarrollando aplicaciones web modernas para clientes de diferentes sectores. Ofrecemos un ambiente de trabajo colaborativo, oportunidades de crecimiento profesional y la posibilidad de trabajar en proyectos desafiantes con tecnologías de vanguardia.',
                'requisitos' => 'Mínimo 4 años de experiencia con PHP y Laravel • Experiencia comprobable en React/JavaScript • Conocimientos en MySQL/PostgreSQL • Experiencia con Git y metodologías ágiles • Capacidad de trabajo en equipo • Inglés intermedio',
                'modalidad' => 'hibrido',
                'ubicacion' => 'CABA, Buenos Aires',
                'tipo_contrato' => 'tiempo_completo',
                'salario_min' => 1200000,
                'salario_max' => 1800000,
                'experiencia_requerida' => 'senior',
            ],
            [
                'titulo' => 'Desarrollador Frontend React',
                'descripcion' => 'Únete a nuestro equipo de desarrollo frontend para crear interfaces de usuario excepcionales. Trabajarás con las últimas versiones de React, desarrollando componentes reutilizables y aplicaciones responsive. Valoramos la creatividad, atención al detalle y pasión por la experiencia del usuario.',
                'requisitos' => '2+ años con React y JavaScript ES6+ • Conocimientos en HTML5, CSS3, Bootstrap • Experiencia con Git • Conocimientos de APIs REST • Diseño responsive • Manejo de estado (Redux/Context)',
                'modalidad' => 'remoto',
                'ubicacion' => 'Argentina',
                'tipo_contrato' => 'tiempo_completo',
                'salario_min' => 800000,
                'salario_max' => 1400000,
                'experiencia_requerida' => 'junior',
            ],
            [
                'titulo' => 'QA Tester Automation',
                'descripcion' => 'Estamos buscando un QA Tester especializado en automatización para garantizar la calidad de nuestros productos de software. Diseñarás y ejecutarás casos de prueba automatizados, trabajarás con herramientas de CI/CD y colaborarás estrechamente con el equipo de desarrollo.',
                'requisitos' => 'Experiencia en testing manual y automatizado • Conocimientos en Selenium, Cypress o similar • Experiencia con APIs testing (Postman) • Conocimientos básicos de SQL • Metodologías ágiles • Inglés básico',
                'modalidad' => 'presencial',
                'ubicacion' => 'Córdoba, Argentina',
                'tipo_contrato' => 'tiempo_completo',
                'salario_min' => 700000,
                'salario_max' => 1200000,
                'experiencia_requerida' => 'semi_senior',
            ],
            [
                'titulo' => 'Analista Funcional',
                'descripcion' => 'Buscamos un Analista Funcional para actuar como puente entre el negocio y el equipo técnico. Serás responsable de relevar y documentar requerimientos, diseñar soluciones y asegurar que los desarrollos cumplan con las necesidades del cliente.',
                'requisitos' => '3+ años como Analista Funcional o Business Analyst • Experiencia en relevamiento de requerimientos • Conocimientos en modelado de procesos • Manejo de herramientas de documentación • Capacidad analítica y comunicacional • Conocimientos de metodologías ágiles',
                'modalidad' => 'hibrido',
                'ubicacion' => 'Rosario, Santa Fe',
                'tipo_contrato' => 'tiempo_completo',
                'salario_min' => 900000,
                'salario_max' => 1500000,
                'experiencia_requerida' => 'semi_senior',
            ],
            [
                'titulo' => 'DevOps Engineer',
                'descripcion' => 'Únete a nuestro equipo de infraestructura como DevOps Engineer. Trabajarás con AWS, Docker, Kubernetes y herramientas de CI/CD para automatizar despliegues y mantener la infraestructura de nuestras aplicaciones. Buscamos alguien proactivo que disfrute de los desafíos técnicos.',
                'requisitos' => 'Experiencia con AWS o Azure • Conocimientos en Docker y Kubernetes • Experiencia con CI/CD (Jenkins, GitLab CI) • Scripting en Bash/Python • Conocimientos de infraestructura como código • Experiencia con monitoring y logging',
                'modalidad' => 'remoto',
                'ubicacion' => 'Argentina',
                'tipo_contrato' => 'tiempo_completo',
                'salario_min' => 1500000,
                'salario_max' => 2200000,
                'experiencia_requerida' => 'senior',
            ],
            [
                'titulo' => 'Desarrollador Python/Django',
                'descripcion' => 'Estamos buscando un desarrollador Python con experiencia en Django para trabajar en el desarrollo de APIs y aplicaciones web backend. Trabajarás en un ambiente colaborativo con metodologías ágiles, desarrollando soluciones escalables y de alta calidad.',
                'requisitos' => 'Mínimo 2 años de experiencia con Python • Experiencia con Django Framework • Conocimientos en PostgreSQL • APIs REST • Git y control de versiones • Conocimientos básicos de frontend (HTML/CSS/JS) • Inglés intermedio',
                'modalidad' => 'hibrido',
                'ubicacion' => 'CABA, Buenos Aires',
                'tipo_contrato' => 'tiempo_completo',
                'salario_min' => 1000000,
                'salario_max' => 1600000,
                'experiencia_requerida' => 'junior',
            ]
        ];
        
        // Crear ofertas específicas con datos realistas
        foreach ($ofertas as $index => $oferta) {
            $empresa = $empresas->skip($index)->first() ?: $empresas->random();
            
            \App\Models\BusquedaLaboral::create([
                'empresa_id' => $empresa->id,
                'titulo' => $oferta['titulo'],
                'descripcion' => $oferta['descripcion'],
                'requisitos' => $oferta['requisitos'],
                'modalidad' => $oferta['modalidad'],
                'ubicacion' => $oferta['ubicacion'],
                'tipo_contrato' => str_replace('tiempo_completo', 'indefinido', str_replace('medio_tiempo', 'temporal', $oferta['tipo_contrato'])),
                'jornada_laboral' => $oferta['tipo_contrato'] === 'tiempo_completo' ? 'completa' : ($oferta['tipo_contrato'] === 'medio_tiempo' ? 'media' : 'flexible'),
                'salario_min' => $oferta['salario_min'],
                'salario_max' => $oferta['salario_max'],
                'estado' => 'abierta',
                'fecha_publicacion' => $faker->dateTimeBetween('-2 months', '-1 week'),
                'fecha_cierre' => $faker->dateTimeBetween('+1 month', '+4 months'),
                'experiencia_requerida' => $this->mapExperienceToYears($oferta['experiencia_requerida']),
                'nivel_educativo' => $faker->randomElement(['secundario', 'terciario', 'universitario']),
            ]);
        }
        
        // Agregar más ofertas aleatorias
        $titulosAdicionales = [
            'Project Manager IT', 'Scrum Master', 'Product Owner', 'Data Scientist',
            'Diseñador UX/UI', 'Mobile Developer iOS', 'Mobile Developer Android',
            'Soporte Técnico N2', 'Administrador de Base de Datos', 'Arquitecto de Software'
        ];
        
        for ($i = 0; $i < 14; $i++) {
            $empresa = $empresas->random();
            
            \App\Models\BusquedaLaboral::create([
                'empresa_id' => $empresa->id,
                'titulo' => $faker->randomElement($titulosAdicionales),
                'descripcion' => $faker->realText(400, 2),
                'requisitos' => $faker->words(8, true) . ' • ' . $faker->words(6, true) . ' • ' . $faker->words(4, true),
                'modalidad' => $faker->randomElement(['presencial', 'remoto', 'hibrido']),
                'ubicacion' => $faker->randomElement(['CABA, Buenos Aires', 'Córdoba', 'Rosario, Santa Fe', 'Mendoza', 'Argentina']),
                'tipo_contrato' => $faker->randomElement(['indefinido', 'temporal', 'por_proyecto', 'freelance']),
                'jornada_laboral' => $faker->randomElement(['completa', 'media', 'flexible']),
                'salario_min' => $faker->numberBetween(600000, 1000000),
                'salario_max' => $faker->numberBetween(1200000, 2000000),
                'estado' => $faker->randomElement(['abierta', 'abierta', 'abierta', 'cerrada']), // Más abiertas que cerradas
                'fecha_publicacion' => $faker->dateTimeBetween('-3 months', 'now'),
                'fecha_cierre' => $faker->optional(0.8)->dateTimeBetween('now', '+6 months'),
                'experiencia_requerida' => $faker->numberBetween(0, 8), // Años de experiencia
                'nivel_educativo' => $faker->randomElement(['secundario', 'terciario', 'universitario', 'posgrado']),
            ]);
        }
    }
    
    /**
     * Mapear niveles de experiencia a años
     */
    private function mapExperienceToYears($level)
    {
        switch ($level) {
            case 'junior': return rand(0, 2);
            case 'semi_senior': return rand(3, 5);
            case 'senior': return rand(6, 10);
            default: return 3;
        }
    }
}
