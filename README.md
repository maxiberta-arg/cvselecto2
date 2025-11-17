# 🚀 CVSelecto 2.0 - Production Ready

**Estado:** ✅ LISTO PARA PRODUCCIÓN  
**Versión:** 2.0 (17/11/2025)  
**Stack:** Laravel 11 + React + MySQL

---

## 📦 Tecnologías

- **Backend:** Laravel 11, PHP 8.2, Sanctum Auth
- **Frontend:** React (CRA), webpack
- **Database:** MySQL/MariaDB (25 migraciones)
- **Testing:** PHPUnit (2/2 tests passing)
- **APIs:** RESTful (63 endpoints)

---

## 🚀 Deploy Rápido

### Opción 1: Automático (PowerShell)

```powershell
.\scripts\deploy_production.ps1 `
  -ServerHost "usuario@servidor.com" `
  -ProjectPath "/var/www/cvselecto"
```

### Opción 2: Manual (Bash)

```bash
bash scripts/deploy-production.sh "https://tu-dominio.com"
```

### Opción 3: Documentación Paso-a-Paso

Ver: **DEPLOY_CHECKLIST.md**

---

## 📋 Documentación

| Documento | Propósito |
|-----------|----------|
| **DEPLOY_RAPIDO.md** | Quick start (3 min read) |
| **DEPLOY_CHECKLIST.md** | Guía completa 8 pasos |
| **POST_DEPLOY_VALIDATION.md** | Tests post-deploy |
| **CREDENCIALES_DEPLOY_REQUERIDAS.md** | Form credenciales |
| **RESUMEN_EJECUTIVO_DEPLOY_FINAL.md** | Status general |

---

## ✅ Pre-Deploy Checklist

- [x] Backend: 25 migrations, 63 APIs, tests passing
- [x] Frontend: Build compilado, ESLint fixed
- [x] Documentation: Guías deploy completadas
- [x] Scripts: Automáticos + manual
- [ ] Credenciales servidor: **⏳ REQUERIDAS**

---

## 📞 Requerimientos Servidor

```
SSH:     usuario@servidor.com:22
DB Host: db.ejemplo.com
DB User: cvselecto_user
DB Pass: ***
Path:    /var/www/cvselecto
Domain:  https://cvselecto.ejemplo.com
```

👉 **Proporciona en:** CREDENCIALES_DEPLOY_REQUERIDAS.md

---

## 🔧 Desarrollo Local

```bash
# Backend
composer install
php artisan migrate
php artisan serve

# Frontend
cd frontend
npm ci
npm start
```

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
