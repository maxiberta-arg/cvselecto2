<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
    public function actualizar(Request $request, $candidatoId)
    {
        $validator = Validator::make($request->all(), [
            'estado_interno' => 'sometimes|in:activo,en_proceso,contratado,descartado,pausado',
            'tags' => 'sometimes|array',
            'notas_privadas' => 'sometimes|string|max:1000',
            'puntuacion_empresa' => 'sometimes|numeric|min:0|max:10',
            'observaciones' => 'sometimes|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Datos inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

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
}
