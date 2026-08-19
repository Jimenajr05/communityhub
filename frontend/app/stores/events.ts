import { defineStore } from 'pinia';

export interface CategoriaResumen {
  _id: string;
  name: string;
  description?: string;
}

export interface OrganizadorResumen {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Actividad {
  _id: string;
  title: string;
  description: string;
  category: CategoriaResumen;
  date: string;
  time: string;
  location: string;
  capacity: number;
  image: string | null;
  organizer: OrganizadorResumen;
  status: 'active' | 'cancelled' | 'finished';
  registeredCount: number;
  spotsAvailable: number;
}

export interface Inscripcion {
  _id: string;
  event: Actividad;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Favorito {
  _id: string;
  event: Actividad;
  createdAt: string;
}

interface Paginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ListaRespuesta {
  data: Actividad[];
  pagination: Paginacion;
}

export interface FiltrosActividades {
  search?: string;
  category?: string;
  location?: string;
  date?: string;
  available?: boolean;
  organizer?: string;
  status?: string;
  page?: number;
}

interface EventsState {
  actividades: Actividad[];
  categorias: CategoriaResumen[];
  misInscripciones: Inscripcion[];
  misFavoritos: Favorito[];
  paginacion: Paginacion | null;
  cargando: boolean;
  error: string | null;
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    actividades: [],
    categorias: [],
    misInscripciones: [],
    misFavoritos: [],
    paginacion: null,
    cargando: false,
    error: null,
  }),

  actions: {
    async buscar(filtros: FiltrosActividades = {}) {
      const { apiFetch } = useApi();
      this.cargando = true;
      this.error = null;

      try {
        const query = new URLSearchParams();
        if (filtros.search) query.set('search', filtros.search);
        if (filtros.category) query.set('category', filtros.category);
        if (filtros.location) query.set('location', filtros.location);
        if (filtros.date) query.set('date', filtros.date);
        if (filtros.available) query.set('available', 'true');
        if (filtros.organizer) query.set('organizer', filtros.organizer);
        if (filtros.status) query.set('status', filtros.status);
        if (filtros.page) query.set('page', String(filtros.page));

        const qs = query.toString();
        const respuesta = await apiFetch<ListaRespuesta>(`/events${qs ? `?${qs}` : ''}`);
        this.actividades = respuesta.data;
        this.paginacion = respuesta.pagination;
      } catch (err: unknown) {
        const fetchError = err as { data?: { message?: string } };
        this.error =
          fetchError?.data?.message ??
          'No pudimos conectar con el servidor. Verifica tu conexión o intenta de nuevo.';
        this.actividades = [];
        this.paginacion = null;
      } finally {
        this.cargando = false;
      }
    },

    async obtenerPorId(id: string): Promise<Actividad | null> {
      const { apiFetch } = useApi();
      try {
        const respuesta = await apiFetch<{ success: boolean; data: { event: Actividad } }>(
          `/events/${id}`
        );
        return respuesta.data?.event ?? null;
      } catch {
        return null;
      }
    },

    async cargarCategorias() {
      const { apiFetch } = useApi();
      try {
        const respuesta = await apiFetch<{
          success: boolean;
          data: { categories: CategoriaResumen[] };
        }>('/categories');
        this.categorias = respuesta.data.categories;
      } catch {
        this.categorias = [];
      }
    },

    async inscribirse(eventId: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${eventId}/register`, { method: 'POST' });
      await this.obtenerMisInscripciones();
    },

    async cancelarInscripcion(eventId: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${eventId}/register`, { method: 'DELETE' });
      await this.obtenerMisInscripciones();
    },

    async obtenerMisInscripciones() {
      const { apiFetch } = useApi();
      try {
        const respuesta = await apiFetch<{
          success: boolean;
          data: { registrations: Inscripcion[] };
        }>('/users/me/registrations');
        this.misInscripciones = respuesta.data.registrations;
      } catch {
        this.misInscripciones = [];
      }
    },

    async marcarFavorito(eventId: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${eventId}/favorite`, { method: 'POST' });
      await this.obtenerMisFavoritos();
    },

    async quitarFavorito(eventId: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${eventId}/favorite`, { method: 'DELETE' });
      await this.obtenerMisFavoritos();
    },

    async obtenerMisFavoritos() {
      const { apiFetch } = useApi();
      try {
        const respuesta = await apiFetch<{
          success: boolean;
          data: { favorites: Favorito[] };
        }>('/users/me/favorites');
        this.misFavoritos = respuesta.data.favorites;
      } catch {
        this.misFavoritos = [];
      }
    },

    async crearActividad(payload: Record<string, unknown>) {
      const { apiFetch } = useApi();
      await apiFetch('/events', { method: 'POST', body: payload });
    },

    async actualizarActividad(id: string, payload: Record<string, unknown>) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${id}`, { method: 'PUT', body: payload });
    },

    async eliminarActividad(id: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${id}`, { method: 'DELETE' });
    },
  },
});