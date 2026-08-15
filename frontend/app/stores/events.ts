import { defineStore } from 'pinia';

// Reflejan la forma real de la respuesta del backend (event.service.js).
// Ojo: Mongoose serializa el _id como string en el JSON, no como "id"
// (a diferencia de Usuario, que sí lo remapea explícitamente en auth.service.js).
export interface CategoriaResumen {
    _id: string;
    name: string;
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
    page?: number;
}

interface EventsState {
    actividades: Actividad[];
    paginacion: Paginacion | null;
    cargando: boolean;
    error: string | null;
}

export const useEventsStore = defineStore('events', {
    state: (): EventsState => ({
        actividades: [],
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
                const respuesta = await apiFetch<{ success: boolean; data: { event: Actividad } }>(`/events/${id}`);
                return respuesta.data?.event ?? null;
            } catch {
                return null;
            }
        },
    },
});