#!/bin/bash
# ============================================
# CVSelecto Deploy - Manual Linux/Bash
# ============================================
# Ejecutar directamente en el servidor:
# bash /tmp/deploy-cvselecto.sh

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   CVSelecto Production Deploy - Bash      ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Configuración
PROJECT_PATH="/var/www/cvselecto"
BRANCH="master"
DOMAIN="${1:-localhost}"

echo "Configuración:"
echo "  Proyecto: $PROJECT_PATH"
echo "  Branch: $BRANCH"
echo "  Dominio: $DOMAIN"
echo ""

# ============================================
# PASO 1: GIT
# ============================================
echo "[1/8] ► Git: Actualizar código"
cd "$PROJECT_PATH"
git status
git pull origin "$BRANCH"
echo "✅ Git actualizado"
echo ""

# ============================================
# PASO 2: COMPOSER
# ============================================
echo "[2/8] ► Composer: Instalar dependencias"
composer install --no-dev --optimize-autoloader
echo "✅ Dependencias instaladas"
echo ""

# ============================================
# PASO 3: FRONTEND
# ============================================
echo "[3/8] ► Frontend: Verificar build"
if [ -d "frontend/build" ]; then
    echo "✅ Build artifacts presentes"
else
    echo "⚠️  No hay build - considera: cd frontend && npm ci && npm run build && cd .."
fi
echo ""

# ============================================
# PASO 4: ENVIRONMENT
# ============================================
echo "[4/8] ► Environment: Configurar .env.production"
if [ ! -f ".env.production" ]; then
    cp .env.production.example .env.production
    echo "✅ Creado .env.production"
else
    echo "✅ .env.production existe"
fi
chmod 600 .env.production
echo ""

# ============================================
# PASO 5: CLAVES
# ============================================
echo "[5/8] ► Claves: Generar APP_KEY"
php artisan key:generate --force
echo "✅ APP_KEY generada"
echo ""

# ============================================
# PASO 6: BASE DE DATOS
# ============================================
echo "[6/8] ► Migrations: Ejecutar migraciones"
php artisan migrate --force
echo "✅ Migraciones ejecutadas"
echo ""

# ============================================
# PASO 7: CACHE Y OPTIMIZACIÓN
# ============================================
echo "[7/8] ► Optimización: Cache y limpieza"
php artisan config:cache
php artisan route:cache
php artisan optimize
php artisan storage:link
chmod -R 755 storage bootstrap/cache
chmod 600 .env.production
echo "✅ Optimizaciones aplicadas"
echo ""

# ============================================
# PASO 8: SERVICIOS
# ============================================
echo "[8/8] ► Servicios: Reiniciar"
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
echo "✅ Servicios reiniciados"
echo ""

# ============================================
# POST-DEPLOY
# ============================================
echo "╔════════════════════════════════════════════╗"
echo "║   POST-DEPLOY VALIDATIONS                 ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Health check
echo "▸ Health Check API:"
curl -s -i "https://$DOMAIN/api/health" | head -1
echo ""

# Frontend
echo "▸ Frontend load:"
curl -s -o /dev/null -w "Status: %{http_code}\n" "https://$DOMAIN/"
echo ""

# Logs
echo "▸ Últimos errores en logs:"
tail -20 storage/logs/laravel.log | grep -i "error\|exception" || echo "(Sin errores críticos)"
echo ""

echo "✅ Deploy completado"
echo ""
echo "PRÓXIMOS PASOS:"
echo "  1. Accede a: https://$DOMAIN"
echo "  2. Login: empresa@test.com / empresa123"
echo "  3. Revisa DevTools Console (F12) para errores"
echo "  4. Prueba: Pool → Búsquedas → Evaluaciones"
echo ""
