/**
 * Store de autenticación (Pinia).
 * Gestiona el usuario autenticado, el token de sesión y las acciones
 * relacionadas con login, registro, obtención de perfil y logout.
 */
import { defineStore } from 'pinia';

/** Representa a un usuario de la plataforma. */
export interface Usuario {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'administrador' | 'organizador' | 'usuario';
  profilePicture: string | null;
}

/** Respuesta de la API para login/registro: usuario y token generado. */
interface AuthPayload {
  data: { user: Usuario; token: string };
}

/** Respuesta de la API al consultar el usuario autenticado actual. */
interface MePayload {
  data: { user: Usuario };
}

/** Forma del estado del store de autenticación. */
interface AuthState {
  usuario: Usuario | null; // Usuario actualmente autenticado (null si no hay sesión)
  token: string | null; // Token de sesión vigente
  cargando: boolean; // Indica si hay una operación de autenticación en curso
}

/** Cookie que persiste el token de autenticación entre recargas/sesiones del navegador. */
const useTokenCookie = () =>
  useCookie<string | null>('ch_token', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    usuario: null,
    token: null,
    cargando: false,
  }),

  getters: {
    /** Indica si actualmente hay un usuario autenticado. */
    estaAutenticado: (state) => Boolean(state.usuario),
  },

  actions: {
    /**
     * Inicia sesión con email y contraseña.
     * Guarda el usuario y token resultantes en el estado y en la cookie de sesión.
     * @param email Correo electrónico del usuario.
     * @param password Contraseña del usuario.
     */
    async login(email: string, password: string) {
      const { apiFetch } = useApi();
      this.cargando = true;
      try {
        const respuesta = await apiFetch<AuthPayload>('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        this.usuario = respuesta.data.user;
        this.token = respuesta.data.token;
        useTokenCookie().value = respuesta.data.token;
      } finally {
        this.cargando = false;
      }
    },

    /**
     * Registra un nuevo usuario y lo autentica automáticamente.
     * Guarda el usuario y token resultantes en el estado y en la cookie de sesión.
     * @param payload Datos del nuevo usuario (nombre, apellido, email y contraseña).
     */
    async registrar(payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      profilePicture?: string;
      role?: 'usuario' | 'organizador';
    }) {
      const { apiFetch } = useApi();
      this.cargando = true;
      try {
        const respuesta = await apiFetch<AuthPayload>('/auth/register', {
          method: 'POST',
          body: payload,
        });
        this.usuario = respuesta.data.user;
        this.token = respuesta.data.token;
        useTokenCookie().value = respuesta.data.token;
      } finally {
        this.cargando = false;
      }
    },

    /**
     * Obtiene los datos del usuario autenticado a partir del token guardado
     * (en estado o en cookie). Si no hay token o la petición falla, limpia la sesión.
     */
    async obtenerUsuarioActual() {
      const cookieToken = useTokenCookie();
      if (!this.token && cookieToken.value) {
        this.token = cookieToken.value;
      }
      if (!this.token) {
        this.usuario = null;
        return;
      }

      const { apiFetch } = useApi();
      try {
        const respuesta = await apiFetch<MePayload>('/auth/me');
        this.usuario = respuesta.data.user;
      } catch {
        this.usuario = null;
        this.token = null;
        cookieToken.value = null;
      }
    },

    /**
     * Actualiza los datos de perfil del usuario autenticado.
     * @param payload Campos a actualizar (nombre, apellido y/o foto de perfil).
     */
    async actualizarPerfil(payload: { firstName?: string; lastName?: string; profilePicture?: string }) {
      if (!this.usuario) return;
      const { apiFetch } = useApi();
      const respuesta = await apiFetch<MePayload>(`/users/${this.usuario.id}`, {
        method: 'PUT',
        body: payload,
      });
      this.usuario = respuesta.data.user;
    },

    /**
     * Promueve al usuario autenticado de rol 'usuario' a 'organizador'.
     * Actualiza el estado local del store tras la confirmación del backend.
     */
    async convertirseEnOrganizador() {
      const { apiFetch } = useApi();
      const respuesta = await apiFetch<MePayload>('/users/me/become-organizer', {
        method: 'POST',
      });
      this.usuario = respuesta.data.user;
    },

    /** Cierra la sesión del usuario: limpia el estado y la cookie de token. */
    async logout() {
      const { apiFetch } = useApi();
      try {
        await apiFetch('/auth/logout', { method: 'POST' });
      } finally {
        this.usuario = null;
        this.token = null;
        useTokenCookie().value = null;
      }
    },
  },
});