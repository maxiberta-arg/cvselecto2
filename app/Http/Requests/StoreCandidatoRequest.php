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
            // Campos para candidatos existentes (registro tradicional)
            'user_id' => 'sometimes|exists:users,id|unique:candidatos,user_id',
            'apellido' => 'sometimes|string',
            
            // Campos para creación manual desde empresa
            'name' => 'sometimes|required|string|min:2|max:255',
            'email' => 'sometimes|required|email|max:255',
            'telefono' => 'nullable|string|regex:/^[\+]?[\d\s\-\(\)]{8,}$/',
            'direccion' => 'nullable|string|max:500',
            'fecha_nacimiento' => 'nullable|date|before:today',
            'nivel_educacion' => 'nullable|in:secundario,terciario,universitario,posgrado',
            'experiencia_anos' => 'nullable|integer|min:0|max:50',
            'disponibilidad' => 'nullable|in:inmediata,1_semana,15_dias,1_mes,2_meses',
            'modalidad_preferida' => 'nullable|in:presencial,remoto,hibrido',
            'pretension_salarial' => 'nullable|numeric|min:0',
            'linkedin_url' => 'nullable|url|regex:/linkedin\.com/',
            'portfolio_url' => 'nullable|url',
            
            // Archivos
            'cv_path' => 'nullable|file|mimes:pdf|max:5120', // 5MB máximo
            'avatar' => 'nullable|file|image|max:2048', // 2MB máximo
        ];
    }

    /**
     * Mensajes de error personalizados
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.min' => 'El nombre debe tener al menos 2 caracteres.',
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email debe tener un formato válido.',
            'telefono.regex' => 'El teléfono debe tener un formato válido.',
            'fecha_nacimiento.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
            'experiencia_anos.integer' => 'Los años de experiencia deben ser un número entero.',
            'experiencia_anos.min' => 'Los años de experiencia no pueden ser negativos.',
            'experiencia_anos.max' => 'Los años de experiencia no pueden superar los 50 años.',
            'linkedin_url.regex' => 'La URL de LinkedIn debe ser válida.',
            'cv_path.mimes' => 'Solo se permiten archivos PDF para el CV.',
            'cv_path.max' => 'El archivo CV no puede superar los 5MB.',
            'avatar.image' => 'El avatar debe ser una imagen.',
            'avatar.max' => 'El avatar no puede superar los 2MB.',
        ];
    }
}
