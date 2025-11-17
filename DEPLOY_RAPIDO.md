# 🚀 CVSelecto - Guía Rápida Deploy Producción

**Estado:** ✅ Listo para deployar  
**Fecha:** 17/11/2025  
**Versión:** CVSelecto 2.0 Production

---

## 📋 Quick Start

### **Si tenés credenciales del servidor:**

```powershell
# 1. Desde Windows:
cd 'c:\Proyectos\Tesis MaxiBerta'

# 2. Ejecuta deploy automático:
.\scripts\deploy_production.ps1 `
  -ServerHost "usuario@servidor.com" `
  -ProjectPath "/var/www/cvselecto"

# 3. Responde preguntas interactivas
# 4. Valida con: https://tu-dominio.com
```

---

### **Si prefieres deploy manual (Linux SSH):**

```bash
# 1. SSH al servidor:
ssh usuario@servidor.com

# 2. Descarga script:
cd /tmp && wget https://raw.githubusercontent.com/maxiberta-arg/cvselecto2/master/scripts/deploy-production.sh

# 3. Ejecuta:
bash deploy-production.sh "https://tu-dominio.com"

# 4. Valida:
curl https://tu-dominio.com/api/health
```

---

## 📚 Documentación Disponible

| Documento | Objetivo | Audiencia |
|-----------|----------|-----------|
| **DEPLOY_CHECKLIST.md** | Validaciones + pasos 1-8 | DevOps/Admin |
| **CREDENCIALES_DEPLOY_REQUERIDAS.md** | ¿Qué datos necesito? | Project Manager |
| **POST_DEPLOY_VALIDATION.md** | Tests post-deploy | QA/Devops |
| **scripts/deploy_production.ps1** | Script automático (PowerShell) | Windows users |
| **scripts/deploy-production.sh** | Script manual (Bash) | Linux/Mac users |

---

## 🔐 Credenciales Necesarias

```
Servidor SSH:
  Host: ejemplo.com:22
  Usuario: deploy-user
  Password/SSH-Key: ***

Base de Datos:
  Host: db.ejemplo.com
  Usuario: cvselecto_user
  Password: ***
  Database: cvselecto_prod

Dominio:
  HTTPS: https://cvselecto.ejemplo.com
  Email: admin@ejemplo.com
```

👉 **Ver:** `CREDENCIALES_DEPLOY_REQUERIDAS.md` para formulario completo

---

## ✅ Pre-Deploy Checklist

- [x] Backend: Migraciones ✅, APIs ✅, Tests ✅
- [x] Frontend: Build compilado ✅
- [x] Documentación: Guías ✅
- [x] Scripts: Deploy automático ✅
- [x] .env.production.example: Presente ✅
- ⏳ **Falta:** Credenciales servidor producción

---

## 🎯 Pasos a Ejecutar (Orden)

### 1. **Proporciona credenciales**
Llena el formulario en `CREDENCIALES_DEPLOY_REQUERIDAS.md`

### 2. **Deploy automático** (opción recomendada)
```powershell
.\scripts\deploy_production.ps1 -ServerHost "..." -ProjectPath "..."
```

### 3. **Validación post-deploy**
```bash
curl https://tu-dominio.com/api/health  # Health check
https://tu-dominio.com                   # Login en browser
# Ver: POST_DEPLOY_VALIDATION.md
```

### 4. **Monitoreo**
```bash
ssh usuario@servidor.com
tail -f /var/www/cvselecto/storage/logs/laravel.log
```

---

## ⏱️ Timeline Estimado

| Fase | Duración | Detalle |
|------|----------|---------|
| Setup | 5 min | SSH + git pull |
| Deploy | 15 min | Composer + migrations + caché |
| Validación | 10 min | Tests + health check |
| **Total** | **30 min** | (con posible 5 min rollback) |

---

## 🆘 Troubleshooting

**Problema:** 500 Internal Server Error
```bash
ssh usuario@servidor.com
tail -100 /var/www/cvselecto/storage/logs/laravel.log
# Ver: DEPLOY_CHECKLIST.md "Troubleshooting"
```

**Problema:** 404 en rutas API
```bash
# En servidor:
php artisan route:cache
sudo systemctl restart php8.2-fpm nginx
```

**Problema:** DB error en migrations
```bash
# Ver .env.production:
grep "DB_" /var/www/cvselecto/.env.production
# Verificar credenciales
```

---

## 📞 Contacto & Soporte

- **Deploy Issues:** Ver `DEPLOY_CHECKLIST.md` → Troubleshooting
- **Post-Deploy Tests:** Ver `POST_DEPLOY_VALIDATION.md`
- **Credenciales:** Ver `CREDENCIALES_DEPLOY_REQUERIDAS.md`

---

## 🎉 Success Indicators

✅ Deploy exitoso cuando:
- [ ] API responde 200 OK a GET /api/health
- [ ] Login funciona: empresa@test.com / empresa123
- [ ] Pool de candidatos carga sin errores
- [ ] Búsquedas se pueden crear/editar
- [ ] DevTools Console sin errores rojos

---

**Listo para deployar. Proporciona credenciales para continuar.** 🚀

