<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

/**
 * Handler global de excepciones para CVSelecto
 * Devuelve respuestas JSON estandarizadas para la API
 */
class Handler extends ExceptionHandler
{
    /**
     * Reportar o registrar una excepción.
     */
    public function report(Throwable $exception): void
    {
        parent::report($exception);
    }

    /**
     * Renderizar una excepción en una respuesta HTTP.
     */
    public function render($request, Throwable $exception): JsonResponse
    {
        // Si la petición es a la API, devolver JSON estandarizado
        if ($request->expectsJson()) {
            // Validaciones
            if ($exception instanceof ValidationException) {
                return response()->json([
                    'mensaje' => 'Error de validación',
                    'errores' => $exception->errors(),
                ], 422);
            }
            // Excepciones HTTP
            if ($exception instanceof HttpExceptionInterface) {
                return response()->json([
                    'mensaje' => $exception->getMessage() ?: 'Error HTTP',
                ], $exception->getStatusCode());
            }
            // Otras excepciones
            return response()->json([
                'mensaje' => 'Error interno del servidor',
                'detalle' => $exception->getMessage(),
            ], 500);
        }
        // Por defecto, usar el render estándar
        return parent::render($request, $exception);
    }
}
