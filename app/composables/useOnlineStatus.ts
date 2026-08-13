/**
 * Expone un estado reactivo que indica si el usuario está conectado a
 * internet. Se usa para mostrar claramente en la UI cuando la app está
 * funcionando en modo offline (requisito de la PWA).
 */
export const useOnlineStatus = () => {
  const isOnline = ref(true);

  onMounted(() => {
    isOnline.value = navigator.onLine;
    window.addEventListener('online', () => (isOnline.value = true));
    window.addEventListener('offline', () => (isOnline.value = false));
  });

  return { isOnline };
};
