import { defineStore } from 'pinia';

export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: 'admin' | 'organizador' | 'usuario';
  fotoPerfil: string | null;
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
}

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
        const respuesta = await apiFetch<{ data: Usuario; token: string }>('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        this.usuario = respuesta.data;
        this.token = respuesta.token;
      } finally {
        this.cargando = false;
      }
    },

    async registrar(payload: { nombre: string; apellido: string; email: string; password: string }) {
      const { apiFetch } = useApi();
      this.cargando = true;
      try {
        const respuesta = await apiFetch<{ data: Usuario; token: string }>('/auth/register', {
          method: 'POST',
          body: payload,
        });
        this.usuario = respuesta.data;
        this.token = respuesta.token;
      } finally {
        this.cargando = false;
      }
    },

    async obtenerUsuarioActual() {
      const { apiFetch } = useApi();
      try {
        const respuesta = await apiFetch<{ data: Usuario }>('/auth/me');
        this.usuario = respuesta.data;
      } catch {
        this.usuario = null;
      }
    },

    async logout() {
      const { apiFetch } = useApi();
      await apiFetch('/auth/logout', { method: 'POST' });
      this.usuario = null;
      this.token = null;
    },
  },
});
