/**
 * Middleware de ruta que exige que el usuario esté autenticado para acceder a la página.
 * Si no lo está, lo redirige al login conservando la ruta original como parámetro `redirect`.
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
});
