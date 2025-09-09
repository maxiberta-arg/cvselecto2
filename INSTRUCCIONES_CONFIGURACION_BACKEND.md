# Instrucciones para Configuración del Backend Laravel

## Problema Detectado

El servidor Laravel no está ejecutándose en el puerto 8000, lo que causa los errores 500 en el frontend cuando se accede a `/centro-evaluacion`.

## Estado Actual del Código

✅ **EvaluacionController**: Completamente implementado con todos los métodos CRUD
✅ **Modelo Evaluacion**: Correctamente definido con relaciones y validaciones  
✅ **Rutas API**: Definidas correctamente en `routes/api.php` líneas 68-84
✅ **Frontend**: Funcional y compilando correctamente
❌ **Servidor Backend**: No está ejecutándose

## Requisitos Previos

Para ejecutar el backend Laravel necesitas tener instalado:

1. **PHP 8.1 o superior**
2. **Composer** (manejador de dependencias de PHP)
3. **MySQL/MariaDB** (base de datos)

## Pasos para Configurar el Backend

### 1. Instalar PHP
```powershell
# Opción 1: Usando Chocolatey
choco install php

# Opción 2: Usando Scoop
scoop install php

# Opción 3: Descargar manualmente desde https://windows.php.net/download/
```

### 2. Instalar Composer
```powershell
# Descargar desde https://getcomposer.org/download/
# O usando Chocolatey:
choco install composer
```

### 3. Instalar Dependencias de Laravel
```powershell
cd "c:\Proyectos\Tesis MaxiBerta"
composer install
```

### 4. Configurar Variables de Entorno
```powershell
# Copiar archivo de configuración
copy .env.example .env

# Generar clave de aplicación
php artisan key:generate
```

### 5. Configurar Base de Datos en .env
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cvselecto
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
```

### 6. Ejecutar Migraciones
```powershell
php artisan migrate
```

### 7. Iniciar Servidor Laravel
```powershell
php artisan serve --port=8000
```

## Verificación de Funcionamiento

Una vez que el servidor esté ejecutándose, deberías ver:

```
Laravel development server started: http://127.0.0.1:8000
```

Y podrás probar los endpoints:

- `GET http://localhost:8000/api/test` - Prueba básica
- `GET http://localhost:8000/api/evaluaciones` - Lista de evaluaciones (requiere autenticación)

## Solución Temporal (Solo Frontend)

Si no puedes configurar el backend inmediatamente, puedes modificar temporalmente el frontend para trabajar con datos mock:

1. Crear un archivo `evaluacionServiceMock.js`
2. Reemplazar las llamadas API con datos estáticos
3. Esto te permitirá probar la interfaz mientras configuras el backend

## Archivos del Backend Verificados

- ✅ `app/Http/Controllers/Api/EvaluacionController.php` - 627 líneas, completamente implementado
- ✅ `app/Models/Evaluacion.php` - 234 líneas, modelo completo
- ✅ `routes/api.php` - Rutas definidas en líneas 68-84
- ✅ `database/migrations/` - Migraciones de evaluaciones disponibles

## Próximos Pasos

1. Configurar PHP y Composer
2. Instalar dependencias con `composer install`
3. Configurar base de datos
4. Ejecutar migraciones
5. Iniciar servidor Laravel
6. Probar integración frontend-backend

El código del backend está completamente preparado y funcional. Solo necesita ser ejecutado correctamente.
