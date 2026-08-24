/**
 * Composable que centraliza las llamadas HTTP a la API del backend.
 * Agrega automáticamente la URL base y el token de autenticación (si existe)
 * a cada petición realizada con `apiFetch`.
 */
export const useApi = () => {
  // Configuración pública/privada de runtime de Nuxt (incluye la URL base de la API)
  const config = useRuntimeConfig();

  /**
   * Realiza una petición HTTP a la API usando $fetch, añadiendo la baseURL,
   * las credenciales y el header de Authorization con el token del usuario si está autenticado.
   * @param path Ruta relativa del endpoint a consultar
   * @param options Opciones estándar de $fetch (método, body, headers, etc.)
   * @returns Promesa con la respuesta tipada de la API
   */
  const apiFetch = <T>(path: string, options: Parameters<typeof $fetch>[1] = {}) => {
    const authStore = useAuthStore();

    // Headers combinados: los que vienen en options más los que agreguemos aquí
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };

    // Si hay un token de sesión, se agrega el header de autorización Bearer
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`;
    }

    return $fetch<T>(path, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      ...options,
      headers,
    });
  };

  return { apiFetch };
}
