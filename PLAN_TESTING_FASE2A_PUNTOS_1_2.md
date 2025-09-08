# 🧪 PLAN DE TESTING FASE 2A - PUNTOS 1 Y 2

## 📋 **RESUMEN EJECUTIVO**

Plan de testing integral para validar las implementaciones completadas de la Fase 2A del proyecto CVSelecto:
- ✅ **Punto 1:** Unificación de Estados de Candidatos
- ✅ **Punto 2:** Dashboard Empresarial Unificado

---

## 🎯 **OBJETIVOS DE TESTING**

### **Funcionales:**
- Verificar que la unificación de estados funciona sin errores
- Validar que el dashboard unificado carga correctamente
- Confirmar que las transiciones de estado son consistentes
- Asegurar que los filtros y navegación funcionan

### **Técnicos:**
- Verificar integridad de base de datos tras migración
- Validar que APIs responden correctamente
- Confirmar que el frontend se conecta sin errores
- Verificar rendimiento de carga de datos

---

## 🧪 **CASOS DE PRUEBA**

### **1. TESTING DE BACKEND (Estados Unificados)**

#### **Test 1.1: Verificación de Migración de Estados**
```bash
# Verificar que la migración se ejecutó correctamente
php artisan migrate:status

# Verificar estructura de ENUMs en base de datos
DESCRIBE postulaciones;
DESCRIBE empresa_candidatos;
```

**Resultado Esperado:** 
- ✅ Migración `unificar_estados_candidatos_fase2a` ejecutada
- ✅ ENUM postulaciones: ['postulado','en_revision','entrevistado','rechazado','seleccionado']
- ✅ ENUM empresa_candidatos: ['activo','en_proceso','evaluado','contratado','descartado','pausado']

#### **Test 1.2: Validación de Enum EstadoCandidato**
```bash
# Crear script de test
php artisan tinker
```

```php
// En tinker:
use App\Enums\EstadoCandidato;

// Test 1: Valores de postulaciones
dd(EstadoCandidato::postulacionValues());
// Esperado: ['postulado','en_revision','entrevistado','rechazado','seleccionado']

// Test 2: Valores de pool
dd(EstadoCandidato::poolValues());
// Esperado: ['activo','en_proceso','evaluado','contratado','descartado','pausado']

// Test 3: Mapeo legacy
dd(EstadoCandidato::mapLegacyState('en proceso'));
// Esperado: 'en_revision'

// Test 4: Validación de transiciones
dd(EstadoCandidato::isValidTransition('postulado', 'en_revision'));
// Esperado: true
```

#### **Test 1.3: Verificación de Request Classes**
```bash
# Test validaciones postulaciones
curl -X PUT http://localhost:8000/api/postulaciones/1 \
  -H "Content-Type: application/json" \
  -d '{"estado":"en_revision"}' \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test validaciones pool (estado inválido)
curl -X PUT http://localhost:8000/api/empresa-pool/actualizar/1 \
  -H "Content-Type: application/json" \
  -d '{"estado_interno":"invalid_state"}' \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resultado Esperado:**
- ✅ Estados válidos se aceptan
- ❌ Estados inválidos retornan error 422 con mensaje descriptivo

#### **Test 1.4: APIs con Estados Actualizados**
```bash
# Test estadísticas empresas
curl -X GET http://localhost:8000/api/postulaciones/estadisticas-empresa/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resultado Esperado:**
- ✅ Campo `en_revision` en lugar de `en_proceso`
- ✅ Estadísticas correctas por estado

---

### **2. TESTING DE FRONTEND (Dashboard Unificado)**

#### **Test 2.1: Acceso al Centro de Gestión**
1. **Navegación:** Ir a `/centro-gestion`
2. **Autenticación:** Login como empresa
3. **Carga inicial:** Verificar que el dashboard carga

**Resultado Esperado:**
- ✅ Ruta `/centro-gestion` accesible
- ✅ Dashboard muestra métricas consolidadas
- ✅ Tabs de navegación visibles
- ✅ Sin errores en consola del navegador

#### **Test 2.2: Métricas del Dashboard**
1. **Datos consolidados:** Verificar KPIs principales
2. **Navegación por tabs:** Alternar entre Dashboard, Postulaciones, Pool, Búsquedas
3. **Responsividad:** Verificar en diferentes tamaños de pantalla

**Resultado Esperado:**
- ✅ Total Candidatos correcto (sum único de postulaciones + pool)
- ✅ Postulaciones Activas correcto (en_revision + entrevistado)
- ✅ Pool Activo correcto (estado: activo)
- ✅ Tasa Conversión calculada correctamente

#### **Test 2.3: Tab Postulaciones Integrada**
1. **Filtros:** Probar filtro por estado (todos, postulado, en_revision, etc.)
2. **Acciones:** Cambiar estado de postulación
3. **Navegación:** Ir a detalle de candidato

**Resultado Esperado:**
- ✅ Filtros funcionan correctamente
- ✅ Estados se muestran con nomenclatura actualizada
- ✅ Cambios de estado se reflejan inmediatamente
- ✅ Contadores se actualizan tras acciones

#### **Test 2.4: Tab Pool Integrada**
1. **Carga de datos:** Verificar que pool carga desde props
2. **Filtros locales:** Probar filtros por estado, origen, búsqueda
3. **Acciones:** Editar candidato, cambiar estado

**Resultado Esperado:**
- ✅ Candidatos del pool se muestran correctamente
- ✅ Filtros locales funcionan sin llamadas adicionales a API
- ✅ Acciones de edición funcionan
- ✅ Estados del pool consistentes con enum

#### **Test 2.5: Tab Búsquedas Integrada**
1. **Lista de búsquedas:** Verificar carga de búsquedas de la empresa
2. **Filtros:** Filtrar por estado (activa, pausada, finalizada)
3. **Acciones:** Cambiar estado de búsqueda

**Resultado Esperado:**
- ✅ Solo búsquedas de la empresa logueada
- ✅ Filtros funcionan correctamente
- ✅ Acciones de cambio de estado funcionan
- ✅ Navegación a detalle/edición funciona

---

### **3. TESTING DE INTEGRACIÓN**

#### **Test 3.1: Flujo Completo de Estados**
**Escenario:** Candidato desde postulación hasta contratación
1. Crear postulación con estado 'postulado'
2. Cambiar a 'en_revision'
3. Mover candidato al pool
4. Cambiar estado en pool a 'contratado'

**Resultado Esperado:**
- ✅ Cada transición funciona sin errores
- ✅ Estados se mantienen consistentes
- ✅ Dashboard refleja cambios inmediatamente

#### **Test 3.2: Carga de Datos Paralela**
**Escenario:** Dashboard carga datos de múltiples fuentes
1. Abrir `/centro-gestion`
2. Monitorear Network tab en DevTools
3. Verificar tiempo de carga

**Resultado Esperado:**
- ✅ Requests paralelos (Promise.all funciona)
- ✅ Tiempo de carga < 3 segundos
- ✅ Manejo correcto de errores

#### **Test 3.3: Consistencia de Datos**
**Escenario:** Modificar datos y verificar sincronización
1. Cambiar estado en tab Postulaciones
2. Verificar que Dashboard se actualiza
3. Navegar a tab Pool
4. Verificar consistencia

**Resultado Esperado:**
- ✅ Cambios se reflejan en todas las vistas
- ✅ Contadores se actualizan correctamente
- ✅ No hay discrepancias entre tabs

---

## 🛠 **SCRIPTS DE TESTING**

### **Script 1: Verificación de Base de Datos**
```bash
# Crear archivo: test_database_states.php
cd "c:\Proyectos\Tesis MaxiBerta"
```

### **Script 2: Test de APIs**
```bash
# Crear archivo: test_apis_estados.php
```

### **Script 3: Test Frontend Automatizado**
```javascript
// Usar Cypress o Jest para testing automatizado
```

---

## ⚠️ **PROBLEMAS POTENCIALES A VERIFICAR**

### **Backend:**
- Estados legacy no migrados correctamente
- Validaciones muy restrictivas/permisivas
- Performance en queries con nuevos índices
- Rollback de migración funcional

### **Frontend:**
- Componentes no reciben props correctamente
- Filtros no funcionan con nuevos estados
- Carga infinita por requests fallidos
- Inconsistencias en nomenclatura de estados

### **Integración:**
- Desincronización entre tabs
- Errores de CORS en requests
- Timeout en carga de datos
- Estados inconsistentes entre frontend/backend

---

## 📊 **CRITERIOS DE ÉXITO**

### **Funcional:** ✅ 100% de casos de prueba pasados
### **Performance:** ✅ Dashboard carga en < 3 segundos
### **UX:** ✅ Navegación fluida sin errores visibles
### **Técnico:** ✅ Sin errores en logs de Laravel/React
### **Datos:** ✅ Integridad de datos mantenida post-migración

---

## 🚀 **PLAN DE EJECUCIÓN**

### **Fase 1: Testing Backend (30 min)**
1. Verificar migración de estados
2. Probar enum y validaciones
3. Verificar APIs actualizadas

### **Fase 2: Testing Frontend (45 min)**
1. Probar nueva ruta `/centro-gestion`
2. Verificar cada tab individualmente
3. Probar filtros y acciones

### **Fase 3: Testing Integración (30 min)**
1. Flujos end-to-end
2. Sincronización de datos
3. Performance y UX

### **Fase 4: Documentación de Resultados (15 min)**
1. Documentar bugs encontrados
2. Crear reporte de testing
3. Planificar correcciones si es necesario

---

**🎯 OBJETIVO FINAL:** Garantizar que las implementaciones de Fase 2A funcionan perfectamente antes de proceder al Punto 3 (Sistema de Vinculación).
