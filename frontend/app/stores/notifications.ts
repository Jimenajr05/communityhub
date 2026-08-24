/**
 * Store de notificaciones (Pinia).
 * Gestiona la carga, marcado como leídas y eliminación de las notificaciones
 * del usuario autenticado.
 */
import { defineStore } from 'pinia';

/** Resumen del evento/actividad asociado a una notificación, si aplica. */
export interface NotificacionEvento {
  _id: string;
  title: string;
  date?: string;
}

/** Representa una notificación del usuario. */
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

/** Forma del estado del store de notificaciones. */
interface NotificationsState {
  notificaciones: Notificacion[]; // Listado de notificaciones del usuario
  cargando: boolean; // Indica si hay una operación en curso
  error: string | null; // Mensaje de error de la última operación fallida
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notificaciones: [],
    cargando: false,
    error: null,
  }),

  getters: {
    /** Cantidad de notificaciones no leídas. */
    sinLeerCount: (state) => state.notificaciones.filter((n) => !n.isRead).length,
    /** Lista de notificaciones no leídas. */
    noLeidas: (state) => state.notificaciones.filter((n) => !n.isRead),
  },

  actions: {
    /**
     * Obtiene las notificaciones del usuario autenticado desde la API
     * (intenta el endpoint principal y usa uno alternativo como respaldo).
     */
    async obtenerNotificaciones() {
      const { apiFetch } = useApi();
      this.cargando = true;
      this.error = null;

      try {
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

    /**
     * Marca una notificación como leída, tanto en la API (probando varios
     * endpoints/métodos posibles) como en el estado local.
     * @param id Identificador de la notificación.
     */
    async marcarLeida(id: string) {
      const { apiFetch } = useApi();
      try {
        try {
          await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
        } catch {
          await apiFetch(`/notifications/${id}/read`, { method: 'PUT' });
        }
      } catch {
        try {
          await apiFetch(`/notifications/${id}`, { method: 'PUT', body: { isRead: true } });
        } catch {}
      }

      const item = this.notificaciones.find((n) => n._id === id);
      if (item) {
        item.isRead = true;
      }
    },

    /** Marca todas las notificaciones del usuario como leídas, en la API y en el estado local. */
    async marcarTodasLeidas() {
      const { apiFetch } = useApi();
      try {
        try {
          await apiFetch('/notifications/read-all', { method: 'PUT' });
        } catch {
          await apiFetch('/notifications/read-all', { method: 'PATCH' });
        }
      } catch {}

      this.notificaciones.forEach((n) => {
        n.isRead = true;
      });
    },

    /**
     * Elimina una notificación de la API y del estado local.
     * @param id Identificador de la notificación a eliminar.
     */
    async eliminarNotificacion(id: string) {
      const { apiFetch } = useApi();
      try {
        await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      } catch {}

      this.notificaciones = this.notificaciones.filter((n) => n._id !== id);
    },
  },
});
