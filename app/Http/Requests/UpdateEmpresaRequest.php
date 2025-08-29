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
        $empresaId = $this->route('empresa');

        return [
            // Campos básicos obligatorios
            'razon_social' => [
                'sometimes',
                'string',
                'min:3',
                'max:255',
                'unique:empresas,razon_social,' . $empresaId
            ],
            'cuit' => [
                'sometimes',
                'string',
                new CuitArgentino(),
                'unique:empresas,cuit,' . $empresaId
            ],
            
            // Información de contacto
            'telefono' => [
                'sometimes',
                'nullable',
                'string',
                'regex:/^[\d\s\-\+\(\)]+$/',
                'min:8',
                'max:20'
            ],
            'direccion' => [
                'sometimes',
                'nullable',
                'string',
                'min:10',
                'max:255'
            ],
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
            
            // Descripción e información corporativa
            'descripcion' => [
                'sometimes',
                'nullable',
                'string',
                'min:50',
                'max:2000'
            ],
            'sector' => [
                'sometimes',
                'nullable',
                'string',
                'max:100'
            ],
            'tamaño_empresa' => [
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
            
            'telefono.regex' => 'El formato del teléfono no es válido',
            'telefono.min' => 'El teléfono debe tener al menos 8 caracteres',
            
            'direccion.min' => 'La dirección debe ser más específica (mínimo 10 caracteres)',
            
            'email_contacto.email' => 'Ingrese un email de contacto válido',
            
            'descripcion.min' => 'La descripción debe tener al menos 50 caracteres',
            'descripcion.max' => 'La descripción no puede superar los 2000 caracteres',
            
            'tamaño_empresa.min' => 'El tamaño de empresa debe ser mayor a 0',
            
            'año_fundacion.min' => 'El año de fundación no puede ser anterior a 1800',
            'año_fundacion.max' => 'El año de fundación no puede ser futuro',
            
            'sitio_web.url' => 'Ingrese una URL válida para el sitio web',
            
            'linkedin_url.url' => 'Ingrese una URL válida',
            'linkedin_url.regex' => 'Debe ser una URL válida de LinkedIn',
            
            'logo.image' => 'El logo debe ser una imagen',
            'logo.mimes' => 'El logo debe ser JPG, PNG o GIF',
            'logo.max' => 'El logo no puede superar los 2MB'
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
