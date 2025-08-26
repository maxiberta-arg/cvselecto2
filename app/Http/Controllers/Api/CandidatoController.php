<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

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
    public function store(Request $request)
    {
        // Validación básica (reemplazar por FormRequest en el siguiente paso)
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:candidatos,user_id',
            'apellido' => 'required|string',
        ]);

        $candidato = \App\Models\Candidato::create($request->all());
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
    public function update(Request $request, string $id)
    {
        $candidato = \App\Models\Candidato::findOrFail($id);
        $candidato->update($request->all());
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
