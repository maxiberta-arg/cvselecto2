<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Evaluacion;

/**
 * Request para crear y actualizar evaluaciones
 * 
 * Valida los datos de entrada para el sistema de evaluación
 * incluyendo criterios, puntuaciones y metadatos.
 */
class EvaluacionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->rol === 'empresa';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'nombre_evaluacion' => 'required|string|max:255',
            'tipo_evaluacion' => [
                'required',
                Rule::in(array_keys(Evaluacion::TIPOS_EVALUACION))
            ],
            'comentarios_generales' => 'nullable|string|max:2000',
            'recomendaciones' => 'nullable|string|max:2000',
            'metadatos' => 'nullable|array'
        ];

        // Reglas específicas para creación
        if ($this->isMethod('POST')) {
            $rules['empresa_candidato_id'] = [
                'required',
                'exists:empresa_candidatos,id',
                function ($attribute, $value, $fail) {
                    $empresaCandidato = \App\Models\EmpresaCandidato::find($value);
                    if (!$empresaCandidato) {
                        $fail('El candidato no existe.');
                        return;
                    }

                    // Verificar que pertenece a la empresa del usuario autenticado
                    $empresa = \App\Models\Empresa::where('user_id', auth()->id())->first();
                    if (!$empresa || $empresaCandidato->empresa_id !== $empresa->id) {
                        $fail('El candidato no pertenece a su empresa.');
                    }
                }
            ];
        }

        // Reglas para criterios de evaluación (opcional, se usan predefinidos si no se proporcionan)
        $rules['criterios_evaluacion'] = 'nullable|array';
        $rules['criterios_evaluacion.*.peso'] = 'required_with:criterios_evaluacion|numeric|min:0|max:100';
        $rules['criterios_evaluacion.*.descripcion'] = 'required_with:criterios_evaluacion|string|max:500';

        // Reglas para puntuaciones (solo en actualización)
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['puntuaciones'] = 'nullable|array';
            $rules['puntuaciones.*'] = 'numeric|min:0|max:100';
            $rules['estado_evaluacion'] = [
                'sometimes',
                Rule::in(['pendiente', 'en_progreso'])
            ];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nombre_evaluacion.required' => 'El nombre de la evaluación es obligatorio.',
            'nombre_evaluacion.max' => 'El nombre de la evaluación no puede tener más de 255 caracteres.',
            'tipo_evaluacion.required' => 'El tipo de evaluación es obligatorio.',
            'tipo_evaluacion.in' => 'El tipo de evaluación seleccionado no es válido.',
            'empresa_candidato_id.required' => 'Debe seleccionar un candidato para evaluar.',
            'empresa_candidato_id.exists' => 'El candidato seleccionado no existe.',
            'criterios_evaluacion.array' => 'Los criterios de evaluación deben ser un array.',
            'criterios_evaluacion.*.peso.required_with' => 'El peso es obligatorio para cada criterio.',
            'criterios_evaluacion.*.peso.numeric' => 'El peso debe ser un número.',
            'criterios_evaluacion.*.peso.min' => 'El peso no puede ser menor a 0.',
            'criterios_evaluacion.*.peso.max' => 'El peso no puede ser mayor a 100.',
            'criterios_evaluacion.*.descripcion.required_with' => 'La descripción es obligatoria para cada criterio.',
            'criterios_evaluacion.*.descripcion.max' => 'La descripción no puede tener más de 500 caracteres.',
            'puntuaciones.array' => 'Las puntuaciones deben ser un array.',
            'puntuaciones.*.numeric' => 'Cada puntuación debe ser un número.',
            'puntuaciones.*.min' => 'Las puntuaciones no pueden ser menores a 0.',
            'puntuaciones.*.max' => 'Las puntuaciones no pueden ser mayores a 100.',
            'comentarios_generales.max' => 'Los comentarios no pueden tener más de 2000 caracteres.',
            'recomendaciones.max' => 'Las recomendaciones no pueden tener más de 2000 caracteres.',
            'estado_evaluacion.in' => 'El estado de evaluación no es válido.',
            'metadatos.array' => 'Los metadatos deben ser un array.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'nombre_evaluacion' => 'nombre de evaluación',
            'tipo_evaluacion' => 'tipo de evaluación',
            'empresa_candidato_id' => 'candidato',
            'criterios_evaluacion' => 'criterios de evaluación',
            'puntuaciones' => 'puntuaciones',
            'comentarios_generales' => 'comentarios generales',
            'recomendaciones' => 'recomendaciones',
            'estado_evaluacion' => 'estado de evaluación',
            'metadatos' => 'metadatos'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        if ($this->expectsJson()) {
            $response = response()->json([
                'success' => false,
                'message' => 'Los datos proporcionados no son válidos.',
                'errors' => $validator->errors()
            ], 422);

            throw new \Illuminate\Validation\ValidationException($validator, $response);
        }

        parent::failedValidation($validator);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validar que los pesos sumen 100% si se proporcionan criterios personalizados
            if ($this->has('criterios_evaluacion') && is_array($this->criterios_evaluacion)) {
                $pesoTotal = collect($this->criterios_evaluacion)->sum('peso');
                
                if (abs($pesoTotal - 100) > 1) { // Tolerancia de 1%
                    $validator->errors()->add('criterios_evaluacion', 
                        "Los pesos de los criterios deben sumar 100%. Suma actual: {$pesoTotal}%");
                }
            }

            // Validar que las puntuaciones correspondan a criterios existentes
            if ($this->has('puntuaciones') && is_array($this->puntuaciones)) {
                // Si es una actualización, obtener criterios de la evaluación existente
                if ($this->route('evaluacion')) {
                    $evaluacion = $this->route('evaluacion');
                    $criteriosEsperados = array_keys($evaluacion->criterios_evaluacion ?? []);
                    
                    $puntuacionesProporcionadas = array_keys($this->puntuaciones);
                    $criteriosFaltantes = array_diff($criteriosEsperados, $puntuacionesProporcionadas);
                    
                    if (!empty($criteriosFaltantes)) {
                        $validator->errors()->add('puntuaciones', 
                            'Faltan puntuaciones para los criterios: ' . implode(', ', $criteriosFaltantes));
                    }
                }
            }
        });
    }
}
