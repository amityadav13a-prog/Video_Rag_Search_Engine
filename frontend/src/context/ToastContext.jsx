import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((message, title = 'Success') => {
    addToast({ title, message, type: 'success' });
  }, [addToast]);

  const error = useCallback((message, title = 'Error') => {
    addToast({ title, message, type: 'error' });
  }, [addToast]);

  const info = useCallback((message, title = 'Info') => {
    addToast({ title, message, type: 'info' });
  }, [addToast]);

  const warning = useCallback((message, title = 'Warning') => {
    addToast({ title, message, type: 'warning' });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const icons = {
              success: <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />,
              error: <AlertCircle className="text-rose-400 shrink-0" size={20} />,
              warning: <AlertTriangle className="text-amber-400 shrink-0" size={20} />,
              info: <Info className="text-indigo-400 shrink-0" size={20} />,
            };

            const borders = {
              success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-100',
              error: 'border-rose-500/30 bg-rose-950/40 text-rose-100',
              warning: 'border-amber-500/30 bg-amber-950/40 text-amber-100',
              info: 'border-indigo-500/30 bg-indigo-950/40 text-indigo-100',
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 relative overflow-hidden ${borders[toast.type] || borders.info}`}
              >
                <div className="mt-0.5">{icons[toast.type] || icons.info}</div>
                <div className="flex-1 pr-2">
                  {toast.title && <p className="text-sm font-semibold leading-tight mb-1">{toast.title}</p>}
                  <p className="text-xs text-white/80 leading-relaxed">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
