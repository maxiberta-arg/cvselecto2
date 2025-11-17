# 🧪 CVSelecto - Post-Deploy Validation Tests

**Fecha:** 17/11/2025  
**Objetivo:** Validar que deploy a producción fue exitoso

---

## 1️⃣ Health Check Remoto

```bash
# Ejecutar desde tu máquina (no el servidor)
curl -i https://tu-dominio.com/api/health

# Esperado:
# HTTP/1.1 200 OK
# Content-Type: application/json
# {"status":"ok"}
```

---

## 2️⃣ Login Test

1. **Abre:** https://tu-dominio.com
2. **Usuario:** empresa@test.com
3. **Contraseña:** empresa123
4. **Verificar:**
   - ✅ Página login carga sin errores
   - ✅ DevTools Console (F12) → 0 errores críticos (warnings OK)
   - ✅ Botón login funciona
   - ✅ Dashboard carga post-login

---

## 3️⃣ Core Functionalities

### Pool de Candidatos
```
1. Login ✅
2. Navega: /pool-candidatos
3. Verificar:
   ✅ Página carga sin errores
   ✅ Lista de candidatos visible
   ✅ Filtros funcionan (por estado, tag, etc.)
   ✅ Paginación funciona
```

### Búsquedas Laborales
```
1. Dashboard → Nueva Búsqueda
2. Rellenar formulario:
   - Título: "Ingeniero Testing"
   - Descripción: "Test descripción"
   - Ubicación: "CABA"
3. Guardar y verificar:
   ✅ Búsqueda aparece en listado
   ✅ Editar funciona
   ✅ Cambiar estado funciona
```

### Postulaciones
```
1. Pool → Candidato cualquiera
2. Hacer postulación a búsqueda
3. Verificar:
   ✅ Postulación se registra
   ✅ Estado cambia
   ✅ Aparece en "Postulaciones" del candidato
```

### Centro de Evaluación
```
1. Navega: /centro-evaluacion (o menu equivalente)
2. Verificar:
   ✅ Página carga sin errores
   ✅ Puedes ver evaluaciones pendientes
   ✅ Puedes marcar como completadas
```

### Configuración Empresa
```
1. Navega: /configuracion-empresa
2. Editar un campo (ej: descripción)
3. Guardar
4. Verificar:
   ✅ Cambios se guardan
   ✅ Refresh de página → datos persisten
```

---

## 4️⃣ API Tests (curl)

```bash
# Test 1: Sin autenticación (debe retornar 401)
curl -X GET https://tu-dominio.com/api/user
# Esperado: 401 Unauthorized

# Test 2: Listar búsquedas (requiere token)
# Primero obtener token (después de login en UI):
TOKEN="tu-bearer-token-aqui"

curl -X GET https://tu-dominio.com/api/busquedas-laborales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
# Esperado: 200 + listado JSON

# Test 3: Crear búsqueda
curl -X POST https://tu-dominio.com/api/busquedas-laborales \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Desarrollador",
    "descripcion": "Descripción test",
    "ubicacion": "CABA"
  }'
# Esperado: 201 Created + objeto creado
```

---

## 5️⃣ Logs y Debugging

### Revisar logs en tiempo real
```bash
# SSH al servidor
ssh usuario@servidor.com

# Ver logs
tail -f /var/www/cvselecto/storage/logs/laravel.log

# Buscar errores
grep "ERROR\|EXCEPTION" storage/logs/laravel.log | tail -20
```

### Revisar browser console
1. F12 → Console
2. Buscar:
   - ❌ Errores rojos → CRÍTICO (no debería haber)
   - ⚠️ Warnings amarillos → OK (React hooks, etc.)

---

## 6️⃣ Performance Checks

```bash
# Tiempo de respuesta API
time curl -s https://tu-dominio.com/api/busquedas-laborales | jq . > /dev/null

# Tamaño de respuesta
curl -s https://tu-dominio.com/api/busquedas-laborales | wc -c

# Headers
curl -i https://tu-dominio.com/api/busquedas-laborales | head -15
```

---

## 7️⃣ Rollback (Si hay problemas)

```bash
# SSH al servidor
ssh usuario@servidor.com
cd /var/www/cvselecto

# Ver commits recientes
git log --oneline -5

# Rollback a commit anterior
git revert HEAD --no-edit
git push origin master

# O revert específico
git revert <commit-hash> --no-edit

# Reiniciar servicios
sudo systemctl restart php8.2-fpm nginx

# Verificar logs
tail -50 storage/logs/laravel.log
```

---

## 8️⃣ Checklist Final

- [ ] Health check 200 OK
- [ ] Login exitoso
- [ ] Pool de candidatos carga y funciona
- [ ] Búsquedas: crear, editar, cambiar estado
- [ ] Postulaciones: crear y ver estado
- [ ] Centro de evaluación accesible
- [ ] Configuración empresa: editar y persistir
- [ ] DevTools Console sin errores críticos
- [ ] API endpoints responden correctamente
- [ ] Logs sin excepciones o errores críticos
- [ ] Permisos de archivos correctos (755 storage, 600 .env)
- [ ] DB migraciones completadas

---

## ❌ Troubleshooting Común

| Problema | Solución |
|----------|----------|
| 500 Internal Server Error | `tail -100 storage/logs/laravel.log` \| revisar errores |
| 404 Not Found en rutas API | Ejecutar `php artisan route:cache` en servidor |
| Base de datos error | Verificar `.env.production`: DB_HOST, DB_USER, DB_PASSWORD |
| Permisos denegados en storage | `sudo chmod -R 755 storage bootstrap/cache` |
| Assets (CSS/JS) no cargan | Verificar `frontend/build/` existe; si no: `npm run build` |
| Errores de autenticación | Verificar `APP_KEY` generada: `php artisan key:generate` |

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa logs: `storage/logs/laravel.log`
2. Revisa browser console: F12 → Console
3. Ejecuta `php artisan tinker` para debugging interactivo
4. Verifica `.env.production` tenga valores correctos

