<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\BusquedaLaboral;
use App\Models\Empresa;
use App\Models\User;

class DebugDatos extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'debug:datos';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Debug de datos para el dashboard de empresa';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== VERIFICACIÓN DE DATOS ===');

        $this->info('Usuarios de empresa:');
        $users = User::where('rol', 'empresa')->get();
        foreach ($users as $user) {
            $this->info("ID: {$user->id}, Email: {$user->email}, Rol: {$user->rol}");
        }

        $this->info('');
        $this->info('Empresas en el sistema:');
        $empresas = Empresa::all();
        foreach ($empresas as $empresa) {
            $this->info("ID: {$empresa->id}, Nombre: {$empresa->nombre}, User ID: {$empresa->user_id}");
        }

        $this->info('');
        $this->info('Búsquedas laborales:');
        $busquedas = BusquedaLaboral::with('empresa')->get();
        foreach ($busquedas as $busqueda) {
            $this->info("ID: {$busqueda->id}, Empresa ID: {$busqueda->empresa_id}, Título: {$busqueda->titulo}, Estado: {$busqueda->estado}");
            $this->info("  → Empresa: " . ($busqueda->empresa ? $busqueda->empresa->nombre : 'No encontrada'));
        }

        $this->info('');
        $this->info("Total búsquedas: " . $busquedas->count());
        $this->info("Búsquedas activas: " . $busquedas->where('estado', 'activa')->count());

        // Buscar al usuario empresa@test.com específicamente
        $this->info('');
        $this->info('=== USUARIO empresa@test.com ===');
        $userEmpresa = User::where('email', 'empresa@test.com')->first();
        if ($userEmpresa) {
            $this->info("Usuario encontrado: ID {$userEmpresa->id}");
            $empresa = Empresa::where('user_id', $userEmpresa->id)->first();
            if ($empresa) {
                $this->info("Empresa asociada: ID {$empresa->id}, Nombre: {$empresa->nombre}");
                $busquedasEmpresa = BusquedaLaboral::where('empresa_id', $empresa->id)->get();
                $this->info("Búsquedas de esta empresa:");
                foreach ($busquedasEmpresa as $busqueda) {
                    $this->info("  - ID: {$busqueda->id}, Título: {$busqueda->titulo}, Estado: {$busqueda->estado}");
                }
                $this->info("Total: " . $busquedasEmpresa->count());
                $this->info("Activas: " . $busquedasEmpresa->where('estado', 'activa')->count());
            } else {
                $this->info("No se encontró empresa asociada al usuario");
            }
        } else {
            $this->info("Usuario empresa@test.com no encontrado");
        }
    }
}
