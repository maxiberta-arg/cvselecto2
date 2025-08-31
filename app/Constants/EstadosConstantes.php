<?php

namespace App\Constants;

/**
 * Constantes de estados para sincronización entre backend y frontend
 * Mantiene consistencia en todos los enums del sistema
 */
class EstadosConstantes
{
    /**
     * Estados de verificación de empresas
     */
    const ESTADO_EMPRESA_PENDIENTE = 'pendiente';
    const ESTADO_EMPRESA_VERIFICADA = 'verificada';
    const ESTADO_EMPRESA_RECHAZADA = 'rechazada';
    const ESTADO_EMPRESA_SUSPENDIDA = 'suspendida';

    const ESTADOS_EMPRESA = [
        self::ESTADO_EMPRESA_PENDIENTE,
        self::ESTADO_EMPRESA_VERIFICADA,
        self::ESTADO_EMPRESA_RECHAZADA,
        self::ESTADO_EMPRESA_SUSPENDIDA,
    ];

    /**
     * Estados de postulaciones
     */
    const ESTADO_POSTULACION_POSTULADO = 'postulado';
    const ESTADO_POSTULACION_EN_PROCESO = 'en proceso';
    const ESTADO_POSTULACION_RECHAZADO = 'rechazado';
    const ESTADO_POSTULACION_SELECCIONADO = 'seleccionado';

    const ESTADOS_POSTULACION = [
        self::ESTADO_POSTULACION_POSTULADO,
        self::ESTADO_POSTULACION_EN_PROCESO,
        self::ESTADO_POSTULACION_RECHAZADO,
        self::ESTADO_POSTULACION_SELECCIONADO,
    ];

    /**
     * Estados de búsquedas laborales
     */
    const ESTADO_BUSQUEDA_ABIERTA = 'abierta';
    const ESTADO_BUSQUEDA_CERRADA = 'cerrada';
    const ESTADO_BUSQUEDA_PAUSADA = 'pausada';

    const ESTADOS_BUSQUEDA = [
        self::ESTADO_BUSQUEDA_ABIERTA,
        self::ESTADO_BUSQUEDA_CERRADA,
        self::ESTADO_BUSQUEDA_PAUSADA,
    ];

    /**
     * Estados de entrevistas
     */
    const ESTADO_ENTREVISTA_PROGRAMADA = 'programada';
    const ESTADO_ENTREVISTA_REALIZADA = 'realizada';
    const ESTADO_ENTREVISTA_CANCELADA = 'cancelada';
    const ESTADO_ENTREVISTA_REPROGRAMADA = 'reprogramada';

    const ESTADOS_ENTREVISTA = [
        self::ESTADO_ENTREVISTA_PROGRAMADA,
        self::ESTADO_ENTREVISTA_REALIZADA,
        self::ESTADO_ENTREVISTA_CANCELADA,
        self::ESTADO_ENTREVISTA_REPROGRAMADA,
    ];

    /**
     * Obtener todos los estados con sus labels para frontend
     */
    public static function getEstadosEmpresaConLabels(): array
    {
        return [
            self::ESTADO_EMPRESA_PENDIENTE => 'Pendiente de Verificación',
            self::ESTADO_EMPRESA_VERIFICADA => 'Verificada',
            self::ESTADO_EMPRESA_RECHAZADA => 'Rechazada',
            self::ESTADO_EMPRESA_SUSPENDIDA => 'Suspendida',
        ];
    }

    public static function getEstadosPostulacionConLabels(): array
    {
        return [
            self::ESTADO_POSTULACION_POSTULADO => 'Postulado',
            self::ESTADO_POSTULACION_EN_PROCESO => 'En Proceso',
            self::ESTADO_POSTULACION_RECHAZADO => 'Rechazado',
            self::ESTADO_POSTULACION_SELECCIONADO => 'Seleccionado',
        ];
    }

    public static function getEstadosBusquedaConLabels(): array
    {
        return [
            self::ESTADO_BUSQUEDA_ABIERTA => 'Abierta',
            self::ESTADO_BUSQUEDA_CERRADA => 'Cerrada',
            self::ESTADO_BUSQUEDA_PAUSADA => 'Pausada',
        ];
    }

    /**
     * Validar si un estado es válido para un tipo específico
     */
    public static function esEstadoEmpresaValido(string $estado): bool
    {
        return in_array($estado, self::ESTADOS_EMPRESA);
    }

    public static function esEstadoPostulacionValido(string $estado): bool
    {
        return in_array($estado, self::ESTADOS_POSTULACION);
    }

    public static function esEstadoBusquedaValido(string $estado): bool
    {
        return in_array($estado, self::ESTADOS_BUSQUEDA);
    }
}
