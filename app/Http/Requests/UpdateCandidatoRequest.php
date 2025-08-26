<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCandidatoRequest extends FormRequest
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
            'apellido' => 'sometimes|required|string',
            'fecha_nacimiento' => 'nullable|date',
            'telefono' => 'nullable|string',
            'direccion' => 'nullable|string',
            'cv_path' => 'nullable|string',
        ];
    }
}
