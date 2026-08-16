/**
 * Protege las rutas /admin/*: exige sesión iniciada y rol admin.
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.usuario && !authStore.cargando) {
    await authStore.obtenerUsuarioActual();
  }

  if (!authStore.estaAutenticado) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }

  if (authStore.usuario?.role !== 'administrador') {
    return navigateTo('/');
  }
});
