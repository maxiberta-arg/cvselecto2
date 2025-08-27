<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CandidatoController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\BusquedaLaboralController;
use App\Http\Controllers\Api\PostulacionController;

// Rutas API RESTful para CVSelecto

// Candidatos
Route::apiResource('candidatos', CandidatoController::class);

// Empresas
Route::apiResource('empresas', EmpresaController::class);

// Búsquedas laborales
Route::apiResource('busquedas-laborales', BusquedaLaboralController::class);

// Postulaciones
Route::apiResource('postulaciones', PostulacionController::class);

// Login
Route::post('login', [AuthController::class, 'login']);
