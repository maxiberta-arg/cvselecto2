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
 * Controlador para gestión del sistema de evaluación de candidatos
 * 
 * Maneja todas las operaciones CRUD del Centro de Evaluación,
 * incluyendo creación, actualización, completado y reporte de evaluaciones.
 * 
 * @version 1.0.0
 * @since Fase 2A - Punto 3
 */
class EvaluacionController extends Controller
{
    /**
     * Obtener todas las evaluaciones de la empresa autenticada
     */
    public function index(Request $request)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $query = Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa) {
                $q->where('empresa_id', $empresa->id);
            })->with([
                'empresaCandidato.candidato.user',
                'evaluador'
            ]);

            // Filtros
            if ($request->filled('estado_evaluacion')) {
                $query->where('estado_evaluacion', $request->estado_evaluacion);
            }

            if ($request->filled('tipo_evaluacion')) {
                $query->where('tipo_evaluacion', $request->tipo_evaluacion);
            }

            if ($request->filled('evaluador_id')) {
                $query->where('evaluador_id', $request->evaluador_id);
            }

            if ($request->filled('puntuacion_min')) {
                $query->where('puntuacion_total', '>=', $request->puntuacion_min);
            }

            if ($request->filled('puntuacion_max')) {
                $query->where('puntuacion_total', '<=', $request->puntuacion_max);
            }

            if ($request->filled('fecha_desde')) {
                $query->where('created_at', '>=', $request->fecha_desde);
            }

            if ($request->filled('fecha_hasta')) {
                $query->where('created_at', '<=', $request->fecha_hasta);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            $validSorts = ['created_at', 'puntuacion_total', 'fecha_completada', 'nombre_evaluacion'];
            if (in_array($sortBy, $validSorts)) {
                $query->orderBy($sortBy, $sortOrder);
            }

            // Paginación
            $perPage = min($request->get('per_page', 15), 50);
            $evaluaciones = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $evaluaciones,
                'meta' => [
                    'filtros_aplicados' => array_filter($request->only([
                        'estado_evaluacion', 'tipo_evaluacion', 'evaluador_id',
                        'puntuacion_min', 'puntuacion_max', 'fecha_desde', 'fecha_hasta'
                    ])),
                    'ordenamiento' => ['campo' => $sortBy, 'orden' => $sortOrder]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener evaluaciones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear una nueva evaluación
     */
    public function store(Request $request)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $validator = Validator::make($request->all(), [
                'empresa_candidato_id' => [
                    'required',
                    'exists:empresa_candidatos,id',
                    function ($attribute, $value, $fail) use ($empresa) {
                        $empresaCandidato = EmpresaCandidato::find($value);
                        if (!$empresaCandidato || $empresaCandidato->empresa_id !== $empresa->id) {
                            $fail('El candidato no pertenece a su empresa.');
                        }
                    }
                ],
                'nombre_evaluacion' => 'required|string|max:255',
                'tipo_evaluacion' => [
                    'required',
                    Rule::in(array_keys(Evaluacion::TIPOS_EVALUACION))
                ],
                'criterios_evaluacion' => 'nullable|array',
                'criterios_evaluacion.*.peso' => 'required_with:criterios_evaluacion|numeric|min:0|max:100',
                'criterios_evaluacion.*.descripcion' => 'required_with:criterios_evaluacion|string|max:500',
                'comentarios_generales' => 'nullable|string|max:2000',
                'metadatos' => 'nullable|array'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de evaluación inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // Si no se proporcionan criterios, usar los predefinidos
            $criterios = $request->criterios_evaluacion ?? 
                        Evaluacion::getCriteriosPorTipo($request->tipo_evaluacion);

            // Validar que los pesos sumen 100 (con tolerancia)
            $pesoTotal = collect($criterios)->sum('peso');
            if (abs($pesoTotal - 100) > 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Los pesos de los criterios deben sumar 100%',
                    'peso_actual' => $pesoTotal
                ], 422);
            }

            $evaluacion = Evaluacion::create([
                'empresa_candidato_id' => $request->empresa_candidato_id,
                'evaluador_id' => Auth::id(),
                'nombre_evaluacion' => $request->nombre_evaluacion,
                'tipo_evaluacion' => $request->tipo_evaluacion,
                'criterios_evaluacion' => $criterios,
                'comentarios_generales' => $request->comentarios_generales,
                'estado_evaluacion' => 'pendiente',
                'metadatos' => array_merge([
                    'version_sistema' => '1.0.0',
                    'ip_creacion' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ], $request->metadatos ?? [])
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Evaluación creada exitosamente',
                'data' => $evaluacion->load(['empresaCandidato.candidato.user', 'evaluador'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error al crear evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener una evaluación específica
     */
    public function show($id)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $evaluacion = Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa) {
                $q->where('empresa_id', $empresa->id);
            })->with([
                'empresaCandidato.candidato.user',
                'empresaCandidato.candidato.experiencias',
                'empresaCandidato.candidato.educaciones',
                'evaluador'
            ])->find($id);

            if (!$evaluacion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Evaluación no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $evaluacion,
                'meta' => [
                    'resumen' => $evaluacion->resumen,
                    'puede_editar' => $evaluacion->estado_evaluacion === 'pendiente' || 
                                    $evaluacion->estado_evaluacion === 'en_progreso',
                    'puede_completar' => $evaluacion->estado_evaluacion === 'en_progreso',
                    'tiempo_transcurrido' => $evaluacion->fecha_inicio ? 
                        now()->diffInMinutes($evaluacion->fecha_inicio) : null
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar una evaluación existente
     */
    public function update(Request $request, $id)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $evaluacion = Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa) {
                $q->where('empresa_id', $empresa->id);
            })->find($id);

            if (!$evaluacion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Evaluación no encontrada'
                ], 404);
            }

            // Solo se puede editar si está pendiente o en progreso
            if (!in_array($evaluacion->estado_evaluacion, ['pendiente', 'en_progreso'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se puede editar una evaluación completada'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'nombre_evaluacion' => 'sometimes|string|max:255',
                'puntuaciones' => 'sometimes|array',
                'puntuaciones.*' => 'numeric|min:0|max:100',
                'comentarios_generales' => 'sometimes|nullable|string|max:2000',
                'recomendaciones' => 'sometimes|nullable|string|max:2000',
                'estado_evaluacion' => [
                    'sometimes',
                    Rule::in(['pendiente', 'en_progreso'])
                ]
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos de actualización inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $datosActualizar = $request->only([
                'nombre_evaluacion', 'puntuaciones', 'comentarios_generales', 
                'recomendaciones', 'estado_evaluacion'
            ]);

            // Si se está iniciando la evaluación
            if ($request->estado_evaluacion === 'en_progreso' && 
                $evaluacion->estado_evaluacion === 'pendiente') {
                $datosActualizar['fecha_inicio'] = now();
            }

            // Si se proporcionan puntuaciones, calcular total
            if ($request->has('puntuaciones')) {
                $datosActualizar['puntuacion_total'] = $this->calcularPuntuacionTotal(
                    $evaluacion->criterios_evaluacion, 
                    $request->puntuaciones
                );
            }

            $evaluacion->update($datosActualizar);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Evaluación actualizada exitosamente',
                'data' => $evaluacion->fresh(['empresaCandidato.candidato.user', 'evaluador'])
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar evaluación como completada
     */
    public function completar(Request $request, $id)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $evaluacion = Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa) {
                $q->where('empresa_id', $empresa->id);
            })->find($id);

            if (!$evaluacion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Evaluación no encontrada'
                ], 404);
            }

            if ($evaluacion->estado_evaluacion === 'completada') {
                return response()->json([
                    'success' => false,
                    'message' => 'La evaluación ya está completada'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'puntuaciones' => 'required|array',
                'puntuaciones.*' => 'required|numeric|min:0|max:100',
                'comentarios_generales' => 'nullable|string|max:2000',
                'recomendaciones' => 'nullable|string|max:2000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Datos para completar evaluación inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validar que se han puntuado todos los criterios
            $criteriosRequeridos = array_keys($evaluacion->criterios_evaluacion);
            $criteriosPuntuados = array_keys($request->puntuaciones);
            
            if (array_diff($criteriosRequeridos, $criteriosPuntuados)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe puntuar todos los criterios de evaluación',
                    'criterios_faltantes' => array_diff($criteriosRequeridos, $criteriosPuntuados)
                ], 422);
            }

            DB::beginTransaction();

            $puntuacionTotal = $this->calcularPuntuacionTotal(
                $evaluacion->criterios_evaluacion, 
                $request->puntuaciones
            );

            $evaluacion->update([
                'puntuaciones' => $request->puntuaciones,
                'puntuacion_total' => $puntuacionTotal,
                'comentarios_generales' => $request->comentarios_generales,
                'recomendaciones' => $request->recomendaciones,
                'estado_evaluacion' => 'completada',
                'fecha_completada' => now(),
                'tiempo_evaluacion_minutos' => $evaluacion->fecha_inicio ? 
                    now()->diffInMinutes($evaluacion->fecha_inicio) : null
            ]);

            // Actualizar puntuación en EmpresaCandidato si es la evaluación más reciente
            $empresaCandidato = $evaluacion->empresaCandidato;
            $evaluacionMasReciente = $empresaCandidato->evaluacionReciente;
            
            if ($evaluacionMasReciente && $evaluacionMasReciente->id === $evaluacion->id) {
                $empresaCandidato->update([
                    'puntuacion_empresa' => $puntuacionTotal,
                    'ultimo_contacto' => now()
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Evaluación completada exitosamente',
                'data' => $evaluacion->fresh(['empresaCandidato.candidato.user', 'evaluador']),
                'meta' => [
                    'puntuacion_total' => $puntuacionTotal,
                    'tiempo_evaluacion' => $evaluacion->tiempo_evaluacion_minutos,
                    'resumen' => $evaluacion->resumen
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error al completar evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una evaluación
     */
    public function destroy($id)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $evaluacion = Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa) {
                $q->where('empresa_id', $empresa->id);
            })->find($id);

            if (!$evaluacion) {
                return response()->json([
                    'success' => false,
                    'message' => 'Evaluación no encontrada'
                ], 404);
            }

            // Solo se puede eliminar si está pendiente
            if ($evaluacion->estado_evaluacion !== 'pendiente') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo se pueden eliminar evaluaciones pendientes'
                ], 422);
            }

            $evaluacion->delete();

            return response()->json([
                'success' => true,
                'message' => 'Evaluación eliminada exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener evaluaciones de un candidato específico
     */
    public function porCandidato($empresaCandidatoId)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $empresaCandidato = EmpresaCandidato::where('empresa_id', $empresa->id)
                ->with(['candidato.user'])
                ->find($empresaCandidatoId);

            if (!$empresaCandidato) {
                return response()->json([
                    'success' => false,
                    'message' => 'Candidato no encontrado en su pool'
                ], 404);
            }

            $evaluaciones = $empresaCandidato->evaluaciones()
                ->with(['evaluador'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'candidato' => $empresaCandidato,
                    'evaluaciones' => $evaluaciones,
                    'resumen' => $empresaCandidato->resumen_evaluaciones
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener evaluaciones del candidato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de evaluaciones
     */
    public function estadisticas()
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $evaluaciones = Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa) {
                $q->where('empresa_id', $empresa->id);
            });

            $estadisticas = [
                'total_evaluaciones' => $evaluaciones->count(),
                'completadas' => $evaluaciones->where('estado_evaluacion', 'completada')->count(),
                'pendientes' => $evaluaciones->where('estado_evaluacion', 'pendiente')->count(),
                'en_progreso' => $evaluaciones->where('estado_evaluacion', 'en_progreso')->count(),
                'puntuacion_promedio' => $evaluaciones->where('estado_evaluacion', 'completada')
                    ->avg('puntuacion_total'),
                'por_tipo' => $evaluaciones->select('tipo_evaluacion', DB::raw('count(*) as total'))
                    ->groupBy('tipo_evaluacion')
                    ->pluck('total', 'tipo_evaluacion'),
                'ultima_semana' => $evaluaciones->where('created_at', '>=', now()->subWeek())->count(),
                'ultimo_mes' => $evaluaciones->where('created_at', '>=', now()->subMonth())->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $estadisticas
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener criterios predefinidos por tipo
     */
    public function criteriosPorTipo($tipo)
    {
        try {
            if (!in_array($tipo, array_keys(Evaluacion::TIPOS_EVALUACION))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tipo de evaluación no válido'
                ], 422);
            }

            $criterios = Evaluacion::getCriteriosPorTipo($tipo);

            return response()->json([
                'success' => true,
                'data' => [
                    'tipo' => $tipo,
                    'descripcion' => Evaluacion::TIPOS_EVALUACION[$tipo],
                    'criterios' => $criterios
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener criterios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // MÉTODOS PRIVADOS

    /**
     * Obtener empresa autenticada
     */
    private function obtenerEmpresaAutenticada()
    {
        $user = Auth::user();
        $empresa = Empresa::where('user_id', $user->id)->first();
        
        if (!$empresa) {
            throw new \Exception('Empresa no encontrada para el usuario autenticado');
        }
        
        return $empresa;
    }

    /**
     * Calcular puntuación total basada en criterios y pesos
     */
    private function calcularPuntuacionTotal($criterios, $puntuaciones)
    {
        $puntuacionTotal = 0;
        $pesoTotal = 0;

        foreach ($criterios as $criterio => $config) {
            $peso = $config['peso'] ?? 0;
            $puntuacion = $puntuaciones[$criterio] ?? 0;
            
            $puntuacionTotal += ($puntuacion * $peso / 100);
            $pesoTotal += $peso;
        }

        return $pesoTotal > 0 ? round($puntuacionTotal, 2) : 0;
    }
}