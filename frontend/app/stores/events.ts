/**
 * Store de actividades/eventos (Pinia).
 * Gestiona la búsqueda y listado de actividades, categorías, inscripciones
 * y favoritos del usuario, así como la creación/edición/eliminación de actividades.
 */
import { defineStore } from 'pinia';

/** Resumen de una categoría de actividad. */
export interface CategoriaResumen {
  _id: string;
  name: string;
  description?: string;
}

/** Resumen del organizador de una actividad. */
export interface OrganizadorResumen {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
}

/** Representa una actividad/evento de la comunidad. */
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

/** Representa la inscripción de un usuario a una actividad. */
export interface Inscripcion {
  _id: string;
  event: Actividad;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

/** Representa una actividad marcada como favorita por el usuario. */
export interface Favorito {
  _id: string;
  event: Actividad;
  createdAt: string;
}

/** Información de paginación devuelta por la API. */
interface Paginacion {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Respuesta de la API para listados paginados de actividades. */
interface ListaRespuesta {
  data: Actividad[];
  pagination: Paginacion;
}

/** Filtros disponibles para la búsqueda de actividades. */
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

/** Forma del estado del store de actividades/eventos. */
interface EventsState {
  actividades: Actividad[]; // Listado de actividades obtenidas de la última búsqueda
  categorias: CategoriaResumen[]; // Categorías disponibles
  misInscripciones: Inscripcion[]; // Inscripciones del usuario autenticado
  misFavoritos: Favorito[]; // Actividades favoritas del usuario autenticado
  paginacion: Paginacion | null; // Información de paginación de la última búsqueda
  cargando: boolean; // Indica si hay una operación en curso
  error: string | null; // Mensaje de error de la última operación fallida
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
    /**
     * Busca actividades aplicando los filtros indicados y actualiza el listado
     * y la paginación en el estado.
     * @param filtros Criterios de búsqueda (texto, categoría, ubicación, fecha, etc.).
     */
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

    /**
     * Obtiene el detalle de una actividad por su id.
     * @param id Identificador de la actividad.
     * @returns La actividad encontrada o null si no existe/hay error.
     */
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

    /** Carga la lista de categorías disponibles desde la API. */
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

    /**
     * Inscribe al usuario autenticado en una actividad y refresca sus inscripciones.
     * @param eventId Identificador de la actividad.
     */
    async inscribirse(eventId: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${eventId}/register`, { method: 'POST' });
      await this.obtenerMisInscripciones();
    },

    /**
     * Cancela la inscripción del usuario autenticado a una actividad y refresca sus inscripciones.
     * @param eventId Identificador de la actividad.
     */
    async cancelarInscripcion(eventId: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${eventId}/register`, { method: 'DELETE' });
      await this.obtenerMisInscripciones();
    },

    /** Obtiene las inscripciones del usuario autenticado y las guarda en el estado. */
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

    /**
     * Marca una actividad como favorita para el usuario autenticado y refresca sus favoritos.
     * @param eventId Identificador de la actividad.
     */
    async marcarFavorito(eventId: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${eventId}/favorite`, { method: 'POST' });
      await this.obtenerMisFavoritos();
    },

    /**
     * Quita una actividad de los favoritos del usuario autenticado y refresca sus favoritos.
     * @param eventId Identificador de la actividad.
     */
    async quitarFavorito(eventId: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${eventId}/favorite`, { method: 'DELETE' });
      await this.obtenerMisFavoritos();
    },

    /** Obtiene las actividades favoritas del usuario autenticado y las guarda en el estado. */
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

    /**
     * Crea una nueva actividad.
     * @param payload Datos de la actividad a crear.
     */
    async crearActividad(payload: Record<string, unknown>) {
      const { apiFetch } = useApi();
      await apiFetch('/events', { method: 'POST', body: payload });
    },

    /**
     * Actualiza una actividad existente.
     * @param id Identificador de la actividad.
     * @param payload Campos a actualizar.
     */
    async actualizarActividad(id: string, payload: Record<string, unknown>) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${id}`, { method: 'PUT', body: payload });
    },

    /**
     * Elimina una actividad.
     * @param id Identificador de la actividad a eliminar.
     */
    async eliminarActividad(id: string) {
      const { apiFetch } = useApi();
      await apiFetch(`/events/${id}`, { method: 'DELETE' });
    },
  },
});