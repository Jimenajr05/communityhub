<!--
  Página "Mis actividades" (ruta "/mis-actividades", requiere rol de organizador).
  Permite al organizador crear, editar, cancelar y eliminar sus actividades,
  y consultar la lista de participantes inscritos en cada una.
-->
<script setup lang="ts">
definePageMeta({ middleware: 'organizer' });
useHead({ title: 'Mis actividades · CommunityHub' });

const authStore = useAuthStore();
const eventsStore = useEventsStore();
const { apiFetch } = useApi();

const cargando = ref(true); // Indica si se está cargando el listado inicial de actividades
const mostrarFormulario = ref(false); // Controla la visibilidad del formulario de creación/edición
const editandoId = ref<string | null>(null); // Id de la actividad en edición (null si se está creando una nueva)
const guardando = ref(false); // Indica si el formulario se está guardando
const errorFormulario = ref(''); // Mensaje de error al guardar el formulario

/** Datos de un participante inscrito en una actividad. */
interface Participante {
  _id: string;
  user: {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  createdAt: string;
}

const mostrarParticipantes = ref(false); // Controla la visibilidad del modal de participantes
const actividadSeleccionada = ref<any>(null); // Actividad cuyo listado de participantes se está viendo
const participantes = ref<Participante[]>([]); // Participantes cargados de la actividad seleccionada
const cargandoParticipantes = ref(false); // Indica si se está cargando el listado de participantes
const errorParticipantes = ref(''); // Mensaje de error al cargar participantes

// Datos del formulario de creación/edición de actividad.
const form = reactive({
  title: '',
  description: '',
  category: '',
  date: '',
  time: '',
  location: '',
  capacity: 20,
});

/** Restablece el formulario a sus valores por defecto y sale del modo edición. */
function resetFormulario() {
  form.title = '';
  form.description = '';
  form.category = eventsStore.categorias[0]?._id ?? '';
  form.date = '';
  form.time = '';
  form.location = '';
  form.capacity = 20;
  editandoId.value = null;
  errorFormulario.value = '';
}

// Al montar la página, carga categorías y las actividades organizadas por el usuario actual.
onMounted(async () => {
  await eventsStore.cargarCategorias();
  await eventsStore.buscar({ organizer: authStore.usuario?.id });
  resetFormulario();
  cargando.value = false;
});

/** Abre el formulario en modo creación de una nueva actividad. */
function abrirCreacion() {
  resetFormulario();
  mostrarFormulario.value = true;
}

/**
 * Abre el formulario en modo edición, precargando los datos de la actividad.
 * @param actividad Actividad a editar.
 */
function abrirEdicion(actividad: any) {
  editandoId.value = actividad._id;
  form.title = actividad.title;
  form.description = actividad.description;
  form.category = actividad.category?._id ?? '';
  form.date = actividad.date?.slice(0, 10) ?? '';
  form.time = actividad.time;
  form.location = actividad.location;
  form.capacity = actividad.capacity;
  mostrarFormulario.value = true;
}

/**
 * Carga y muestra el listado de participantes inscritos en una actividad.
 * @param actividad Actividad de la que se desean ver los participantes.
 */
async function verParticipantes(actividad: any) {
  actividadSeleccionada.value = actividad;
  mostrarParticipantes.value = true;
  cargandoParticipantes.value = true;
  errorParticipantes.value = '';
  participantes.value = [];

  try {
    let res: any;
    try {
      res = await apiFetch<any>(`/events/${actividad._id}/participants`);
    } catch {
      res = await apiFetch<any>(`/events/${actividad._id}/registrations`);
    }

    const lista = res?.data?.participants || res?.data?.registrations || res?.data || [];
    participantes.value = Array.isArray(lista) ? lista : [];
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    errorParticipantes.value =
      fetchError?.data?.message || 'No pudimos cargar la lista de participantes.';
  } finally {
    cargandoParticipantes.value = false;
  }
}

/** Guarda la actividad del formulario: crea una nueva o actualiza la existente en edición. */
async function guardar() {
  guardando.value = true;
  errorFormulario.value = '';
  try {
    const payload = { ...form, capacity: Number(form.capacity) };
    if (editandoId.value) {
      await eventsStore.actualizarActividad(editandoId.value, payload);
    } else {
      await eventsStore.crearActividad(payload);
    }
    mostrarFormulario.value = false;
    await eventsStore.buscar({ organizer: authStore.usuario?.id });
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    errorFormulario.value = fetchError?.data?.message ?? 'No pudimos guardar la actividad.';
  } finally {
    guardando.value = false;
  }
}

/**
 * Cancela una actividad (cambia su estado a "cancelled"), previa confirmación.
 * @param actividad Actividad a cancelar.
 */
async function cancelarActividad(actividad: any) {
  if (!confirm(`¿Cancelar la actividad "${actividad.title}"? Se notificará a los inscritos.`)) return;
  await eventsStore.actualizarActividad(actividad._id, { status: 'cancelled' });
  await eventsStore.buscar({ organizer: authStore.usuario?.id });
}

/**
 * Elimina definitivamente una actividad, previa confirmación.
 * @param actividad Actividad a eliminar.
 */
async function eliminarActividad(actividad: any) {
  if (!confirm(`¿Eliminar definitivamente "${actividad.title}"?`)) return;
  await eventsStore.eliminarActividad(actividad._id);
  await eventsStore.buscar({ organizer: authStore.usuario?.id });
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">

      <header class="panel-header">
        <span class="panel-eyebrow">Organizador</span>
        <h1>Mis actividades</h1>
        <p>Crea, edita y administra las actividades que organizas y consulta tus participantes.</p>
      </header>

      <button type="button" class="pill-btn" style="margin-bottom: 1.5rem" @click="abrirCreacion">
        + Nueva actividad
      </button>

      <div v-if="mostrarFormulario" class="panel-card" style="margin-bottom: 2rem">
        <h2>{{ editandoId ? 'Editar actividad' : 'Nueva actividad' }}</h2>
        <form novalidate @submit.prevent="guardar">
          <div class="field">
            <label>Título</label>
            <input v-model.trim="form.title" type="text" required />
          </div>
          <div class="field">
            <label>Descripción</label>
            <input v-model.trim="form.description" type="text" required />
          </div>
          <div class="field-row">
            <div class="field">
              <label>Categoría</label>
              <select v-model="form.category" required>
                <option v-for="cat in eventsStore.categorias" :key="cat._id" :value="cat._id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="field">
              <label>Capacidad</label>
              <input v-model.number="form.capacity" type="number" min="1" required />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Fecha</label>
              <input v-model="form.date" type="date" required />
            </div>
            <div class="field">
              <label>Hora</label>
              <input v-model="form.time" type="time" required />
            </div>
          </div>
          <div class="field">
            <label>Ubicación</label>
            <input v-model.trim="form.location" type="text" required />
          </div>

          <p v-if="errorFormulario" class="form-error">{{ errorFormulario }}</p>

          <div style="display: flex; gap: 0.6rem">
            <button type="submit" class="submit-btn" :disabled="guardando">
              {{ guardando ? 'Guardando…' : 'Guardar' }}
            </button>
            <button type="button" class="pill-btn pill-btn--ghost" @click="mostrarFormulario = false">
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <p v-if="cargando" class="panel-empty">Cargando…</p>

      <p v-else-if="eventsStore.actividades.length === 0" class="panel-empty">
        Todavía no has creado ninguna actividad.
      </p>

      <div v-else class="data-table-wrap panel-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Fecha</th>
              <th>Inscritos</th>
              <th>Cupo disponible</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="actividad in eventsStore.actividades" :key="actividad._id">
              <td>
                <NuxtLink :to="`/actividad/${actividad._id}`" class="activity-title-link">
                  <strong>{{ actividad.title }}</strong>
                </NuxtLink>
              </td>
              <td>
                <span class="table-date">
                  {{ new Date(actividad.date).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                </span>
                <span v-if="actividad.time" class="table-time">· {{ actividad.time }}</span>
              </td>
              <td>
                <button
                  type="button"
                  class="badge-btn"
                  :title="'Ver lista de inscritos (' + actividad.registeredCount + ')'"
                  @click="verParticipantes(actividad)"
                >
                  {{ actividad.registeredCount }} inscritos
                </button>
              </td>
              <td>
                <span class="spots-count">
                  {{ actividad.spotsAvailable }} <small>/ {{ actividad.capacity }}</small>
                </span>
              </td>
              <td>
                <span class="status-pill" :class="`status-pill--${actividad.status}`">
                  <span class="status-dot" />
                  {{ actividad.status === 'active' ? 'Activa' : actividad.status === 'cancelled' ? 'Cancelada' : 'Finalizada' }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    class="action-pill action-pill--edit"
                    title="Editar actividad"
                    @click="abrirEdicion(actividad)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="actividad.status === 'active'"
                    type="button"
                    class="action-pill action-pill--cancel"
                    title="Cancelar actividad"
                    @click="cancelarActividad(actividad)"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    class="action-pill action-pill--delete"
                    title="Eliminar actividad"
                    @click="eliminarActividad(actividad)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="mostrarParticipantes" class="modal-backdrop" @click="mostrarParticipantes = false">
        <div class="modal-card panel-card" @click.stop>
          <div class="modal-header">
            <div>
              <span class="panel-eyebrow">Lista de Asistencia</span>
              <h2 class="modal-title">{{ actividadSeleccionada?.title }}</h2>
              <p class="modal-subtitle">
                Total inscritos: {{ actividadSeleccionada?.registeredCount }} / Capacidad: {{ actividadSeleccionada?.capacity }}
              </p>
            </div>
            <button
              type="button"
              class="modal-close"
              aria-label="Cerrar"
              @click="mostrarParticipantes = false"
            >
              ✕
            </button>
          </div>

          <div class="modal-body">
            <p v-if="cargandoParticipantes" class="panel-empty">Cargando participantes…</p>
            <p v-else-if="errorParticipantes" class="form-error">{{ errorParticipantes }}</p>
            <p v-else-if="participantes.length === 0" class="panel-empty">
              Aún no hay usuarios inscritos en esta actividad.
            </p>

            <div v-else class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Participante</th>
                    <th>Correo</th>
                    <th>Fecha de inscripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in participantes" :key="p._id || p.user?._id">
                    <td>
                      <strong>{{ p.user?.firstName }} {{ p.user?.lastName }}</strong>
                    </td>
                    <td>{{ p.user?.email }}</td>
                    <td>
                      {{ p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-CR') : 'Registrado' }}
                    </td>
                    <td>
                      <span class="status-tag status-tag--confirmed">
                        {{ p.status === 'confirmed' || !p.status ? 'Confirmado' : p.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="pill-btn pill-btn--ghost" @click="mostrarParticipantes = false">
              Cerrar
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.activity-title-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ch-text-on-paper);
  text-decoration: none;
  font-size: 0.96rem;
  transition: color 0.15s ease;
}

.activity-title-link:hover {
  color: var(--ch-coral);
}

.activity-bullet {
  font-size: 1.1rem;
}

.table-date {
  font-weight: 500;
  color: var(--ch-text-on-paper);
  white-space: nowrap;
}

.table-time {
  font-size: 0.8rem;
  color: var(--ch-text-on-paper-muted);
}

.spots-count {
  font-weight: 600;
  color: var(--ch-text-on-paper);
}

.spots-count small {
  font-weight: 400;
  color: var(--ch-text-on-paper-muted);
}

.badge-btn {
  background: var(--ch-paper-2);
  border: 1px solid var(--ch-line);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-family: var(--ch-font-body);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ch-text-on-paper);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.badge-btn:hover {
  background: var(--ch-coral);
  color: #fff;
  border-color: var(--ch-coral);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-body);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  white-space: nowrap;
}

.status-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
}

.status-pill--active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-pill--active .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}

.status-pill--cancelled {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.status-pill--cancelled .status-dot {
  background: #ef4444;
}

.status-pill--finished {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.status-pill--finished .status-dot {
  background: #94a3b8;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  white-space: nowrap;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-family: var(--ch-font-body);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.7rem;
  border-radius: var(--ch-radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-pill--edit {
  background: var(--ch-paper-2);
  border-color: var(--ch-line);
  color: var(--ch-text-on-paper);
}

.action-pill--edit:hover {
  border-color: var(--ch-coral);
  color: var(--ch-coral);
  background: rgba(99, 102, 241, 0.08);
}

.action-pill--cancel {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
  color: #f59e0b;
}

.action-pill--cancel:hover {
  background: #f59e0b;
  color: #ffffff;
}

.action-pill--delete {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 0.35rem 0.55rem;
}

.action-pill--delete:hover {
  background: #ef4444;
  color: #ffffff;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(4px);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  max-width: 44rem;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  border-radius: var(--ch-radius-md);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid var(--ch-line);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.modal-title {
  margin: 0.2rem 0;
  font-size: 1.3rem;
  color: var(--ch-text-on-paper);
}

.modal-subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: var(--ch-text-on-paper-muted);
  font-family: var(--ch-font-mono);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--ch-text-on-paper-muted);
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: var(--ch-radius-sm);
  transition: all 0.15s ease;
}

.modal-close:hover {
  color: var(--ch-coral);
  background: rgba(255, 107, 74, 0.1);
}

.modal-body {
  overflow-y: auto;
  flex: 1;
  padding-right: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--ch-line);
  padding-top: 1rem;
  margin-top: 1rem;
}

.status-tag {
  font-family: var(--ch-font-mono);
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
}
</style>

