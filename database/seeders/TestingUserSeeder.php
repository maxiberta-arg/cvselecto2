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

        Candidato::updateOrCreate(
            ['user_id' => $candidatoUser->id],
            [
                'apellido' => 'Pérez',
                'telefono' => '+54 9 11 2345-6789',
                'direccion' => 'Av. Rivadavia 4567, Caballito, CABA',
                'fecha_nacimiento' => '1990-03-15',
                'linkedin' => 'https://linkedin.com/in/juan-carlos-perez',
                'bio' => 'Desarrollador Full Stack con 5 años de experiencia en PHP/Laravel y React. Especializado en desarrollo de APIs RESTful y aplicaciones web modernas. Experiencia trabajando en equipos ágiles y metodologías Scrum.',
                'habilidades' => 'PHP, Laravel, React, MySQL, Git, JavaScript, HTML5, CSS3, Bootstrap, APIs REST',
                'experiencia_resumida' => '5 años como Desarrollador Full Stack - Empresa TechSolutions (2019-2024)',
                'educacion_resumida' => 'Licenciado en Sistemas - Universidad Tecnológica Nacional (2018)',
            ]
        );

        // 👨‍💼 CANDIDATO BÁSICO (menos datos)
        $candidatoBasico = User::updateOrCreate(
            ['email' => 'ana@test.com'],
            [
                'name' => 'Ana María López',
                'password' => bcrypt('password123'),
                'rol' => 'candidato',
                'email_verified_at' => now(),
            ]
        );

        Candidato::updateOrCreate(
            ['user_id' => $candidatoBasico->id],
            [
                'apellido' => 'López',
                'telefono' => '+54 9 11 8765-4321',
                'direccion' => 'San Martín 1234, San Isidro, Buenos Aires',
                'fecha_nacimiento' => '1995-07-22',
            ]
        );

        echo "\n✅ USUARIOS DE PRUEBA CREADOS:\n";
        echo "👤 Admin: admin@test.com / admin123\n";
        echo "🏢 Empresa Verificada: empresa@test.com / empresa123\n";
        echo "🏢 Empresa Pendiente: startup@test.com / startup123\n";
        echo "👨‍💼 Candidato Completo: candidato@test.com / candidato123\n";
        echo "👩‍💼 Candidato Básico: ana@test.com / password123\n\n";
    }
}
