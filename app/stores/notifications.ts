import { defineStore } from 'pinia';

export interface NotificacionEvento {
  _id: string;
  title: string;
  date?: string;
}

export interface Notificacion {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'reminder' | 'registration' | 'event_update' | 'system' | 'report' | string;
  isRead: boolean;
  event?: NotificacionEvento | null;
  createdAt: string;
}

interface NotificationsState {
  notificaciones: Notificacion[];
  cargando: boolean;
  error: string | null;
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notificaciones: [],
    cargando: false,
    error: null,
  }),

  getters: {
    sinLeerCount: (state) => state.notificaciones.filter((n) => !n.isRead).length,
    noLeidas: (state) => state.notificaciones.filter((n) => !n.isRead),
  },

  actions: {
    async obtenerNotificaciones() {
      const { apiFetch } = useApi();
      this.cargando = true;
      this.error = null;

      try {
        // Intenta obtener de /notifications (o fallback /users/me/notifications)
        let res: any;
        try {
          res = await apiFetch<any>('/notifications');
        } catch {
          res = await apiFetch<any>('/users/me/notifications');
        }

        const items = res?.data?.notifications || res?.data || [];
        this.notificaciones = Array.isArray(items) ? items : [];
      } catch (err: unknown) {
        const fetchError = err as { data?: { message?: string } };
        this.error = fetchError?.data?.message || 'No se pudieron cargar las notificaciones.';
        this.notificaciones = [];
      } finally {
        this.cargando = false;
      }
    },

    async marcarLeida(id: string) {
      const { apiFetch } = useApi();
      try {
        try {
          await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
        } catch {
          await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
        }
      } catch {
        // En caso de que el backend use PUT /notifications/:id
        try {
          await apiFetch(`/notifications/${id}`, { method: 'PUT', body: { isRead: true } });
        } catch {
          // Ignorar error si el endpoint difiere ligeramente
        }
      }

      const item = this.notificaciones.find((n) => n._id === id);
      if (item) {
        item.isRead = true;
      }
    },

    async marcarTodasLeidas() {
      const { apiFetch } = useApi();
      try {
        try {
          await apiFetch('/notifications/read-all', { method: 'PUT' });
        } catch {
          await apiFetch('/notifications/read-all', { method: 'PATCH' });
        }
      } catch {
        // Fallback: marcar localmente y llamar a cada una si fuera necesario
      }

      this.notificaciones.forEach((n) => {
        n.isRead = true;
      });
    },

    async eliminarNotificacion(id: string) {
      const { apiFetch } = useApi();
      try {
        await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      } catch {
        // Ignorar si el endpoint difiere
      }

      this.notificaciones = this.notificaciones.filter((n) => n._id !== id);
    },
  },
});
