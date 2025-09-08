<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePoolCandidatoRequest;
use App\Models\Candidato;
use App\Models\Empresa;
use App\Models\EmpresaCandidato;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

/**
 * Controlador para gestión del pool de candidatos empresarial
 */
class EmpresaPoolController extends Controller
{
    /**
     * Obtener todos los candidatos del pool de la empresa
     */
    public function index(Request $request)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $query = $empresa->empresaCandidatos()
                            ->with(['candidato.user', 'candidato.educaciones', 'candidato.experiencias']);

            // Filtros
            if ($request->filled('estado_interno')) {
                $query->where('estado_interno', $request->estado_interno);
            }

            if ($request->filled('origen')) {
                $query->where('origen', $request->origen);
            }

            if ($request->filled('puntuacion_min')) {
                $query->where('puntuacion_empresa', '>=', $request->puntuacion_min);
            }

            if ($request->filled('puntuacion_max')) {
                $query->where('puntuacion_empresa', '<=', $request->puntuacion_max);
            }

            if ($request->filled('tags')) {
                $tags = is_array($request->tags) ? $request->tags : [$request->tags];
                foreach ($tags as $tag) {
                    $query->whereJsonContains('tags', $tag);
                }
            }

            // Búsqueda por texto
            if ($request->filled('search')) {
                $searchTerm = $request->search;
                $query->whereHas('candidato', function($q) use ($searchTerm) {
                    $q->where('nombre', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('apellido', 'LIKE', "%{$searchTerm}%")
                      ->orWhere('email', 'LIKE', "%{$searchTerm}%")
                      ->orWhereHas('user', function($userQuery) use ($searchTerm) {
                          $userQuery->where('name', 'LIKE', "%{$searchTerm}%")
                                   ->orWhere('email', 'LIKE', "%{$searchTerm}%");
                      });
                });
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'created_at');
            $orderDirection = $request->get('order_direction', 'desc');
            
            $validOrderFields = ['created_at', 'fecha_incorporacion', 'ultimo_contacto', 'puntuacion_empresa'];
            if (in_array($orderBy, $validOrderFields)) {
                $query->orderBy($orderBy, $orderDirection);
            }

            $poolCandidatos = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $poolCandidatos,
                'filtros_aplicados' => $request->only(['estado_interno', 'origen', 'puntuacion_min', 'puntuacion_max', 'tags', 'search'])
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener candidatos del pool',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Agregar candidato existente al pool
     */
    public function agregarExistente(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'candidato_id' => 'required|exists:candidatos,id',
            'origen' => 'sometimes|in:manual,importacion,referido',
            'tags' => 'sometimes|array',
            'notas_privadas' => 'sometimes|string|max:1000',
            'puntuacion_empresa' => 'sometimes|numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $empresa = $this->obtenerEmpresaAutenticada();
            $candidato = Candidato::findOrFail($request->candidato_id);

            // Verificar si ya existe
            if ($empresa->candidatos()->where('candidato_id', $candidato->id)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'El candidato ya está en el pool de esta empresa'
                ], 409);
            }

            // Datos para el pool - usar arrays directos, no JSON
            $datosPool = [
                'origen' => $request->get('origen', 'manual'),
                'estado_interno' => 'activo',
                'tags' => $request->get('tags', []),
                'notas_privadas' => $request->get('notas_privadas'),
                'puntuacion_empresa' => $request->get('puntuacion_empresa'),
                'fecha_incorporacion' => now(),
                'historial_estados' => [[
                    'estado_anterior' => null,
                    'estado_nuevo' => 'activo',
                    'fecha' => now()->toISOString(),
                    'observaciones' => 'Candidato agregado al pool'
                ]]
            ];

            // Crear directamente usando el modelo para aprovechar los casts
            EmpresaCandidato::create(array_merge($datosPool, [
                'empresa_id' => $empresa->id,
                'candidato_id' => $candidato->id
            ]));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Candidato agregado al pool exitosamente',
                'candidato' => $candidato->load('user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error en EmpresaPoolController@agregarExistente: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar candidato al pool',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo candidato y agregarlo al pool
     */
    public function crearYAgregar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telefono' => 'nullable|string|max:20',
            'fecha_nacimiento' => 'nullable|date',
            'direccion' => 'nullable|string|max:500',
            'nivel_educacion' => 'nullable|string|max:100',
            'experiencia_anos' => 'nullable|integer|min:0',
            'disponibilidad' => 'nullable|string|max:50',
            'modalidad_preferida' => 'nullable|string|max:50',
            'pretension_salarial' => 'nullable|numeric|min:0',
            'linkedin_url' => 'nullable|url',
            'portfolio_url' => 'nullable|url',
            'tags' => 'nullable|array',
            'notas_privadas' => 'nullable|string|max:1000',
            'puntuacion_empresa' => 'nullable|numeric|min:0|max:10'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $empresa = $this->obtenerEmpresaAutenticada();

            // Crear usuario
            $usuario = User::create([
                'name' => $request->nombre . ' ' . $request->apellido,
                'email' => $request->email,
                'password' => bcrypt('candidato123'), // Password temporal
                'rol' => 'candidato'
            ]);

            // Crear candidato
            $candidato = Candidato::create([
                'user_id' => $usuario->id,
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'email' => $request->email,
                'telefono' => $request->telefono,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'direccion' => $request->direccion,
                'nivel_educacion' => $request->nivel_educacion,
                'experiencia_anos' => $request->experiencia_anos,
                'disponibilidad' => $request->disponibilidad,
                'modalidad_preferida' => $request->modalidad_preferida,
                'pretension_salarial' => $request->pretension_salarial,
                'linkedin_url' => $request->linkedin_url,
                'portfolio_url' => $request->portfolio_url
            ]);

            // Agregar al pool - usar arrays directos, no JSON
            $datosPool = [
                'origen' => 'manual',
                'estado_interno' => 'activo',
                'tags' => $request->get('tags', []),
                'notas_privadas' => $request->get('notas_privadas'),
                'puntuacion_empresa' => $request->get('puntuacion_empresa'),
                'fecha_incorporacion' => now(),
                'historial_estados' => [[
                    'estado_anterior' => null,
                    'estado_nuevo' => 'activo',
                    'fecha' => now()->toISOString(),
                    'observaciones' => 'Candidato creado y agregado al pool'
                ]]
            ];

            // Crear directamente usando el modelo para aprovechar los casts
            EmpresaCandidato::create(array_merge($datosPool, [
                'empresa_id' => $empresa->id,
                'candidato_id' => $candidato->id
            ]));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Candidato creado y agregado al pool exitosamente',
                'candidato' => $candidato->load('user')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error en EmpresaPoolController@crearYAgregar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear candidato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar datos del candidato en el pool
     */
    public function actualizar(UpdatePoolCandidatoRequest $request, $candidatoId)
    {

        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $empresaCandidato = EmpresaCandidato::where('empresa_id', $empresa->id)
                                              ->where('candidato_id', $candidatoId)
                                              ->firstOrFail();

            $datosActualizacion = [];

            // Actualizar estado si se proporciona
            if ($request->filled('estado_interno')) {
                $estadoAnterior = $empresaCandidato->estado_interno;
                $estadoNuevo = $request->estado_interno;
                
                if ($estadoAnterior !== $estadoNuevo) {
                    $datosActualizacion['estado_interno'] = $estadoNuevo;
                    
                    // Actualizar historial
                    $historial = $empresaCandidato->historial_estados ?? [];
                    $historial[] = [
                        'estado_anterior' => $estadoAnterior,
                        'estado_nuevo' => $estadoNuevo,
                        'fecha' => now()->toISOString(),
                        'observaciones' => $request->get('observaciones', 'Cambio de estado')
                    ];
                    $datosActualizacion['historial_estados'] = $historial;
                }
            }

            // Otros campos
            if ($request->filled('tags')) {
                $datosActualizacion['tags'] = $request->tags;
            }

            if ($request->has('notas_privadas')) {
                $datosActualizacion['notas_privadas'] = $request->notas_privadas;
            }

            if ($request->filled('puntuacion_empresa')) {
                $datosActualizacion['puntuacion_empresa'] = $request->puntuacion_empresa;
            }

            // Actualizar último contacto
            $datosActualizacion['ultimo_contacto'] = now();

            $empresaCandidato->update($datosActualizacion);

            return response()->json([
                'success' => true,
                'message' => 'Candidato actualizado exitosamente',
                'candidato_pool' => $empresaCandidato->load('candidato.user')
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@actualizar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar candidato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar candidato del pool
     */
    public function eliminar($candidatoId)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $eliminado = $empresa->candidatos()->detach($candidatoId);

            if ($eliminado) {
                return response()->json([
                    'success' => true,
                    'message' => 'Candidato eliminado del pool exitosamente'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'El candidato no está en el pool de esta empresa'
                ], 404);
            }

        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@eliminar: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar candidato del pool',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas del pool
     */
    public function estadisticas()
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            $estadisticas = $empresa->estadisticasPool();

            return response()->json([
                'success' => true,
                'data' => $estadisticas
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@estadisticas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Importar candidatos desde postulaciones existentes
     */
    public function importarDesdePostulaciones(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'postulacion_ids' => 'required|array',
            'postulacion_ids.*' => 'exists:postulaciones,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $empresa = $this->obtenerEmpresaAutenticada();
            $postulaciones = \App\Models\Postulacion::with('candidato')
                                                   ->whereIn('id', $request->postulacion_ids)
                                                   ->whereHas('busquedaLaboral', function($q) use ($empresa) {
                                                       $q->where('empresa_id', $empresa->id);
                                                   })
                                                   ->get();

            $candidatosAgregados = 0;
            $candidatosYaExistentes = 0;

            foreach ($postulaciones as $postulacion) {
                // Verificar si ya existe en el pool
                if ($empresa->candidatos()->where('candidato_id', $postulacion->candidato_id)->exists()) {
                    $candidatosYaExistentes++;
                    continue;
                }

                // Agregar al pool - usar arrays directos, no JSON
                $datosPool = [
                    'origen' => 'postulacion',
                    'estado_interno' => 'activo',
                    'tags' => ['importado_postulacion'],
                    'notas_privadas' => "Importado desde postulación a: {$postulacion->busquedaLaboral->titulo}",
                    'puntuacion_empresa' => $postulacion->puntuacion,
                    'fecha_incorporacion' => now(),
                    'historial_estados' => [[
                        'estado_anterior' => null,
                        'estado_nuevo' => 'activo',
                        'fecha' => now()->toISOString(),
                        'observaciones' => 'Candidato importado desde postulación'
                    ]]
                ];

                // Crear directamente usando el modelo para aprovechar los casts
                EmpresaCandidato::create(array_merge($datosPool, [
                    'empresa_id' => $empresa->id,
                    'candidato_id' => $postulacion->candidato_id
                ]));
                $candidatosAgregados++;
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Importación completada: {$candidatosAgregados} candidatos agregados, {$candidatosYaExistentes} ya existían",
                'estadisticas' => [
                    'agregados' => $candidatosAgregados,
                    'ya_existentes' => $candidatosYaExistentes,
                    'total_procesados' => count($postulaciones)
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error en EmpresaPoolController@importarDesdePostulaciones: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al importar candidatos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener empresa autenticada
     */
    private function obtenerEmpresaAutenticada()
    {
        $usuario = Auth::user();
        
        if (!$usuario || $usuario->rol !== 'empresa') {
            throw new \Exception('Usuario no autorizado');
        }

        $empresa = Empresa::where('user_id', $usuario->id)->firstOrFail();
        
        return $empresa;
    }

    /**
     * Obtener detalle específico de un candidato en el pool
     */
    public function show($empresaCandidatoId)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $empresaCandidato = $empresa->empresaCandidatos()
                                       ->with([
                                           'candidato.user',
                                           'candidato.educaciones',
                                           'candidato.experiencias'
                                       ])
                                       ->findOrFail($empresaCandidatoId);

            return response()->json([
                'success' => true,
                'data' => $empresaCandidato
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener detalle del candidato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar información específica del candidato en el pool
     */
    public function updatePoolInfo($candidatoId, UpdatePoolCandidatoRequest $request)
    {

        try {
            DB::beginTransaction();

            $empresa = $this->obtenerEmpresaAutenticada();
            
            $empresaCandidato = $empresa->empresaCandidatos()
                                       ->where('candidato_id', $candidatoId)
                                       ->firstOrFail();

            $datosActualizacion = [];
            
            if ($request->has('notas_privadas')) {
                $datosActualizacion['notas_privadas'] = $request->notas_privadas;
            }
            
            if ($request->has('puntuacion_empresa')) {
                $datosActualizacion['puntuacion_empresa'] = $request->puntuacion_empresa;
            }
            
            if ($request->has('tags')) {
                $datosActualizacion['tags'] = $request->tags;
            }

            // Si hay cambio de estado, actualizar historial
            if ($request->has('estado_interno') && $request->estado_interno !== $empresaCandidato->estado_interno) {
                $historialActual = $empresaCandidato->historial_estados ?? [];
                
                $historialActual[] = [
                    'estado_anterior' => $empresaCandidato->estado_interno,
                    'estado_nuevo' => $request->estado_interno,
                    'fecha' => now()->toISOString(),
                    'observaciones' => 'Cambio de estado desde vista detalle'
                ];
                
                $datosActualizacion['estado_interno'] = $request->estado_interno;
                $datosActualizacion['historial_estados'] = $historialActual;
                
                if ($request->estado_interno === 'contratado') {
                    $datosActualizacion['fecha_contratacion'] = now();
                }
            }

            $empresaCandidato->update($datosActualizacion);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Información actualizada correctamente',
                'data' => $empresaCandidato->fresh()->load('candidato.user')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error en EmpresaPoolController@updatePoolInfo: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar información',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener todos los tags únicos utilizados por la empresa
     */
    public function getTags()
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $tags = $empresa->empresaCandidatos()
                           ->whereNotNull('tags')
                           ->where('tags', '!=', '[]')
                           ->pluck('tags')
                           ->flatten()
                           ->unique()
                           ->values()
                           ->sort();
            
            return response()->json([
                'success' => true,
                'data' => $tags
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@getTags: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tags',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener candidatos listos para evaluación
     */
    public function candidatosParaEvaluacion()
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $candidatos = $empresa->empresaCandidatos()
                ->with(['candidato.user', 'evaluaciones'])
                ->whereIn('estado_interno', ['activo', 'en_proceso'])
                ->get()
                ->map(function ($empresaCandidato) {
                    return [
                        'id' => $empresaCandidato->id,
                        'candidato' => $empresaCandidato->candidato,
                        'estado_interno' => $empresaCandidato->estado_interno,
                        'puntuacion_empresa' => $empresaCandidato->puntuacion_empresa,
                        'resumen_evaluaciones' => $empresaCandidato->resumen_evaluaciones,
                        'tiene_evaluaciones_pendientes' => $empresaCandidato->tieneEvaluacionesPendientes(),
                        'puntuacion_promedio' => $empresaCandidato->puntuacion_promedio_evaluaciones
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $candidatos,
                'meta' => [
                    'total' => $candidatos->count(),
                    'sin_evaluar' => $candidatos->where('resumen_evaluaciones.total', 0)->count(),
                    'evaluacion_pendiente' => $candidatos->where('tiene_evaluaciones_pendientes', true)->count()
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@candidatosParaEvaluacion: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener candidatos para evaluación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener ranking de candidatos basado en evaluaciones
     */
    public function rankingCandidatos(Request $request)
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $tipoEvaluacion = $request->get('tipo_evaluacion');
            $limite = min($request->get('limite', 10), 50);

            $query = $empresa->empresaCandidatos()
                ->with(['candidato.user', 'evaluacionesCompletadas'])
                ->whereHas('evaluacionesCompletadas');

            if ($tipoEvaluacion) {
                $query->whereHas('evaluacionesCompletadas', function ($q) use ($tipoEvaluacion) {
                    $q->where('tipo_evaluacion', $tipoEvaluacion);
                });
            }

            $candidatos = $query->get()
                ->map(function ($empresaCandidato) use ($tipoEvaluacion) {
                    $evaluaciones = $empresaCandidato->evaluacionesCompletadas;
                    
                    if ($tipoEvaluacion) {
                        $evaluaciones = $evaluaciones->where('tipo_evaluacion', $tipoEvaluacion);
                    }
                    
                    return [
                        'id' => $empresaCandidato->id,
                        'candidato' => $empresaCandidato->candidato,
                        'puntuacion_promedio' => $evaluaciones->avg('puntuacion_total'),
                        'total_evaluaciones' => $evaluaciones->count(),
                        'ultima_evaluacion' => $evaluaciones->max('fecha_completada'),
                        'estado_interno' => $empresaCandidato->estado_interno
                    ];
                })
                ->sortByDesc('puntuacion_promedio')
                ->take($limite)
                ->values();

            return response()->json([
                'success' => true,
                'data' => $candidatos,
                'meta' => [
                    'tipo_evaluacion' => $tipoEvaluacion,
                    'limite' => $limite,
                    'total_candidatos_evaluados' => $candidatos->count()
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@rankingCandidatos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener ranking de candidatos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas extendidas incluyendo evaluaciones
     */
    public function estadisticasExtendidas()
    {
        try {
            $empresa = $this->obtenerEmpresaAutenticada();
            
            $estadisticasBasicas = $empresa->estadisticasPool();
            
            // Estadísticas de evaluaciones
            $totalCandidatos = $empresa->empresaCandidatos()->count();
            $candidatosEvaluados = $empresa->empresaCandidatos()
                ->whereHas('evaluacionesCompletadas')
                ->count();
            
            $evaluacionesCompletadas = \App\Models\Evaluacion::whereHas('empresaCandidato', function ($q) use ($empresa) {
                $q->where('empresa_id', $empresa->id);
            })->where('estado_evaluacion', 'completada');

            $estadisticasEvaluacion = [
                'candidatos_evaluados' => $candidatosEvaluados,
                'porcentaje_evaluados' => $totalCandidatos > 0 ? round(($candidatosEvaluados / $totalCandidatos) * 100, 1) : 0,
                'evaluaciones_completadas' => $evaluacionesCompletadas->count(),
                'puntuacion_promedio_general' => $evaluacionesCompletadas->avg('puntuacion_total'),
                'por_tipo_evaluacion' => $evaluacionesCompletadas
                    ->select('tipo_evaluacion', DB::raw('count(*) as total'), DB::raw('avg(puntuacion_total) as promedio'))
                    ->groupBy('tipo_evaluacion')
                    ->get()
                    ->keyBy('tipo_evaluacion'),
                'ultima_semana' => $evaluacionesCompletadas->where('fecha_completada', '>=', now()->subWeek())->count(),
                'ultimo_mes' => $evaluacionesCompletadas->where('fecha_completada', '>=', now()->subMonth())->count()
            ];

            return response()->json([
                'success' => true,
                'data' => array_merge($estadisticasBasicas, [
                    'evaluaciones' => $estadisticasEvaluacion
                ])
            ]);

        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@estadisticasExtendidas: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas extendidas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
            
            return response()->json([
                'success' => true,
                'data' => $tags
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en EmpresaPoolController@getTags: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener tags',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
