import React, { useState, useEffect } from 'react';
import CONFIG, { showBackendStatus } from '../config/config';

const BackendStatusBanner = () => {
  const [showBanner, setShowBanner] = useState(CONFIG.USE_MOCK_SERVICES);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    showBackendStatus();
  }, []);

  if (!showBanner) return null;

  const handleDismiss = () => {
    setShowBanner(false);
  };

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`bg-amber-50 border-l-4 border-amber-400 transition-all duration-300 ${
      isMinimized ? 'p-2' : 'p-4'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-5 h-5 text-amber-400">
            🔧
          </div>
        </div>
        <div className="ml-3 flex-1">
          {!isMinimized && (
            <>
              <h3 className="text-sm font-medium text-amber-800">
                Modo de Desarrollo Activo
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p className="mb-2">
                  {CONFIG.MESSAGES.BACKEND_NOT_AVAILABLE}
                </p>
                <details className="cursor-pointer">
                  <summary className="font-medium hover:text-amber-900">
                    📋 Instrucciones para configurar el backend Laravel
                  </summary>
                  <div className="mt-2 ml-4 space-y-1 text-xs">
                    <p>1. <strong>Instalar PHP 8.1+:</strong> <code>choco install php</code></p>
                    <p>2. <strong>Instalar Composer:</strong> <code>choco install composer</code></p>
                    <p>3. <strong>Instalar dependencias:</strong> <code>composer install</code></p>
                    <p>4. <strong>Configurar .env:</strong> Copiar .env.example y configurar base de datos</p>
                    <p>5. <strong>Ejecutar migraciones:</strong> <code>php artisan migrate</code></p>
                    <p>6. <strong>Iniciar servidor:</strong> <code>php artisan serve --port=8000</code></p>
                    <p>7. <strong>Cambiar config:</strong> USE_MOCK_SERVICES = false en config.js</p>
                  </div>
                </details>
              </div>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={() => window.open('/INSTRUCCIONES_CONFIGURACION_BACKEND.md', '_blank')}
                  className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded hover:bg-amber-200 transition-colors"
                >
                  📖 Ver guía completa
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-amber-600 hover:text-amber-800"
                >
                  Ocultar este aviso
                </button>
              </div>
            </>
          )}
          {isMinimized && (
            <p className="text-xs text-amber-700">
              Modo desarrollo - Backend no configurado
            </p>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <button
            onClick={handleToggleMinimize}
            className="text-amber-400 hover:text-amber-600 transition-colors"
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? '⬇️' : '⬆️'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusBanner;
