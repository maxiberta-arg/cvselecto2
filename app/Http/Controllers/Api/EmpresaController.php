<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateEmpresaRequest;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
    public function update(UpdateEmpresaRequest $request, string $id)
    {
        $empresa = Empresa::findOrFail($id);
        $data = $request->validated();
        
        // Procesar logo si viene en la request
        if ($request->hasFile('logo')) {
            // Eliminar logo anterior si existe
            if ($empresa->logo_path) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $empresa->logo_path));
            }
            
            $file = $request->file('logo');
            $path = $file->store('logos', 'public');
            $data['logo_path'] = '/storage/' . $path;
        }
        
        $empresa->update($data);
        
        // Retornar empresa con relaciones
        return response()->json($empresa->load('user'));
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
