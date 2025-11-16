# CREDENCIALES DE TESTING ACTUALIZADAS

## 🔑 Credenciales de Acceso Correctas

Basado en el seeder `TestingUserSeeder.php`, las credenciales correctas son:

### Administrador
- **Email:** admin@test.com
- **Password:** admin123
- **Rol:** admin

### Empresa de Prueba
- **Email:** empresa@test.com
- **Password:** empresa123
- **Rol:** empresa
- **Empresa:** TechCorp Solutions S.A.

### Candidato de Prueba
- **Email:** candidato@test.com
- **Password:** candidato123
- **Rol:** candidato
- **Nombre:** Juan Carlos Pérez

### Empresa Pendiente (Adicional)
- **Email:** startup@test.com
- **Password:** startup123
- **Rol:** empresa
- **Empresa:** StartupInnovate S.R.L. (pendiente de verificación)

## 📝 Notas Importantes

1. **Campo de Usuario:** El sistema usa el campo `rol` (no `tipo_usuario`)
2. **Contraseñas:** Todas las contraseñas de testing terminan en "123"
3. **Verificación:** Los usuarios ya tienen email verificado
4. **Base de Datos:** SQLite en `database/database.sqlite`

## 🔧 Solución de Problemas

Si las credenciales no funcionan, ejecuta:

```bash
# Resetear y crear datos de testing
php artisan migrate:fresh
php artisan db:seed --class=TestingUserSeeder

# O ejecutar todos los seeders
php artisan migrate:fresh --seed
```

## ✅ URLs de Acceso

- **Login:** http://localhost:3000/login
- **Registro:** http://localhost:3000/register
- **Dashboard Empresa:** http://localhost:3000/empresa
- **Dashboard Candidato:** http://localhost:3000/candidato
- **Dashboard Admin:** http://localhost:3000/admin

---
*Actualizado: 6 de septiembre de 2025*
