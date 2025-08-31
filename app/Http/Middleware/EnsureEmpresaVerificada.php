<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Empresa;
use App\Constants\EstadosConstantes;
use Symfony\Component\HttpFoundation\Response;

class EnsureEmpresaVerificada
{
    /**
     * Handle an incoming request.
     * Verifica que la empresa esté verificada antes de permitir ciertas operaciones críticas
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        // Solo aplica a usuarios con rol empresa
        if (!$user || $user->rol !== 'empresa') {
            return response()->json([
                'message' => 'No autorizado. Debe ser una empresa.',
                'code' => 'UNAUTHORIZED_ROLE'
            ], 403);
        }

        // Obtener datos de la empresa
        $empresa = Empresa::where('user_id', $user->id)->first();
        
        if (!$empresa) {
            return response()->json([
                'message' => 'Perfil de empresa no encontrado. Complete su registro.',
                'code' => 'EMPRESA_NOT_FOUND'
            ], 404);
        }

        // Verificar estado de verificación
        if ($empresa->estado_verificacion !== EstadosConstantes::ESTADO_EMPRESA_VERIFICADA) {
            $messages = [
                EstadosConstantes::ESTADO_EMPRESA_PENDIENTE => 'Su empresa está pendiente de verificación. No puede realizar esta acción.',
                EstadosConstantes::ESTADO_EMPRESA_RECHAZADA => 'Su empresa ha sido rechazada. Contacte al administrador.',
                EstadosConstantes::ESTADO_EMPRESA_SUSPENDIDA => 'Su empresa está suspendida. Contacte al administrador.',
            ];

            return response()->json([
                'message' => $messages[$empresa->estado_verificacion] ?? 'Estado de empresa no válido.',
                'code' => 'EMPRESA_NOT_VERIFIED',
                'estado_actual' => $empresa->estado_verificacion,
                'notas_verificacion' => $empresa->notas_verificacion
            ], 403);
        }

        // Agregar empresa al request para uso posterior
        $request->merge(['empresa' => $empresa]);
        
        return $next($request);
    }
}
