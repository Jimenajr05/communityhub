/**
 * Protege rutas que requieren sesión iniciada. Se usa con
 * `definePageMeta({ middleware: 'auth' })` en cualquier página que solo
 * deba ser accesible para usuarios autenticados.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.usuario && !authStore.cargando) {
    await authStore.obtenerUsuarioActual();
  }

  if (!authStore.estaAutenticado) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
});
