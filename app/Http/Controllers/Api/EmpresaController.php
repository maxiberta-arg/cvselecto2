<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmpresaRequest;
use App\Http\Requests\UpdateEmpresaRequest;

class EmpresaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /**
     * Listar todas las empresas.
     */
    public function index()
    {
        return response()->json(\App\Models\Empresa::with(['user', 'busquedasLaborales'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * Crear una nueva empresa.
     */
    public function store(StoreEmpresaRequest $request)
    {
    $empresa = \App\Models\Empresa::create($request->validated());
    return response()->json($empresa, 201);
    }

    /**
     * Display the specified resource.
     */
    /**
     * Mostrar una empresa específica.
     */
    public function show(string $id)
    {
        $empresa = \App\Models\Empresa::with(['user', 'busquedasLaborales'])->findOrFail($id);
        return response()->json($empresa);
    }

    /**
     * Update the specified resource in storage.
     */
    /**
     * Actualizar una empresa existente.
     */
    public function update(UpdateEmpresaRequest $request, string $id)
    {
    $empresa = \App\Models\Empresa::findOrFail($id);
    $empresa->update($request->validated());
    return response()->json($empresa);
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * Eliminar una empresa.
     */
    public function destroy(string $id)
    {
        $empresa = \App\Models\Empresa::findOrFail($id);
        $empresa->delete();
        return response()->json(['mensaje' => 'Empresa eliminada correctamente']);
    }
}
