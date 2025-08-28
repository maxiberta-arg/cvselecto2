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
        $query = \App\Models\Candidato::with(['user', 'educaciones', 'experiencias', 'postulaciones']);
        
        // Si hay parámetro de búsqueda, filtrar candidatos
        if (request()->has('search') && !empty(request('search'))) {
            $searchTerm = request('search');
            
            $query->where(function($q) use ($searchTerm) {
                // Buscar por nombre en la tabla users
                $q->whereHas('user', function($userQuery) use ($searchTerm) {
                    $userQuery->where('name', 'LIKE', '%' . $searchTerm . '%')
                             ->orWhere('email', 'LIKE', '%' . $searchTerm . '%');
                })
                // O buscar por teléfono en candidatos
                ->orWhere('telefono', 'LIKE', '%' . $searchTerm . '%');
            });
        }
        
        // Ordenar por fecha de creación más reciente
        $candidatos = $query->orderBy('created_at', 'desc')->get();
        
        // Formatear la respuesta para incluir datos del usuario
        $candidatosFormatted = $candidatos->map(function($candidato) {
            return [
                'id' => $candidato->id,
                'name' => $candidato->user->name ?? 'Sin nombre',
                'email' => $candidato->user->email ?? 'Sin email',
                'telefono' => $candidato->telefono,
                'direccion' => $candidato->direccion,
                'fecha_nacimiento' => $candidato->fecha_nacimiento,
                'nivel_educacion' => $candidato->nivel_educacion,
                'experiencia_anos' => $candidato->experiencia_anos,
                'disponibilidad' => $candidato->disponibilidad,
                'modalidad_preferida' => $candidato->modalidad_preferida,
                'pretension_salarial' => $candidato->pretension_salarial,
                'cv_path' => $candidato->cv_path,
                'linkedin_url' => $candidato->linkedin_url,
                'portfolio_url' => $candidato->portfolio_url,
                'created_at' => $candidato->created_at,
                'updated_at' => $candidato->updated_at
            ];
        });
        
        return response()->json($candidatosFormatted);
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
        try {
            \DB::beginTransaction();
            
            $data = $request->validated();
            
            // Si se está creando desde formulario manual (tiene name y email), crear usuario también
            if (isset($data['name']) && isset($data['email'])) {
                
                // Verificar que no exista ya un usuario con este email
                $existingUser = \App\Models\User::where('email', $data['email'])->first();
                if ($existingUser) {
                    // Si existe usuario, verificar si ya tiene candidato
                    $existingCandidato = \App\Models\Candidato::where('user_id', $existingUser->id)->first();
                    if ($existingCandidato) {
                        return response()->json([
                            'message' => 'Ya existe un candidato registrado con este email.',
                            'candidato_id' => $existingCandidato->id
                        ], 409);
                    }
                    
                    // Si usuario existe pero no tiene candidato, usar usuario existente
                    $user = $existingUser;
                } else {
                    // Crear nuevo usuario
                    $user = \App\Models\User::create([
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'password' => bcrypt('temporal123'), // Password temporal
                        'email_verified_at' => now() // Auto-verificado para candidatos manuales
                    ]);
                }
                
                // Remover name y email del array de candidato
                unset($data['name'], $data['email']);
                
                // Asignar user_id
                $data['user_id'] = $user->id;
                
                // Si no hay apellido proporcionado, usar un valor por defecto
                if (!isset($data['apellido']) || empty($data['apellido'])) {
                    $data['apellido'] = '-'; // Valor por defecto cuando no se proporciona
                }
            }

            // Procesar archivo CV si viene en la request
            if ($request->hasFile('cv_path')) {
                $file = $request->file('cv_path');
                
                // Validar archivo
                if ($file->getSize() > 5 * 1024 * 1024) { // 5MB máximo
                    return response()->json([
                        'message' => 'El archivo CV no puede superar los 5MB'
                    ], 422);
                }
                
                if ($file->getClientOriginalExtension() !== 'pdf') {
                    return response()->json([
                        'message' => 'Solo se permiten archivos PDF para el CV'
                    ], 422);
                }
                
                // Generar nombre único (usar timestamp si no hay usuario creado aún)
                $userId = isset($user) ? $user->id : 'temp_' . time();
                $filename = 'cv_' . time() . '_' . $userId . '.pdf';
                $path = $file->storeAs('cvs', $filename, 'public');
                $data['cv_path'] = '/storage/' . $path;
            }

            // Procesar imagen si viene en la request (para futuras mejoras)
            if ($request->hasFile('avatar')) {
                $file = $request->file('avatar');
                $path = $file->store('avatars', 'public');
                $data['avatar'] = '/storage/' . $path;
            }

            // Crear candidato
            $candidato = \App\Models\Candidato::create($data);
            
            // Cargar relaciones para la respuesta
            $candidato->load('user');
            
            \DB::commit();
            
            // Formatear respuesta
            $candidatoFormatted = [
                'id' => $candidato->id,
                'name' => $candidato->user->name,
                'email' => $candidato->user->email,
                'telefono' => $candidato->telefono,
                'direccion' => $candidato->direccion,
                'fecha_nacimiento' => $candidato->fecha_nacimiento,
                'nivel_educacion' => $candidato->nivel_educacion,
                'experiencia_anos' => $candidato->experiencia_anos,
                'disponibilidad' => $candidato->disponibilidad,
                'modalidad_preferida' => $candidato->modalidad_preferida,
                'pretension_salarial' => $candidato->pretension_salarial,
                'cv_path' => $candidato->cv_path,
                'linkedin_url' => $candidato->linkedin_url,
                'portfolio_url' => $candidato->portfolio_url,
                'created_at' => $candidato->created_at,
                'updated_at' => $candidato->updated_at
            ];
            
            return response()->json($candidatoFormatted, 201);
            
        } catch (\Exception $e) {
            \DB::rollBack();
            
            \Log::error('Error al crear candidato: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Error interno del servidor al crear el candidato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get candidato by user_id
     */
    /**
     * @OA\Get(
     *     path="/api/candidatos/by-user/{userId}",
     *     summary="Obtener candidato por ID de usuario",
     *     tags={"Candidatos"},
     *     @OA\Parameter(
     *         name="userId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Datos del candidato",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="apellido", type="string"),
     *             @OA\Property(property="telefono", type="string"),
     *             @OA\Property(property="direccion", type="string"),
     *             @OA\Property(property="bio", type="string"),
     *             @OA\Property(property="habilidades", type="string"),
     *             @OA\Property(property="linkedin", type="string"),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="name", type="string"),
     *                 @OA\Property(property="email", type="string")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Candidato no encontrado"
     *     )
     * )
     */
    public function getByUser($userId)
    {
        $candidato = \App\Models\Candidato::with(['user', 'educaciones', 'experiencias', 'postulaciones'])
            ->where('user_id', $userId)
            ->firstOrFail();
        
        // Construir URLs completas para archivos si existen
        if ($candidato->cv_path && !str_starts_with($candidato->cv_path, 'http')) {
            $candidato->cv_path = url($candidato->cv_path);
        }
        
        if ($candidato->avatar && !str_starts_with($candidato->avatar, 'http')) {
            $candidato->avatar = url($candidato->avatar);
        }
        
        return response()->json($candidato);
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
        $data = $request->validated();
        
        // Procesar imagen avatar si viene en la request
        if ($request->hasFile('avatar')) {
            // Eliminar avatar anterior si existe
            if ($candidato->avatar) {
                \Storage::disk('public')->delete(str_replace('/storage/', '', $candidato->avatar));
            }
            $file = $request->file('avatar');
            $path = $file->store('avatars', 'public');
            $data['avatar'] = '/storage/' . $path;
        }
        
        // Procesar CV si viene en la request
        if ($request->hasFile('cv')) {
            // Eliminar CV anterior si existe
            if ($candidato->cv_path) {
                \Storage::disk('public')->delete(str_replace('/storage/', '', $candidato->cv_path));
            }
            $file = $request->file('cv');
            $path = $file->store('cvs', 'public');
            $data['cv_path'] = '/storage/' . $path;
        }
        
        $candidato->update($data);
        
        // Retornar candidato con relaciones
        return response()->json($candidato->load('user'));
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
