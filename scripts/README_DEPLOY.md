# Deploy seguro (staging)

Este README explica cómo usar `deploy_staging_safe.ps1` que crea backups locales, actualiza el código, instala dependencias, ejecuta migraciones y construye el frontend.

Instrucciones rápidas (ejecutar en el servidor de staging, PowerShell como Administrador):

```powershell
# Ir a la raíz del proyecto (ejemplo)
Set-Location -Path "C:\Proyectos\Tesis MaxiBerta"

# Ejecutar deploy (branch por defecto: master)
.\scripts\deploy_staging_safe.ps1 -Branch master

# Si querés omitir el build del frontend (por ejemplo, si el frontend se compila en CI):
.\scripts\deploy_staging_safe.ps1 -Branch master -SkipFrontend
```

Notas importantes:
- El script crea backups en `scripts/backups/` (repo bundle, .env copia, storage/public zip si existen).
- El script NO hace backup de la base de datos. Realizá un backup DB con `mysqldump` o desde el panel de control antes de migraciones si es crítico.
- Si tu servidor es Linux, el script intentará pasos válidos pero la parte de reinicio de IIS no aplica: reiniciá `nginx` y `php-fpm` manualmente.
- Ejecutá esto en `staging` primero y probá los endpoints antes de ejecutar en `production`.

Recomendación de seguridad:
- Crear un usuario `deploy` con permisos limitados y usar una clave SSH temporal. Revocar la clave después del deploy.
- Mantener `.env.production` fuera del repo y gestionarlo con un gestor de secretos.
