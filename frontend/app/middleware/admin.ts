/**
 * Middleware de ruta que restringe el acceso únicamente a usuarios con rol "administrador".
 * Si el usuario no está autenticado, lo redirige al login (conservando la ruta destino).
 * Si está autenticado pero no es administrador, lo redirige a la página de inicio.
 * @param to Ruta a la que el usuario intenta navegar
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  // Si aún no se ha cargado el usuario actual y no está en proceso de carga, se obtiene
  if (!authStore.usuario && !authStore.cargando) {
    await authStore.obtenerUsuarioActual();
  }

  // Si no está autenticado, redirige al login con la ruta original como redirect
  if (!authStore.estaAutenticado) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  // Si está autenticado pero no tiene rol de administrador, se le niega el acceso
  if (authStore.usuario?.role !== 'administrador') {
    return navigateTo('/');
  }
});
