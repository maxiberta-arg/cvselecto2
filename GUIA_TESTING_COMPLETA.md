# 🧪 GUÍA COMPLETA DE TESTING - PERFIL EMPRESA

## 📋 **USUARIOS DE PRUEBA DISPONIBLES**

| Tipo | Email | Password | Estado | Notas |
|------|-------|----------|--------|--------|
| 🔧 Admin | `admin@test.com` | `admin123` | Activo | Panel de administración |
| 🏢 Empresa Verificada | `empresa@test.com` | `empresa123` | Verificada | **USAR ESTE PARA TESTING** |
| 🏢 Empresa Pendiente | `startup@test.com` | `startup123` | Pendiente | Para probar estados |
| 👨‍💼 Candidato Completo | `candidato@test.com` | `candidato123` | Completo | Todos los datos |
| 👩‍💼 Candidato Básico | `ana@test.com` | `password123` | Básico | Datos mínimos |

---

## 🚀 **PREPARACIÓN DE ENTORNO**

### **1. Iniciar Servidores**
```bash
# Terminal 1 - Backend Laravel
cd "c:\Proyectos\Tesis MaxiBerta"
php artisan serve --port=8000

# Terminal 2 - Frontend React
cd "c:\Proyectos\Tesis MaxiBerta\frontend"
npm start
# Aceptar puerto alternativo (3001) si pregunta
```

### **2. Verificar Conexión API**
- Backend: `http://127.0.0.1:8000`
- Frontend: `http://localhost:3001` (o puerto asignado)
- API Test: `http://127.0.0.1:8000/api/empresas/by-user/33`

---

## 🧪 **TESTS FUNCIONALES PASO A PASO**

### **📍 FASE 1: Login y Acceso**
1. **Ir a:** `http://localhost:3001`
2. **Login con:** `empresa@test.com` / `empresa123`
3. **Verificar:** Dashboard de empresa aparece
4. **Ir a:** "Perfil" o "Mi Perfil"

### **📍 FASE 2: Carga Inicial** ⭐ **CRÍTICO**
**✅ DEBE FUNCIONAR:**
- Spinner de carga por ~1-2 segundos
- Formulario se llena automáticamente con datos
- Badge "Empresa Verificada" (verde) visible
- Botón "Editar Perfil" disponible
- Todos los campos en modo lectura (disabled)

**❌ SI FALLA:**
- Error 404: Usuario/empresa no encontrado
- Error 500: Problema en el backend
- Campos vacíos: API no está trayendo datos
- Error CORS: Problema de configuración

### **📍 FASE 3: Modo Edición**
1. **Click en "Editar Perfil"**
2. **Verificar cambios:**
   - ✅ Campos se habilitan (enabled)
   - ✅ Botón cámara aparece en logo
   - ✅ Botones cambian a "Cancelar" y "Guardar"

### **📍 FASE 4: Validaciones en Tiempo Real** ⭐ **CRÍTICO**

#### **4.1 Campos Obligatorios**
- **Borrar** contenido de "Razón Social"
- **Esperar 1 segundo** → ❌ "La razón social es obligatoria"
- **Hacer lo mismo con:** Nombre, Email, CUIT, Teléfono, Dirección, Descripción, Sector

#### **4.2 Formato CUIT**
- **Cambiar CUIT a:** `123456789`
- **Verificar:** ❌ "Formato válido: XX-XXXXXXXX-X"
- **Cambiar a:** `30-12345678-9` → ✅ Error desaparece

#### **4.3 Descripción**
- **Escribir menos de 50 caracteres**
- **Verificar:** ❌ "Mínimo 50 caracteres"
- **Contador:** `25/2000 caracteres` actualizado

#### **4.4 URLs**
- **Sitio Web:** Escribir `www.empresa.com` → ❌ "Debe comenzar con http://"
- **LinkedIn:** Escribir `facebook.com/empresa` → ❌ "URL de LinkedIn inválida"

### **📍 FASE 5: Upload de Logo** ⭐ **CRÍTICO**
1. **Click en botón cámara (esquina del logo)**
2. **Seleccionar imagen JPG/PNG < 2MB**
3. **Verificar:** ✅ Preview inmediato del logo
4. **Probar archivo > 2MB:** ❌ "Logo no puede superar 2MB"
5. **Probar archivo .txt:** ❌ "Solo archivos de imagen"

### **📍 FASE 6: Guardado Completo** ⭐ **MUY CRÍTICO**
1. **Completar todos los campos obligatorios**
2. **Click "Guardar Cambios"**
3. **Verificar secuencia:**
   - ✅ Botón muestra spinner "Guardando..."
   - ✅ Mensaje verde "✅ Perfil actualizado correctamente"
   - ✅ Modo edición se desactiva automáticamente
   - ✅ Datos se mantienen después del guardado

### **📍 FASE 7: Cancelación**
1. **Activar modo edición**
2. **Modificar varios campos**
3. **Click "Cancelar"**
4. **Verificar:** ✅ Datos originales restaurados

---

## 🔍 **TESTS TÉCNICOS AVANZADOS**

### **📡 Network Tab Testing**
1. **F12 → Network → Reload página**
2. **Verificar llamadas:**
   - ✅ `GET /api/empresas/by-user/33` → Status 200
   - ✅ Response JSON con datos empresa
3. **Al guardar:**
   - ✅ `POST /api/empresas/X?_method=PUT` → Status 200
   - ✅ `Content-Type: multipart/form-data` si hay logo

### **📱 Responsive Testing**
- **Desktop (1920px):** Layout 2 columnas
- **Tablet (768px):** Columnas se adaptan
- **Mobile (375px):** Formulario stacked

---

## 🐛 **TROUBLESHOOTING**

### **🚨 Errores Comunes**

| Error | Causa Probable | Solución |
|-------|----------------|----------|
| **Página en blanco** | React no compiló | `npm start` nuevamente |
| **404 API** | Laravel no está corriendo | `php artisan serve` |
| **CORS Error** | Config Laravel | Verificar `config/cors.php` |
| **500 Error** | DB no conecta | Verificar `.env` database |
| **Campos vacíos** | Usuario sin empresa | Usar `empresa@test.com` |

### **🔧 Comandos de Emergencia**
```bash
# Restart todo desde cero
cd "c:\Proyectos\Tesis MaxiBerta"
php artisan migrate:fresh --seed
php artisan serve --port=8000

cd frontend
npm start
```

---

## ✅ **CHECKLIST FINAL**

| Test | Status | Notas |
|------|---------|-------|
| ✅ Login empresa funciona | ⬜ | empresa@test.com |
| ✅ Carga inicial API | ⬜ | Datos automáticos |
| ✅ Modo edición toggle | ⬜ | Campos enabled/disabled |
| ✅ Validaciones tiempo real | ⬜ | Errores inmediatos |
| ✅ Upload logo + preview | ⬜ | <2MB, JPG/PNG |
| ✅ Guardado completo | ⬜ | Success + reload |
| ✅ Cancelación funciona | ⬜ | Rollback datos |
| ✅ Network calls OK | ⬜ | 200 responses |
| ✅ Mobile responsive | ⬜ | Usable en móvil |

---

## 🎯 **CRITERIOS DE ÉXITO**

**SPRINT 2 COMPLETADO SI:**
- ✅ Login → Carga datos automáticamente
- ✅ Todas las validaciones funcionan
- ✅ Upload de logo funciona
- ✅ Guardado persiste los cambios
- ✅ UX es fluida y sin errores

**🚀 LISTO PARA SPRINT 3:** Gestión de Búsquedas Laborales

---

## 📞 **REPORTE DE BUGS**

Si encuentras algún problema, reporta:
1. **Pasos para reproducir**
2. **Error exacto (screenshot)**
3. **Browser y versión**
4. **Console logs (F12)**
