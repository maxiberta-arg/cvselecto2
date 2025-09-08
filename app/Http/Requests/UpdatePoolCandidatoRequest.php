<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\EstadoCandidato;

class UpdatePoolCandidatoRequest extends FormRequest
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
            'estado_interno' => [
                'sometimes',
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (!in_array($value, EstadoCandidato::poolValues())) {
                        $validStates = implode(', ', EstadoCandidato::poolValues());
                        $fail("El estado '$value' no es válido. Estados permitidos para pool: $validStates");
                    }
                }
            ],
            'tags' => 'sometimes|array',
            'tags.*' => 'string|max:50',
            'notas_privadas' => 'sometimes|nullable|string|max:1000',
            'puntuacion_empresa' => 'sometimes|nullable|numeric|min:0|max:10',
            'observaciones' => 'sometimes|nullable|string|max:500'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'estado_interno.required' => 'El estado interno es requerido.',
            'estado_interno.string' => 'El estado interno debe ser una cadena de texto.',
            'tags.array' => 'Las etiquetas deben ser un array.',
            'tags.*.string' => 'Cada etiqueta debe ser una cadena de texto.',
            'tags.*.max' => 'Cada etiqueta no puede tener más de 50 caracteres.',
            'notas_privadas.string' => 'Las notas privadas deben ser texto.',
            'notas_privadas.max' => 'Las notas privadas no pueden tener más de 1000 caracteres.',
            'puntuacion_empresa.numeric' => 'La puntuación debe ser un número.',
            'puntuacion_empresa.min' => 'La puntuación no puede ser menor a 0.',
            'puntuacion_empresa.max' => 'La puntuación no puede ser mayor a 10.',
            'observaciones.string' => 'Las observaciones deben ser texto.',
            'observaciones.max' => 'Las observaciones no pueden tener más de 500 caracteres.',
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     */
    public function attributes(): array
    {
        return [
            'estado_interno' => 'estado interno',
            'notas_privadas' => 'notas privadas',
            'puntuacion_empresa' => 'puntuación de empresa',
            'observaciones' => 'observaciones',
            'tags' => 'etiquetas'
        ];
    }
}
