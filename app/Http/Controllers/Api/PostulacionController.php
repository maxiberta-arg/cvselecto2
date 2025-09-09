<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostulacionRequest;
use App\Http\Requests\UpdatePostulacionRequest;
use App\Enums\EstadoCandidato;

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
        return response()->json(\App\Models\Postulacion::with(['busquedaLaboral', 'candidato.user', 'entrevistas'])->get());
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
        // Verificar si ya existe una postulación para este candidato y búsqueda
        $existente = \App\Models\Postulacion::where('busqueda_id', $request->busqueda_id)
                                           ->where('candidato_id', $request->candidato_id)
                                           ->first();
        
        if ($existente) {
            return response()->json([
                'error' => 'El candidato ya se ha postulado a esta búsqueda laboral',
                'postulacion' => $existente
            ], 422);
        }

        $postulacion = \App\Models\Postulacion::create($request->validated());
        return response()->json($postulacion->load(['candidato.user', 'busquedaLaboral']), 201);
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
        
        // INTEGRACIÓN: Incluir información de evaluaciones
        $evaluacionesInfo = null;
        try {
            $empresaCandidato = $postulacion->obtenerOCrearEmpresaCandidato();
            $evaluaciones = $empresaCandidato->evaluaciones()
                ->select(['id', 'nombre_evaluacion', 'tipo_evaluacion', 'estado_evaluacion', 'puntuacion_total', 'created_at'])
                ->orderBy('created_at', 'desc')
                ->get();
                
            $evaluacionesInfo = [
                'total_evaluaciones' => $evaluaciones->count(),
                'evaluaciones_pendientes' => $evaluaciones->where('estado_evaluacion', 'pendiente')->count(),
                'evaluaciones_completadas' => $evaluaciones->where('estado_evaluacion', 'completada')->count(),
                'puede_generar_evaluacion' => $postulacion->puedeGenerarEvaluacion(),
                'ultima_evaluacion' => $evaluaciones->first(),
                'evaluaciones' => $evaluaciones
            ];
        } catch (\Exception $e) {
            // Si hay algún error, simplemente no incluir la información de evaluaciones
            $evaluacionesInfo = [
                'total_evaluaciones' => 0,
                'puede_generar_evaluacion' => $postulacion->puedeGenerarEvaluacion(),
                'evaluaciones' => []
            ];
        }
        
        $postulacion->evaluaciones_info = $evaluacionesInfo;
        
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

    /**
     * Get postulaciones by empresa ID
     */
    public function byEmpresa(string $empresaId)
    {
        $postulaciones = \App\Models\Postulacion::with(['busquedaLaboral', 'candidato'])
            ->whereHas('busquedaLaboral', function($query) use ($empresaId) {
                $query->where('empresa_id', $empresaId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($postulaciones);
    }

    /**
     * Get estadisticas by empresa ID
     */
    public function estadisticasEmpresa(string $empresaId)
    {
        $stats = \App\Models\Postulacion::whereHas('busquedaLaboral', function($query) use ($empresaId) {
                $query->where('empresa_id', $empresaId);
            })
            ->selectRaw('
                COUNT(*) as total,
                COUNT(CASE WHEN estado = "postulado" THEN 1 END) as postulados,
                COUNT(CASE WHEN estado = "en_revision" THEN 1 END) as en_revision,
                COUNT(CASE WHEN estado = "seleccionado" THEN 1 END) as seleccionados,
                COUNT(CASE WHEN estado = "rechazado" THEN 1 END) as rechazados,
                AVG(puntuacion) as promedio_puntuacion,
                COUNT(CASE WHEN puntuacion IS NOT NULL THEN 1 END) as calificados
            ')
            ->first();

        return response()->json($stats);
    }

    /**
     * Change postulacion status
     */
    public function cambiarEstado(UpdatePostulacionRequest $request, string $id)
    {
        $postulacion = \App\Models\Postulacion::with(['candidato', 'busquedaLaboral'])->findOrFail($id);
        
        $postulacion->update([
            'estado' => $request->estado
        ]);

        // INTEGRACIÓN: Generar evaluación automáticamente si procede
        $evaluacion = null;
        if ($postulacion->puedeGenerarEvaluacion()) {
            $evaluacion = $postulacion->generarEvaluacionSiProcede();
        }

        $response = [
            'success' => true,
            'message' => 'Estado actualizado correctamente',
            'postulacion' => $postulacion
        ];

        // Incluir información de evaluación generada si existe
        if ($evaluacion) {
            $response['evaluacion_generada'] = [
                'id' => $evaluacion->id,
                'estado' => $evaluacion->estado_evaluacion,
                'mensaje' => 'Se ha generado automáticamente una evaluación para este candidato'
            ];
        }

        return response()->json($response);
    }

    /**
     * Calificar candidato
     */
    public function calificar(UpdatePostulacionRequest $request, string $id)
    {
        $postulacion = \App\Models\Postulacion::with(['candidato', 'busquedaLaboral'])->findOrFail($id);
        
        $postulacion->update([
            'puntuacion' => $request->puntuacion,
            'notas_empresa' => $request->notas_empresa
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Candidato calificado correctamente',
            'postulacion' => $postulacion
        ]);
    }

    /**
     * INTEGRACIÓN: Obtener evaluaciones relacionadas con una postulación
     */
    public function evaluaciones(string $id)
    {
        $postulacion = \App\Models\Postulacion::with(['candidato', 'busquedaLaboral.empresa'])->findOrFail($id);
        
        // Obtener o crear la relación empresa-candidato
        $empresaCandidato = $postulacion->obtenerOCrearEmpresaCandidato();
        
        // Obtener todas las evaluaciones
        $evaluaciones = $empresaCandidato->evaluaciones()
            ->with(['evaluador'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'postulacion_id' => $postulacion->id,
            'empresa_candidato_id' => $empresaCandidato->id,
            'evaluaciones' => $evaluaciones,
            'puede_generar_evaluacion' => $postulacion->puedeGenerarEvaluacion()
        ]);
    }

    /**
     * INTEGRACIÓN: Crear evaluación manual para una postulación
     */
    public function crearEvaluacion(\Illuminate\Http\Request $request, string $id)
    {
        $request->validate([
            'nombre_evaluacion' => 'required|string|max:255',
            'tipo_evaluacion' => 'required|in:tecnica,competencias,cultural,entrevista,integral,personalizada',
            'criterios_evaluacion' => 'required|array'
        ]);

        $postulacion = \App\Models\Postulacion::with(['candidato', 'busquedaLaboral.empresa'])->findOrFail($id);
        
        if (!$postulacion->puedeGenerarEvaluacion()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede crear una evaluación para el estado actual de la postulación'
            ], 400);
        }

        $empresaCandidato = $postulacion->obtenerOCrearEmpresaCandidato();
        
        $evaluacion = $empresaCandidato->evaluaciones()->create([
            'evaluador_id' => auth()->id(),
            'nombre_evaluacion' => $request->nombre_evaluacion,
            'tipo_evaluacion' => $request->tipo_evaluacion,
            'criterios_evaluacion' => $request->criterios_evaluacion,
            'estado_evaluacion' => 'pendiente',
            'metadatos' => [
                'origen' => 'manual',
                'postulacion_id' => $postulacion->id,
                'busqueda_titulo' => $postulacion->busquedaLaboral->titulo,
                'creado_por' => auth()->user()->name
            ]
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evaluación creada exitosamente',
            'evaluacion' => $evaluacion->load('evaluador')
        ]);
    }
}
