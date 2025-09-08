# 📱 CHECKLIST DE TESTING FRONTEND - CENTRO DE GESTIÓN UNIFICADO

## 🎯 **OBJETIVO**
Verificar que el Dashboard Empresarial Unificado (`/centro-gestion`) funciona correctamente con los estados unificados implementados.

---

## 🚀 **PREPARACIÓN**

### **Prerrequisitos:**
- ✅ Backend ejecutándose: `php artisan serve`
- ✅ Frontend ejecutándose: `npm start` 
- ✅ Base de datos migrada con estados unificados
- ✅ Usuario empresa logueado

### **Datos de prueba necesarios:**
- Al menos 1 empresa con búsquedas laborales
- Al menos 3 postulaciones en diferentes estados
- Al menos 2 candidatos en pool privado
- Al menos 2 búsquedas (1 activa, 1 pausada)

---

## 📋 **TESTS MANUALES**

### **🔗 TEST 1: ACCESO Y NAVEGACIÓN**

#### **1.1 Acceso a la nueva ruta**
- [ ] Ir a `http://localhost:3000/centro-gestion`
- [ ] **Esperado:** Dashboard carga sin errores
- [ ] **Esperado:** URL se mantiene en `/centro-gestion`
- [ ] **Esperado:** No aparecen errores en consola del navegador (F12)

#### **1.2 Redirección de autenticación**
- [ ] Acceder sin estar logueado
- [ ] **Esperado:** Redirige a login
- [ ] Acceder con usuario candidato
- [ ] **Esperado:** Muestra error de autorización o redirige

#### **1.3 Navegación por tabs**
- [ ] Hacer clic en "📊 Dashboard General"
- [ ] **Esperado:** Muestra métricas consolidadas
- [ ] Hacer clic en "📝 Postulaciones"
- [ ] **Esperado:** Cambia a vista de postulaciones
- [ ] Hacer clic en "👥 Pool de Candidatos"
- [ ] **Esperado:** Cambia a vista de pool
- [ ] Hacer clic en "🎯 Búsquedas"
- [ ] **Esperado:** Cambia a vista de búsquedas

**❌ Problemas encontrados:**
```
- 
- 
```

---

### **📊 TEST 2: DASHBOARD GENERAL**

#### **2.1 Métricas principales**
- [ ] Verificar "Total Candidatos" muestra número correcto
- [ ] Verificar "Postulaciones Activas" cuenta solo estados: postulado, en_revision, entrevistado
- [ ] Verificar "Pool Activo" cuenta solo estado: activo
- [ ] Verificar "Tasa Conversión" calcula correctamente

#### **2.2 Cards de resumen**
- [ ] Card "Postulaciones Recientes" muestra últimas 5
- [ ] Estados se muestran con badges correctos
- [ ] Card "Pool de Candidatos" muestra últimos incorporados
- [ ] Card "Búsquedas Activas" muestra solo búsquedas activas

#### **2.3 Botones de navegación**
- [ ] "Ver todas las postulaciones" cambia a tab postulaciones
- [ ] "Gestionar pool" cambia a tab pool
- [ ] "Ver todas las búsquedas" cambia a tab búsquedas

**❌ Problemas encontrados:**
```
- 
- 
```

---

### **📝 TEST 3: TAB POSTULACIONES**

#### **3.1 Carga de datos**
- [ ] Postulaciones se cargan desde props (no request adicional)
- [ ] Solo aparecen postulaciones de la empresa logueada
- [ ] Contador "X postulaciones" es correcto

#### **3.2 Estados unificados**
- [ ] Filtro muestra "En Revisión" en lugar de "En Proceso"
- [ ] Estados en tabla muestran nomenclatura actualizada
- [ ] Badge de "en_revision" muestra "En Revisión"

#### **3.3 Filtros**
- [ ] Filtro "Todos los estados" muestra todas
- [ ] Filtro "Postulado" filtra correctamente
- [ ] Filtro "En Revisión" filtra correctamente
- [ ] Filtro "Seleccionado" filtra correctamente
- [ ] Filtro "Rechazado" filtra correctamente

#### **3.4 Acciones de estado**
- [ ] Botón "Marcar en revisión" cambia estado correctamente
- [ ] Cambio se refleja inmediatamente en UI
- [ ] Mensaje de éxito aparece
- [ ] Contadores se actualizan

**❌ Problemas encontrados:**
```
- 
- 
```

---

### **👥 TEST 4: TAB POOL**

#### **4.1 Carga de datos**
- [ ] Candidatos se cargan desde props
- [ ] Solo candidatos del pool de la empresa
- [ ] Contador "X en pool" es correcto

#### **4.2 Filtros locales**
- [ ] Filtro por estado funciona sin requests adicionales
- [ ] Filtro por origen funciona
- [ ] Búsqueda por nombre/email funciona
- [ ] Filtros de puntuación funcionan
- [ ] Botón "Limpiar filtros" funciona

#### **4.3 Estados del pool**
- [ ] Estados muestran valores correctos: activo, en_proceso, evaluado, contratado, descartado, pausado
- [ ] Cambios de estado funcionan
- [ ] Estados son consistentes con enum backend

#### **4.4 Acciones**
- [ ] Botones "Agregar Existente" y "Crear Nuevo" aparecen
- [ ] Edición rápida funciona (si está implementada)
- [ ] Eliminación del pool funciona

**❌ Problemas encontrados:**
```
- 
- 
```

---

### **🎯 TEST 5: TAB BÚSQUEDAS**

#### **5.1 Carga de búsquedas**
- [ ] Solo búsquedas de la empresa actual
- [ ] Estadísticas rápidas correctas (total, activas, pausadas, finalizadas)
- [ ] Cards muestran información completa

#### **5.2 Filtros**
- [ ] Filtro "Todas las búsquedas" muestra todas
- [ ] Filtro "Activas" filtra correctamente
- [ ] Filtro "Pausadas" filtra correctamente
- [ ] Filtro "Finalizadas" filtra correctamente

#### **5.3 Acciones**
- [ ] Botón "Nueva Búsqueda" navega correctamente
- [ ] Botón "Ver Detalle" navega a búsqueda específica
- [ ] Botón "Editar" navega a edición
- [ ] Cambios de estado (pausar/reactivar/finalizar) funcionan

**❌ Problemas encontrados:**
```
- 
- 
```

---

### **🔄 TEST 6: INTEGRACIÓN Y SINCRONIZACIÓN**

#### **6.1 Actualización de datos**
- [ ] Cambiar estado en tab Postulaciones → Dashboard se actualiza
- [ ] Cambiar estado en tab Pool → Métricas se actualizan
- [ ] Crear nueva búsqueda → Tab búsquedas se actualiza

#### **6.2 Navegación entre tabs**
- [ ] Cambiar entre tabs mantiene los datos
- [ ] No hay pérdida de estado al navegar
- [ ] Filtros se mantienen al cambiar tabs

#### **6.3 Mensajes y feedback**
- [ ] Mensajes de éxito aparecen y desaparecen
- [ ] Mensajes de error son informativos
- [ ] Loading states funcionan correctamente

**❌ Problemas encontrados:**
```
- 
- 
```

---

### **📱 TEST 7: RESPONSIVIDAD Y UX**

#### **7.1 Diferentes tamaños de pantalla**
- [ ] Desktop (1920x1080): Layout correcto
- [ ] Tablet (768x1024): Navegación adaptada
- [ ] Mobile (375x667): Tabs stack correctamente

#### **7.2 Performance**
- [ ] Dashboard carga en menos de 3 segundos
- [ ] Cambio entre tabs es inmediato
- [ ] No hay delay notable en filtros

#### **7.3 Usabilidad**
- [ ] Botones tienen feedback visual
- [ ] Hover states funcionan
- [ ] Loading spinners aparecen cuando es necesario
- [ ] Textos son legibles y claros

**❌ Problemas encontrados:**
```
- 
- 
```

---

## 🛠 **DEBUGGING**

### **Herramientas de desarrollo:**
1. **Consola del navegador (F12):**
   - Verificar errores en Console
   - Monitorear requests en Network
   - Inspeccionar estado en React DevTools

2. **Logs de Laravel:**
   ```bash
   tail -f storage/logs/laravel.log
   ```

3. **Requests de red:**
   - Verificar que se hacen 3 requests paralelos al cargar
   - Confirmar respuestas 200 OK
   - Verificar estructura de datos

---

## 📊 **CRITERIOS DE ÉXITO**

### **Funcional:**
- [ ] 100% de funcionalidades básicas funcionan
- [ ] Estados unificados se muestran correctamente
- [ ] Navegación fluida entre tabs

### **Performance:**
- [ ] Carga inicial < 3 segundos
- [ ] Cambio entre tabs < 500ms
- [ ] Filtros responden inmediatamente

### **UX:**
- [ ] Interfaz intuitiva y coherente
- [ ] Feedback apropiado para todas las acciones
- [ ] Sin errores visibles para el usuario

---

## ✅ **REPORTE FINAL**

### **Tests pasados:** ___/30
### **Tests fallidos:** ___/30

### **Problemas críticos encontrados:**
```
1. 
2. 
3. 
```

### **Problemas menores encontrados:**
```
1. 
2. 
3. 
```

### **Recomendaciones:**
```
1. 
2. 
3. 
```

---

**🎯 RESULTADO FINAL:**
- [ ] ✅ Listo para Punto 3 de Fase 2A
- [ ] ⚠️ Necesita correcciones menores
- [ ] ❌ Necesita correcciones importantes

**📅 Fecha de testing:** ___________  
**👤 Tester:** ___________
