<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     * Verifica que el usuario tenga el rol requerido
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json([
                'message' => 'No autenticado.',
                'code' => 'UNAUTHENTICATED'
            ], 401);
        }

        // Verificar si el usuario tiene alguno de los roles requeridos
        if (!in_array($user->rol, $roles)) {
            return response()->json([
                'message' => 'No tiene permisos para realizar esta acción.',
                'code' => 'INSUFFICIENT_PERMISSIONS',
                'required_roles' => $roles,
                'user_role' => $user->rol
            ], 403);
        }

        return $next($request);
    }
}
