<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CandidatoController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\BusquedaLaboralController;
use App\Http\Controllers\Api\PostulacionController;
use App\Http\Controllers\Api\EvaluacionController;

// Rutas API RESTful para CVSelecto

// Rutas públicas (sin autenticación)
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

// Ruta de prueba para verificar que el servidor funciona
Route::get('test', function () {
    return response()->json([
        'message' => 'API funcionando correctamente',
        'timestamp' => now(),
        'version' => '1.0.0'
    ]);
});

// Rutas que requieren autenticación
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);
    Route::put('user/profile', [AuthController::class, 'updateProfile']);
    
    // Candidatos - TODAS las operaciones requieren autenticación
    Route::apiResource('candidatos', CandidatoController::class);
    Route::get('candidatos/by-user/{userId}', [CandidatoController::class, 'getByUser']);
    Route::get('candidatos-search', [CandidatoController::class, 'search']);
    Route::get('candidatos-by-busqueda/{busquedaId}', [CandidatoController::class, 'byBusqueda']);
    Route::get('candidatos-estadisticas', [CandidatoController::class, 'estadisticas']);
    
    // Empresas - Rutas básicas
    Route::apiResource('empresas', EmpresaController::class);
    Route::get('empresas/by-user/{userId}', [EmpresaController::class, 'getByUser']);
    
    // Empresas - Rutas que requieren empresa verificada con rate limiting
    Route::middleware(['empresa.verificada'])->group(function () {
        // Creación de búsquedas laborales (usa el rate limiting global de 60/min)
        Route::post('busquedas-laborales', [BusquedaLaboralController::class, 'store']);
        
        // Gestión de postulaciones
        Route::patch('postulaciones/{id}/estado', [PostulacionController::class, 'cambiarEstado'])
             ->middleware('empresa.ownership:postulacion');
        Route::patch('postulaciones/{id}/calificar', [PostulacionController::class, 'calificar'])
             ->middleware('empresa.ownership:postulacion');
             
        // INTEGRACIÓN: Postulaciones ↔ Evaluaciones
        Route::get('postulaciones/{id}/evaluaciones', [PostulacionController::class, 'evaluaciones'])
             ->middleware('empresa.ownership:postulacion');
        Route::post('postulaciones/{id}/evaluaciones', [PostulacionController::class, 'crearEvaluacion'])
             ->middleware('empresa.ownership:postulacion');
             
        // Pool de candidatos empresarial
        Route::prefix('pool-candidatos')->name('pool.')->group(function () {
            Route::get('/', [App\Http\Controllers\Api\EmpresaPoolController::class, 'index'])->name('index');
            Route::get('/estadisticas', [App\Http\Controllers\Api\EmpresaPoolController::class, 'estadisticas'])->name('estadisticas');
            Route::get('/estadisticas-extendidas', [App\Http\Controllers\Api\EmpresaPoolController::class, 'estadisticasExtendidas'])->name('estadisticas-extendidas');
            Route::get('/tags', [App\Http\Controllers\Api\EmpresaPoolController::class, 'getTags'])->name('tags');
            Route::get('/para-evaluacion', [App\Http\Controllers\Api\EmpresaPoolController::class, 'candidatosParaEvaluacion'])->name('para-evaluacion');
            Route::get('/ranking', [App\Http\Controllers\Api\EmpresaPoolController::class, 'rankingCandidatos'])->name('ranking');
            Route::get('/candidato/{empresaCandidatoId}', [App\Http\Controllers\Api\EmpresaPoolController::class, 'show'])->name('show');
            Route::post('/agregar-existente', [App\Http\Controllers\Api\EmpresaPoolController::class, 'agregarExistente'])->name('agregar-existente');
            Route::post('/crear-candidato', [App\Http\Controllers\Api\EmpresaPoolController::class, 'crearYAgregar'])->name('crear-candidato');
            Route::put('/candidato/{candidato_id}', [App\Http\Controllers\Api\EmpresaPoolController::class, 'updatePoolInfo'])->name('actualizar');
            Route::delete('/candidato/{candidato_id}', [App\Http\Controllers\Api\EmpresaPoolController::class, 'eliminar'])->name('eliminar');
            Route::post('/importar-postulaciones', [App\Http\Controllers\Api\EmpresaPoolController::class, 'importarDesdePostulaciones'])->name('importar');
        });

        // Sistema de Evaluación de Candidatos (Fase 2A - Punto 3)
        Route::prefix('evaluaciones')->name('evaluaciones.')->group(function () {
            // CRUD básico de evaluaciones
            Route::get('/', [EvaluacionController::class, 'index'])->name('index');
            Route::post('/', [EvaluacionController::class, 'store'])->name('store');
            Route::get('/{evaluacion}', [EvaluacionController::class, 'show'])->name('show');
            Route::put('/{evaluacion}', [EvaluacionController::class, 'update'])->name('update');
            Route::delete('/{evaluacion}', [EvaluacionController::class, 'destroy'])->name('destroy');
            
            // Acciones específicas de evaluación
            Route::post('/{evaluacion}/completar', [EvaluacionController::class, 'completar'])->name('completar');
            
            // Evaluaciones por candidato
            Route::get('/candidato/{empresaCandidatoId}', [EvaluacionController::class, 'porCandidato'])->name('por-candidato');
            
            // Estadísticas y reportes
            Route::get('/estadisticas/general', [EvaluacionController::class, 'estadisticas'])->name('estadisticas');
            
            // Criterios predefinidos
            Route::get('/criterios/{tipo}', [EvaluacionController::class, 'criteriosPorTipo'])->name('criterios-tipo');
        });
    });
    
    // Empresas - Rutas con ownership pero sin restricción de verificación
    Route::middleware('empresa.ownership:busqueda')->group(function () {
        Route::get('busquedas-laborales/{busquedas_laborale}', [BusquedaLaboralController::class, 'show']);
        Route::put('busquedas-laborales/{busquedas_laborale}', [BusquedaLaboralController::class, 'update']);
        Route::delete('busquedas-laborales/{busquedas_laborale}', [BusquedaLaboralController::class, 'destroy']);
    });
    
    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        Route::patch('empresas/{empresa}/verification', [EmpresaController::class, 'toggleVerification']);
        Route::get('empresas-pending-verification', [EmpresaController::class, 'pendingVerification']);
    });
    
    // Búsquedas laborales - Rutas públicas
    Route::get('busquedas-laborales', [BusquedaLaboralController::class, 'index']);
    
    // Postulaciones 
    Route::apiResource('postulaciones', PostulacionController::class);
    Route::get('postulaciones/empresa/{empresaId}', [PostulacionController::class, 'byEmpresa']);
    Route::get('postulaciones/empresa/{empresaId}/estadisticas', [PostulacionController::class, 'estadisticasEmpresa']);
});
