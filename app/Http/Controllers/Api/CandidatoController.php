<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCandidatoRequest;
use App\Http\Requests\UpdateCandidatoRequest;

class CandidatoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Listar todos los candidatos.
     */
    public function index()
    {
        // Retorna todos los candidatos con sus relaciones principales
        return response()->json(\App\Models\Candidato::with(['user', 'educaciones', 'experiencias', 'postulaciones'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Crear un nuevo candidato.
     */
    public function store(StoreCandidatoRequest $request)
    {
        // Validación básica (reemplazar por FormRequest en el siguiente paso)
    // Validación centralizada con FormRequest
    $candidato = \App\Models\Candidato::create($request->validated());
    return response()->json($candidato, 201);
    }

    /**
     * Display the specified resource.
     */
    /**
     * Mostrar un candidato específico.
     */
    public function show(string $id)
    {
        $candidato = \App\Models\Candidato::with(['user', 'educaciones', 'experiencias', 'postulaciones'])->findOrFail($id);
        return response()->json($candidato);
    }

    /**
     * Update the specified resource in storage.
     */
    /**
     * Actualizar un candidato existente.
     */
    public function update(UpdateCandidatoRequest $request, string $id)
    {
    $candidato = \App\Models\Candidato::findOrFail($id);
    $candidato->update($request->validated());
    return response()->json($candidato);
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * Eliminar un candidato.
     */
    public function destroy(string $id)
    {
        $candidato = \App\Models\Candidato::findOrFail($id);
        $candidato->delete();
        return response()->json(['mensaje' => 'Candidato eliminado correctamente']);
    }
}
