# 🔐 CREDENCIALES REQUERIDAS - Deploy Producción

**Estado:** Listo para deploy una vez tengas las credenciales del servidor

---

## ✅ Lo que ya preparé

- ✅ Código backend optimizado (25 migraciones, 63 APIs)
- ✅ Frontend build compilado (`frontend/build/`)
- ✅ `.env.production.example` template completo
- ✅ `DEPLOY_CHECKLIST.md` (guía paso-a-paso)
- ✅ `scripts/deploy_production.ps1` (PowerShell automated)
- ✅ `scripts/deploy-production.sh` (Bash manual)
- ✅ `POST_DEPLOY_VALIDATION.md` (tests post-deploy)
- ✅ PHPUnit tests pasando (2/2 ✅)
- ✅ git master actualizado con 9 commits

---

## 🔑 CREDENCIALES FALTANTES

Para ejecutar el deploy necesito que proporciones:

### 📌 Servidor SSH/VPS

```
Servidor Producción:
├─ Host/IP: ________________
├─ Puerto SSH (por defecto 22): ________________
├─ Usuario SSH: ________________
├─ Contraseña/SSH Key: ________________
└─ ¿Ya tienes SSH key o necesitas password?
```

### 📌 Base de Datos

```
MySQL/MariaDB Producción:
├─ Host DB (ej: localhost o 192.168.1.100): ________________
├─ Puerto (por defecto 3306): ________________
├─ Usuario DB: ________________
├─ Contraseña DB: ________________
├─ Nombre BD: ________________
└─ ¿Existe BD o debo crearla?
```

### 📌 Rutas y Dominio

```
Configuración Servidor:
├─ Ruta proyecto en servidor (ej: /var/www/cvselecto): ________________
├─ Dominio producción (ej: https://cvselecto.com): ________________
├─ Email admin/contacto: ________________
└─ ¿Usar HTTP o HTTPS con Let's Encrypt?
```

### 📌 Configuración App

```
Producción Específico:
├─ APP_NAME: ________________
├─ APP_ENV: production
├─ APP_DEBUG: false
├─ CACHE_DRIVER (redis/file/database): ________________
├─ QUEUE_CONNECTION (sync/redis/database): ________________
└─ MAIL_FROM_ADDRESS: ________________
```

---

## 🚀 Opción A: Deploy Automático (Recomendado)

Una vez tengas las credenciales, ejecuto:

```powershell
# Desde Windows (tu máquina)
cd 'c:\Proyectos\Tesis MaxiBerta'

# Opción 1: Script PowerShell automático
.\scripts\deploy_production.ps1 `
  -ServerHost "usuario@servidor.com" `
  -ProjectPath "/var/www/cvselecto"

# O sin credenciales (te pide interactivamente)
.\scripts\deploy_production.ps1 `
  -ServerHost "usuario@servidor.com" `
  -ProjectPath "/var/www/cvselecto" `
  -DryRun  # Simula sin ejecutar
```

---

## 🛠️ Opción B: Deploy Manual (Si prefieres controlar)

O si lo prefieres, te paso la guía paso-a-paso y lo ejecutas vos:

1. Conectas SSH al servidor
2. Clonas/actualizas git
3. Ejecutas `scripts/deploy-production.sh`
4. Validas con `POST_DEPLOY_VALIDATION.md`

---

## 📊 Resumen Estado Actual

```
COMPONENTE           ESTADO      DETALLE
─────────────────────────────────────────────────────────
Backend              ✅ Listo    Laravel 11, PHP 8.2, Sanctum
Frontend             ✅ Listo    React build compilado
Tests                ✅ Pasando  PHPUnit 2/2, ESLint fix
Documentación        ✅ Listo    4 guías de deploy + checklist
Git                  ✅ Pusheado 9 commits en master
─────────────────────────────────────────────────────────
DEPLOY SCRIPTS       ✅ Listo    PowerShell + Bash automático
ENV TEMPLATE         ✅ Listo    .env.production.example
POST-DEPLOY TESTS    ✅ Listo    Health check + login + APIs
─────────────────────────────────────────────────────────

BLOQUEANTE: Credenciales servidor producción
```

---

## ⏱️ Timing Deploy

Una vez tengas credenciales:
- **Deploy tiempo:** ~15-20 min (automático)
- **Post-deploy validación:** ~10-15 min
- **Rollback (si falla):** ~5 min

**Total:** 30-50 minutos de downtime mínimo

---

## 🎯 Próximos Pasos

1. **Proporciona credenciales** (arriba)
2. Yo ejecuto `deploy_production.ps1` automáticamente
3. Validamos con curl + browser
4. ✅ Producción live

**O:**

1. Proporciona credenciales
2. Te paso guía manual + login acceso
3. Ejecutas vos `deploy-production.sh` en el servidor
4. Validamos juntos

---

## 📝 Notas Importantes

- **Backup BD:** Antes de migrar, creá backup de DB producción
- **Rollback plan:** Git revert disponible en `DEPLOY_CHECKLIST.md`
- **SSL/HTTPS:** Asumimos Nginx/Apache + Let's Encrypt ya configurado
- **Permisos:** Script maneja chmod automáticamente

