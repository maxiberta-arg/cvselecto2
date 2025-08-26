<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCandidatoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    /**
     * Autoriza el uso del request (permitir a todos por simplicidad).
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
    /**
     * Reglas de validación para crear candidato.
     */
    public function rules(): array
    {
        return [
            'user_id' => 'required|exists:users,id|unique:candidatos,user_id',
            'apellido' => 'required|string',
            'fecha_nacimiento' => 'nullable|date',
            'telefono' => 'nullable|string',
            'direccion' => 'nullable|string',
            'cv_path' => 'nullable|string',
        ];
    }
}
