<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateEmpresaRequest;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Rules\CuitUnico;

class EmpresaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(
            Empresa::with(['user', 'busquedasLaborales'])
                   ->verificadas()
                   ->get()
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UpdateEmpresaRequest $request)
    {
        $data = $request->validated();
        
        // Procesar logo si viene en la request
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $path = $file->store('logos', 'public');
            $data['logo_path'] = '/storage/' . $path;
        }

        $empresa = Empresa::create($data);
        
        return response()->json($empresa->load('user'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $empresa = Empresa::with(['user', 'busquedasLaborales'])->findOrFail($id);
        
        return response()->json($empresa);
    }

    /**
     * Get empresa by user ID
     */
    public function getByUser(string $userId)
    {
        $currentUser = auth()->user();
        
        // Solo el propio usuario o un admin pueden ver los datos de la empresa
        if ($currentUser->id != $userId && $currentUser->rol !== 'admin') {
            return response()->json([
                'message' => 'No autorizado para ver esta empresa.',
                'code' => 'FORBIDDEN'
            ], 403);
        }
        
        $empresa = Empresa::where('user_id', $userId)
                         ->with(['user', 'busquedasLaborales'])
                         ->firstOrFail();
        
        // Construir URLs completas para archivos si existen
        if ($empresa->logo_path && !str_starts_with($empresa->logo_path, 'http')) {
            $empresa->logo_path = url($empresa->logo_path);
        }
        
        return response()->json($empresa);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $empresa = Empresa::findOrFail($id);
        
        // Debug: Registrar datos recibidos
        \Log::info('Update Empresa - Datos recibidos:', [
            'id' => $id,
            'cuit_enviado' => $request->cuit,
            'cuit_actual_empresa' => $empresa->cuit
        ]);
        
        // Limpiar CUIT si viene con formato
        $cuitLimpio = null;
        if ($request->has('cuit') && $request->cuit) {
            $cuitLimpio = preg_replace('/[^0-9]/', '', $request->cuit);
        }
        
        // Crear una copia de los datos para validación
        $dataParaValidacion = $request->all();
        if ($cuitLimpio) {
            $dataParaValidacion['cuit'] = $cuitLimpio;
        }
        
        // Validación manual con el ID correcto y usando Rule::unique()
        $validator = \Validator::make($dataParaValidacion, [
            'razon_social' => [
                'required',
                'string',
                'min:3',
                'max:255',
                \Illuminate\Validation\Rule::unique('empresas', 'razon_social')->ignore($id)
            ],
            'cuit' => [
                'nullable',
                'string',
                new \App\Rules\CuitArgentino(),
                new CuitUnico($id)
            ],
            'telefono' => [
                'required',
                'string',
                'regex:/^[\d\s\-\+\(\)]+$/',
                'min:8',
                'max:20'
            ],
            'direccion' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'sitio_web' => 'nullable|url|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'sector' => 'nullable|string|max:100',
            'tamaño_empresa' => 'nullable|integer|min:1|max:500000',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5120', // 5MB máximo
            
            // Campos del usuario
            'user_name' => 'nullable|string|min:2|max:255',
            'user_email' => [
                'nullable',
                'email',
                'max:255',
                \Illuminate\Validation\Rule::unique('users', 'email')->ignore($empresa->user_id)
            ],
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            \Log::warning('Validación fallida para empresa ID: ' . $id, [
                'errors' => $validator->errors()->toArray(),
                'cuit_enviado' => $request->cuit,
                'cuit_limpio' => $cuitLimpio
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Actualizar datos del usuario asociado si se proporcionan
        $user = $empresa->user;
        if ($request->has('user_name') || $request->has('user_email') || $request->has('password')) {
            $userDataToUpdate = [];
            
            if ($request->has('user_name') && $request->user_name) {
                $userDataToUpdate['name'] = $request->user_name;
            }
            
            if ($request->has('user_email') && $request->user_email) {
                $userDataToUpdate['email'] = $request->user_email;
            }
            
            if ($request->has('password') && $request->password) {
                $userDataToUpdate['password'] = bcrypt($request->password);
            }
            
            if (!empty($userDataToUpdate)) {
                $user->update($userDataToUpdate);
            }
        }
        
        // Preparar datos de la empresa para actualización
        $data = $request->only([
            'razon_social', 'telefono', 'direccion', 'descripcion', 
            'sitio_web', 'linkedin_url', 'sector', 'tamaño_empresa'
        ]);
        
        // Usar el CUIT limpio si se proporcionó
        if ($cuitLimpio !== null) {
            $data['cuit'] = $cuitLimpio;
        }
        
        \Log::info('Datos finales para actualizar empresa:', $data);
        
        // Manejar eliminación del logo si se solicita
        if ($request->has('remove_logo') && $request->input('remove_logo') === '1') {
            if ($empresa->logo_path) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $empresa->logo_path));
            }
            $data['logo_path'] = null;
        }
        // Procesar logo nuevo si viene en la request
        else if ($request->hasFile('logo')) {
            // Eliminar logo anterior si existe
            if ($empresa->logo_path) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $empresa->logo_path));
            }
            
            $file = $request->file('logo');
            $path = $file->store('logos', 'public');
            $data['logo_path'] = '/storage/' . $path;
        }
        
        $empresa->update($data);
        
        // Retornar respuesta de éxito
        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado correctamente',
            'empresa' => $empresa->load('user')
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $empresa = Empresa::findOrFail($id);
        
        // Eliminar logo si existe
        if ($empresa->logo_path) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $empresa->logo_path));
        }
        
        $empresa->delete();
        
        return response()->json(['mensaje' => 'Empresa eliminada correctamente']);
    }

    /**
     * Toggle verification status (Admin only)
     */
    public function toggleVerification(Request $request, string $id)
    {
        $empresa = Empresa::findOrFail($id);
        
        $request->validate([
            'estado_verificacion' => 'required|in:pendiente,verificada,rechazada,suspendida',
            'notas_verificacion' => 'nullable|string|max:1000'
        ]);
        
        $empresa->update([
            'estado_verificacion' => $request->estado_verificacion,
            'verificada_at' => $request->estado_verificacion === 'verificada' ? now() : null,
            'notas_verificacion' => $request->notas_verificacion
        ]);
        
        return response()->json([
            'message' => 'Estado de verificación actualizado',
            'empresa' => $empresa
        ]);
    }

    /**
     * Get pending verification companies (Admin only)
     */
    public function pendingVerification()
    {
        return response()->json(
            Empresa::with('user')
                   ->pendientes()
                   ->orderBy('created_at', 'desc')
                   ->get()
        );
    }
}
