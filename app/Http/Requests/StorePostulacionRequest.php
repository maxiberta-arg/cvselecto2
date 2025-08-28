<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostulacionRequest extends FormRequest
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
            'busqueda_id' => 'required|exists:busquedas_laborales,id',
            'candidato_id' => 'required|exists:candidatos,id',
            'estado' => 'nullable|in:postulado,en proceso,rechazado,seleccionado',
            'fecha_postulacion' => 'nullable|date',
            'notas_empresa' => 'nullable|string|max:1000',
            'puntuacion' => 'nullable|numeric|min:0|max:10',
        ];
    }
}
