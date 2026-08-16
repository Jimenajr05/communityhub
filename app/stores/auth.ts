import { defineStore } from 'pinia';

// Estos campos reflejan exactamente lo que devuelve el backend
// (services/auth.service.js -> sanitizeUser y models/User.js).
// Ojo: el modelo usa firstName/lastName (en inglés) pero los roles están
// en español ('administrador' | 'organizador' | 'usuario').
export interface Usuario {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'administrador' | 'organizador' | 'usuario';
  profilePicture: string | null;
}

interface AuthPayload {
  data: { user: Usuario; token: string };
}

interface MePayload {
  data: { user: Usuario };
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
}

// Cookie donde persistimos el JWT para que la sesión sobreviva a un refresh
// de página. httpOnly no aplica aquí porque el token lo maneja el cliente
// (Nuxt SSR) para adjuntarlo como Bearer en cada request.
const useTokenCookie = () =>
  useCookie<string | null>('ch_token', {
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    usuario: null,
    token: null,
    cargando: false,
  }),

  getters: {
    estaAutenticado: (state) => Boolean(state.usuario),
  },

  actions: {
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

    async registrar(payload: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
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

    async actualizarPerfil(payload: { firstName?: string; lastName?: string; profilePicture?: string }) {
      if (!this.usuario) return;
      const { apiFetch } = useApi();
      const respuesta = await apiFetch<MePayload>(`/users/${this.usuario.id}`, {
        method: 'PUT',
        body: payload,
      });
      this.usuario = respuesta.data.user;
    },

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