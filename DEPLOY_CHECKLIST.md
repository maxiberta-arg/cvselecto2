# 🚀 DEPLOY CHECKLIST - CVSelecto a Producción

**Generado:** 16 de noviembre de 2025  
**Objetivo:** Validación pre-deploy y pasos finales  
**Deadline:** 17/11/2025 (Mañana)

---

## 📋 CHECKLIST PRE-DEPLOY (Local/Staging)

### **Bloque 1: Backend Validations**

- [ ] `php artisan config:cache` ejecutado exitosamente
- [ ] `php artisan migrate:status` muestra todas migraciones ✅
- [ ] `php artisan route:list --path=api` lista 63+ rutas
- [ ] `php vendor/bin/phpunit` pasa todas las pruebas (si existen)
- [ ] `composer install --no-dev --optimize-autoloader` validado

### **Bloque 2: Frontend Validations**

- [ ] `npm run build` genera artefactos sin errores críticos
- [ ] Build folder en `frontend/build/` contiene `main.*.js` y `main.*.css`
- [ ] `npm start` arranca en http://localhost:3000 sin crashes
- [ ] Página login carga (sin errores en DevTools console)

### **Bloque 3: Integration Validations**

- [ ] Login con empresa@test.com / empresa123 funciona ✅
- [ ] Navegar `/dashboard-empresa` → carga sin errores
- [ ] Navegar `/pool-candidatos` → carga sin errores
- [ ] Navegar `/configuracion-empresa` → carga sin errores
- [ ] Crear búsqueda (test completo) → exitoso
- [ ] Pool de candidatos → se carga y muestra datos

### **Bloque 4: Database Validations**

- [ ] Backup de BD producción creado
- [ ] Migraciones sin tabla de verdad duplicadas
- [ ] Seeders ejecutados (usuarios test creados)
- [ ] Conexión BD verificada: `mysql -u user -p -h host db_name`

### **Bloque 5: Environment Validations**

- [ ] `.env.production.example` está actualizado
- [ ] `.env.production` en servidor tiene valores correctos
- [ ] APP_KEY generada: `php artisan key:generate --force`
- [ ] JWT_SECRET generada: `php artisan jwt:secret` (si aplica)
- [ ] Permisos: `chmod 600 .env.production`

---

## 🔧 PASOS DE DEPLOY (VPS/Servidor Linux)

### **Paso 1: Preparación del Servidor**

```bash
# Conectar SSH
ssh usuario@servidor-produccion.com

# Navegar al directorio del proyecto
cd /var/www/cvselecto

# Verificar que git está limpio
git status
```

### **Paso 2: Descargar Cambios**

```bash
# Actualizar desde master
git pull origin master

# Verificar último commit
git log --oneline -3
```

### **Paso 3: Instalar Dependencias**

```bash
# Backend
composer install --no-dev --optimize-autoloader

# Frontend (si la build no está en repo)
cd frontend && npm ci && npm run build && cd ..
```

### **Paso 4: Configurar Ambiente**

```bash
# Copiar .env.production.example a .env.production
cp .env.production.example .env.production

# Editar valores (usuario, host, DB, etc.)
nano .env.production

# Generar APP_KEY
php artisan key:generate --force

# Generar JWT_SECRET (si aplica)
php artisan jwt:secret
```

### **Paso 5: Base de Datos**

```bash
# Ejecutar migraciones
php artisan migrate --force

# Opcional: Seed test data (si necesario)
php artisan db:seed --class=TestingDataSeeder
```

### **Paso 6: Optimización**

```bash
# Cache configuración
php artisan config:cache

# Cache rutas
php artisan route:cache

# Optimizar autoloader
php artisan optimize

# Limpiar caché viejo (por seguridad)
php artisan cache:clear
php artisan view:clear
php artisan storage:link
```

### **Paso 7: Permisos**

```bash
# Asegurar permisos
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod 600 .env.production
```

### **Paso 8: Reiniciar Servicios**

```bash
# Nginx
sudo systemctl restart nginx
# o Apache
sudo systemctl restart apache2

# PHP-FPM (si aplica)
sudo systemctl restart php8.2-fpm
```

---

## ✅ POST-DEPLOY VALIDATIONS

### **Validación 1: Health Check**

```bash
# Desde otro terminal / máquina
curl -i https://tu-dominio.com/api/health
# Esperado: Status 200 OK

# O acceder a:
https://tu-dominio.com/
# Debe cargar página login
```

### **Validación 2: Login Test**

- [ ] Acceder a https://tu-dominio.com
- [ ] Usar credenciales: empresa@test.com / empresa123
- [ ] Verificar que Dashboard carga
- [ ] Revisar DevTools Console: 0 errores críticos

### **Validación 3: Funcionalidades Core**

- [ ] **Pool de Candidatos:** `/pool-candidatos` funciona ✅
- [ ] **Búsquedas:** Crear búsqueda laboral → exitoso
- [ ] **Postulaciones:** Ver postulaciones → carga datos
- [ ] **Centro Evaluación:** Acceder sin crashes
- [ ] **Configuración:** Editar datos empresa → guarda

### **Validación 4: API Directa**

```bash
# Test endpoint sin autenticación (esperado: 401)
curl -X GET https://tu-dominio.com/api/user
# Respuesta: 401 Unauthorized ← CORRECTO

# Test con token (si tienes bearer token)
curl -X GET https://tu-dominio.com/api/user \
  -H "Authorization: Bearer TOKEN_AQUI"
# Respuesta: 200 + datos de usuario ← CORRECTO
```

### **Validación 5: Logs y Monitoring**

```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Buscar errores
grep -i "error\|exception" storage/logs/laravel.log | tail -20

# Verificar BD
mysql -u usuario -p -h host cvselecto_produccion -e "SELECT COUNT(*) FROM users;"
```

---

## ⚠️ SI ALGO FALLA

### **Error: 500 Internal Server Error**

```bash
# 1. Revisar logs
tail -f storage/logs/laravel.log

# 2. Verificar permisos
ls -la storage/ bootstrap/

# 3. Verificar .env
grep "APP_KEY\|DB_HOST\|DB_PASSWORD" .env.production

# 4. Clear cache
php artisan cache:clear
php artisan view:clear
```

### **Error: Database Connection Refused**

```bash
# 1. Verificar conectividad
mysql -u usuario -p -h SERVIDOR_DB

# 2. Verificar credenciales en .env.production
grep DB_ .env.production

# 3. Verificar firewall
sudo ufw status
# Debe permitir puerto 3306 si BD es remota
```

### **Error: Frontend no carga**

```bash
# 1. Verificar Nginx config
sudo nginx -t

# 2. Verificar permisos de archivos
ls -la public/index.html

# 3. Verificar API_URL en frontend
grep API_URL .env.production

# 4. Rebuild frontend
cd frontend && npm run build && cd ..
```

### **Error: 401 Unauthorized en APIs**

```bash
# 1. Verificar JWT_SECRET
grep JWT_SECRET .env.production

# 2. Regenerar si necesario
php artisan jwt:secret

# 3. Verificar headers en requests
# Debe incluir: Authorization: Bearer TOKEN
```

---

## 📊 ROLLBACK PLAN (Si Deploy Falla)

```bash
# 1. Revertir a commit anterior
git reset --hard COMMIT_ANTERIOR

# 2. Reinstalar dependencias (versión anterior)
composer install --no-dev --optimize-autoloader

# 3. Recuperar BD (restore backup)
mysql -u usuario -p -h host cvselecto_produccion < backup-pre-deploy.sql

# 4. Clear caches
php artisan cache:clear && php artisan view:clear

# 5. Reiniciar servicios
sudo systemctl restart nginx php8.2-fpm
```

---

## 📝 POST-DEPLOY DOCUMENTATION

Después de deploy exitoso:

- [ ] Crear resumen en `DEPLOY_LOG_2025_11_17.md`
- [ ] Registrar timestamp, duración, cambios ejecutados
- [ ] Listar issues encontrados y cómo se resolvieron
- [ ] Backup de .env.production en lugar seguro
- [ ] Notificar al team: "✅ Deploy a Producción Completado"

---

## 🎯 SUCCESS CRITERIA

```
DEPLOY EXITOSO SI TODO CUMPLE:

✅ Backend Health: http://servidor/api/health → 200 OK
✅ Frontend Load: http://servidor/ → página login carga
✅ Login funciona: empresa@test.com / empresa123 → dashboard visible
✅ Pool accesible: /pool-candidatos → datos cargan
✅ API Integrada: fetch a /api/user → 401 (esperado sin token)
✅ Logs: Sin errores críticos en laravel.log
✅ DB: Conexión establece, queries ejecutan OK
✅ Performance: Tiempos respuesta < 2s en endpoints principales
```

---

**Fecha Prep:** 16/11/2025  
**Fecha Deploy Target:** 17/11/2025 17:00  
**Responsable:** Senior Professional  
**Backup Plan:** Rollback a commit anterior si es necesario
