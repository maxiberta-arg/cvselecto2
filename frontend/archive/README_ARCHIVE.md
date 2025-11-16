# 📦 Archivo de Componentes React - CVSelecto Frontend

**Propósito:** Preservar variantes antiguas de componentes React para referencia sin crear confusión en el código activo.

**Fecha de Creación:** 16 de noviembre de 2025

---

## 📋 Estrategia de Unificación de Componentes

El proyecto CVSelecto tenía **múltiples variantes de componentes críticos** que podían causar:
- ❌ Inconsistencias si alguien editaba una versión sin actualizar las otras
- ❌ Confusión sobre cuál era la versión "oficial"
- ❌ Deuda técnica acumulada

**Decisión Ejecutiva:** Mantener **1 versión única** en `frontend/src/views/` y archivar variantes aquí como respaldo histórico.

---

## 📁 Componentes Archivados

### **Componentes Unificados**

| Componente Principal | Variantes Archivadas | Criterio de Selección |
|---|---|---|
| `CentroCandidatos.js` | `CentroCandidatos_NEW.js` | ✅ Versión estable, sin variantes |
| `CentroCandidatos.js` | `CentroCandidatosSimple.js` | ✅ Versión estable, sin variantes |
| `CentroCandidatos.js` | `CentroCandidatosFixed.js` | ✅ Versión estable, sin variantes |
| `ConfiguracionEmpresa.js` | `ConfiguracionEmpresaSimple.js` | ✅ Versión estable, sin variantes |

### **Archivos en Este Directorio**

```
frontend/archive/
├── CentroCandidatos_NEW.js.bak
├── CentroCandidatosSimple.js.bak
├── CentroCandidatosFixed.js.bak
├── ConfiguracionEmpresaSimple.js.bak
└── README_ARCHIVE.md (este archivo)
```

---

## 🔄 Cómo Recuperar Una Variante Antigua

Si necesitas revisar o recuperar una versión anterior:

```powershell
# 1. Revisar contenido del archivo archivado
Get-Content "frontend/archive/CentroCandidatos_NEW.js.bak" | head -50

# 2. Copiar de vuelta a views/ para referencia (con nombre diferente)
Copy-Item "frontend/archive/CentroCandidatos_NEW.js.bak" `
  -Destination "frontend/src/views/CentroCandidatos_OLD_REFERENCE.js"

# 3. Comparar con versión actual (usando git diff o similar)
git diff frontend/src/views/CentroCandidatos.js frontend/src/views/CentroCandidatos_OLD_REFERENCE.js

# 4. Eliminar referencia después de usarla
Remove-Item "frontend/src/views/CentroCandidatos_OLD_REFERENCE.js"
```

---

## 📝 Changelog de Archivado

### **16/11/2025 - Consolidación Inicial**

**Componentes archivados:**
- ✅ `CentroCandidatos_NEW.js` → duplicado del principal
- ✅ `CentroCandidatosSimple.js` → versión simplificada (no usada)
- ✅ `CentroCandidatosFixed.js` → versión antigua de fixes
- ✅ `ConfiguracionEmpresaSimple.js` → versión sin validaciones (no usada)

**Razón:** Consolidación para producción. Versión única en `frontend/src/views/`.

---

## ⚠️ Importante: Antes de Cambiar Componentes

1. ✅ **Revisar** variantes en `frontend/archive/` para ver si tienen features perdidas
2. ✅ **Usar git diff** para comparar antes de cambios significativos
3. ✅ **Hacer backup** de la versión actual antes de grandes refactors
4. ✅ **Documentar** por qué se hace el cambio en el commit

---

## 🎯 Próximos Pasos

- [ ] **Semana 1:** Validar que componentes unificados funcionan en producción
- [ ] **Semana 2:** Si todo OK, eliminar archivos `.bak` después de 2 semanas
- [ ] **Semana 2+:** Considerar usar versioning y git tags en lugar de variantes

---

## 📞 Preguntas Frecuentes

**P: ¿Puedo editar un archivo .bak aquí?**  
R: No. Si necesitas cambios, copian a `frontend/src/views/` con nombre único y editan ahí.

**P: ¿Estos archivos se incluyen en el build?**  
R: No. `frontend/archive/` está fuera de `src/`, así que npm build los ignora.

**P: ¿Qué pasa si recupero un .bak y tiene imports rotos?**  
R: Es normal. Esos imports eran válidos en ese momento. Revisa los errores y adapta los imports.

---

**Última actualización:** 16/11/2025  
**Responsable:** Consolidación de Componentes React (PLAN_DE_ACCION_EJECUTIVO_INMEDIATO)
