# 🧪 GUÍA COMPLETA DE TESTING MANUAL - CVSelecto

## 📊 ESTADO PRELIMINAR

**✅ Servidores Verificados:**
- **Backend Laravel**: http://127.0.0.1:8000 - OPERATIVO
- **Frontend React**: http://localhost:3002 - OPERATIVO
- **Integración**: COMPLETAMENTE FUNCIONAL

---

## 📋 1. MÓDULOS A TESTEAR

### **👔 ROL EMPRESA (Principal)**

#### **A. Dashboard y Configuración**
- ✅ **Dashboard Principal** (`/empresa`)
- ✅ **Configuración de Empresa** (`/configuracion-empresa`)
- ✅ **Perfil de Empresa** (`/perfil-empresa`)

#### **B. Gestión de Búsquedas Laborales**
- ✅ **Crear Búsqueda** (`/crear-busqueda-laboral`)
- ✅ **Lista de Búsquedas** (`/mis-busquedas-laborales`)
- ✅ **Editar Búsqueda** (`/editar-busqueda-laboral/:id`)
- ✅ **Detalle de Búsqueda** (`/busqueda-detalle/:id`)

#### **C. Gestión de Candidatos**
- ✅ **Pool de Candidatos** (`/pool-candidatos`)
- ✅ **Búsqueda de Candidatos** (`/busqueda-candidatos`)
- ✅ **Centro de Candidatos** (`/empresa/centro-candidatos`)
- ✅ **Gestión de Candidatos** (`/gestion-candidatos`)
- ✅ **Centro Gestión** (`/centro-gestion`)
- ✅ **Agregar Candidato Manual** (`/agregar-candidato-manual/:busquedaId`)
- ✅ **Editar Candidato** (`/empresa/candidatos/editar/:id`)
- ✅ **Perfil de Candidato** (`/candidatos/:id`)

#### **D. Sistema de Evaluaciones (NUEVO)**
- ✅ **Centro de Evaluación** (`/centro-evaluacion`)
- ✅ **Crear Evaluación** (`/crear-evaluacion`)
- ✅ **Detalle de Evaluación** (`/evaluacion/:id`)
- ✅ **Editar Evaluación** (`/evaluacion/:id/editar`)
- ✅ **Evaluaciones por Candidato** (`/evaluaciones/candidato/:candidatoId`)

#### **E. Reportes**
- ✅ **Reportes de Empresa** (`/reportes-empresa`)

### **👤 ROL CANDIDATO**
- ✅ **Dashboard Candidato** (`/candidato`)
- ✅ **Perfil Candidato** (`/perfil`)

### **⚙️ ROL ADMIN**
- ✅ **Dashboard Admin** (`/admin`)
- ✅ **Gestión de Candidatos Admin** (`/admin-candidatos`)
- ✅ **Perfil Admin** (`/perfil-admin`)

### **🌐 PÚBLICO**
- ✅ **Página Principal** (`/`)
- ✅ **Login** (`/login`)
- ✅ **Registro** (`/register`)

---

## 🧪 2. CHECKLIST DE PRUEBAS MANUALES

### **🚀 TESTING INICIAL - PREPARACIÓN**

#### **Paso 1: Verificación de Servidores**
```
☐ Acceder a http://127.0.0.1:8000/api/test
   Resultado esperado: JSON con mensaje "API funcionando correctamente"

☐ Acceder a http://localhost:3002
   Resultado esperado: Página principal de CVSelecto carga correctamente

☐ Verificar consola del navegador (F12)
   Resultado esperado: Sin errores críticos de JavaScript
```

#### **Paso 2: Crear Usuarios de Prueba**
```
☐ Usuario Empresa:
   Email: testing.empresa@cvselecto.com
   Password: Testing123!
   
☐ Usuario Candidato:
   Email: testing.candidato@cvselecto.com
   Password: Testing123!
   
☐ Usuario Admin (si disponible):
   Email: testing.admin@cvselecto.com
   Password: Testing123!
```

---

### **👔 TESTING ROL EMPRESA**

#### **A1. REGISTRO Y LOGIN DE EMPRESA**

**Navegación:** `/register`

**Pasos de Testing:**
```
☐ 1. Acceder a página de registro
☐ 2. Seleccionar rol "Empresa"
☐ 3. Completar Paso 1: Datos básicos
   - Nombre: Testing Empresa SA
   - Email: testing.empresa@cvselecto.com
   - Password: Testing123!
   - Confirmar password
☐ 4. Avanzar al Paso 2: Datos de empresa
   - Razón Social: Testing Empresa SA
   - CUIT: 20-12345678-9
   - Teléfono: +54 11 1234-5678
   - Dirección: Av. Test 123, CABA
   - Descripción: Empresa de testing
☐ 5. Completar registro
☐ 6. Verificar redirección a dashboard empresa
```

**Resultados Esperados:**
- ✅ Formulario valida campos obligatorios
- ✅ Mensajes de error claros para campos inválidos
- ✅ Registro exitoso y redirección automática
- ✅ Token de autenticación almacenado
- ✅ Usuario logueado en dashboard

**Botones a Verificar:**
- ✅ "Siguiente" (habilitado solo con datos válidos)
- ✅ "Anterior" (retrocede sin perder datos)
- ✅ "Registrarse" (procesa formulario)
- ✅ "¿Ya tienes cuenta? Inicia sesión" (navega a login)

#### **A2. CONFIGURACIÓN INICIAL DE EMPRESA**

**Navegación:** `/configuracion-empresa`

**Pasos de Testing:**
```
☐ 1. Desde dashboard, click en "Configuración"
☐ 2. Verificar datos precargados del registro
☐ 3. Subir logo de empresa (imagen PNG/JPG)
☐ 4. Actualizar descripción
☐ 5. Agregar sitio web
☐ 6. Cambiar password (opcional)
☐ 7. Guardar configuración
```

**Resultados Esperados:**
- ✅ Formulario precargado con datos del registro
- ✅ Upload de logo funciona correctamente
- ✅ Validaciones en tiempo real
- ✅ Mensaje de éxito al guardar
- ✅ Cambios reflejados en el perfil

**Botones a Verificar:**
- ✅ "Subir Logo" - abre selector de archivos
- ✅ "Cambiar Contraseña" - muestra/oculta campos
- ✅ "Guardar Configuración" - envía formulario
- ✅ "Volver" - navega al dashboard

#### **A3. GESTIÓN DE BÚSQUEDAS LABORALES**

**Navegación:** `/crear-busqueda-laboral`

**Pasos de Testing:**
```
☐ 1. Click en "Crear Nueva Búsqueda" desde dashboard
☐ 2. Completar formulario:
   - Título: Desarrollador Frontend React
   - Descripción: Descripción detallada del puesto
   - Salario: 150000-200000
   - Ubicación: Buenos Aires
   - Modalidad: Híbrido
   - Nivel educación: Universitario
   - Años experiencia: 2-5 años
☐ 3. Guardar búsqueda
☐ 4. Verificar en lista de búsquedas
☐ 5. Editar búsqueda creada
☐ 6. Ver detalle de búsqueda
```

**Resultados Esperados:**
- ✅ Validaciones de campos obligatorios
- ✅ Búsqueda se crea correctamente
- ✅ Aparece en lista de búsquedas
- ✅ Edición funciona correctamente
- ✅ Detalle muestra información completa

**Botones a Verificar:**
- ✅ "Crear Búsqueda" - valida y crea
- ✅ "Cancelar" - vuelve sin guardar
- ✅ "Guardar Cambios" (en edición)
- ✅ "Ver Detalle" - navega al detalle
- ✅ "Editar" - navega a edición
- ✅ "Eliminar" - confirma y elimina

#### **A4. GESTIÓN DE POSTULACIONES Y EVALUACIONES (INTEGRACIÓN NUEVA)**

**Navegación:** `/busqueda-detalle/:id` → Tab Postulaciones

**Pasos de Testing:**
```
☐ 1. Acceder a detalle de búsqueda con postulaciones
☐ 2. Verificar columna "Evaluaciones" en tabla
☐ 3. Observar badges de estado:
   - Rojo: Evaluaciones pendientes
   - Verde: Evaluaciones completadas
   - Amarillo: Puede evaluar
☐ 4. Click en badge de evaluaciones
☐ 5. Verificar apertura de modal "Gestión de Evaluaciones"
☐ 6. Probar creación manual de evaluación:
   - Nombre: Evaluación Técnica React
   - Tipo: Técnica
   - Verificar criterios automáticos
☐ 7. Cambiar estado de postulación:
   - De "postulado" a "seleccionado"
   - Verificar generación automática de evaluación
☐ 8. Navegar a detalle de evaluación
```

**Resultados Esperados:**
- ✅ Columna "Evaluaciones" visible en tabla
- ✅ Badges muestran estado correcto
- ✅ Modal se abre correctamente
- ✅ Formulario de evaluación funciona
- ✅ Evaluación automática se genera
- ✅ Navegación a detalle funciona
- ✅ Estados se sincronizan correctamente

**Botones a Verificar:**
- ✅ Badge de evaluaciones - abre modal
- ✅ "Nueva Evaluación" - muestra formulario
- ✅ "Crear Evaluación" - valida y crea
- ✅ "Cancelar" - cierra formulario
- ✅ "Ver" (evaluación) - navega a detalle
- ✅ "Cerrar" (modal) - cierra modal
- ✅ Botones de cambio de estado (en revisión, seleccionado, rechazado)
- ✅ "Ver detalles" - navega a perfil candidato
- ✅ "Agregar a pool" - agrega candidato al pool
- ✅ "Evaluaciones" - abre modal de evaluaciones

#### **A5. CENTRO DE EVALUACIÓN**

**Navegación:** `/centro-evaluacion`

**Pasos de Testing:**
```
☐ 1. Acceder desde menú principal
☐ 2. Verificar lista de evaluaciones
☐ 3. Filtrar por estado:
   - Pendientes
   - En progreso
   - Completadas
☐ 4. Ordenar por fecha/candidato
☐ 5. Acceder a detalle de evaluación
☐ 6. Completar evaluación:
   - Asignar puntajes a criterios
   - Agregar comentarios
   - Marcar como completada
☐ 7. Exportar resultados (si disponible)
```

**Resultados Esperados:**
- ✅ Lista carga correctamente
- ✅ Filtros funcionan
- ✅ Ordenamiento funciona
- ✅ Detalle muestra información completa
- ✅ Evaluación se puede completar
- ✅ Cambios se guardan correctamente

**Botones a Verificar:**
- ✅ Filtros de estado - aplican filtro
- ✅ "Ver Detalle" - navega a evaluación
- ✅ "Editar" - permite modificar
- ✅ "Completar" - marca como terminada
- ✅ "Guardar Cambios" - persiste datos
- ✅ "Exportar" - genera reporte

#### **A6. POOL DE CANDIDATOS**

**Navegación:** `/pool-candidatos`

**Pasos de Testing:**
```
☐ 1. Verificar lista de candidatos en pool
☐ 2. Agregar candidato desde postulación
☐ 3. Filtrar candidatos:
   - Por habilidades
   - Por experiencia
   - Por evaluaciones
☐ 4. Ver perfil de candidato
☐ 5. Editar información del candidato
☐ 6. Asignar tags/etiquetas
☐ 7. Crear evaluación desde pool
☐ 8. Eliminar candidato del pool
```

**Resultados Esperados:**
- ✅ Pool carga correctamente
- ✅ Candidatos se agregan desde postulaciones
- ✅ Filtros funcionan correctamente
- ✅ Perfil muestra información completa
- ✅ Edición funciona
- ✅ Tags se asignan correctamente
- ✅ Evaluaciones se crean desde pool
- ✅ Eliminación funciona con confirmación

**Botones a Verificar:**
- ✅ "Agregar Candidato" - múltiples opciones
- ✅ "Filtrar" - aplica filtros
- ✅ "Ver Perfil" - navega a detalle
- ✅ "Editar" - permite modificación
- ✅ "Agregar Tag" - asigna etiqueta
- ✅ "Evaluar" - crea evaluación
- ✅ "Eliminar" - confirma y remueve

#### **A7. DASHBOARD DE EMPRESA**

**Navegación:** `/empresa`

**Pasos de Testing:**
```
☐ 1. Verificar métricas principales:
   - Total de búsquedas activas
   - Total de postulaciones
   - Candidatos en pool
   - Evaluaciones pendientes (NUEVO)
   - Evaluaciones completadas (NUEVO)
☐ 2. Verificar enlaces rápidos funcionan
☐ 3. Verificar gráficos/estadísticas
☐ 4. Probar navegación a secciones principales
```

**Resultados Esperados:**
- ✅ Métricas cargan correctamente
- ✅ Números reflejan datos reales
- ✅ Enlaces rápidos funcionan
- ✅ Gráficos se renderizan
- ✅ Navegación es fluida

**Botones a Verificar:**
- ✅ "Nueva Búsqueda" - navega a crear
- ✅ "Ver Postulaciones" - navega a gestión
- ✅ "Gestionar Pool" - navega a pool
- ✅ "Centro Evaluación" - navega a evaluaciones
- ✅ "Configuración" - navega a settings

---

### **👤 TESTING ROL CANDIDATO**

#### **B1. REGISTRO Y PERFIL DE CANDIDATO**

**Navegación:** `/register`

**Pasos de Testing:**
```
☐ 1. Seleccionar rol "Candidato"
☐ 2. Completar datos básicos
☐ 3. Completar datos profesionales:
   - Título profesional
   - Años de experiencia
   - Nivel educación
   - Habilidades
   - CV (upload)
☐ 4. Completar registro
☐ 5. Acceder a perfil (`/perfil`)
☐ 6. Editar información
☐ 7. Actualizar CV
```

**Resultados Esperados:**
- ✅ Registro exitoso
- ✅ Perfil se crea correctamente
- ✅ Edición funciona
- ✅ Upload de CV funciona
- ✅ Cambios se guardan

#### **B2. DASHBOARD DE CANDIDATO**

**Navegación:** `/candidato`

**Pasos de Testing:**
```
☐ 1. Verificar métricas:
   - Postulaciones enviadas
   - En proceso de selección
   - Entrevistas programadas
☐ 2. Ver búsquedas disponibles
☐ 3. Postularse a búsqueda
☐ 4. Ver estado de postulaciones
```

**Resultados Esperados:**
- ✅ Dashboard carga correctamente
- ✅ Métricas son precisas
- ✅ Postulación funciona
- ✅ Estados se actualizan

---

### **⚙️ TESTING ROL ADMIN**

#### **C1. GESTIÓN ADMINISTRATIVA**

**Navegación:** `/admin`

**Pasos de Testing:**
```
☐ 1. Verificar métricas generales del sistema
☐ 2. Gestionar candidatos (`/admin-candidatos`)
☐ 3. Verificar empresas pendientes de verificación
☐ 4. Aprobar/rechazar empresas
☐ 5. Ver reportes del sistema
```

**Resultados Esperados:**
- ✅ Panel admin accesible
- ✅ Métricas del sistema correctas
- ✅ Gestión de usuarios funciona
- ✅ Verificación de empresas funciona

---

## 🔍 3. AUDITORÍA DE BOTONES Y RUTAS

### **A. CATEGORIZACIÓN DE BOTONES**

#### **🔗 Botones de Navegación (Deben redirigir correctamente)**
```
☐ Navbar - "CVSelecto" → `/` (Home)
☐ Navbar - "Dashboard" → dashboard según rol
☐ Navbar - "Perfil" → perfil según rol
☐ Navbar - "Cerrar Sesión" → `/login`
☐ Home - "Iniciar Sesión" → `/login`
☐ Home - "Registrarse" → `/register`
☐ Footer - Enlaces de navegación
```

#### **📝 Botones de Formulario (Deben procesar datos)**
```
☐ Login - "Iniciar Sesión" → autentica usuario
☐ Register - "Registrarse" → crea cuenta
☐ Register - "Siguiente/Anterior" → navegación de pasos
☐ Configuración - "Guardar" → actualiza datos
☐ Crear Búsqueda - "Crear" → crea búsqueda
☐ Editar - "Guardar Cambios" → actualiza registro
☐ Upload - "Subir Archivo" → procesa archivo
```

#### **🎛️ Botones de Acción (Deben ejecutar funciones)**
```
☐ Postulaciones - Cambio de estado → actualiza estado
☐ Evaluaciones - "Nueva Evaluación" → abre formulario
☐ Evaluaciones - "Completar" → marca como terminada
☐ Pool - "Agregar/Eliminar" → modifica pool
☐ Filtros - "Aplicar/Limpiar" → filtra/resetea resultados
☐ Modal - "Abrir/Cerrar" → muestra/oculta modal
☐ Dropdown - "Seleccionar" → aplica selección
```

#### **⚠️ Botones de Confirmación (Deben pedir confirmación)**
```
☐ Eliminar registros → modal de confirmación
☐ Cambios importantes → confirmación de acción
☐ Salir sin guardar → advertencia de pérdida
☐ Rechazar postulación → confirmación
```

### **B. TESTING SISTEMÁTICO DE BOTONES**

#### **B1. Testing de Navegación**
```
☐ Click en cada botón de navegación
☐ Verificar URL destino correcta
☐ Verificar carga de página destino
☐ Verificar breadcrumbs actualizados
☐ Verificar estado de navbar actualizado
```

#### **B2. Testing de Formularios**
```
☐ Llenar formulario con datos válidos → envío exitoso
☐ Enviar formulario vacío → mensajes de error
☐ Enviar datos inválidos → validación específica
☐ Verificar estados de loading durante envío
☐ Verificar mensajes de éxito/error
☐ Verificar redirección post-envío
```

#### **B3. Testing de Acciones**
```
☐ Click en botón de acción → función ejecuta
☐ Verificar feedback visual (loading, success, error)
☐ Verificar cambios en UI reflejan acción
☐ Verificar persistencia de cambios (refresh)
☐ Verificar sincronización con backend
```

#### **B4. Testing de Modales**
```
☐ Botón abre modal → modal aparece correctamente
☐ Overlay funciona → click fuera cierra modal
☐ Botón cerrar → modal se cierra
☐ Escape key → modal se cierra
☐ Formulario en modal → funciona independiente
```

### **C. CHECKLIST DE VERIFICACIÓN POR BOTÓN**

#### **🚨 Indicadores de Problemas:**
```
❌ Botón no responde al click
❌ Redirección a página inexistente (404)
❌ Error de JavaScript en consola
❌ Loading infinito sin respuesta
❌ Modal no se abre/cierra
❌ Formulario no valida datos
❌ Cambios no se persisten
❌ Estados inconsistentes entre frontend/backend
❌ Botón habilitado cuando debería estar deshabilitado
❌ Falta feedback visual para acciones
```

#### **✅ Indicadores de Funcionamiento Correcto:**
```
✅ Click ejecuta acción esperada
✅ Navegación lleva a destino correcto
✅ Validaciones funcionan apropiadamente
✅ Feedback visual es claro y oportuno
✅ Estados se sincronizan correctamente
✅ Errores se manejan elegantemente
✅ Loading states son apropiados
✅ Accesibilidad funciona (keyboard navigation)
✅ Responsive design se mantiene
✅ Performance es aceptable
```

---

## 📌 4. QUÉ OBSERVAR DURANTE EL TESTING

### **🔍 Frontend**
```
☐ Tiempo de carga de páginas < 3 segundos
☐ Responsividad en diferentes tamaños de pantalla
☐ Iconos y estilos se cargan correctamente
☐ Animaciones fluidas (spinners, transiciones)
☐ Mensajes de error/éxito claros y visibles
☐ Estados de loading apropiados
☐ Navegación intuitiva y consistente
☐ Formularios intuitivos y bien validados
```

### **🔗 Backend Integration**
```
☐ APIs responden en tiempo razonable < 2 segundos
☐ Datos se sincronizan correctamente
☐ Autenticación funciona en todas las rutas protegidas
☐ Permisos por rol se respetan
☐ Upload de archivos funciona
☐ Filtros y búsquedas devuelven resultados correctos
☐ Paginación funciona si aplica
```

### **💾 Base de Datos**
```
☐ Registros se crean correctamente
☐ Actualizaciones se persisten
☐ Eliminaciones son efectivas
☐ Relaciones entre tablas funcionan
☐ Integridad referencial se mantiene
☐ Evaluaciones se vinculan a postulaciones correctamente
```

### **🔐 Seguridad**
```
☐ Rutas protegidas requieren autenticación
☐ Roles se respetan (empresa no puede acceder a admin)
☐ Datos sensibles no se exponen en frontend
☐ Sesión expira apropiadamente
☐ CSRF protection funciona
```

---

## 🧼 5. PRECAUCIONES Y MEJORES PRÁCTICAS

### **🛡️ Datos de Prueba**
```
✅ USAR: Usuarios específicos de testing
✅ USAR: Datos ficticios pero realistas
✅ USAR: Archivos de prueba pequeños (<5MB)
❌ EVITAR: Datos de producción reales
❌ EVITAR: Información personal sensible
❌ EVITAR: Archivos grandes o maliciosos
```

### **📋 Registro de Resultados**
```
☐ Crear checklist específico por sesión
☐ Capturar pantalla de errores
☐ Documentar pasos para reproducir bugs
☐ Registrar tiempos de respuesta
☐ Anotar browser y versión usada
☐ Registrar dispositivo/resolución
```

### **🔄 Protocolo de Testing**
```
1. Limpiar cache y cookies antes de empezar
2. Usar modo incógnito para sesiones frescas
3. Testear en múltiples browsers (Chrome, Firefox, Edge)
4. Verificar responsive en mobile/tablet
5. Documentar inmediatamente cualquier anomalía
6. Re-testear después de cada fix
```

### **🚨 Criterios de Fallo**
```
❌ ERROR CRÍTICO: Sistema no carga / Datos se pierden
❌ ERROR MAYOR: Funcionalidad principal no funciona
⚠️ ERROR MENOR: UI inconsistente / Performance lento
ℹ️ MEJORA: UX podría ser más intuitiva
```

---

## 📊 TEMPLATE DE REPORTE

### **Testing Session Report**
```
Fecha: ___________
Tester: ___________
Browser: ___________
Dispositivo: ___________

MÓDULOS TESTED:
☐ Empresa - Dashboard
☐ Empresa - Búsquedas
☐ Empresa - Postulaciones
☐ Empresa - Evaluaciones ⭐ (NUEVO)
☐ Empresa - Pool Candidatos
☐ Candidato - Dashboard
☐ Admin - Gestión

BUGS ENCONTRADOS:
1. [CRÍTICO/MAYOR/MENOR] Descripción
   Pasos para reproducir:
   Resultado esperado:
   Resultado actual:

2. [...]

FUNCIONALIDADES VERIFICADAS:
✅ Lista de features que funcionan correctamente

RECOMENDACIONES:
- Mejoras sugeridas
- Optimizaciones UX
- Features faltantes
```

---

## 🎯 TESTING PRIORITARIO

### **🔥 MÁXIMA PRIORIDAD (Testing Obligatorio)**
1. ✅ **Login/Logout** - Funcionalidad crítica
2. ✅ **Registro de Usuarios** - Flujo de incorporación
3. ✅ **Crear Búsqueda Laboral** - Funcionalidad principal empresa
4. ✅ **Gestión de Postulaciones** - Core del sistema
5. ✅ **Integración Evaluaciones** ⭐ - Feature nueva crítica
6. ✅ **Dashboard Empresa** - Overview del negocio

### **🔶 ALTA PRIORIDAD (Testing Importante)**
1. ✅ **Pool de Candidatos** - Diferenciador competitivo
2. ✅ **Centro de Evaluación** - Sistema de evaluaciones
3. ✅ **Configuración de Empresa** - Setup inicial
4. ✅ **Perfil de Candidato** - Experiencia del candidato

### **🔷 MEDIA PRIORIDAD (Testing Recomendado)**
1. ✅ **Reportes** - Analytics del negocio
2. ✅ **Gestión Admin** - Administración del sistema
3. ✅ **Features Avanzadas** - Funcionalidades adicionales

---

**🎉 Con esta guía completa, tendrás una roadmap detallada para validar exhaustivamente todo el sistema CVSelecto, especialmente la nueva integración de Postulaciones ↔ Evaluaciones.**

¿Te gustaría que profundice en algún módulo específico o que cree scripts automatizados para complementar el testing manual?
