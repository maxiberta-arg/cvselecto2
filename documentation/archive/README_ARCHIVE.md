# 📦 Archivo de Documentación Histórica - CVSelecto

**Propósito:** Preservar versiones históricas y borradores de documentación sin entorpecer la navegación principal.

**Fecha de Creación:** 16 de noviembre de 2025

---

## 📋 Archivos Históricos Recomendados para Archivar

Los siguientes archivos son candidatos a ser movidos a esta carpeta. Son documentos versionados o borradores que pueden servir de referencia pero no son la fuente de verdad actual.

### **Análisis y Diagnósticos (borrador/versionados)**
- `PLAN_MAESTRO_*.md` (versiones antiguas si existen)
- `FASE2_ANALISIS_*.md` (versiones obsoletas)
- `PLAN_INTEGRACION_*.md` (versiones obsoletas)
- `DIAGNOSTICO_INICIAL_*.md` (reportes históricos)

### **Reportes de Testing (versionados)**
- `PLAN_TESTING_COMPREHENSIVE_*.md`
- `REPORTE_TESTING_FUNCIONAL_*.md`
- `REPORTE_TESTING_*.md`
- `VALIDACION_TESTING_*.md`

### **Sugerencias y Avances (completados/obsoletos)**
- `SUGERENCIAS_AVANCES_*.md`
- `PLAN_ACCION_*.md` (versiones antiguas)
- `CHECKLIST_*.md` (versiones antiguas)

### **Informes Técnicos (versionados)**
- `ARQUITECTURA_SISTEMA_*.md` (versiones antiguas)
- `VALIDACION_INFRAESTRUCTURA_*.md`
- `VALIDACION_TECNICA_*.md`

### **Propuestas y Borradores**
- `PROPUESTA_*.md`
- `BORRADOR_*.md`
- `DRAFT_*.md`

---

## 📁 Estructura Actual (NO mover aún)

Los siguientes archivos son la **fuente de verdad actual** y deben permanecer en `documentation/`:

### **Documentos Maestros Activos**
- ✅ `AUDITORIA_Y_CORRECCIONES_2025_11_16.md` — Auditoría final del sistema
- ✅ `ANALISIS_SENIOR_PROFESIONAL_2025_11_16.md` — Análisis técnico completo
- ✅ `ARQUITECTURA_SISTEMA_CVSELECTO.md` — Arquitectura actual (si es reciente)
- ✅ `INDICE_DE_DOCUMENTACION_CVSELECTO.md` — Índice de referencia

### **Guías Operacionales**
- ✅ `README.md` (raíz) — Punto de entrada principal
- ✅ Scripts y guías de setup/deploy

---

## 🔄 Cómo Usar Este Archivo

### **Opción 1: Mover Archivos Manualmente (PowerShell)**

```powershell
# Navegar al directorio raíz del proyecto
cd 'c:\Proyectos\Tesis MaxiBerta'

# Mover archivos específicos al archivo
Move-Item -Path "PLAN_TESTING_*.md" -Destination "documentation/archive/" -Force
Move-Item -Path "REPORTE_TESTING_*.md" -Destination "documentation/archive/" -Force
Move-Item -Path "SUGERENCIAS_AVANCES_*.md" -Destination "documentation/archive/" -Force

# Verificar resultado
Get-ChildItem documentation/archive/
```

### **Opción 2: Mover Todo (menos archivos activos)**

```powershell
# Listar archivos a mover interactivamente
Get-ChildItem -Filter "*.md" | Where-Object { 
  $_.Name -match "(PLAN_TESTING|REPORTE_TESTING|SUGERENCIAS|DIAGNOSTICO|BORRADOR)" 
} | ForEach-Object {
  Write-Host "¿Mover $($_.Name)? (S/n)"
  Move-Item -Path $_.FullName -Destination "documentation/archive/" -Force
}
```

### **Opción 3: Script Automático (si todos acuerdan)**

Esperar confirmación antes de ejecutar mover masivos.

---

## 📌 Convención de Nombres

Todos los archivos en `archive/` deben tener un comentario al inicio indicando:
- **Razón de archivado:** Versión antigua, borrador, completado, etc.
- **Fecha de archivado:** Cuándo se archivó
- **Referencia activa:** Dónde está la versión actual (si aplica)

**Ejemplo al inicio de archivo archivado:**

```markdown
# [ARCHIVED] PLAN_TESTING_v1.md

> **Estado:** Versión obsoleta, archivada el 16/11/2025
> **Reemplazado por:** AUDITORIA_Y_CORRECCIONES_2025_11_16.md
> **Motivo:** Consolidación de documentación

...resto del contenido...
```

---

## 🎯 Meta de Consolidación

```
Situación Actual:  46 .md (40% duplicados)
Meta:              ~20 .md activos + archive/
Resultado:         Reducción 57% de confusión de docs
Fecha Target:      17/11/2025
```

---

## 📞 Preguntas Frecuentes

**P: ¿Puedo recuperar un archivo archivado?**  
R: Sí, está en `documentation/archive/`. Basta con moverlo de vuelta o usarlo como referencia.

**P: ¿Qué pasa si borro accidentalmente algo?**  
R: Los archivos están en git. Usa `git log` o `git checkout` para recuperar.

**P: ¿Debo revisar archivos antes de archivar?**  
R: Recomendado. Verifica que el contenido no tenga información crítica no documentada en activos.

---

**Última actualización:** 16/11/2025  
**Responsable:** Consolidación de Documentación (PLAN_DE_ACCION_EJECUTIVO_INMEDIATO)
