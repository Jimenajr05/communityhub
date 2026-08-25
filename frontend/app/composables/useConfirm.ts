/**
 * Composable global para mostrar diálogos de confirmación modernos y estilizados
 * en lugar de los popups nativos del navegador (confirm()).
 */
interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const isOpen = ref(false);
const options = ref<ConfirmOptions>({
  title: '¿Confirmar acción?',
  message: '',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  type: 'warning',
});

let resolvePromise: ((value: boolean) => void) | null = null;

export function useConfirm() {
  function confirmar(opts: ConfirmOptions | string): Promise<boolean> {
    if (typeof opts === 'string') {
      options.value = {
        title: '¿Confirmar acción?',
        message: opts,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        type: 'warning',
      };
    } else {
      options.value = {
        title: opts.title || '¿Confirmar acción?',
        message: opts.message,
        confirmText: opts.confirmText || 'Confirmar',
        cancelText: opts.cancelText || 'Cancelar',
        type: opts.type || 'warning',
      };
    }
    isOpen.value = true;
    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve;
    });
  }

  function onConfirm() {
    isOpen.value = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
  }

  function onCancel() {
    isOpen.value = false;
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
  }

  return {
    isOpen,
    options,
    confirmar,
    onConfirm,
    onCancel,
  };
}
