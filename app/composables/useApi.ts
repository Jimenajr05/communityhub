/**
 * Composable central para consumir la API REST del backend.
 * El frontend nunca debe conectarse directamente a MongoDB: toda
 * comunicación pasa por esta capa hacia la API de Express.
 */
export const useApi = () => {
  const config = useRuntimeConfig();

  const apiFetch = <T>(path: string, options: Parameters<typeof $fetch>[1] = {}) => {
    const authStore = useAuthStore();

    // El middleware `authenticate` del backend exige "Authorization: Bearer <token>".
    // Sin esto, cualquier ruta protegida devuelve 401 aunque haya sesión iniciada.
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    };

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