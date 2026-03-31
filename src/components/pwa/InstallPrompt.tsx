'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if ((navigator as any).standalone) return;

    const dismissed = localStorage.getItem('cuaderno-install-dismissed');
    if (dismissed) return;

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(ios);

    if (ios) {
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setShowIOSGuide(false);
    localStorage.setItem('cuaderno-install-dismissed', '1');
  };

  if (!show) return null;

  return (
    <>
      {/* Modal de guía iOS */}
      {showIOSGuide && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 flex items-end justify-center p-4"
          onClick={() => setShowIOSGuide(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Instalar la app</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">1</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Toca el botón Compartir</p>
                  <p className="text-xs text-slate-500 mt-0.5">El ícono de la flecha hacia arriba en la barra inferior de Safari</p>
                  <div className="mt-2 flex items-center gap-2 text-blue-500">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                    </svg>
                    <span className="text-sm font-medium">Compartir</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">2</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Desplázate y toca <span className="font-bold">"Agregar a pantalla de inicio"</span></p>
                  <p className="text-xs text-slate-500 mt-0.5">Aparece en la lista de opciones del menú</p>
                  <div className="mt-2 flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
                    <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-sm text-slate-700">Agregar a pantalla de inicio</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center shrink-0">3</div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Toca <span className="font-bold">"Agregar"</span></p>
                  <p className="text-xs text-slate-500 mt-0.5">La app quedará en tu pantalla de inicio</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="mt-6 w-full text-center text-sm text-slate-400 hover:text-slate-600"
            >
              No mostrar de nuevo
            </button>
          </div>
        </div>
      )}

      {/* Barra de instalación */}
      <div className="fixed bottom-20 left-4 right-4 z-[100] max-w-md mx-auto">
        <div
          className={`bg-slate-900 text-white rounded-3xl p-4 shadow-2xl shadow-black/40 border border-white/10 flex items-center gap-3 ${isIOS ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}`}
          onClick={isIOS ? () => setShowIOSGuide(true) : undefined}
        >
          <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Instalar Cuaderno</p>
            {isIOS ? (
              <p className="text-xs text-blue-300 mt-0.5 font-medium">Toca aquí para ver cómo →</p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Acceso rápido sin abrir el browser</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
              className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {!isIOS && (
              <button
                onClick={handleInstall}
                className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                Instalar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
