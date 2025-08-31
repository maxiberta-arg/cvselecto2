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
            // Campos básicos
            'nombre' => 'sometimes|string|max:255',
            'apellido' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|email|max:255|unique:candidatos,email,' . $this->route('candidato'),
            'fecha_nacimiento' => 'nullable|date|before:today',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:500',
            'cv_path' => 'nullable|string',
            'bio' => 'nullable|string|max:1000',
            'habilidades' => 'nullable|string|max:500',
            'linkedin' => 'nullable|url|max:255',
            'experiencia_resumida' => 'nullable|string|max:1000',
            'educacion_resumida' => 'nullable|string|max:1000',
            
            // Campos de migración adicional
            'nivel_educacion' => 'nullable|in:secundario,terciario,universitario,posgrado',
            'experiencia_anos' => 'nullable|integer|min:0|max:50',
            'disponibilidad' => 'nullable|in:inmediata,1_semana,15_dias,1_mes,2_meses',
            'modalidad_preferida' => 'nullable|in:presencial,remoto,hibrido',
            'pretension_salarial' => 'nullable|numeric|min:0|max:999999999.99',
            'linkedin_url' => 'nullable|url|max:255',
            'portfolio_url' => 'nullable|url|max:255',
            
            // Archivos
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
            'cv' => 'nullable|mimes:pdf|max:5120', // 5MB max para CV
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'nombre.string' => 'El nombre debe ser una cadena de texto.',
            'nombre.max' => 'El nombre no puede tener más de 255 caracteres.',
            'apellido.required' => 'El apellido es obligatorio.',
            'apellido.string' => 'El apellido debe ser una cadena de texto.',
            'apellido.max' => 'El apellido no puede tener más de 255 caracteres.',
            'email.email' => 'Debe proporcionar un email válido.',
            'email.unique' => 'Este email ya está registrado para otro candidato.',
            'fecha_nacimiento.date' => 'La fecha de nacimiento debe ser una fecha válida.',
            'fecha_nacimiento.before' => 'La fecha de nacimiento debe ser anterior a hoy.',
            'telefono.max' => 'El teléfono no puede tener más de 20 caracteres.',
            'direccion.max' => 'La dirección no puede tener más de 500 caracteres.',
            'bio.max' => 'La biografía no puede tener más de 1000 caracteres.',
            'habilidades.max' => 'Las habilidades no pueden tener más de 500 caracteres.',
            'linkedin.url' => 'El perfil de LinkedIn debe ser una URL válida.',
            'linkedin_url.url' => 'La URL de LinkedIn debe ser una URL válida.',
            'portfolio_url.url' => 'La URL del portfolio debe ser una URL válida.',
            'experiencia_resumida.max' => 'La experiencia resumida no puede tener más de 1000 caracteres.',
            'educacion_resumida.max' => 'La educación resumida no puede tener más de 1000 caracteres.',
            'nivel_educacion.in' => 'El nivel de educación debe ser: secundario, terciario, universitario o posgrado.',
            'experiencia_anos.integer' => 'Los años de experiencia deben ser un número entero.',
            'experiencia_anos.min' => 'Los años de experiencia no pueden ser negativos.',
            'experiencia_anos.max' => 'Los años de experiencia no pueden ser más de 50.',
            'disponibilidad.in' => 'La disponibilidad debe ser: inmediata, 1_semana, 15_dias, 1_mes o 2_meses.',
            'modalidad_preferida.in' => 'La modalidad preferida debe ser: presencial, remoto o hibrido.',
            'pretension_salarial.numeric' => 'La pretensión salarial debe ser un número.',
            'pretension_salarial.min' => 'La pretensión salarial no puede ser negativa.',
            'avatar.image' => 'El avatar debe ser una imagen.',
            'avatar.mimes' => 'El avatar debe ser un archivo de tipo: jpeg, png, jpg, gif.',
            'avatar.max' => 'El avatar no puede ser mayor a 2MB.',
            'cv.mimes' => 'El CV debe ser un archivo PDF.',
            'cv.max' => 'El CV no puede ser mayor a 5MB.',
        ];
    }
}
