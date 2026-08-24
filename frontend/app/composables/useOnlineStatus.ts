/**
 * Composable que expone el estado de conexión a internet del navegador (online/offline).
 * Se suscribe a los eventos "online" y "offline" del objeto window al montar el componente.
 * @returns Un objeto reactivo con `isOnline`, true si el navegador reporta conexión activa
 */
export const useOnlineStatus = () => {
  // Estado reactivo de conexión, true por defecto hasta que se determine en el cliente
  const isOnline = ref(true);

  onMounted(() => {
    // Al montar, se toma el estado real reportado por el navegador
    isOnline.value = navigator.onLine;
    // Actualiza el estado cuando el navegador recupera la conexión
    window.addEventListener('online', () => (isOnline.value = true));
    // Actualiza el estado cuando el navegador pierde la conexión
    window.addEventListener('offline', () => (isOnline.value = false));
  });

  return { isOnline };
};
