// src/components/ui/Toaster.tsx
import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, XIcon, InfoIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  message: string;
  type: ToastType;
  onClose: () => void;
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const iconMap: Record<ToastType, JSX.Element> = {
    success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
    error: <XCircleIcon className="w-5 h-5 text-red-500" />,
    info: <InfoIcon className="w-5 h-5 text-blue-500" />
  };

  const borderColorMap: Record<ToastType, string> = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500'
  };

  return (
    <div
      className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[250px] max-w-[90%] z-50 animate-fade-in-up transition-all duration-300 bg-white dark:bg-gray-800 border-l-4 border-solid ${borderColorMap[type]}`}
    >
      {iconMap[type]}
      <p className="flex-grow text-sm">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

type ToastData = {
  id: string;
  message: string;
  type: ToastType;
};

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent<{ message: string; type: ToastType }>) => {
      const { message, type } = event.detail;
      const id = Date.now().toString();
      setToasts((prev: ToastData[]) => [...prev, { id, message, type }]);
    };

    window.addEventListener('toast', handleToast as EventListener);
    return () => window.removeEventListener('toast', handleToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev: ToastData[]) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
      ))}
    </>
  );
};

export const showToast = (message: string, type: ToastType = 'success') => {
  const event = new CustomEvent('toast', {
    detail: { message, type }
  });
  window.dispatchEvent(event);
};
