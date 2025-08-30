<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\CuitArgentino;

class UpdateEmpresaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Autorizado para usuarios autenticados
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Obtener el ID de la empresa desde la ruta de múltiples formas
        $empresaId = $this->route('empresa') ?? 
                    $this->route()->parameter('empresa') ?? 
                    $this->route()->parameters()['empresa'] ?? 
                    null;
        
        return [
            // Campos básicos obligatorios
            'razon_social' => [
                'required',
                'string',
                'min:3',
                'max:255',
                'unique:empresas,razon_social,' . $empresaId
            ],
            'cuit' => [
                'nullable',
                'string', 
                new CuitArgentino(),
                'unique:empresas,cuit,' . $empresaId
            ],
            
            // Información de contacto obligatoria
            'telefono' => [
                'required',
                'string',
                'regex:/^[\d\s\-\+\(\)]+$/',
                'min:8',
                'max:20'
            ],
            'direccion' => [
                'required',
                'string',
                'min:10',
                'max:255'
            ],
            
            // Descripción obligatoria
            'descripcion' => [
                'required',
                'string',
                'min:50',
                'max:2000'
            ],
            
            // Información de contacto opcional
            'email_contacto' => [
                'sometimes',
                'nullable',
                'email',
                'max:255'
            ],
            'persona_contacto' => [
                'sometimes',
                'nullable',
                'string',
                'min:3',
                'max:255'
            ],
            
            // Información corporativa opcional
            'sector' => [
                'sometimes',
                'nullable',
                'string',
                'max:100'
            ],
            'empleados_cantidad' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
                'max:999999'
            ],
            'año_fundacion' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1800',
                'max:' . date('Y')
            ],
            
            // URLs y redes sociales
            'sitio_web' => [
                'sometimes',
                'nullable',
                'url',
                'max:255'
            ],
            'linkedin_url' => [
                'sometimes',
                'nullable',
                'url',
                'regex:/^https?:\/\/(www\.)?linkedin\.com\/.*/',
                'max:255'
            ],
            
            // Archivos
            'logo' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,gif',
                'max:2048' // 2MB
            ],
            
            // Campos de usuario (opcional)
            'user_name' => [
                'sometimes',
                'string',
                'min:2',
                'max:255'
            ],
            'user_email' => [
                'sometimes',
                'email',
                'max:255'
            ],
            'password' => [
                'sometimes',
                'string',
                'min:8',
                'max:255'
            ],
            'password_confirmation' => [
                'sometimes',
                'same:password'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'razon_social.required' => 'La razón social es obligatoria',
            'razon_social.min' => 'La razón social debe tener al menos 3 caracteres',
            'razon_social.unique' => 'Esta razón social ya está registrada',
            
            'cuit.required' => 'El CUIT es obligatorio',
            'cuit.unique' => 'Este CUIT ya está registrado',
            
            'telefono.required' => 'El teléfono es obligatorio',
            'telefono.regex' => 'El formato del teléfono no es válido',
            'telefono.min' => 'El teléfono debe tener al menos 8 caracteres',
            
            'direccion.required' => 'La dirección es obligatoria',
            'direccion.min' => 'La dirección debe ser más específica (mínimo 10 caracteres)',
            
            'descripcion.required' => 'La descripción de la empresa es obligatoria',
            'descripcion.min' => 'La descripción debe tener al menos 50 caracteres',
            'descripcion.max' => 'La descripción no puede superar los 2000 caracteres',
            
            'email_contacto.email' => 'Ingrese un email de contacto válido',
            
            'empleados_cantidad.min' => 'El número de empleados debe ser mayor a 0',
            
            'año_fundacion.min' => 'El año de fundación no puede ser anterior a 1800',
            'año_fundacion.max' => 'El año de fundación no puede ser futuro',
            
            'sitio_web.url' => 'Ingrese una URL válida para el sitio web',
            
            'linkedin_url.url' => 'Ingrese una URL válida',
            'linkedin_url.regex' => 'Debe ser una URL válida de LinkedIn',
            
            'logo.image' => 'El logo debe ser una imagen',
            'logo.mimes' => 'El logo debe ser JPG, PNG o GIF',
            'logo.max' => 'El logo no puede superar los 2MB',
            
            // Campos de usuario
            'user_name.required' => 'El nombre de usuario es obligatorio',
            'user_name.min' => 'El nombre debe tener al menos 2 caracteres',
            'user_email.required' => 'El email es obligatorio',
            'user_email.email' => 'Ingrese un email válido',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres',
            'password_confirmation.same' => 'La confirmación de contraseña no coincide'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'razon_social' => 'razón social',
            'email_contacto' => 'email de contacto',
            'persona_contacto' => 'persona de contacto',
            'tamaño_empresa' => 'tamaño de empresa',
            'año_fundacion' => 'año de fundación',
            'sitio_web' => 'sitio web',
            'linkedin_url' => 'LinkedIn'
        ];
    }
}
