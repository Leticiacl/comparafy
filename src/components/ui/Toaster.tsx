import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, XIcon } from 'lucide-react';
type ToastProps = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};
const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 min-w-[250px] max-w-[90%] z-50 animate-fade-in-up transition-all duration-300 bg-white dark:bg-gray-800 border-l-4 border-solid border-l-yellow-500">
      {type === 'success' ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
      <p className="flex-grow text-sm">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <XIcon className="w-4 h-4" />
      </button>
    </div>;
};
type ToastData = {
  id: string;
  message: string;
  type: 'success' | 'error';
};
export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  useEffect(() => {
    const handleToast = (event: CustomEvent<{
      message: string;
      type: 'success' | 'error';
    }>) => {
      const {
        message,
        type
      } = event.detail;
      const id = Date.now().toString();
      setToasts(prev => [...prev, {
        id,
        message,
        type
      }]);
    };
    window.addEventListener('toast' as any, handleToast as EventListener);
    return () => window.removeEventListener('toast' as any, handleToast as EventListener);
  }, []);
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  return <>
      {toasts.map(toast => <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />)}
    </>;
};
export const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const event = new CustomEvent('toast', {
    detail: {
      message,
      type
    }
  });
  window.dispatchEvent(event);
};