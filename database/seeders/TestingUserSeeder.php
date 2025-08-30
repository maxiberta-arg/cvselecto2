<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Empresa;
use App\Models\Candidato;

class TestingUserSeeder extends Seeder
{
    /**
     * Crear usuarios específicos para testing con datos completos y consistentes.
     */
    public function run(): void
    {
        // 🔧 ADMIN DE PRUEBA
        $admin = User::updateOrCreate(
            ['email' => 'admin@test.com'],
            [
                'name' => 'Admin Testing',
                'password' => bcrypt('admin123'),
                'rol' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 🏢 EMPRESA DE PRUEBA COMPLETA
        $empresaUser = User::updateOrCreate(
            ['email' => 'empresa@test.com'],
            [
                'name' => 'TechCorp Solutions',
                'password' => bcrypt('empresa123'),
                'rol' => 'empresa',
                'email_verified_at' => now(),
            ]
        );

        $empresa = Empresa::updateOrCreate(
            ['user_id' => $empresaUser->id],
            [
                'razon_social' => 'TechCorp Solutions S.A.',
                'cuit' => '30-71234567-8', // CUIT único para testing
                'telefono' => '+54 11 4567-8900',
                'direccion' => 'Av. Corrientes 1234, CABA, Buenos Aires, Argentina',
                'descripcion' => 'TechCorp Solutions es una empresa líder en desarrollo de software y soluciones tecnológicas innovadoras. Nos especializamos en aplicaciones web modernas, sistemas empresariales y consultoría en transformación digital. Con más de 10 años de experiencia, hemos trabajado con clientes de diversos sectores ayudándolos a optimizar sus procesos mediante tecnología de vanguardia.',
                'estado_verificacion' => 'verificada',
                'sector' => 'Tecnología',
                'tamaño_empresa' => 125,
                'año_fundacion' => 2012,
                'email_contacto' => 'rrhh@techcorp.com.ar',
                'persona_contacto' => 'María González - Gerente de RRHH',
                'sitio_web' => 'https://www.techcorp-solutions.com.ar',
                'linkedin_url' => 'https://linkedin.com/company/techcorp-solutions',
                'verificada_at' => now()->subDays(30),
                'notas_verificacion' => 'Empresa verificada exitosamente. Documentación completa presentada.',
            ]
        );

        // 🏢 EMPRESA PENDIENTE DE VERIFICACIÓN
        $empresaPendiente = User::updateOrCreate(
            ['email' => 'startup@test.com'],
            [
                'name' => 'StartupInnovate',
                'password' => bcrypt('startup123'),
                'rol' => 'empresa',
                'email_verified_at' => now(),
            ]
        );

        Empresa::updateOrCreate(
            ['user_id' => $empresaPendiente->id],
            [
                'razon_social' => 'StartupInnovate S.R.L.',
                'cuit' => '30-82345678-9', // CUIT único para testing
                'telefono' => '+54 11 5678-9012',
                'direccion' => 'Av. Santa Fe 2856, CABA, Buenos Aires, Argentina',
                'descripcion' => 'StartupInnovate es una empresa emergente enfocada en soluciones digitales para pequeñas y medianas empresas. Desarrollamos aplicaciones móviles, sistemas de gestión y herramientas de marketing digital.',
                'estado_verificacion' => 'pendiente',
                'sector' => 'Tecnología',
                'tamaño_empresa' => 15,
                'año_fundacion' => 2023,
                'email_contacto' => 'contacto@startupinnovate.com',
                'persona_contacto' => 'Carlos Ruiz - Fundador',
                'sitio_web' => 'https://www.startupinnovate.com',
                'linkedin_url' => 'https://linkedin.com/company/startupinnovate',
            ]
        );

        // 👨‍💼 CANDIDATO DE PRUEBA COMPLETO
        $candidatoUser = User::updateOrCreate(
            ['email' => 'candidato@test.com'],
            [
                'name' => 'Juan Carlos Pérez',
                'password' => bcrypt('candidato123'),
                'rol' => 'candidato',
                'email_verified_at' => now(),
            ]
        );

        $candidatoPrueba = Candidato::updateOrCreate(
            ['user_id' => $candidatoUser->id],
            [
                'nombre' => 'Juan Carlos',
                'apellido' => 'Pérez',
                'email' => 'candidato@test.com',
                'telefono' => '+54 9 11 2345-6789',
                'direccion' => 'Av. Rivadavia 4567, Caballito, CABA',
                'fecha_nacimiento' => '1990-03-15',
                'linkedin_url' => 'https://linkedin.com/in/juan-carlos-perez',
                'nivel_educacion' => 'universitario',
                'experiencia_anos' => 5,
                'disponibilidad' => 'inmediata',
                'modalidad_preferida' => 'hibrido',
                'pretension_salarial' => 1600000.00,
                'portfolio_url' => 'https://juanperez-portfolio.com',
            ]
        );

        // 👨‍💼 CANDIDATO BÁSICO (menos datos)
        $candidatoBasicoUser = User::updateOrCreate(
            ['email' => 'ana@test.com'],
            [
                'name' => 'Ana María López',
                'password' => bcrypt('password123'),
                'rol' => 'candidato',
                'email_verified_at' => now(),
            ]
        );

        $candidatoBasico = Candidato::updateOrCreate(
            ['user_id' => $candidatoBasicoUser->id],
            [
                'nombre' => 'Ana María',
                'apellido' => 'López',
                'email' => 'ana@test.com',
                'telefono' => '+54 9 11 8765-4321',
                'direccion' => 'San Martín 1234, San Isidro, Buenos Aires',
                'fecha_nacimiento' => '1995-07-22',
                'nivel_educacion' => 'universitario',
                'experiencia_anos' => 2,
                'disponibilidad' => '15_dias',
                'modalidad_preferida' => 'presencial',
                'pretension_salarial' => 900000.00,
            ]
        );

        // 📊 CREAR BÚSQUEDAS LABORALES PARA LA EMPRESA DE PRUEBA
        $this->createBusquedasLaboralesParaEmpresaPrueba($empresa);
        
        // 🎯 CREAR POSTULACIONES ESPECÍFICAS PARA TESTING
        $this->createPostulacionesParaTesting($candidatoPrueba, $candidatoBasico, $empresa);

        echo "\n✅ USUARIOS DE PRUEBA CREADOS:\n";
        echo "👤 Admin: admin@test.com / admin123\n";
        echo "🏢 Empresa Verificada: empresa@test.com / empresa123\n";
        echo "🏢 Empresa Pendiente: startup@test.com / startup123\n";
        echo "👨‍💼 Candidato Completo: candidato@test.com / candidato123\n";
        echo "👩‍💼 Candidato Básico: ana@test.com / password123\n";
        echo "📊 Creadas búsquedas laborales y postulaciones de prueba\n\n";
    }
    
    /**
     * Crear búsquedas laborales específicas para la empresa de prueba
     */
    private function createBusquedasLaboralesParaEmpresaPrueba($empresa)
    {
        $busquedas = [
            [
                'titulo' => 'Desarrollador Full Stack Senior - TechCorp',
                'descripcion' => 'Buscamos un Desarrollador Full Stack Senior para unirse a nuestro equipo de TechCorp Solutions. Trabajarás en proyectos innovadores desarrollando aplicaciones web modernas con PHP/Laravel en el backend y React en el frontend. Ofrecemos un ambiente colaborativo, crecimiento profesional y la oportunidad de trabajar con tecnologías de vanguardia.',
                'requisitos' => 'Mínimo 4 años de experiencia con PHP y Laravel • React/JavaScript avanzado • MySQL/PostgreSQL • Git y metodologías ágiles • Inglés intermedio • Capacidad de trabajo en equipo',
                'modalidad' => 'hibrido',
                'ubicacion' => 'CABA, Buenos Aires',
                'tipo_contrato' => 'indefinido',
                'jornada_laboral' => 'completa',
                'salario_min' => 1400000,
                'salario_max' => 2000000,
                'estado' => 'abierta',
                'experiencia_requerida' => 5, // 5 años para senior
            ],
            [
                'titulo' => 'QA Automation Engineer - TechCorp',
                'descripcion' => 'Únete a TechCorp como QA Automation Engineer. Serás responsable de diseñar y ejecutar casos de prueba automatizados, trabajar con herramientas de CI/CD y asegurar la calidad de nuestros productos de software.',
                'requisitos' => 'Experiencia en testing automatizado • Selenium, Cypress o similar • APIs testing • Conocimientos de SQL • Metodologías ágiles • Atención al detalle',
                'modalidad' => 'presencial',
                'ubicacion' => 'CABA, Buenos Aires', 
                'tipo_contrato' => 'indefinido',
                'jornada_laboral' => 'completa',
                'salario_min' => 900000,
                'salario_max' => 1400000,
                'estado' => 'abierta',
                'experiencia_requerida' => 3, // 3 años para semi senior
            ]
        ];
        
        foreach ($busquedas as $busquedaData) {
            \App\Models\BusquedaLaboral::updateOrCreate(
                [
                    'empresa_id' => $empresa->id,
                    'titulo' => $busquedaData['titulo']
                ],
                array_merge($busquedaData, [
                    'fecha_publicacion' => now()->subWeeks(2),
                    'fecha_cierre' => now()->addMonths(2),
                ])
            );
        }
    }
    
    /**
     * Crear postulaciones específicas para testing de dashboards
     */
    private function createPostulacionesParaTesting($candidatoPrueba, $candidatoBasico, $empresa)
    {
        $busquedasEmpresa = \App\Models\BusquedaLaboral::where('empresa_id', $empresa->id)->get();
        
        if ($busquedasEmpresa->count() > 0 && $candidatoPrueba) {
            // Postulación aceptada para candidato completo
            \App\Models\Postulacion::updateOrCreate(
                [
                    'candidato_id' => $candidatoPrueba->id,
                    'busqueda_id' => $busquedasEmpresa->first()->id,
                ],
                [
                    'estado' => 'seleccionado',
                    'fecha_postulacion' => now()->subWeeks(3),
                    'puntuacion' => 5,
                    'notas_empresa' => 'Excelente candidato con el perfil ideal para nuestro equipo.',
                ]
            );
            
            // Postulación en proceso para candidato completo (si hay más búsquedas)
            if ($busquedasEmpresa->count() > 1) {
                \App\Models\Postulacion::updateOrCreate(
                    [
                        'candidato_id' => $candidatoPrueba->id,
                        'busqueda_id' => $busquedasEmpresa->skip(1)->first()->id,
                    ],
                    [
                        'estado' => 'en proceso',
                        'fecha_postulacion' => now()->subWeek(),
                        'puntuacion' => 4,
                        'notas_empresa' => 'Candidato con buen perfil, programada entrevista técnica.',
                    ]
                );
            }
        }
        
        // Postulación básica para candidato básico
        if ($busquedasEmpresa->count() > 0 && $candidatoBasico) {
            \App\Models\Postulacion::updateOrCreate(
                [
                    'candidato_id' => $candidatoBasico->id,
                    'busqueda_id' => $busquedasEmpresa->first()->id,
                ],
                [
                    'estado' => 'postulado',
                    'fecha_postulacion' => now()->subDays(2),
                    'puntuacion' => 3,
                    'notas_empresa' => null,
                ]
            );
        }
    }
}
