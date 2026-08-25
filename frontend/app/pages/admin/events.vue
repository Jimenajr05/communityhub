<!--
  Página de administración de actividades (ruta /admin/events).
  Solo accesible para administradores; permite moderar (listar y
  eliminar) cualquier actividad de la plataforma.
-->
<script setup lang="ts">
import { Trash2, Search, ExternalLink } from 'lucide-vue-next';
import type { Actividad } from '~/stores/events';

definePageMeta({ middleware: 'admin' });
useHead({ title: 'Actividades · Administración' });

const eventsStore = useEventsStore();
const { apiFetch } = useApi();
// Indica si las actividades todavía se están cargando
const cargando = ref(true);
// Lista combinada de actividades (activas, canceladas y finalizadas)
const actividades = ref<Actividad[]>([]);
// Filtro de búsqueda por título
const busqueda = ref('');

/** Carga todas las actividades (activas, canceladas y finalizadas) desde el API. */
async function cargar() {
  cargando.value = true;
  const respuestas = await Promise.all(
    ['active', 'cancelled', 'finished'].map((status) =>
      apiFetch<{ data: Actividad[] }>(`/events?status=${status}&limit=50`)
    )
  );
  actividades.value = respuestas.flatMap((r) => r.data);
  cargando.value = false;
}

// Al montar la página, carga la lista de actividades
onMounted(cargar);

const { confirmar } = useConfirm();

/** Elimina definitivamente una actividad (previa confirmación) y refresca la lista. */
async function eliminar(actividad: Actividad) {
  const aceptado = await confirmar({
    title: '¿Eliminar actividad?',
    message: `¿Estás seguro de eliminar "${actividad.title}"? Esta acción borrará la actividad definitivamente de la base de datos.`,
    confirmText: 'Sí, eliminar actividad',
    cancelText: 'Cancelar',
    type: 'danger',
  });
  if (!aceptado) return;
  await eventsStore.eliminarActividad(actividad._id);
  await cargar();
}

/** Etiqueta legible en español para el estado de una actividad. */
function etiquetaEstado(status: string) {
  if (status === 'active') return 'Activa';
  if (status === 'cancelled') return 'Cancelada';
  return 'Finalizada';
}

const actividadesFiltradas = computed(() => {
  if (!busqueda.value) return actividades.value;
  const q = busqueda.value.toLowerCase();
  return actividades.value.filter((a) => a.title.toLowerCase().includes(q));
});
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="panel-eyebrow">Administración</span>
          <h1>Moderación de actividades</h1>
          <p>Modera cualquier actividad de la plataforma, sin importar el organizador.</p>
        </div>

        <div class="header-search">
          <Search :size="14" :stroke-width="2.2" class="header-search__icon" />
          <input
            v-model.trim="busqueda"
            type="text"
            placeholder="Buscar actividad..."
            class="header-search__input"
          />
        </div>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando actividades del sistema...</p>

      <div v-else-if="actividadesFiltradas.length === 0" class="panel-card panel-empty">
        No se encontraron actividades que coincidan con tu búsqueda.
      </div>

      <div v-else class="data-table-wrap panel-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Organizador</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="actividad in actividadesFiltradas" :key="actividad._id">
              <td>
                <NuxtLink :to="`/actividad/${actividad._id}`" class="activity-link">
                  {{ actividad.title }}
                  <ExternalLink :size="12" :stroke-width="2" class="activity-link__ext" />
                </NuxtLink>
              </td>
              <td>
                <span class="organizer-cell">{{ actividad.organizer?.firstName }} {{ actividad.organizer?.lastName }}</span>
              </td>
              <td>
                <span class="date-cell">{{ new Date(actividad.date).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
              </td>
              <td>
                <span class="status-pill" :class="getEventStatus(actividad.status, actividad.date, actividad.time).className">
                  <span class="status-dot" />
                  {{ getEventStatus(actividad.status, actividad.date, actividad.time).label }}
                </span>
              </td>
              <td>
                <button type="button" class="pill-btn pill-btn--danger" @click="eliminar(actividad)">
                  <Trash2 :size="14" :stroke-width="2.2" /> Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!cargando" class="results-count">
        {{ actividadesFiltradas.length }} actividad{{ actividadesFiltradas.length !== 1 ? 'es' : '' }} en el sistema
      </p>
    </div>
  </div>
</template>

<style scoped>
.header-search {
  position: relative;
  display: flex;
  align-items: center;
}

.header-search__icon {
  position: absolute;
  left: 0.85rem;
  color: var(--ch-text-on-paper-dim);
  pointer-events: none;
}

.header-search__input {
  font-family: var(--ch-font-body);
  font-size: 0.88rem;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border-radius: var(--ch-radius-full);
  border: 1px solid var(--ch-line-strong);
  background: rgba(15, 21, 40, 0.75);
  color: var(--ch-text-on-paper);
  width: 16rem;
  transition: all 0.18s ease;
}

.header-search__input:focus-visible {
  outline: none;
  border-color: var(--ch-coral-light);
  box-shadow: 0 0 0 3px var(--ch-coral-glow);
  width: 19rem;
}

.activity-link {
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: color 0.15s ease;
}

.activity-link:hover {
  color: var(--ch-coral-light);
}

.activity-link__ext {
  opacity: 0;
  transition: opacity 0.15s ease;
}

.activity-link:hover .activity-link__ext {
  opacity: 0.7;
}

.organizer-cell {
  font-size: 0.9rem;
  color: var(--ch-text-on-paper-muted);
}

.date-cell {
  font-size: 0.88rem;
  color: var(--ch-text-on-paper);
  font-weight: 500;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: var(--ch-radius-full);
  white-space: nowrap;
}

.status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
}

.status-pill--active,
.status-pill--scheduled {
  background: rgba(16, 185, 129, 0.15);
  color: var(--ch-leaf);
}

.status-pill--active .status-dot,
.status-pill--scheduled .status-dot {
  background: var(--ch-leaf);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}

.status-pill--ongoing {
  background: rgba(6, 182, 212, 0.15);
  color: var(--ch-teal);
}

.status-pill--ongoing .status-dot {
  background: var(--ch-teal);
  box-shadow: 0 0 6px rgba(6, 182, 212, 0.5);
}

.status-pill--cancelled {
  background: rgba(244, 63, 94, 0.15);
  color: var(--ch-rose);
}

.status-pill--cancelled .status-dot {
  background: var(--ch-rose);
}

.status-pill--finished {
  background: rgba(148, 163, 184, 0.15);
  color: var(--ch-text-on-paper-muted);
}

.status-pill--finished .status-dot {
  background: var(--ch-text-on-paper-muted);
}

.results-count {
  margin-top: 1.25rem;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  color: var(--ch-text-on-ink-dim);
  text-align: right;
  letter-spacing: 0.04em;
}
</style>
