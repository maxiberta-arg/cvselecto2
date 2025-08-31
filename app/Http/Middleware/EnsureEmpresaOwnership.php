<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Empresa;
use App\Models\BusquedaLaboral;
use App\Models\Postulacion;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmpresaOwnership
{
    /**
     * Handle an incoming request.
     * Verifica que la empresa solo acceda a recursos que le pertenecen
     */
    public function handle(Request $request, Closure $next, string $resourceType = null): Response
    {
        $user = Auth::user();
        
        if (!$user || $user->rol !== 'empresa') {
            return response()->json([
                'message' => 'No autorizado.',
                'code' => 'UNAUTHORIZED'
            ], 403);
        }

        $empresa = Empresa::where('user_id', $user->id)->first();
        
        if (!$empresa) {
            return response()->json([
                'message' => 'Empresa no encontrada.',
                'code' => 'EMPRESA_NOT_FOUND'
            ], 404);
        }

        // Verificar ownership según el tipo de recurso
        if (!$this->verifyOwnership($request, $empresa, $resourceType)) {
            return response()->json([
                'message' => 'No tiene permisos para acceder a este recurso.',
                'code' => 'RESOURCE_FORBIDDEN'
            ], 403);
        }

        return $next($request);
    }

    /**
     * Verifica si la empresa tiene ownership del recurso solicitado
     */
    private function verifyOwnership(Request $request, Empresa $empresa, ?string $resourceType): bool
    {
        // Si no se especifica tipo de recurso, solo verificamos que sea una empresa válida
        if (!$resourceType) {
            return true;
        }

        switch ($resourceType) {
            case 'busqueda':
                return $this->verifyBusquedaOwnership($request, $empresa);
            
            case 'postulacion':
                return $this->verifyPostulacionOwnership($request, $empresa);
                
            default:
                return true;
        }
    }

    /**
     * Verifica ownership de búsquedas laborales
     */
    private function verifyBusquedaOwnership(Request $request, Empresa $empresa): bool
    {
        $busquedaId = $request->route('busquedas_laborale') ?? 
                     $request->route('id') ?? 
                     $request->input('busqueda_id');
        
        if (!$busquedaId) {
            return true; // Si no hay ID específico, permitir (será validado en el controlador)
        }

        $busqueda = BusquedaLaboral::find($busquedaId);
        
        return $busqueda && $busqueda->empresa_id === $empresa->id;
    }

    /**
     * Verifica ownership de postulaciones (a través de búsquedas)
     */
    private function verifyPostulacionOwnership(Request $request, Empresa $empresa): bool
    {
        $postulacionId = $request->route('postulacion') ?? 
                        $request->route('id');
        
        if (!$postulacionId) {
            return true;
        }

        $postulacion = Postulacion::with('busquedaLaboral')->find($postulacionId);
        
        return $postulacion && 
               $postulacion->busquedaLaboral && 
               $postulacion->busquedaLaboral->empresa_id === $empresa->id;
    }
}
