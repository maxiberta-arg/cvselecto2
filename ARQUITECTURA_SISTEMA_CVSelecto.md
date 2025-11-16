# 🏗️ ARQUITECTURA DEL SISTEMA - CVSelecto
## Diagrama Técnico y Componentes Principales

**Generado:** 16 de noviembre de 2025  
**Versión:** 2A.3 (Sistema de Evaluaciones)

---

## 🎯 ARQUITECTURA DE ALTO NIVEL

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USUARIOS FINALES                               │
├─────────────────┬─────────────────┬──────────────────┬─────────────────┤
│   CANDIDATO     │     EMPRESA     │      ADMIN       │   INTEGRACIONES │
│   (Web/Mobile)  │     (Web)       │      (Web)       │   (APIs 3rd)    │
└────────┬────────┴────────┬────────┴────────┬─────────┴────────┬────────┘
         │                 │                 │                  │
         ▼                 ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19 SPA)                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Login │ Dashboard │ Pool │ Búsquedas │ Postulaciones │ Evaluaciones│ │
│  │                                                                  │  │
│  │  32 Vistas | 50+ Componentes | React Router v7 | Bootstrap 5   │  │
│  │  State: Context API | Auth: LocalStorage (token)               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              ▲                                          │
│  axios interceptors + Sanctum Bearer Tokens ◄──────────────────────    │
│                              │                                          │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
                    ┌──────────▼───────────┐
                    │  API Gateway         │
                    │  (Sanctum Auth)      │
                    │  CORS + Rate Limit   │
                    └──────────┬───────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────────┐
│                    BACKEND (Laravel 11 API)                             │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  Routes (63 endpoints)                                         │   │
│  │  ├─ /api/auth          (login, register, logout)             │   │
│  │  ├─ /api/candidatos    (CRUD, búsqueda, educación, exp)      │   │
│  │  ├─ /api/empresas      (CRUD, verificación, logo)            │   │
│  │  ├─ /api/busquedas-laborales (CRUD, filtros)                 │   │
│  │  ├─ /api/postulaciones (CRUD, estados, calificación)         │   │
│  │  ├─ /api/pool-candidatos (gestión, ranking, tags)            │   │
│  │  └─ /api/evaluaciones  (CRUD, tipos, criterios, puntuación)  │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                               │                                        │
│  ┌────────────────────────────▼─────────────────────────────────┐   │
│  │  Controllers (11)                                            │   │
│  │  ├─ AuthController                                          │   │
│  │  ├─ CandidatoController      + Educacion, Experiencia       │   │
│  │  ├─ EmpresaController        + Verificación, Logo           │   │
│  │  ├─ BusquedaLaboralController                               │   │
│  │  ├─ PostulacionController    + Estados automáticos          │   │
│  │  ├─ EmpresaPoolController    + Ranking, Tags               │   │
│  │  ├─ EvaluacionController     + 6 tipos, criterios          │   │
│  │  ├─ EntrevistaController                                    │   │
│  │  └─ AdminController          + Verificación empresas        │   │
│  └────────────────────────────────────────────────────────────┘   │
│                               │                                        │
│  ┌────────────────────────────▼─────────────────────────────────┐   │
│  │  Models (21 - Eloquent ORM)                                 │   │
│  │  ├─ User (admin, empresa, candidato) + Roles               │   │
│  │  ├─ Candidato + Educacion, Experiencia                      │   │
│  │  ├─ Empresa + Logo, Verificación                            │   │
│  │  ├─ BusquedaLaboral                                         │   │
│  │  ├─ Postulacion (Pivot) + Estados automáticos              │   │
│  │  ├─ EmpresaCandidato (PIVOT) + Pool, Tags, Puntuación      │   │
│  │  ├─ Evaluacion + Criterios (JSON), Puntuación              │   │
│  │  ├─ Entrevista                                              │   │
│  │  └─ Relaciones many-to-many (3)                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                               │                                        │
│  ┌────────────────────────────▼─────────────────────────────────┐   │
│  │  Validations (Dual: Frontend + Backend)                      │   │
│  │  ├─ FormRequest rules (~15 reglas por endpoint)             │   │
│  │  ├─ Model validation (fillable, guarded, casts)             │   │
│  │  └─ Custom validators (CUIT, email, dates)                  │   │
│  └────────────────────────────────────────────────────────────┘   │
│                               │                                        │
│  ┌────────────────────────────▼─────────────────────────────────┐   │
│  │  Business Logic                                              │   │
│  │  ├─ Postulacion::generarEvaluacionSiProcede()              │   │
│  │  ├─ Evaluacion::calcularPuntuacionTotal()                   │   │
│  │  ├─ EmpresaCandidato::obtenerRanking()                      │   │
│  │  ├─ Candidato::validarCUIT(), verificarEmail()             │   │
│  │  └─ Empresa::marcarComoVerificada()                         │   │
│  └────────────────────────────────────────────────────────────┘   │
│                               │                                        │
└───────────────────────────────┼────────────────────────────────────────┘
                                │
                ┌───────────────▼────────────────┐
                │   DATA ACCESS LAYER            │
                │   (Migrations + Seeders)       │
                └───────────────┬────────────────┘
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                    MYSQL DATABASE (v8+)                              │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  Tablas (21):                                             │    │
│  │  ┌──────────────────┬──────────────────────────────────┐  │    │
│  │  │ AUTENTICACIÓN    │ users, personal_access_tokens   │  │    │
│  │  │ CORE ENTITIES    │ candidatos, empresas,           │  │    │
│  │  │                  │ busquedas_laborales             │  │    │
│  │  │ RELACIONES       │ empresa_candidatos (PIVOT),     │  │    │
│  │  │                  │ postulaciones, educacions,      │  │    │
│  │  │                  │ experiencias                    │  │    │
│  │  │ EVALUACIONES     │ evaluaciones, entrevistas       │  │    │
│  │  │ INFRASTRUCTURE   │ cache, jobs, migrations         │  │    │
│  │  └──────────────────┴──────────────────────────────────┘  │    │
│  │                                                            │    │
│  │  Normalización: 3NF                                       │    │
│  │  Índices: En columnas clave (user_id, empresa_id, etc.)  │    │
│  │  Constraints: FK, NOT NULL, UNIQUE donde aplica          │    │
│  │  Seeders: 13 (TestingUserSeeder, TestingEvaluacionesSde) │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJOS PRINCIPALES

### **Flujo 1: CREAR Y EVALUAR POSTULACIÓN**

```
CANDIDATO crea Postulación
        │
        ▼
Postulacion.create() → trigger automático
        │
        ├─→ ¿Estado permite evaluación?
        │   └─ SÍ: continua
        │   └─ NO: fin
        │
        ▼
Crea/obtiene EmpresaCandidato
(tabla PIVOT empresa_candidatos)
        │
        ▼
¿Ya tiene evaluación?
├─ SÍ: actualizar estado
└─ NO: Crear Evaluacion con
       └─ empresa_candidato_id
       └─ tipo predefinido
       └─ criterios por defecto
       └─ estado: pendiente
        │
        ▼
EMPRESA ve en Centro Evaluación
        │
        ├─→ Editar criterios
        ├─→ Puntuar candidato
        └─→ Completar evaluación
        │
        ▼
Evaluacion.completar()
├─ Calcula puntuación total (automática)
├─ Marca como completada
├─ Almacena en BD
└─ Actualiza EmpresaCandidato
   └─ Puntuación empresarial = promedio evaluaciones
```

### **Flujo 2: GESTIONAR POOL DE CANDIDATOS**

```
EMPRESA accede a /pool-candidatos
        │
        ▼
EmpresaPoolController::index()
├─ Obtiene todos los EmpresaCandidato
│  └─ WHERE empresa_id = auth()->user()->empresa_id
│
├─ Paginado + Ordenamientos + Filtros
│
└─ Incluye:
   ├─ Datos candidato (nombre, email, CV)
   ├─ Estado interno (activo, en proceso, etc.)
   ├─ Tags empresariales (etiquetas personalizadas)
   ├─ Puntuación 1-10 (rating independiente)
   ├─ Historial de cambios estado
   ├─ Evaluaciones asociadas
   └─ Notas privadas (solo empresa ve)

EMPRESA interactúa:
├─→ Agregar candidato existente
├─→ Cambiar estado interno
├─→ Etiquetar candidato
├─→ Calificar (puntuación 1-10)
├─→ Escribir notas
└─→ Ver ranking de candidatos
```

### **Flujo 3: BÚSQUEDA Y POSTULACIÓN**

```
CANDIDATO busca ofertas
        │
        ▼
GET /api/busquedas-laborales (público/filtrado)
├─ Solo ofertas estado: activa, abierta
├─ Filtros: sector, modalidad, experiencia, salario
└─ Paginado, ordenado
        │
        ▼
VER detalle búsqueda (requisitos, beneficios, etc.)
        │
        ▼
POSTULARSE (click botón)
        │
        ▼
POST /api/postulaciones
├─ Valida: Candidato + Búsqueda activa
├─ Evita duplicados (existe postulación anterior?)
├─ Crea Postulacion con:
│  ├─ candidato_id
│  ├─ busqueda_id
│  └─ estado: 'postulado' (inicial)
│
└─→ Trigger automático:
    ├─ Crea EmpresaCandidato (si no existe)
    └─ Crea Evaluacion automática
       (según reglas de negocio)
        │
        ▼
EMPRESA ve postulaciones entrantes
├─→ Filtrar, ordenar
├─→ Ver candidato detalle
├─→ Cambiar estado:
│   ├─ postulado → en_revision
│   ├─ en_revision → entrevista
│   ├─ entrevista → seleccionado
│   └─ * → rechazado
│
└─→ Cada cambio de estado:
    └─ Sincroniza a EmpresaCandidato
    └─ Genera evaluación si corresponde
```

---

## 📊 RELACIONES DE BASE DE DATOS

```
╔═══════════════════════════════════════════════════════════════════╗
║                   ENTIDADES Y RELACIONES                         ║
╠═══════════════════════════════════════════════════════════════════╣

User (1)
├─ has_many: Candidato (si rol = candidato)
├─ has_many: Empresa (si rol = empresa)
├─ has_many: PersonalAccessToken (Sanctum)
└─ has_one: Rol (admin, empresa, candidato)

Candidato (N)
├─ belongs_to: User
├─ has_many: Educacion
├─ has_many: Experiencia
├─ has_many: Postulacion
├─ belongs_to_many: Empresa
│  └─ through: EmpresaCandidato (PIVOT con metadatos)
└─ has_many: Evaluacion (a través de EmpresaCandidato)

Empresa (N)
├─ belongs_to: User
├─ has_many: BusquedaLaboral
├─ has_many: Postulacion (indirecta vía BusquedaLaboral)
├─ belongs_to_many: Candidato
│  └─ through: EmpresaCandidato
├─ has_many: EmpresaCandidato
└─ has_many: Evaluacion (indirecta)

BusquedaLaboral (N)
├─ belongs_to: Empresa
├─ has_many: Postulacion
└─ has_many: Candidato (a través de Postulacion)

Postulacion (N) ← TABLA TRANSACCIONAL
├─ belongs_to: Candidato
├─ belongs_to: BusquedaLaboral
├─ has_many: Evaluacion
└─ Metadatos: estado, fecha, calificación

EmpresaCandidato (N) ← PIVOT CON METADATOS
├─ belongs_to: Empresa
├─ belongs_to: Candidato
├─ has_many: Evaluacion
└─ Metadatos: tags, puntuacion, estado_interno, notas, historial

Evaluacion (N)
├─ belongs_to: EmpresaCandidato
├─ belongs_to: Postulacion (opcional)
└─ JSON: criterios[], puntuaciones[], fecha_completada

Educacion (N)
├─ belongs_to: Candidato
└─ Metadatos: nivel, institución, fecha, certificado

Experiencia (N)
├─ belongs_to: Candidato
└─ Metadatos: puesto, empresa, período, descripción

╚═══════════════════════════════════════════════════════════════════╝
```

---

## 🔐 AUTENTICACIÓN Y AUTORIZACIÓN

```
┌─────────────────────────────────────────────────────────┐
│             FLUJO AUTENTICACIÓN (Sanctum)              │
├─────────────────────────────────────────────────────────┤

1. LOGIN (POST /api/login)
   ├─ Email + Password
   ├─ Valida credenciales
   ├─ Crea PersonalAccessToken (Bearer)
   └─ Retorna: { token, user, rol }
           │
           ▼
   Token se guarda en localStorage (frontend)

2. CADA REQUEST (Frontend)
   ├─ Header: Authorization: Bearer {token}
   ├─ Middleware: auth:sanctum
   └─ Valida token
       ├─ Válido → Continua
       └─ Inválido/Expirado → 401 Unauthorized

3. RUTAS PROTEGIDAS (Backend)
   ├─ Route::middleware('auth:sanctum')->group(...)
   ├─ Route::middleware('role:empresa')->group(...)
   ├─ Route::middleware('role:candidato')->group(...)
   └─ Route::middleware('role:admin')->group(...)

4. FRONTEND (React)
   ├─ ProtectedRoute component
   │  ├─ SI token existe → renderiza componente
   │  └─ NO token → redirige a /login
   └─ AuthContext
      ├─ login(email, password)
      ├─ logout()
      ├─ isAuthenticated()
      └─ getCurrentUser()

SEGURIDAD:
├─ HTTPS en producción (obligatorio)
├─ Token expira: 24 horas (configurable)
├─ CORS: Frontend origin autorizado
├─ CSRF: Laravel protección nativa
└─ Rate limiting: 60 requests/min por IP
```

---

## 📦 DEPLOYMENT STACK

```
PRODUCCIÓN (Recomendado):
├─ Server: AWS EC2 / Heroku / DigitalOcean
├─ OS: Linux (Ubuntu 22.04+)
├─ Web Server: Nginx (reverse proxy)
├─ PHP: 8.2+ (FPM)
├─ Database: MySQL 8+ (managed RDS)
├─ Cache: Redis (opcional, mejora performance)
├─ Queue: Redis Queue o Beanstalkd
├─ Storage: AWS S3 (para archivos)
├─ CDN: CloudFront / Cloudflare
├─ CI/CD: GitHub Actions / GitLab CI
└─ Monitoring: NewRelic / Datadog

FRONTEND DEPLOY:
├─ Build: npm run build
├─ Static hosting: Vercel / Netlify / S3+CloudFront
├─ Environment: .env con API_URL producción
└─ SSL: Let's Encrypt (gratis)

VERSIONING:
├─ Git: master (producción) + develop (staging)
├─ Semantic: v2.0.0 (major.minor.patch)
└─ Changelog: Documentar cada release
```

---

## 🎯 MÉTRICAS DE RENDIMIENTO

```
BACKEND (Laravel):
├─ Avg Response Time: <200ms (target)
├─ Database Queries: <3 por request (N+1 optimization)
├─ Memory Usage: <100MB por worker
├─ CPU: <30% en peak load
└─ Uptime: >99.5% SLA

FRONTEND (React):
├─ Page Load: <2s (Lighthouse)
├─ Time to Interactive: <3s
├─ Lighthouse Score: >90
├─ Bundle Size: <200KB gzipped
└─ FCP (First Contentful Paint): <1.5s

DATABASE (MySQL):
├─ Connection Pool: 20-50 conexiones
├─ Slow Query Log: <100ms threshold
├─ Backups: Diarios (snapshots)
├─ Replication: Master-Slave para HA
└─ IOPS: Dimensionar según carga
```

---

## 📚 CAPAS DE SEGURIDAD

```
┌─────────────────────────────────────────────────────┐
│              SEGURIDAD MULTICAPA                    │
├─────────────────────────────────────────────────────┤

CAPA 1: TRANSPORTE
├─ HTTPS/TLS 1.3
├─ Certificados válidos (Let's Encrypt)
└─ HSTS header (force HTTPS)

CAPA 2: AUTENTICACIÓN
├─ Sanctum tokens (Bearer)
├─ Password hashing: bcrypt
├─ Token rotation (opcional)
└─ 2FA (futuro)

CAPA 3: AUTORIZACIÓN
├─ Roles-based: admin, empresa, candidato
├─ Middlewares: role:*, permission:*
├─ Model policies: Can candadidato ver otro candidato?
└─ Resource checks: Propiedad de recurso

CAPA 4: ENTRADA/DATOS
├─ Validación FormRequest (servidor)
├─ Sanitización: HTML encode, SQL escape
├─ File uploads: Validar mime type, size
├─ SQL Injection: Prepared statements (Eloquent)
└─ XSS Prevention: React auto-escaping

CAPA 5: SALIDA/RESPUESTA
├─ Rate limiting: 60 req/min
├─ Response headers: X-Content-Type-Options, etc.
├─ CORS: Solo domains autorizados
├─ Logging: Request/response audit trail
└─ Error handling: No exponer stack traces

CAPA 6: INFRAESTRUCTURA
├─ Firewall: Bloquear ports inecesarios
├─ WAF: Web Application Firewall
├─ DDoS Protection: Cloudflare/AWS Shield
├─ IDS: Intrusion Detection System
└─ Monitoring: Alertas de comportamiento sospechoso
```

---

**Arquitectura Diseñada por:** GitHub Copilot  
**Fecha:** 16 de noviembre de 2025  
**Estado:** Production Ready ✅

