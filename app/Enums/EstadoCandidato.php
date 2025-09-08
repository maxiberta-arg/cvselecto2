<?php

namespace App\Enums;

/**
 * Enum centralizado para estados de candidatos en CVSelecto
 * 
 * Este enum unifica todos los estados posibles de un candidato
 * tanto en postulaciones como en pool empresarial, eliminando
 * inconsistencias y proporcionando una fuente única de verdad.
 * 
 * @version 1.0.0
 * @since Fase 2A
 */
enum EstadoCandidato: string
{
    // Estados de Postulación (flujo público)
    case POSTULADO = 'postulado';
    case EN_REVISION = 'en_revision';
    case ENTREVISTA = 'entrevista';
    case SELECCIONADO = 'seleccionado';
    case RECHAZADO = 'rechazado';
    
    // Estados de Pool Empresarial (flujo privado)
    case EN_POOL = 'en_pool';
    case ACTIVO = 'activo';
    case EN_PROCESO = 'en_proceso';
    case CONTRATADO = 'contratado';
    case DESCARTADO = 'descartado';
    case PAUSADO = 'pausado';
    
    // Estados específicos de Evaluación (Fase 2A - Punto 3)
    case EN_EVALUACION = 'en_evaluacion';
    case EVALUADO = 'evaluado';
    case EVALUACION_PENDIENTE = 'evaluacion_pendiente';

    /**
     * Obtiene todos los estados válidos para postulaciones
     */
    public static function postulacionStates(): array
    {
        return [
            self::POSTULADO,
            self::EN_REVISION,
            self::ENTREVISTA,
            self::SELECCIONADO,
            self::RECHAZADO,
        ];
    }

    /**
     * Obtiene todos los estados válidos para pool empresarial
     */
    public static function poolStates(): array
    {
        return [
            self::EN_POOL,
            self::ACTIVO,
            self::EN_PROCESO,
            self::CONTRATADO,
            self::DESCARTADO,
            self::PAUSADO,
        ];
    }

    /**
     * Obtiene todos los estados específicos de evaluación
     */
    public static function evaluacionStates(): array
    {
        return [
            self::EN_EVALUACION,
            self::EVALUADO,
            self::EVALUACION_PENDIENTE,
        ];
    }

    /**
     * Obtiene todos los valores como array de strings
     */
    public static function values(): array
    {
        return array_map(fn($case) => $case->value, self::cases());
    }

    /**
     * Obtiene todos los estados de postulación como strings
     */
    public static function postulacionValues(): array
    {
        return array_map(fn($case) => $case->value, self::postulacionStates());
    }

    /**
     * Obtiene todos los estados de pool como strings
     */
    public static function poolValues(): array
    {
        return array_map(fn($case) => $case->value, self::poolStates());
    }

    /**
     * Obtiene la etiqueta legible para humanos
     */
    public function label(): string
    {
        return match($this) {
            self::POSTULADO => 'Postulado',
            self::EN_REVISION => 'En Revisión',
            self::ENTREVISTA => 'Entrevista',
            self::SELECCIONADO => 'Seleccionado',
            self::RECHAZADO => 'Rechazado',
            self::EN_POOL => 'En Pool',
            self::ACTIVO => 'Activo',
            self::EN_PROCESO => 'En Proceso',
            self::CONTRATADO => 'Contratado',
            self::DESCARTADO => 'Descartado',
            self::PAUSADO => 'Pausado',
        };
    }

    /**
     * Obtiene la clase CSS de Bootstrap para el badge
     */
    public function badgeClass(): string
    {
        return match($this) {
            self::POSTULADO => 'bg-warning',
            self::EN_REVISION => 'bg-info',
            self::ENTREVISTA => 'bg-primary',
            self::SELECCIONADO => 'bg-success',
            self::RECHAZADO => 'bg-danger',
            self::EN_POOL => 'bg-secondary',
            self::ACTIVO => 'bg-success',
            self::EN_PROCESO => 'bg-info',
            self::CONTRATADO => 'bg-primary',
            self::DESCARTADO => 'bg-danger',
            self::PAUSADO => 'bg-warning',
        };
    }

    /**
     * Obtiene el icono de Bootstrap Icons
     */
    public function icon(): string
    {
        return match($this) {
            self::POSTULADO => 'bi-clock',
            self::EN_REVISION => 'bi-eye',
            self::ENTREVISTA => 'bi-camera-video',
            self::SELECCIONADO => 'bi-check-circle',
            self::RECHAZADO => 'bi-x-circle',
            self::EN_POOL => 'bi-collection',
            self::ACTIVO => 'bi-person-check',
            self::EN_PROCESO => 'bi-gear',
            self::CONTRATADO => 'bi-briefcase',
            self::DESCARTADO => 'bi-person-x',
            self::PAUSADO => 'bi-pause-circle',
        };
    }

    /**
     * Verifica si el estado es final (no permite más transiciones)
     */
    public function isFinal(): bool
    {
        return in_array($this, [
            self::SELECCIONADO,
            self::RECHAZADO,
            self::CONTRATADO,
            self::DESCARTADO,
        ]);
    }

    /**
     * Verifica si el estado permite transición al estado dado
     */
    public function canTransitionTo(EstadoCandidato $newState): bool
    {
        // Si el estado actual es final, no permite transiciones
        if ($this->isFinal()) {
            return false;
        }

        // Reglas de transición específicas
        return match($this) {
            self::POSTULADO => in_array($newState, [
                self::EN_REVISION,
                self::RECHAZADO,
                self::EN_POOL
            ]),
            self::EN_REVISION => in_array($newState, [
                self::ENTREVISTA,
                self::SELECCIONADO,
                self::RECHAZADO,
                self::EN_POOL
            ]),
            self::ENTREVISTA => in_array($newState, [
                self::SELECCIONADO,
                self::RECHAZADO,
                self::EN_POOL
            ]),
            self::EN_POOL => in_array($newState, [
                self::ACTIVO,
                self::DESCARTADO
            ]),
            self::ACTIVO => in_array($newState, [
                self::EN_PROCESO,
                self::PAUSADO,
                self::DESCARTADO
            ]),
            self::EN_PROCESO => in_array($newState, [
                self::CONTRATADO,
                self::ACTIVO,
                self::DESCARTADO
            ]),
            self::PAUSADO => in_array($newState, [
                self::ACTIVO,
                self::DESCARTADO
            ]),
            default => false,
        };
    }

    /**
     * Mapea estados legacy a nuevos estados
     */
    public static function fromLegacy(string $legacyState): ?self
    {
        return match($legacyState) {
            'en proceso' => self::EN_REVISION, // Mapeo específico para postulaciones
            'postulado' => self::POSTULADO,
            'seleccionado' => self::SELECCIONADO,
            'rechazado' => self::RECHAZADO,
            'activo' => self::ACTIVO,
            'en_proceso' => self::EN_PROCESO, // Para pool
            'contratado' => self::CONTRATADO,
            'descartado' => self::DESCARTADO,
            'pausado' => self::PAUSADO,
            default => null,
        };
    }

    /**
     * Mapea un estado legacy a nuevo estado (alias para fromLegacy)
     */
    public static function mapLegacyState(string $legacyState): string
    {
        $mapped = self::fromLegacy($legacyState);
        return $mapped ? $mapped->value : $legacyState;
    }

    /**
     * Verifica si una transición es válida (método estático)
     */
    public static function isValidTransition(string $from, string $to): bool
    {
        $fromState = self::tryFrom($from);
        $toState = self::tryFrom($to);
        
        if (!$fromState || !$toState) {
            return false;
        }
        
        return $fromState->canTransitionTo($toState);
    }
}
