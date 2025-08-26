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
     * @OA\Get(
     *     path="/api/candidatos",
     *     summary="Listar todos los candidatos",
     *     tags={"Candidatos"},
     *     @OA\Response(
     *         response=200,
     *         description="Listado de candidatos"
     *     )
     * )
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
     * @OA\Post(
     *     path="/api/candidatos",
     *     summary="Crear un nuevo candidato",
     *     tags={"Candidatos"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id", "apellido"},
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="apellido", type="string"),
     *             @OA\Property(property="fecha_nacimiento", type="string", format="date"),
     *             @OA\Property(property="telefono", type="string"),
     *             @OA\Property(property="direccion", type="string"),
     *             @OA\Property(property="cv_path", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Candidato creado"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/candidatos/{id}",
     *     summary="Mostrar un candidato específico",
     *     tags={"Candidatos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Datos del candidato"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Candidato no encontrado"
     *     )
     * )
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
     * @OA\Put(
     *     path="/api/candidatos/{id}",
     *     summary="Actualizar un candidato existente",
     *     tags={"Candidatos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="apellido", type="string"),
     *             @OA\Property(property="fecha_nacimiento", type="string", format="date"),
     *             @OA\Property(property="telefono", type="string"),
     *             @OA\Property(property="direccion", type="string"),
     *             @OA\Property(property="cv_path", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Candidato actualizado"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Candidato no encontrado"
     *     )
     * )
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
     * @OA\Delete(
     *     path="/api/candidatos/{id}",
     *     summary="Eliminar un candidato",
     *     tags={"Candidatos"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Candidato eliminado"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Candidato no encontrado"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $candidato = \App\Models\Candidato::findOrFail($id);
        $candidato->delete();
        return response()->json(['mensaje' => 'Candidato eliminado correctamente']);
    }
}
