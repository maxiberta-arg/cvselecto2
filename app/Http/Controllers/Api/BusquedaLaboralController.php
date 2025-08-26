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
     * @OA\Get(
     *     path="/api/busquedas-laborales",
     *     summary="Listar todas las búsquedas laborales",
     *     tags={"Búsquedas Laborales"},
     *     @OA\Response(
     *         response=200,
     *         description="Listado de búsquedas laborales"
     *     )
     * )
     */
    public function index()
    {
        return response()->json(\App\Models\BusquedaLaboral::with(['empresa', 'postulaciones'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * @OA\Post(
     *     path="/api/busquedas-laborales",
     *     summary="Crear una nueva búsqueda laboral",
     *     tags={"Búsquedas Laborales"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"empresa_id", "titulo", "descripcion"},
     *             @OA\Property(property="empresa_id", type="integer"),
     *             @OA\Property(property="titulo", type="string"),
     *             @OA\Property(property="descripcion", type="string"),
     *             @OA\Property(property="requisitos", type="string"),
     *             @OA\Property(property="estado", type="string"),
     *             @OA\Property(property="fecha_publicacion", type="string", format="date"),
     *             @OA\Property(property="fecha_cierre", type="string", format="date")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Búsqueda laboral creada"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/busquedas-laborales/{id}",
     *     summary="Mostrar una búsqueda laboral específica",
     *     tags={"Búsquedas Laborales"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Datos de la búsqueda laboral"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Búsqueda laboral no encontrada"
     *     )
     * )
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
     * @OA\Put(
     *     path="/api/busquedas-laborales/{id}",
     *     summary="Actualizar una búsqueda laboral existente",
     *     tags={"Búsquedas Laborales"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="titulo", type="string"),
     *             @OA\Property(property="descripcion", type="string"),
     *             @OA\Property(property="requisitos", type="string"),
     *             @OA\Property(property="estado", type="string"),
     *             @OA\Property(property="fecha_publicacion", type="string", format="date"),
     *             @OA\Property(property="fecha_cierre", type="string", format="date")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Búsqueda laboral actualizada"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Búsqueda laboral no encontrada"
     *     )
     * )
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
     * @OA\Delete(
     *     path="/api/busquedas-laborales/{id}",
     *     summary="Eliminar una búsqueda laboral",
     *     tags={"Búsquedas Laborales"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Búsqueda laboral eliminada"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Búsqueda laboral no encontrada"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $busqueda = \App\Models\BusquedaLaboral::findOrFail($id);
        $busqueda->delete();
        return response()->json(['mensaje' => 'Búsqueda laboral eliminada correctamente']);
    }
}
