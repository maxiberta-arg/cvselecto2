<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evaluacion;
use App\Models\EmpresaCandidato;
use App\Models\Empresa;
use App\Http\Requests\EvaluacionRequest;
use App\Http\Resources\EvaluacionResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * Controller para gestionar evaluaciones de candidatos
 * 
 * Proporciona endpoints para el CRUD completo del sistema de evaluación
 * de candidatos, incluyendo gestión de criterios, puntuaciones y reportes.
 */
class EvaluacionController extends Controller
{
    /**
     * Constructor - aplicar middleware de autenticación
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Obtener empresa autenticada
     */
    private function obtenerEmpresaAutenticada()
    {
        $empresa = Empresa::where('user_id', Auth::id())->first();
        
        if (!$empresa) {
            abort(404, 'Empresa no encontrada');
        }
        
        return $empresa;
    }

    /**
     * Listar evaluaciones de la empresa
     */
    public function index(Request $request)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $query = Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa) {
                $q->where('empresa_id', $empresa->id);
            })->with([
                'empresaCandidato.candidato',
                'empresaCandidato.empresa'
            ]);

            // Filtros
            if ($request->filled('estado_evaluacion')) {
                $query->where('estado_evaluacion', $request->estado_evaluacion);
            }

            if ($request->filled('tipo_evaluacion')) {
                $query->where('tipo_evaluacion', $request->tipo_evaluacion);
            }

            if ($request->filled('candidato_id')) {
                $query->whereHas('empresaCandidato.candidato', function ($q) use ($request) {
                    $q->where('id', $request->candidato_id);
                });
            }

            if ($request->filled('puntuacion_min')) {
                $query->where('puntuacion_total', '>=', $request->puntuacion_min);
            }

            if ($request->filled('puntuacion_max')) {
                $query->where('puntuacion_total', '<=', $request->puntuacion_max);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            $validSorts = ['created_at', 'updated_at', 'puntuacion_total', 'nombre_evaluacion', 'estado_evaluacion'];
            if (in_array($sortBy, $validSorts)) {
                $query->orderBy($sortBy, $sortOrder);
            }

            // Paginación
            $perPage = min($request->get('per_page', 15), 50);
            $evaluaciones = $query->paginate($perPage);

            return EvaluacionResource::collection($evaluaciones)->additional([
                'success' => true,
                'message' => 'Evaluaciones obtenidas exitosamente.',
                'meta' => [
                    'filtros_aplicados' => array_filter($request->only([
                        'estado_evaluacion', 'tipo_evaluacion', 'candidato_id',
                        'puntuacion_min', 'puntuacion_max'
                    ])),
                    'ordenamiento' => ['campo' => $sortBy, 'orden' => $sortOrder]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener evaluaciones.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Crear nueva evaluación
     */
    public function store(EvaluacionRequest $request)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            // Verificar que el candidato pertenece a la empresa
            $empresaCandidato = EmpresaCandidato::where('id', $request->empresa_candidato_id)
                ->where('empresa_id', $empresa->id)
                ->with('candidato')
                ->first();

            if (!$empresaCandidato) {
                return response()->json([
                    'success' => false,
                    'message' => 'Candidato no encontrado o no pertenece a su empresa.'
                ], 404);
            }

            // Verificar que no existe evaluación del mismo tipo
            $evaluacionExistente = Evaluacion::where('empresa_candidato_id', $empresaCandidato->id)
                ->where('tipo_evaluacion', $request->tipo_evaluacion)
                ->first();

            if ($evaluacionExistente) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya existe una evaluación de este tipo para el candidato.'
                ], 422);
            }

            DB::beginTransaction();

            // Crear evaluación
            $evaluacion = new Evaluacion();
            $evaluacion->empresa_candidato_id = $empresaCandidato->id;
            $evaluacion->evaluador_id = Auth::id();
            $evaluacion->nombre_evaluacion = $request->nombre_evaluacion;
            $evaluacion->tipo_evaluacion = $request->tipo_evaluacion;
            $evaluacion->estado_evaluacion = 'pendiente';
            
            // Criterios: personalizados o predefinidos
            $evaluacion->criterios_evaluacion = $request->criterios_evaluacion ?? 
                Evaluacion::CRITERIOS_PREDEFINIDOS[$request->tipo_evaluacion] ?? [];
            
            $evaluacion->comentarios_generales = $request->comentarios_generales;
            $evaluacion->recomendaciones = $request->recomendaciones;
            $evaluacion->metadatos = $request->metadatos ?? [];

            $evaluacion->save();

            // Actualizar estado del candidato
            if ($empresaCandidato->estado === 'aceptado') {
                $empresaCandidato->estado = 'en_evaluacion';
                $empresaCandidato->save();
            }

            DB::commit();

            return (new EvaluacionResource($evaluacion->load(['empresaCandidato.candidato'])))
                ->additional([
                    'success' => true,
                    'message' => 'Evaluación creada exitosamente.'
                ])
                ->response()
                ->setStatusCode(201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear evaluación.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Mostrar evaluación específica
     */
    public function show(Evaluacion $evaluacion)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            // Verificar que la evaluación pertenece a la empresa
            if ($evaluacion->empresaCandidato->empresa_id !== $empresa->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Evaluación no encontrada.'
                ], 404);
            }

            $evaluacion->load(['empresaCandidato.candidato', 'empresaCandidato.empresa']);

            return (new EvaluacionResource($evaluacion))
                ->additional([
                    'success' => true,
                    'message' => 'Evaluación obtenida exitosamente.'
                ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener evaluación.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Actualizar evaluación
     */
    public function update(EvaluacionRequest $request, Evaluacion $evaluacion)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            // Verificar permisos
            if ($evaluacion->empresaCandidato->empresa_id !== $empresa->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para modificar esta evaluación.'
                ], 403);
            }

            // No permitir edición de evaluaciones completadas
            if ($evaluacion->estado_evaluacion === 'completada') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede modificar una evaluación completada.'
                ], 422);
            }

            DB::beginTransaction();

            // Actualizar campos
            $evaluacion->nombre_evaluacion = $request->nombre_evaluacion ?? $evaluacion->nombre_evaluacion;
            $evaluacion->comentarios_generales = $request->comentarios_generales ?? $evaluacion->comentarios_generales;
            $evaluacion->recomendaciones = $request->recomendaciones ?? $evaluacion->recomendaciones;
            
            // Actualizar criterios si se proporcionan
            if ($request->has('criterios_evaluacion')) {
                $evaluacion->criterios_evaluacion = $request->criterios_evaluacion;
            }

            // Actualizar puntuaciones si se proporcionan
            if ($request->has('puntuaciones')) {
                $evaluacion->puntuaciones = array_merge(
                    $evaluacion->puntuaciones ?? [],
                    $request->puntuaciones
                );
                
                // Calcular nueva puntuación total
                $evaluacion->puntuacion_total = $evaluacion->calcularPuntuacionTotal();
                
                // Cambiar estado a 'en_progreso' si tiene puntuaciones
                if ($evaluacion->estado_evaluacion === 'pendiente') {
                    $evaluacion->estado_evaluacion = 'en_progreso';
                }
            }

            // Actualizar metadatos
            if ($request->has('metadatos')) {
                $evaluacion->metadatos = array_merge(
                    $evaluacion->metadatos ?? [],
                    $request->metadatos
                );
            }

            $evaluacion->save();
            DB::commit();

            return (new EvaluacionResource($evaluacion->load(['empresaCandidato.candidato'])))
                ->additional([
                    'success' => true,
                    'message' => 'Evaluación actualizada exitosamente.'
                ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar evaluación.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Eliminar evaluación
     */
    public function destroy(Evaluacion $evaluacion)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            // Verificar permisos
            if ($evaluacion->empresaCandidato->empresa_id !== $empresa->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para eliminar esta evaluación.'
                ], 403);
            }

            // No permitir eliminación de evaluaciones completadas
            if ($evaluacion->estado_evaluacion === 'completada') {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede eliminar una evaluación completada.'
                ], 422);
            }

            DB::beginTransaction();

            // Verificar si es la única evaluación del candidato
            $totalEvaluaciones = Evaluacion::where('empresa_candidato_id', $evaluacion->empresa_candidato_id)->count();
            
            if ($totalEvaluaciones === 1) {
                // Si es la única evaluación, volver el estado del candidato a 'aceptado'
                $empresaCandidato = $evaluacion->empresaCandidato;
                if ($empresaCandidato->estado === 'en_evaluacion') {
                    $empresaCandidato->estado = 'aceptado';
                    $empresaCandidato->save();
                }
            }

            $evaluacion->delete();
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Evaluación eliminada exitosamente.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar evaluación.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Completar evaluación
     */
    public function completar(Evaluacion $evaluacion)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            // Verificar permisos
            if ($evaluacion->empresaCandidato->empresa_id !== $empresa->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'No tiene permisos para completar esta evaluación.'
                ], 403);
            }

            // Verificar que no esté ya completada
            if ($evaluacion->estado_evaluacion === 'completada') {
                return response()->json([
                    'success' => false,
                    'message' => 'La evaluación ya está completada.'
                ], 422);
            }

            // Verificar que tenga todas las puntuaciones necesarias
            $criteriosRequeridos = array_keys($evaluacion->criterios_evaluacion ?? []);
            $puntuacionesActuales = array_keys($evaluacion->puntuaciones ?? []);
            $criteriosFaltantes = array_diff($criteriosRequeridos, $puntuacionesActuales);

            if (!empty($criteriosFaltantes)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La evaluación está incompleta. Faltan puntuaciones para: ' . implode(', ', $criteriosFaltantes)
                ], 422);
            }

            DB::beginTransaction();

            // Marcar como completada
            $evaluacion->marcarComoCompletada();

            // Actualizar estado del candidato
            $empresaCandidato = $evaluacion->empresaCandidato;
            $empresaCandidato->estado = 'evaluado';
            $empresaCandidato->save();

            DB::commit();

            return (new EvaluacionResource($evaluacion->load(['empresaCandidato.candidato'])))
                ->additional([
                    'success' => true,
                    'message' => 'Evaluación completada exitosamente.'
                ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al completar evaluación.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Obtener evaluaciones por candidato
     */
    public function porCandidato(Request $request, $candidatoId)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $evaluaciones = Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa, $candidatoId) {
                $q->where('empresa_id', $empresa->id)
                  ->whereHas('candidato', function ($qq) use ($candidatoId) {
                      $qq->where('id', $candidatoId);
                  });
            })->with(['empresaCandidato.candidato'])->get();

            if ($evaluaciones->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontraron evaluaciones para este candidato.'
                ], 404);
            }

            return EvaluacionResource::collection($evaluaciones)->additional([
                'success' => true,
                'message' => 'Evaluaciones del candidato obtenidas exitosamente.',
                'meta' => [
                    'candidato_id' => $candidatoId,
                    'total_evaluaciones' => $evaluaciones->count(),
                    'evaluaciones_completadas' => $evaluaciones->where('estado_evaluacion', 'completada')->count(),
                    'promedio_puntuacion' => $evaluaciones->where('estado_evaluacion', 'completada')
                        ->avg('puntuacion_total')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener evaluaciones del candidato.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de evaluaciones
     */
    public function estadisticas(Request $request)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $evaluaciones = Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa) {
                $q->where('empresa_id', $empresa->id);
            });

            // Aplicar filtros de fecha si se proporcionan
            if ($request->filled('fecha_desde')) {
                $evaluaciones->where('created_at', '>=', $request->fecha_desde);
            }

            if ($request->filled('fecha_hasta')) {
                $evaluaciones->where('created_at', '<=', $request->fecha_hasta);
            }

            $evaluaciones = $evaluaciones->get();

            $estadisticas = [
                'resumen_general' => [
                    'total_evaluaciones' => $evaluaciones->count(),
                    'evaluaciones_completadas' => $evaluaciones->where('estado_evaluacion', 'completada')->count(),
                    'evaluaciones_en_progreso' => $evaluaciones->where('estado_evaluacion', 'en_progreso')->count(),
                    'evaluaciones_pendientes' => $evaluaciones->where('estado_evaluacion', 'pendiente')->count(),
                ],
                'por_tipo_evaluacion' => $evaluaciones->groupBy('tipo_evaluacion')->map(function ($grupo) {
                    return [
                        'total' => $grupo->count(),
                        'completadas' => $grupo->where('estado_evaluacion', 'completada')->count(),
                        'promedio_puntuacion' => $grupo->where('estado_evaluacion', 'completada')->avg('puntuacion_total')
                    ];
                }),
                'puntuaciones' => [
                    'promedio_general' => $evaluaciones->where('estado_evaluacion', 'completada')->avg('puntuacion_total'),
                    'puntuacion_maxima' => $evaluaciones->where('estado_evaluacion', 'completada')->max('puntuacion_total'),
                    'puntuacion_minima' => $evaluaciones->where('estado_evaluacion', 'completada')->min('puntuacion_total'),
                ],
                'tendencias_mensuales' => $evaluaciones->groupBy(function ($evaluacion) {
                    return $evaluacion->created_at->format('Y-m');
                })->map(function ($grupo) {
                    return [
                        'total' => $grupo->count(),
                        'completadas' => $grupo->where('estado_evaluacion', 'completada')->count(),
                        'promedio_puntuacion' => $grupo->where('estado_evaluacion', 'completada')->avg('puntuacion_total')
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'message' => 'Estadísticas obtenidas exitosamente.',
                'data' => $estadisticas,
                'meta' => [
                    'filtros_aplicados' => $request->only(['fecha_desde', 'fecha_hasta']),
                    'fecha_generacion' => now()->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas.',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }
}
