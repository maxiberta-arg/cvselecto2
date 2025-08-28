<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CuitArgentino implements ValidationRule
{
    /**
     * Valida que el CUIT tenga formato argentino válido y dígito verificador correcto
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->isValidCuit($value)) {
            $fail('El CUIT ingresado no es válido. Debe tener formato XX-XXXXXXXX-X y dígito verificador correcto.');
        }
    }

    /**
     * Validación completa de CUIT argentino
     */
    private function isValidCuit(string $cuit): bool
    {
        // Limpiar formato (solo números)
        $cuitNumerico = preg_replace('/[^0-9]/', '', $cuit);
        
        // Debe tener exactamente 11 dígitos
        if (strlen($cuitNumerico) !== 11) {
            return false;
        }

        // Extraer componentes
        $tipoPersona = substr($cuitNumerico, 0, 2);
        $numero = substr($cuitNumerico, 2, 8);
        $digitoVerificador = (int)substr($cuitNumerico, 10, 1);

        // Validar tipo de persona (prefijos válidos)
        $tiposValidos = ['20', '23', '24', '27', '30', '33', '34'];
        if (!in_array($tipoPersona, $tiposValidos)) {
            return false;
        }

        // Calcular dígito verificador
        $secuencia = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
        $suma = 0;

        for ($i = 0; $i < 10; $i++) {
            $suma += (int)$cuitNumerico[$i] * $secuencia[$i];
        }

        $resto = $suma % 11;
        $digitoCalculado = $resto < 2 ? $resto : 11 - $resto;

        return $digitoCalculado === $digitoVerificador;
    }

    /**
     * Formatea CUIT para mostrar (XX-XXXXXXXX-X)
     */
    public static function formatCuit(string $cuit): string
    {
        $cuitNumerico = preg_replace('/[^0-9]/', '', $cuit);
        
        if (strlen($cuitNumerico) === 11) {
            return substr($cuitNumerico, 0, 2) . '-' . 
                   substr($cuitNumerico, 2, 8) . '-' . 
                   substr($cuitNumerico, 10, 1);
        }

        return $cuit;
    }
}\Rules;

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
        //
    }
}
