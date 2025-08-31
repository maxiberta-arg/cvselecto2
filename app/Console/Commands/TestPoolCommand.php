<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Empresa;
use App\Models\Candidato;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TestPoolCommand extends Command
{
    protected $signature = 'test:pool';
    protected $description = 'Test the pool de candidatos functionality';

    public function handle()
    {
        $this->info('=== PRUEBA DE POOL DE CANDIDATOS ===');
        
        // 1. Verificar que existe una empresa
        $empresa = Empresa::with('user')->first();
        if (!$empresa) {
            $this->error('❌ No hay empresas en el sistema');
            return 1;
        }

        $this->info("✅ Empresa encontrada: {$empresa->razon_social}");
        $this->info("   Usuario: {$empresa->user->email}");

        // 2. Verificar estadísticas iniciales
        $stats = $empresa->estadisticasPool();
        $this->info('📊 Estadísticas iniciales del pool:');
        $this->info("   Total candidatos: {$stats->total_candidatos}");
        $this->info("   Activos: {$stats->activos}");
        $this->info("   En proceso: {$stats->en_proceso}");
        $this->info("   Contratados: {$stats->contratados}");
        $this->info("   Descartados: {$stats->descartados}");
        $this->info("   Promedio puntuación: " . ($stats->promedio_puntuacion ? round($stats->promedio_puntuacion, 2) : 'N/A'));

        // 3. Crear un candidato de prueba y agregarlo al pool
        try {
            DB::beginTransaction();
            
            // Verificar si ya existe el usuario de prueba
            $userEmail = 'candidato.pool.test@example.com';
            $existingUser = User::where('email', $userEmail)->first();
            
            if ($existingUser) {
                $this->info('⚠️ Usuario de prueba ya existe, lo eliminaremos primero');
                // Eliminar relaciones del pool si existen
                $candidato = Candidato::where('user_id', $existingUser->id)->first();
                if ($candidato) {
                    $empresa->candidatos()->detach($candidato->id);
                    $candidato->delete();
                }
                $existingUser->delete();
            }
            
            // Crear nuevo usuario
            $user = User::create([
                'name' => 'Juan Carlos Pool Test',
                'email' => $userEmail,
                'password' => Hash::make('password123'),
                'role' => 'candidato'
            ]);
            
            $this->info("✅ Usuario creado: {$user->name} ({$user->email})");
            
            // Crear candidato
            $candidato = Candidato::create([
                'user_id' => $user->id,
                'nombre' => 'Juan Carlos',
                'apellido' => 'Pool Test',
                'email' => $userEmail,
                'telefono' => '+54 11 1234-5678',
                'fecha_nacimiento' => '1990-05-15',
                'direccion' => 'Av. Corrientes 1234, CABA',
                'nivel_educacion' => 'universitario',
                'experiencia_anos' => 5,
                'disponibilidad' => 'inmediata',
                'modalidad_preferida' => 'hibrido',
                'pretension_salarial' => 150000,
                'linkedin_url' => 'https://linkedin.com/in/juancarlos-test',
                'portfolio_url' => 'https://github.com/juancarlos-test'
            ]);
            
            $this->info("✅ Candidato creado: {$candidato->nombre} {$candidato->apellido}");
            
            // Agregar al pool de la empresa
            $datosPool = [
                'origen' => 'manual',
                'estado_interno' => 'activo',
                'tags' => json_encode(['desarrollador', 'php', 'laravel', 'prueba']),
                'notas_privadas' => 'Candidato de prueba creado para testing del sistema de pool',
                'puntuacion_empresa' => 8.5,
                'fecha_incorporacion' => now(),
                'historial_estados' => json_encode([[
                    'estado_anterior' => null,
                    'estado_nuevo' => 'activo',
                    'fecha' => now()->toISOString(),
                    'observaciones' => 'Candidato de prueba agregado al pool'
                ]])
            ];
            
            $empresa->candidatos()->attach($candidato->id, $datosPool);
            
            $this->info('✅ Candidato agregado al pool exitosamente');
            
            // 4. Verificar estadísticas después
            $statsNuevas = $empresa->estadisticasPool();
            $this->info('📊 Estadísticas después de agregar candidato:');
            $this->info("   Total candidatos: {$statsNuevas->total_candidatos}");
            $this->info("   Activos: {$statsNuevas->activos}");
            $this->info("   Promedio puntuación: " . ($statsNuevas->promedio_puntuacion ? round($statsNuevas->promedio_puntuacion, 2) : 'N/A'));
            
            // 5. Mostrar datos del pool
            $poolCandidatos = $empresa->empresaCandidatos()->with('candidato.user')->get();
            $this->info("👥 Candidatos en el pool ({$poolCandidatos->count()}):");
            
            foreach ($poolCandidatos as $pc) {
                $this->info("   • {$pc->candidato->nombre} {$pc->candidato->apellido}");
                $this->info("     Estado: {$pc->estado_interno}");
                $this->info("     Origen: {$pc->origen}");
                $this->info("     Puntuación: {$pc->puntuacion_empresa}/10");
                $this->info("     Tags: " . implode(', ', $pc->tags ?: []));
                $this->info("     Incorporación: {$pc->fecha_incorporacion->format('d/m/Y H:i')}");
                $this->info('');
            }
            
            DB::commit();
            $this->info('🎉 PRUEBA EXITOSA: Sistema de pool funcionando correctamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("❌ ERROR: {$e->getMessage()}");
            $this->error("Trace: {$e->getTraceAsString()}");
            return 1;
        }

        $this->info('=== FIN DE LA PRUEBA ===');
        return 0;
    }
}
