<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmpresaRequest extends FormRequest
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
            'user_id' => 'required|exists:users,id|unique:empresas,user_id',
            'razon_social' => 'required|string',
            'cuit' => 'required|string|unique:empresas,cuit',
            'telefono' => 'nullable|string',
            'direccion' => 'nullable|string',
            'verificada' => 'boolean',
            'descripcion' => 'nullable|string',
        ];
    }
}
