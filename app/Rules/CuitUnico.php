<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\Empresa;

class CuitUnico implements ValidationRule
{
    protected $ignoreId;

    public function __construct($ignoreId = null)
    {
        $this->ignoreId = $ignoreId;
    }

    /**
     * Run the validation rule.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$value) {
            return; // Si no hay valor, no validar (es nullable)
        }

        // Limpiar el CUIT de entrada
        $cuitLimpio = preg_replace('/[^0-9]/', '', $value);
        
        // Log para debugging
        \Log::info("Validando CUIT único", [
            'cuit_original' => $value,
            'cuit_limpio' => $cuitLimpio,
            'ignore_id' => $this->ignoreId
        ]);

        // Buscar empresas que tengan el mismo CUIT limpio
        $empresasConMismoCuit = Empresa::all()->filter(function($empresa) use ($cuitLimpio) {
            if (!$empresa->cuit) return false;
            
            $empresaCuitLimpio = preg_replace('/[^0-9]/', '', $empresa->cuit);
            return $empresaCuitLimpio === $cuitLimpio;
        });

        // Excluir el registro actual si se especifica
        if ($this->ignoreId) {
            $empresasConMismoCuit = $empresasConMismoCuit->where('id', '!=', $this->ignoreId);
        }
        
        \Log::info("Empresas encontradas con mismo CUIT", [
            'count' => $empresasConMismoCuit->count(),
            'empresas' => $empresasConMismoCuit->pluck('id', 'razon_social')->toArray()
        ]);

        if ($empresasConMismoCuit->count() > 0) {
            $fail('El CUIT ya está registrado por otra empresa.');
        }
    }
}
