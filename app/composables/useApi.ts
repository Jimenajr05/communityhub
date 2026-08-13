/**
 * Composable central para consumir la API REST del backend.
 * El frontend nunca debe conectarse directamente a MongoDB: toda
 * comunicación pasa por esta capa hacia la API de Express.
 */
export const useApi = () => {
  const config = useRuntimeConfig();

  const apiFetch = <T>(path: string, options: Parameters<typeof $fetch>[1] = {}) => {
    return $fetch<T>(path, {
      baseURL: config.public.apiBase,
      credentials: 'include',
      ...options,
    });
  };

  return { apiFetch };
};
