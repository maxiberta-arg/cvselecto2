<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CuitArgentino implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->isValidCuit($value)) {
            $fail('El :attribute debe ser un CUIT argentino válido (formato: XX-XXXXXXXX-X).');
        }
    }

    /**
     * Valida si un CUIT argentino es válido
     */
    private function isValidCuit(string $cuit): bool
    {
        // Remover guiones y espacios
        $cuit = preg_replace('/[^0-9]/', '', $cuit);
        
        // Debe tener exactamente 11 dígitos
        if (strlen($cuit) !== 11) {
            return false;
        }

        // Verificar que todos sean números
        if (!ctype_digit($cuit)) {
            return false;
        }

        // Algoritmo de validación CUIT argentino
        $multiplicador = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        $suma = 0;

        // Calcular suma con multiplicadores
        for ($i = 0; $i < 10; $i++) {
            $suma += intval($cuit[$i]) * $multiplicador[$i];
        }

        // Calcular dígito verificador
        $resto = $suma % 11;
        $digitoVerificador = 0;

        if ($resto === 0) {
            $digitoVerificador = 0;
        } elseif ($resto === 1) {
            // Si el resto es 1, el CUIT es inválido para personas físicas
            // Para empresas puede ser válido con dígito 4 o 9
            $digitoVerificador = 9;
        } else {
            $digitoVerificador = 11 - $resto;
        }

        // Verificar que el dígito verificador coincida
        return intval($cuit[10]) === $digitoVerificador;
    }
}
