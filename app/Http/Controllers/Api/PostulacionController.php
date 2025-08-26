<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostulacionRequest;
use App\Http\Requests\UpdatePostulacionRequest;

class PostulacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Listar todas las postulaciones.
     */
    public function index()
    {
        return response()->json(\App\Models\Postulacion::with(['busquedaLaboral', 'candidato', 'entrevistas'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Crear una nueva postulación.
     */
    public function store(StorePostulacionRequest $request)
    {
    $postulacion = \App\Models\Postulacion::create($request->validated());
    return response()->json($postulacion, 201);
    }

    /**
     * Display the specified resource.
     */
    /**
     * Mostrar una postulación específica.
     */
    public function show(string $id)
    {
        $postulacion = \App\Models\Postulacion::with(['busquedaLaboral', 'candidato', 'entrevistas'])->findOrFail($id);
        return response()->json($postulacion);
    }

    /**
     * Update the specified resource in storage.
     */
    /**
     * Actualizar una postulación existente.
     */
    public function update(UpdatePostulacionRequest $request, string $id)
    {
    $postulacion = \App\Models\Postulacion::findOrFail($id);
    $postulacion->update($request->validated());
    return response()->json($postulacion);
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * Eliminar una postulación.
     */
    public function destroy(string $id)
    {
        $postulacion = \App\Models\Postulacion::findOrFail($id);
        $postulacion->delete();
        return response()->json(['mensaje' => 'Postulación eliminada correctamente']);
    }
}
