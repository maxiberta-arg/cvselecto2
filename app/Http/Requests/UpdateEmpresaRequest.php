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
        return true;
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
            'razon_social' => 'sometimes|required|string|min:3|max:255',
            'cuit' => [
                'sometimes',
                'required',
                'string',
                new CuitArgentino(),
                'unique:empresas,cuit,' . $empresaId
            ],
            'telefono' => 'sometimes|required|string|min:8|max:20',
            'direccion' => 'sometimes|required|string|min:10|max:255',
            'descripcion' => 'sometimes|required|string|min:50|max:2000',
            
            // Campos adicionales opcionales
            'sitio_web' => 'nullable|url|max:255',
            'linkedin_url' => 'nullable|url|max:255|regex:/linkedin\.com/',
            'sector' => 'nullable|string|max:100',
            'empleados_cantidad' => 'nullable|integer|min:1|max:100000',
            
            // Archivos
            'logo' => [
                'nullable',
                'file',
                'image',
                'max:2048', // 2MB
                'mimes:jpeg,png,jpg,gif',
                'dimensions:max_width=1000,max_height=1000'
            ],

            // Campos del sistema (solo para admin)
            'estado_verificacion' => 'sometimes|in:pendiente,verificada,rechazada',
            'notas_verificacion' => 'nullable|string|max:1000'
        ];
    }

    /**
     * Mensajes personalizados de validación
     */
    public function messages(): array
    {
        return [
            'razon_social.required' => 'La razón social es obligatoria',
            'razon_social.min' => 'La razón social debe tener al menos 3 caracteres',
            'cuit.required' => 'El CUIT es obligatorio',
            'cuit.unique' => 'Este CUIT ya está registrado en el sistema',
            'telefono.required' => 'El teléfono es obligatorio',
            'telefono.min' => 'El teléfono debe tener al menos 8 caracteres',
            'direccion.required' => 'La dirección es obligatoria',
            'direccion.min' => 'Ingrese una dirección completa (mínimo 10 caracteres)',
            'descripcion.required' => 'La descripción de la empresa es obligatoria',
            'descripcion.min' => 'La descripción debe tener al menos 50 caracteres',
            'descripcion.max' => 'La descripción no puede superar los 2000 caracteres',
            'sitio_web.url' => 'Ingrese una URL válida para el sitio web',
            'linkedin_url.url' => 'Ingrese una URL válida de LinkedIn',
            'linkedin_url.regex' => 'La URL debe pertenecer al dominio linkedin.com',
            'empleados_cantidad.integer' => 'La cantidad de empleados debe ser un número',
            'empleados_cantidad.min' => 'La cantidad mínima de empleados es 1',
            'logo.image' => 'El logo debe ser una imagen',
            'logo.max' => 'El logo no puede superar los 2MB',
            'logo.mimes' => 'El logo debe ser JPG, PNG o GIF',
            'logo.dimensions' => 'El logo no puede superar 1000x1000 píxeles'
        ];
    }

    /**
     * Preparar datos antes de la validación
     */
    protected function prepareForValidation(): void
    {
        // Limpiar y formatear CUIT
        if ($this->has('cuit')) {
            $this->merge([
                'cuit' => preg_replace('/[^0-9]/', '', $this->cuit)
            ]);
        }

        // Limpiar URLs
        if ($this->has('sitio_web') && $this->sitio_web) {
            $url = $this->sitio_web;
            if (!str_starts_with($url, 'http://') && !str_starts_with($url, 'https://')) {
                $url = 'https://' . $url;
            }
            $this->merge(['sitio_web' => $url]);
        }
    }
}
