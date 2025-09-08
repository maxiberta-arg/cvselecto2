<?php

/**
 * Script de testing completo para la API de Evaluaciones
 * 
 * Valida todos los endpoints del sistema de evaluación implementado
 * en la Fase 2 del Centro de Evaluación.
 */

require_once 'vendor/autoload.php';

class EvaluacionApiTester
{
    private $baseUrl;
    private $token;
    private $empresaId;
    private $candidatoId;
    private $evaluacionId;
    
    public function __construct()
    {
        $this->baseUrl = 'http://localhost:8000/api';
        $this->empresaId = null;
        $this->candidatoId = null;
        $this->evaluacionId = null;
    }

    /**
     * Ejecutar todos los tests
     */
    public function ejecutarTests()
    {
        echo "🧪 INICIANDO TESTS DE API DE EVALUACIONES\n";
        echo "==========================================\n\n";

        // 1. Autenticación
        if (!$this->testAutenticacion()) {
            echo "❌ ERROR: No se pudo autenticar. Abortando tests.\n";
            return false;
        }

        // 2. Preparar datos de prueba
        if (!$this->prepararDatosPrueba()) {
            echo "❌ ERROR: No se pudieron preparar datos de prueba.\n";
            return false;
        }

        // 3. Tests de CRUD de evaluaciones
        $this->testCrearEvaluacion();
        $this->testListarEvaluaciones();
        $this->testObtenerEvaluacion();
        $this->testActualizarEvaluacion();
        $this->testCompletarEvaluacion();
        
        // 4. Tests de endpoints específicos
        $this->testEvaluacionesPorCandidato();
        $this->testEstadisticasEvaluaciones();
        
        // 5. Tests de validación y errores
        $this->testValidaciones();
        $this->testAutorizacion();
        
        // 6. Cleanup
        $this->testEliminarEvaluacion();

        echo "\n✅ TESTS COMPLETADOS\n";
        echo "====================\n";
        return true;
    }

    /**
     * Test de autenticación
     */
    private function testAutenticacion()
    {
        echo "🔐 Testeando autenticación...\n";
        
        $credentials = [
            'email' => 'empresa@test.com',
            'password' => 'password123'
        ];

        $response = $this->makeRequest('POST', '/login', $credentials);
        
        if ($response['success'] && isset($response['data']['token'])) {
            $this->token = $response['data']['token'];
            echo "   ✅ Autenticación exitosa\n";
            return true;
        }
        
        echo "   ❌ Error en autenticación: " . ($response['message'] ?? 'Error desconocido') . "\n";
        return false;
    }

    /**
     * Preparar datos de prueba
     */
    private function prepararDatosPrueba()
    {
        echo "📋 Preparando datos de prueba...\n";
        
        // Obtener empresa del usuario autenticado
        $response = $this->makeRequest('GET', '/empresa/perfil');
        if ($response['success']) {
            $this->empresaId = $response['data']['id'];
            echo "   ✅ Empresa ID: {$this->empresaId}\n";
        } else {
            echo "   ❌ No se pudo obtener empresa\n";
            return false;
        }

        // Obtener candidatos del pool
        $response = $this->makeRequest('GET', '/pool-candidatos');
        if ($response['success'] && !empty($response['data']['data'])) {
            $candidato = $response['data']['data'][0];
            $this->candidatoId = $candidato['empresa_candidato_id'];
            echo "   ✅ Candidato ID: {$this->candidatoId}\n";
            return true;
        }
        
        echo "   ❌ No se encontraron candidatos en el pool\n";
        return false;
    }

    /**
     * Test: Crear evaluación
     */
    private function testCrearEvaluacion()
    {
        echo "➕ Testeando creación de evaluación...\n";
        
        $data = [
            'empresa_candidato_id' => $this->candidatoId,
            'nombre_evaluacion' => 'Evaluación Técnica - Test API',
            'tipo_evaluacion' => 'tecnica',
            'comentarios_generales' => 'Evaluación creada mediante test automatizado',
            'criterios_evaluacion' => [
                'conocimientos_tecnicos' => ['peso' => 40, 'descripcion' => 'Conocimientos técnicos específicos'],
                'experiencia_practica' => ['peso' => 35, 'descripcion' => 'Experiencia práctica demostrada'],
                'capacidad_aprendizaje' => ['peso' => 25, 'descripcion' => 'Capacidad de aprendizaje y adaptación']
            ],
            'metadatos' => [
                'test_automatizado' => true,
                'fecha_test' => date('Y-m-d H:i:s')
            ]
        ];

        $response = $this->makeRequest('POST', '/evaluaciones', $data);
        
        if ($response['success']) {
            $this->evaluacionId = $response['data']['id'];
            echo "   ✅ Evaluación creada exitosamente - ID: {$this->evaluacionId}\n";
            echo "   📊 Estado: {$response['data']['estado_evaluacion']}\n";
            echo "   📝 Tipo: {$response['data']['tipo_evaluacion']}\n";
        } else {
            echo "   ❌ Error al crear evaluación: " . $response['message'] . "\n";
            if (isset($response['errors'])) {
                foreach ($response['errors'] as $field => $errors) {
                    echo "       - $field: " . implode(', ', $errors) . "\n";
                }
            }
        }
    }

    /**
     * Test: Listar evaluaciones
     */
    private function testListarEvaluaciones()
    {
        echo "📋 Testeando listado de evaluaciones...\n";
        
        // Test básico
        $response = $this->makeRequest('GET', '/evaluaciones');
        if ($response['success']) {
            $total = $response['meta']['total'] ?? count($response['data']);
            echo "   ✅ Listado básico exitoso - Total: $total evaluaciones\n";
        } else {
            echo "   ❌ Error en listado básico: " . $response['message'] . "\n";
        }

        // Test con filtros
        $params = [
            'tipo_evaluacion' => 'tecnica',
            'estado_evaluacion' => 'pendiente',
            'per_page' => 5
        ];
        
        $response = $this->makeRequest('GET', '/evaluaciones?' . http_build_query($params));
        if ($response['success']) {
            echo "   ✅ Listado con filtros exitoso\n";
        } else {
            echo "   ❌ Error en listado con filtros: " . $response['message'] . "\n";
        }
    }

    /**
     * Test: Obtener evaluación específica
     */
    private function testObtenerEvaluacion()
    {
        if (!$this->evaluacionId) {
            echo "⚠️  Saltando test de obtener evaluación (no hay ID)\n";
            return;
        }

        echo "👁️  Testeando obtener evaluación específica...\n";
        
        $response = $this->makeRequest('GET', "/evaluaciones/{$this->evaluacionId}");
        
        if ($response['success']) {
            echo "   ✅ Evaluación obtenida exitosamente\n";
            echo "   📝 Nombre: {$response['data']['nombre_evaluacion']}\n";
            echo "   📊 Progreso: {$response['data']['progreso']['porcentaje']}%\n";
        } else {
            echo "   ❌ Error al obtener evaluación: " . $response['message'] . "\n";
        }
    }

    /**
     * Test: Actualizar evaluación
     */
    private function testActualizarEvaluacion()
    {
        if (!$this->evaluacionId) {
            echo "⚠️  Saltando test de actualizar evaluación (no hay ID)\n";
            return;
        }

        echo "✏️  Testeando actualización de evaluación...\n";
        
        $data = [
            'puntuaciones' => [
                'conocimientos_tecnicos' => 85,
                'experiencia_practica' => 78,
                'capacidad_aprendizaje' => 92
            ],
            'comentarios_generales' => 'Evaluación actualizada mediante test - Candidato con buen potencial',
            'recomendaciones' => 'Recomendado para segunda fase de entrevistas',
            'metadatos' => [
                'test_actualizado' => true,
                'puntuacion_actualizada' => date('Y-m-d H:i:s')
            ]
        ];

        $response = $this->makeRequest('PUT', "/evaluaciones/{$this->evaluacionId}", $data);
        
        if ($response['success']) {
            echo "   ✅ Evaluación actualizada exitosamente\n";
            echo "   📊 Puntuación total: {$response['data']['puntuacion_total']}\n";
            echo "   📈 Estado: {$response['data']['estado_evaluacion']}\n";
        } else {
            echo "   ❌ Error al actualizar evaluación: " . $response['message'] . "\n";
        }
    }

    /**
     * Test: Completar evaluación
     */
    private function testCompletarEvaluacion()
    {
        if (!$this->evaluacionId) {
            echo "⚠️  Saltando test de completar evaluación (no hay ID)\n";
            return;
        }

        echo "✅ Testeando completar evaluación...\n";
        
        $response = $this->makeRequest('POST', "/evaluaciones/{$this->evaluacionId}/completar");
        
        if ($response['success']) {
            echo "   ✅ Evaluación completada exitosamente\n";
            echo "   📊 Estado final: {$response['data']['estado_evaluacion']}\n";
            echo "   🎯 Puntuación final: {$response['data']['puntuacion_total']}\n";
        } else {
            echo "   ❌ Error al completar evaluación: " . $response['message'] . "\n";
        }
    }

    /**
     * Test: Evaluaciones por candidato
     */
    private function testEvaluacionesPorCandidato()
    {
        if (!$this->candidatoId) {
            echo "⚠️  Saltando test de evaluaciones por candidato (no hay candidato)\n";
            return;
        }

        echo "👤 Testeando evaluaciones por candidato...\n";
        
        // Primero obtener el ID del candidato real
        $response = $this->makeRequest('GET', "/evaluaciones/{$this->evaluacionId}");
        if ($response['success']) {
            $candidatoRealId = $response['data']['candidato']['id'];
            
            $response = $this->makeRequest('GET', "/evaluaciones/candidato/{$candidatoRealId}");
            
            if ($response['success']) {
                $total = $response['meta']['total_evaluaciones'];
                $completadas = $response['meta']['evaluaciones_completadas'];
                echo "   ✅ Evaluaciones por candidato obtenidas exitosamente\n";
                echo "   📊 Total evaluaciones: $total\n";
                echo "   ✅ Completadas: $completadas\n";
                
                if (isset($response['meta']['promedio_puntuacion'])) {
                    echo "   📈 Promedio: {$response['meta']['promedio_puntuacion']}\n";
                }
            } else {
                echo "   ❌ Error al obtener evaluaciones por candidato: " . $response['message'] . "\n";
            }
        }
    }

    /**
     * Test: Estadísticas de evaluaciones
     */
    private function testEstadisticasEvaluaciones()
    {
        echo "📊 Testeando estadísticas de evaluaciones...\n";
        
        $response = $this->makeRequest('GET', '/evaluaciones/estadisticas');
        
        if ($response['success']) {
            $stats = $response['data'];
            echo "   ✅ Estadísticas obtenidas exitosamente\n";
            echo "   📊 Total evaluaciones: {$stats['resumen_general']['total_evaluaciones']}\n";
            echo "   ✅ Completadas: {$stats['resumen_general']['evaluaciones_completadas']}\n";
            echo "   🔄 En progreso: {$stats['resumen_general']['evaluaciones_en_progreso']}\n";
            echo "   ⏳ Pendientes: {$stats['resumen_general']['evaluaciones_pendientes']}\n";
            
            if (isset($stats['puntuaciones']['promedio_general'])) {
                echo "   📈 Promedio general: {$stats['puntuaciones']['promedio_general']}\n";
            }
        } else {
            echo "   ❌ Error al obtener estadísticas: " . $response['message'] . "\n";
        }
    }

    /**
     * Test: Validaciones
     */
    private function testValidaciones()
    {
        echo "🔍 Testeando validaciones...\n";
        
        // Test 1: Datos faltantes
        $data = [
            'nombre_evaluacion' => '',
            'tipo_evaluacion' => 'invalido'
        ];
        
        $response = $this->makeRequest('POST', '/evaluaciones', $data);
        if (!$response['success'] && isset($response['errors'])) {
            echo "   ✅ Validación de datos faltantes funciona correctamente\n";
        } else {
            echo "   ❌ La validación de datos faltantes no funciona\n";
        }

        // Test 2: Evaluación duplicada
        if ($this->candidatoId) {
            $data = [
                'empresa_candidato_id' => $this->candidatoId,
                'nombre_evaluacion' => 'Evaluación Duplicada',
                'tipo_evaluacion' => 'tecnica'
            ];
            
            $response = $this->makeRequest('POST', '/evaluaciones', $data);
            if (!$response['success'] && strpos($response['message'], 'Ya existe') !== false) {
                echo "   ✅ Validación de evaluación duplicada funciona correctamente\n";
            } else {
                echo "   ⚠️  Validación de evaluación duplicada puede no funcionar\n";
            }
        }
    }

    /**
     * Test: Autorización
     */
    private function testAutorizacion()
    {
        echo "🔒 Testeando autorización...\n";
        
        // Test sin token
        $tempToken = $this->token;
        $this->token = null;
        
        $response = $this->makeRequest('GET', '/evaluaciones');
        if (!$response['success']) {
            echo "   ✅ Protección sin autenticación funciona correctamente\n";
        } else {
            echo "   ❌ Falla en protección sin autenticación\n";
        }
        
        $this->token = $tempToken;
    }

    /**
     * Test: Eliminar evaluación
     */
    private function testEliminarEvaluacion()
    {
        if (!$this->evaluacionId) {
            echo "⚠️  Saltando test de eliminar evaluación (no hay ID)\n";
            return;
        }

        echo "🗑️  Testeando eliminación de evaluación...\n";
        
        $response = $this->makeRequest('DELETE', "/evaluaciones/{$this->evaluacionId}");
        
        if ($response['success']) {
            echo "   ✅ Evaluación eliminada exitosamente\n";
        } else {
            echo "   ❌ Error al eliminar evaluación: " . $response['message'] . "\n";
            // Si no se puede eliminar porque está completada, es comportamiento esperado
            if (strpos($response['message'], 'completada') !== false) {
                echo "   ℹ️  (Comportamiento esperado para evaluación completada)\n";
            }
        }
    }

    /**
     * Realizar request HTTP
     */
    private function makeRequest($method, $endpoint, $data = null)
    {
        $url = $this->baseUrl . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $headers = [
            'Content-Type: application/json',
            'Accept: application/json'
        ];
        
        if ($this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        switch ($method) {
            case 'POST':
                curl_setopt($ch, CURLOPT_POST, true);
                break;
            case 'PUT':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
                break;
            case 'DELETE':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
                break;
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        $decodedResponse = json_decode($response, true);
        
        if ($httpCode >= 400) {
            return $decodedResponse ?? ['success' => false, 'message' => "HTTP Error $httpCode"];
        }
        
        return $decodedResponse ?? ['success' => false, 'message' => 'Invalid response'];
    }
}

// Ejecutar tests
try {
    $tester = new EvaluacionApiTester();
    $resultado = $tester->ejecutarTests();
    
    if ($resultado) {
        echo "\n🎉 TODOS LOS TESTS COMPLETADOS EXITOSAMENTE\n";
        exit(0);
    } else {
        echo "\n💥 ALGUNOS TESTS FALLARON\n";
        exit(1);
    }
} catch (Exception $e) {
    echo "\n💀 ERROR FATAL: " . $e->getMessage() . "\n";
    exit(1);
}
