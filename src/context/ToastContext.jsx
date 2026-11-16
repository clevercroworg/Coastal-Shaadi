import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const toastStyles = {
  success: {
    title: 'All done',
    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    iconBg: 'bg-green-50',
    accent: 'bg-green-500',
    duration: 4000
  },
  error: {
    title: "We couldn't complete that",
    icon: <AlertCircle className="w-5 h-5 text-primary" />,
    iconBg: 'bg-red-50',
    accent: 'bg-primary',
    duration: 6500
  },
  warning: {
    title: 'Please note',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    iconBg: 'bg-amber-50',
    accent: 'bg-accent',
    duration: 5500
  },
  info: {
    title: 'For your information',
    icon: <Info className="w-5 h-5 text-blue-600" />,
    iconBg: 'bg-blue-50',
    accent: 'bg-blue-500',
    duration: 4500
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++nextId.current;
    const style = toastStyles[type] || toastStyles.info;
    // Avoid stacking the same message when an action is retried quickly
    setToasts(prev => [...prev.filter(t => t.message !== message), { id, message, type }]);
    setTimeout(() => removeToast(id), style.duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-20 sm:top-24 inset-x-4 sm:inset-x-auto sm:right-4 z-[9999] flex flex-col items-stretch sm:items-end gap-3 pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map(toast => {
            const style = toastStyles[toast.type] || toastStyles.info;
            return (
              <motion.div
                key={toast.id}
                role={toast.type === 'error' ? 'alert' : 'status'}
                initial={{ opacity: 0, y: -12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                className="pointer-events-auto relative overflow-hidden flex items-start gap-3 w-full sm:w-[360px] bg-white rounded-2xl shadow-xl border border-gray-100 pl-5 pr-3 py-4"
              >
                <span className={`absolute left-0 top-0 bottom-0 w-1 ${style.accent}`} />
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.iconBg}`}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{style.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5 leading-snug">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-1 -m-1"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
