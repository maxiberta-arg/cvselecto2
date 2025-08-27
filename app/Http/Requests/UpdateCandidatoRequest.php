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
            'apellido' => 'sometimes|required|string|max:255',
            'fecha_nacimiento' => 'nullable|date',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:500',
            'cv_path' => 'nullable|string',
            'bio' => 'nullable|string|max:1000',
            'habilidades' => 'nullable|string|max:500',
            'linkedin' => 'nullable|url|max:255',
            'experiencia_resumida' => 'nullable|string|max:1000',
            'educacion_resumida' => 'nullable|string|max:1000',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
            'cv' => 'nullable|mimes:pdf|max:5120', // 5MB max para CV
        ];
    }
}
