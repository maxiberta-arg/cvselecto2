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
     * @OA\Get(
     *     path="/api/postulaciones",
     *     summary="Listar todas las postulaciones",
     *     tags={"Postulaciones"},
     *     @OA\Response(
     *         response=200,
     *         description="Listado de postulaciones"
     *     )
     * )
     */
    public function index()
    {
        return response()->json(\App\Models\Postulacion::with(['busquedaLaboral', 'candidato', 'entrevistas'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * @OA\Post(
     *     path="/api/postulaciones",
     *     summary="Crear una nueva postulación",
     *     tags={"Postulaciones"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"busqueda_id", "candidato_id"},
     *             @OA\Property(property="busqueda_id", type="integer"),
     *             @OA\Property(property="candidato_id", type="integer"),
     *             @OA\Property(property="estado", type="string"),
     *             @OA\Property(property="fecha_postulacion", type="string", format="date")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Postulación creada"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/postulaciones/{id}",
     *     summary="Mostrar una postulación específica",
     *     tags={"Postulaciones"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Datos de la postulación"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Postulación no encontrada"
     *     )
     * )
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
     * @OA\Put(
     *     path="/api/postulaciones/{id}",
     *     summary="Actualizar una postulación existente",
     *     tags={"Postulaciones"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="estado", type="string"),
     *             @OA\Property(property="fecha_postulacion", type="string", format="date")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Postulación actualizada"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Postulación no encontrada"
     *     )
     * )
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
     * @OA\Delete(
     *     path="/api/postulaciones/{id}",
     *     summary="Eliminar una postulación",
     *     tags={"Postulaciones"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Postulación eliminada"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Postulación no encontrada"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $postulacion = \App\Models\Postulacion::findOrFail($id);
        $postulacion->delete();
        return response()->json(['mensaje' => 'Postulación eliminada correctamente']);
    }
}
