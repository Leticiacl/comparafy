// src/components/ui/Toaster.tsx
import { toast, Toaster as Sonner } from 'sonner';

// Componente para exibir os toasts
export const Toaster = () => {
  return <Sonner richColors position="top-center" />;
};

// Funções de toast que podem ser usadas globalmente
export const showToast = {
  success: (msg: string) => toast.success(msg),
  error: (msg: string) => toast.error(msg),
  warning: (msg: string) => toast.warning(msg),
  info: (msg: string) => toast.info(msg),
};
