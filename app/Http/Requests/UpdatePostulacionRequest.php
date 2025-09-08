<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enums\EstadoCandidato;

class UpdatePostulacionRequest extends FormRequest
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
            'estado' => [
                'sometimes',
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    if (!in_array($value, EstadoCandidato::postulacionValues())) {
                        $validStates = implode(', ', EstadoCandidato::postulacionValues());
                        $fail("El estado '$value' no es válido. Estados permitidos para postulaciones: $validStates");
                    }
                }
            ],
            'fecha_postulacion' => 'nullable|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'estado.required' => 'El estado es requerido.',
            'fecha_postulacion.date' => 'La fecha de postulación debe ser una fecha válida.',
        ];
    }
}
