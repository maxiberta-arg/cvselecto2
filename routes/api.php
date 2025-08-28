<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CandidatoController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\BusquedaLaboralController;
use App\Http\Controllers\Api\PostulacionController;

// Rutas API RESTful para CVSelecto

// Rutas públicas (sin autenticación)
Route::post('login', [AuthController::class, 'login']);

// Ruta temporal para creación manual de candidatos (PARA TESTING)
Route::post('candidatos', [CandidatoController::class, 'store']);

// Rutas que requieren autenticación
Route::middleware('auth:sanctum')->group(function () {
    // Autenticación
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);
    Route::put('user/profile', [AuthController::class, 'updateProfile']);
    
    // Candidatos (resto de operaciones)
    Route::get('candidatos', [CandidatoController::class, 'index']);
    Route::get('candidatos/{candidato}', [CandidatoController::class, 'show']);
    Route::put('candidatos/{candidato}', [CandidatoController::class, 'update']);
    Route::delete('candidatos/{candidato}', [CandidatoController::class, 'destroy']);
    Route::get('candidatos/by-user/{userId}', [CandidatoController::class, 'getByUser']);
    
    // Empresas
    Route::apiResource('empresas', EmpresaController::class);
    Route::get('empresas/by-user/{userId}', [EmpresaController::class, 'getByUser']);
    Route::patch('empresas/{empresa}/verification', [EmpresaController::class, 'toggleVerification']);
    Route::get('empresas-pending-verification', [EmpresaController::class, 'pendingVerification']);
    
    // Búsquedas laborales
    Route::apiResource('busquedas-laborales', BusquedaLaboralController::class);
    
    // Postulaciones
    Route::apiResource('postulaciones', PostulacionController::class);
});
