# 🧪 **GUÍA COMPLETA DE TESTING - CENTRO CANDIDATOS**

## ✅ **ESTADO ACTUAL DEL SISTEMA**

**Backend Laravel:** ✅ Ejecutándose en http://127.0.0.1:8000
**Frontend React:** ✅ Ejecutándose en http://localhost:3001 (compilando con warnings menores)
**Base de Datos:** ✅ MySQL poblada con 61 registros en pool empresarial

---

## 🔑 **CREDENCIALES PARA TESTING**

### **EMPRESA PRINCIPAL**
```
📧 Email: empresa@test.com
🔐 Password: empresa123
🏢 Empresa: TechCorp Solutions S.A. (VERIFICADA)
🎯 Rol: empresa
```

### **CANDIDATOS DE PRUEBA**
```
📧 Email: candidato@test.com
🔐 Password: candidato123
👤 Nombre: Juan Carlos Pérez
🎯 Rol: candidato
```

### **ADMINISTRADOR**
```
📧 Email: admin@test.com
🔐 Password: admin123
🎯 Rol: admin
```

---

## 🎯 **PLAN DE TESTING PASO A PASO**

### **PASO 1: Verificar Login Empresa** ⏱️ 2 minutos

1. **Abrir navegador:** http://localhost:3001/login
2. **Credenciales:**
   - Email: `empresa@test.com`
   - Password: `empresa123`
3. **✅ Resultado esperado:** Redirección a dashboard empresa
4. **🔍 Verificar:** Botón "Centro Candidatos" visible con gradiente morado

---

### **PASO 2: Acceso al Centro Candidatos** ⏱️ 1 minuto

1. **En dashboard empresa,** click en botón **"Centro Candidatos"**
2. **URL esperada:** http://localhost:3001/empresa/centro-candidatos
3. **✅ Resultado esperado:** 
   - Vista con 3 tabs: "Postulaciones", "Mi Pool", "Buscar Candidatos"
   - Dashboard de estadísticas en la parte superior
   - Tab "Postulaciones" activo por defecto

---

### **PASO 3: Testing Tab Postulaciones** ⏱️ 3 minutos

**🎯 OBJETIVO:** Verificar gestión de postulaciones recibidas

1. **Verificar datos cargados:**
   - ✅ Lista de postulaciones de TechCorp Solutions
   - ✅ Estados: postulado, en proceso, seleccionado, rechazado
   - ✅ Información de candidatos visible

2. **Probar filtros:**
   - Cambiar filtro de estado (dropdown)
   - ✅ Lista se filtra correctamente

3. **Probar acciones:**
   - Click en botón "En Proceso" (ícono reloj)
   - ✅ Estado cambia y aparece mensaje de éxito
   - Click en "Agregar a Pool" (ícono +)
   - ✅ Candidato se agrega al pool, mensaje de confirmación

---

### **PASO 4: Testing Tab Mi Pool** ⏱️ 4 minutos

**🎯 OBJETIVO:** Verificar gestión del pool privado

1. **Cambiar a tab "Mi Pool"**
2. **Verificar datos del pool:**
   - ✅ Candidatos previamente agregados desde postulaciones
   - ✅ Estados internos: activo, en_proceso, contratado, etc.
   - ✅ Información de origen, puntuación, tags

3. **Probar filtros:**
   - Filtrar por estado interno
   - Filtrar por origen
   - Buscar por nombre

4. **Probar acciones:**
   - Cambiar estado interno (dropdown)
   - ✅ Estado se actualiza en tiempo real
   - Click en "Ver detalles" (ícono ojo)
   - Click en "Eliminar del pool" (ícono basura)
   - ✅ Confirmación y eliminación exitosa

---

### **PASO 5: Testing Tab Buscar Candidatos** ⏱️ 3 minutos

**🎯 OBJETIVO:** Verificar búsqueda y agregado de candidatos

1. **Cambiar a tab "Buscar Candidatos"**
2. **Configurar filtros de búsqueda:**
   - Nombre: `candidato@test.com`
   - Nivel educación: `universitario`
   - Años experiencia: `4-6`

3. **Ejecutar búsqueda:**
   - Click en "Buscar"
   - ✅ Resultados aparecen con candidatos coincidentes

4. **Agregar candidato al pool:**
   - Click en "Agregar a mi pool" (ícono +)
   - ✅ Mensaje de éxito
   - Cambiar a tab "Mi Pool"
   - ✅ Verificar que candidato aparece en pool

---

### **PASO 6: Testing Navegación Integrada** ⏱️ 2 minutos

**🎯 OBJETIVO:** Verificar flujo completo entre tabs

1. **Flujo: Postulación → Pool → Búsqueda**
   - Tab Postulaciones: Mover candidato a pool
   - Tab Mi Pool: Verificar candidato agregado
   - Tab Búsqueda: Buscar y agregar nuevo candidato
   - Tab Mi Pool: Verificar ambos candidatos

2. **Verificar estadísticas:**
   - Dashboard superior actualiza contadores
   - Números coinciden con datos mostrados

---

### **PASO 7: Testing Funcionalidad Cross-Tab** ⏱️ 2 minutos

**🎯 OBJETIVO:** Verificar integración entre componentes

1. **Estado compartido:**
   - Cambios en un tab se reflejan en otros
   - Estadísticas se actualizan automáticamente

2. **Navegación fluida:**
   - Cambio entre tabs sin pérdida de estado
   - Filtros se mantienen activos

---

## 🚨 **CASOS DE ERROR A PROBAR**

### **Errores de Red:**
1. **Desconectar internet** temporalmente
2. **✅ Verificar:** Mensajes de error apropiados
3. **Reconectar y probar** recuperación automática

### **Casos Límite:**
1. **Pool vacío:** Verificar mensaje informativo
2. **Sin postulaciones:** Verificar estado vacío
3. **Búsqueda sin resultados:** Verificar mensaje apropiado

---

## 📊 **CRITERIOS DE ÉXITO**

### **✅ FUNCIONALIDAD BÁSICA:**
- [ ] Login empresa exitoso
- [ ] Centro Candidatos accesible
- [ ] 3 tabs navegables
- [ ] Datos cargan correctamente

### **✅ GESTIÓN POSTULACIONES:**
- [ ] Lista de postulaciones visible
- [ ] Filtros funcionan
- [ ] Cambio de estados funciona
- [ ] Mover a pool funciona

### **✅ GESTIÓN POOL:**
- [ ] Candidatos en pool visibles
- [ ] Estados internos editables
- [ ] Filtros y búsqueda funcionan
- [ ] Eliminación funciona

### **✅ BÚSQUEDA CANDIDATOS:**
- [ ] Filtros de búsqueda funcionan
- [ ] Resultados se muestran correctamente
- [ ] Agregar a pool funciona

### **✅ INTEGRACIÓN:**
- [ ] Estados compartidos entre tabs
- [ ] Estadísticas actualizadas
- [ ] Navegación fluida
- [ ] Sin errores de consola críticos

---

## 🔧 **COMANDOS DE DEBUGGING**

### **Si hay errores:**
```bash
# Ver logs del backend
cd "C:\Proyectos\Tesis MaxiBerta"
php artisan log:clear
tail -f storage/logs/laravel.log

# Ver estado de la base de datos
php analisis_relaciones.php

# Regenerar datos si es necesario
php artisan migrate:fresh --seed
```

### **Si frontend no compila:**
```bash
cd "C:\Proyectos\Tesis MaxiBerta\frontend"
npm install
npm start
```

---

## 📋 **CHECKLIST FINAL**

**ANTES DE TESTING:**
- [ ] ✅ Backend corriendo en puerto 8000
- [ ] ✅ Frontend corriendo en puerto 3001
- [ ] ✅ Base de datos poblada
- [ ] ✅ Credenciales confirmadas

**DURANTE TESTING:**
- [ ] Tomar screenshots de cada funcionalidad
- [ ] Anotar cualquier error o comportamiento inesperado
- [ ] Verificar tiempos de respuesta
- [ ] Probar en diferentes navegadores

**DESPUÉS DE TESTING:**
- [ ] Documentar resultados
- [ ] Reportar bugs encontrados
- [ ] Sugerir mejoras de UX
- [ ] Planificar próximas iteraciones

---

## 🎯 **URLS DE ACCESO RÁPIDO**

- **Login:** http://localhost:3001/login
- **Dashboard Empresa:** http://localhost:3001/empresa
- **Centro Candidatos:** http://localhost:3001/empresa/centro-candidatos
- **API Backend:** http://127.0.0.1:8000/api
- **phpMyAdmin:** http://localhost/phpmyadmin (Base: cvselecto)

---

**⏱️ TIEMPO TOTAL ESTIMADO: 15-20 minutos**
**🎯 ¡Estás listo para comenzar el testing!**
