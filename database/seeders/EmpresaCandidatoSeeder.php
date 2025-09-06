<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Empresa;
use App\Models\Candidato;
use App\Models\EmpresaCandidato;
use App\Models\Postulacion;

class EmpresaCandidatoSeeder extends Seeder
{
    public function run()
    {
        // Obtener empresas verificadas
        $empresasVerificadas = Empresa::where('estado_verificacion', 'verificada')->get();
        
        // Para cada empresa verificada, agregar candidatos a su pool
        foreach ($empresasVerificadas as $empresa) {
            // 1. Importar candidatos de sus postulaciones
            $postulacionesEmpresa = Postulacion::whereHas('busquedaLaboral', function($query) use ($empresa) {
                $query->where('empresa_id', $empresa->id);
            })->with('candidato')->get();
            
            foreach ($postulacionesEmpresa as $postulacion) {
                if ($postulacion->candidato) {
                    EmpresaCandidato::updateOrCreate([
                        'empresa_id' => $empresa->id,
                        'candidato_id' => $postulacion->candidato->id,
                    ], [
                        'origen' => 'postulacion',
                        'estado_interno' => $this->mapearEstadoInterno($postulacion->estado),
                        'tags' => $this->generarTags($postulacion->candidato),
                        'puntuacion_empresa' => $postulacion->puntuacion ? $postulacion->puntuacion : rand(6, 10),
                        'notas_privadas' => $postulacion->notas_empresa ?: 'Candidato proveniente de postulación',
                        'fecha_incorporacion' => $postulacion->created_at,
                        'ultimo_contacto' => now()->subDays(rand(1, 30)),
                    ]);
                }
            }
            
            // 2. Agregar candidatos adicionales manualmente
            $candidatosAdicionales = Candidato::whereNotIn('id', 
                $empresa->candidatos()->pluck('candidato_id')
            )->inRandomOrder()->take(rand(3, 8))->get();
            
            foreach ($candidatosAdicionales as $candidato) {
                EmpresaCandidato::create([
                    'empresa_id' => $empresa->id,
                    'candidato_id' => $candidato->id,
                    'origen' => fake()->randomElement(['manual', 'referido']),
                    'estado_interno' => fake()->randomElement(['activo', 'en_proceso', 'pausado']),
                    'tags' => $this->generarTags($candidato),
                    'puntuacion_empresa' => fake()->randomFloat(1, 5.0, 10.0),
                    'notas_privadas' => fake()->sentence(),
                    'fecha_incorporacion' => fake()->dateTimeBetween('-6 months', 'now'),
                    'ultimo_contacto' => fake()->dateTimeBetween('-30 days', 'now'),
                ]);
            }
        }
        
        echo "✅ Pool empresarial poblado para " . $empresasVerificadas->count() . " empresas\n";
    }
    
    private function mapearEstadoInterno($estadoPostulacion)
    {
        return match($estadoPostulacion) {
            'seleccionado' => 'contratado',
            'en proceso' => 'en_proceso', 
            'rechazado' => 'descartado',
            default => 'activo'
        };
    }
    
    private function generarTags($candidato)
    {
        $tagsGenericos = ['senior', 'junior', 'remoto', 'presencial', 'fullstack', 'frontend', 'backend'];
        return fake()->randomElements($tagsGenericos, rand(1, 3));
    }
}
