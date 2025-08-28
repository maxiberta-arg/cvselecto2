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
     * @OA\Get(
     *     path="/api/empresas",
     *     summary="Listar todas las empresas",
     *     tags={"Empresas"},
     *     @OA\Response(
     *         response=200,
     *         description="Listado de empresas"
     *     )
     * )
     */
    public function index()
    {
        return response()->json(\App\Models\Empresa::with(['user', 'busquedasLaborales'])->get());
    }

    /**
     * Store a newly created resource in storage.
     */
    /**
     * @OA\Post(
     *     path="/api/empresas",
     *     summary="Crear una nueva empresa",
     *     tags={"Empresas"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id", "razon_social", "cuit"},
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="razon_social", type="string"),
     *             @OA\Property(property="cuit", type="string"),
     *             @OA\Property(property="telefono", type="string"),
     *             @OA\Property(property="direccion", type="string"),
     *             @OA\Property(property="verificada", type="boolean"),
     *             @OA\Property(property="descripcion", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Empresa creada"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación"
     *     )
     * )
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
     * @OA\Get(
     *     path="/api/empresas/{id}",
     *     summary="Mostrar una empresa específica",
     *     tags={"Empresas"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Datos de la empresa"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Empresa no encontrada"
     *     )
     * )
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
     * @OA\Put(
     *     path="/api/empresas/{id}",
     *     summary="Actualizar una empresa existente",
     *     tags={"Empresas"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="razon_social", type="string"),
     *             @OA\Property(property="cuit", type="string"),
     *             @OA\Property(property="telefono", type="string"),
     *             @OA\Property(property="direccion", type="string"),
     *             @OA\Property(property="verificada", type="boolean"),
     *             @OA\Property(property="descripcion", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Empresa actualizada"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Empresa no encontrada"
     *     )
     * )
     */
    public function update(UpdateEmpresaRequest $request, string $id)
    {
        $empresa = \App\Models\Empresa::findOrFail($id);
        $data = $request->validated();
        
        // Procesar logo si viene en la request
        if ($request->hasFile('logo')) {
            // Eliminar logo anterior si existe
            if ($empresa->logo_path) {
                \Storage::disk('public')->delete(str_replace('/storage/', '', $empresa->logo_path));
            }
            
            $file = $request->file('logo');
            $path = $file->store('logos', 'public');
            $data['logo_path'] = '/storage/' . $path;
        }
        
        // Actualizar timestamp de verificación si cambia el estado
        if (isset($data['estado_verificacion']) && 
            $data['estado_verificacion'] !== $empresa->estado_verificacion) {
            $data['fecha_verificacion'] = now();
            
            // Sincronizar campo legacy 'verificada'
            $data['verificada'] = $data['estado_verificacion'] === 'verificada';
        }
        
        $empresa->update($data);
        
        // Retornar empresa con relaciones actualizadas
        return response()->json($empresa->load('user'));
    }

    /**
     * Remove the specified resource from storage.
     */
    /**
     * @OA\Delete(
     *     path="/api/empresas/{id}",
     *     summary="Eliminar una empresa",
     *     tags={"Empresas"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Empresa eliminada"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Empresa no encontrada"
     *     )
     * )
     */
    public function destroy(string $id)
    {
        $empresa = \App\Models\Empresa::findOrFail($id);
        $empresa->delete();
        return response()->json(['mensaje' => 'Empresa eliminada correctamente']);
    }

    /**
     * @OA\Get(
     *     path="/api/empresas/by-user/{userId}",
     *     summary="Obtener empresa por ID de usuario",
     *     tags={"Empresas"},
     *     @OA\Parameter(
     *         name="userId",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Empresa encontrada",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer"),
     *             @OA\Property(property="razon_social", type="string"),
     *             @OA\Property(property="cuit", type="string"),
     *             @OA\Property(property="telefono", type="string"),
     *             @OA\Property(property="direccion", type="string"),
     *             @OA\Property(property="descripcion", type="string"),
     *             @OA\Property(property="logo_path", type="string"),
     *             @OA\Property(property="sitio_web", type="string"),
     *             @OA\Property(property="linkedin_url", type="string"),
     *             @OA\Property(property="estado_verificacion", type="string"),
     *             @OA\Property(property="sector", type="string"),
     *             @OA\Property(property="empleados_cantidad", type="integer"),
     *             @OA\Property(property="user", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Empresa no encontrada"
     *     )
     * )
     */
    public function getByUser(string $userId)
    {
        $empresa = \App\Models\Empresa::where('user_id', $userId)
            ->with('user')
            ->firstOrFail();
        
        // Construir URLs completas para archivos si existen
        if ($empresa->logo_path && !str_starts_with($empresa->logo_path, 'http')) {
            $empresa->logo_path = url($empresa->logo_path);
        }
        
        return response()->json($empresa);
    }
}
