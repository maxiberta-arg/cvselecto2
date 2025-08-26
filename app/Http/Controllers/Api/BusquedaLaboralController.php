<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBusquedaLaboralRequest;
use App\Http\Requests\UpdateBusquedaLaboralRequest;

class BusquedaLaboralController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Listar todas las búsquedas laborales.
     */
    public function index()
    {
        return response()->json(\App\Models\BusquedaLaboral::with(['empresa', 'postulaciones'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Crear una nueva búsqueda laboral.
     */
    public function store(StoreBusquedaLaboralRequest $request)
    {
    $busqueda = \App\Models\BusquedaLaboral::create($request->validated());
    return response()->json($busqueda, 201);
    }

    /**
     * Display the specified resource.
     */
    /**
     * Mostrar una búsqueda laboral específica.
     */
    public function show(string $id)
    {
        $busqueda = \App\Models\BusquedaLaboral::with(['empresa', 'postulaciones'])->findOrFail($id);
        return response()->json($busqueda);
    }

    /**
     * Update the specified resource in storage.
     */
    /**
     * Actualizar una búsqueda laboral existente.
     */
    public function update(UpdateBusquedaLaboralRequest $request, string $id)
    {
    $busqueda = \App\Models\BusquedaLaboral::findOrFail($id);
    $busqueda->update($request->validated());
    return response()->json($busqueda);
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * Eliminar una búsqueda laboral.
     */
    public function destroy(string $id)
    {
        $busqueda = \App\Models\BusquedaLaboral::findOrFail($id);
        $busqueda->delete();
        return response()->json(['mensaje' => 'Búsqueda laboral eliminada correctamente']);
    }
}
