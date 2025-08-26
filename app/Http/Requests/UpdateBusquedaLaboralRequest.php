<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBusquedaLaboralRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => 'sometimes|required|string',
            'descripcion' => 'sometimes|required|string',
            'requisitos' => 'nullable|string',
            'estado' => 'in:abierta,cerrada,pausada',
            'fecha_publicacion' => 'nullable|date',
            'fecha_cierre' => 'nullable|date',
        ];
    }
}
