<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Middlewares personalizados para seguridad de empresas
        $middleware->alias([
            'empresa.verificada' => \App\Http\Middleware\EnsureEmpresaVerificada::class,
            'empresa.ownership' => \App\Http\Middleware\EnsureEmpresaOwnership::class,
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
        
        // Configurar rate limiting básico
        $middleware->throttleApi('60,1'); // 60 requests per minute por defecto
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
