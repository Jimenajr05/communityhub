<!--
  Página "Mis actividades" (ruta "/mis-actividades", requiere rol de organizador).
  Permite crear, editar, cancelar y eliminar actividades y consultar los participantes inscritos.
-->
<script setup lang="ts">
import { Plus, X, Pencil, Ban, Trash2, Users, CalendarDays, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-vue-next';

definePageMeta({ middleware: 'organizer' });
useHead({ title: 'Mis actividades · CommunityHub' });

const authStore = useAuthStore();
const eventsStore = useEventsStore();
const { apiFetch } = useApi();

const cargando = ref(true);
const mostrarFormulario = ref(false);
const editandoId = ref<string | null>(null);
const guardando = ref(false);
const errorFormulario = ref('');

interface Participante {
  _id: string;
  registrationId?: string;
  user: {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
  };
  status: string;
  registeredAt?: string;
  createdAt: string;
}

const mostrarParticipantes = ref(false);
const actividadSeleccionada = ref<any>(null);
const participantes = ref<Participante[]>([]);
const cargandoParticipantes = ref(false);
const errorParticipantes = ref('');

const form = reactive({
  title: '',
  description: '',
  category: '',
  date: '',
  time: '',
  location: '',
  capacity: 20,
  image: '',
});

function resetFormulario() {
  form.title = '';
  form.description = '';
  form.category = eventsStore.categorias[0]?._id ?? '';
  form.date = '';
  form.time = '';
  form.location = '';
  form.capacity = 20;
  form.image = '';
  editandoId.value = null;
  errorFormulario.value = '';
}

onMounted(async () => {
  await eventsStore.cargarCategorias();
  await eventsStore.buscar({ organizer: authStore.usuario?.id });
  resetFormulario();
  cargando.value = false;
});

function abrirCreacion() {
  resetFormulario();
  mostrarFormulario.value = true;
}

function abrirEdicion(actividad: any) {
  editandoId.value = actividad._id;
  form.title = actividad.title;
  form.description = actividad.description;
  form.category = actividad.category?._id ?? '';
  form.date = actividad.date?.slice(0, 10) ?? '';
  form.time = actividad.time;
  form.location = actividad.location;
  form.capacity = actividad.capacity;
  form.image = actividad.image ?? '';
  mostrarFormulario.value = true;
}

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

function formatearFechaRegistro(fechaRaw?: string | Date) {
  if (!fechaRaw) return '—';
  const f = new Date(fechaRaw);
  if (isNaN(f.getTime())) return '—';
  return f.toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

const { confirmar } = useConfirm();

async function cancelarActividad(actividad: any) {
  const aceptado = await confirmar({
    title: '¿Cancelar actividad?',
    message: `¿Deseas cancelar "${actividad.title}"? Se notificará inmediatamente a los participantes inscritos.`,
    confirmText: 'Sí, cancelar actividad',
    cancelText: 'Volver',
    type: 'warning',
  });
  if (!aceptado) return;
  await eventsStore.actualizarActividad(actividad._id, { status: 'cancelled' });
  await eventsStore.buscar({ organizer: authStore.usuario?.id });
}

async function eliminarActividad(actividad: any) {
  const aceptado = await confirmar({
    title: '¿Eliminar definitivamente?',
    message: `¿Estás seguro de eliminar "${actividad.title}"? Esta acción no se puede deshacer y liberará los registros.`,
    confirmText: 'Sí, eliminar actividad',
    cancelText: 'Cancelar',
    type: 'danger',
  });
  if (!aceptado) return;
  await eventsStore.eliminarActividad(actividad._id);
  await eventsStore.buscar({ organizer: authStore.usuario?.id });
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <header class="panel-header" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="panel-eyebrow">Gestión Comunitaria</span>
          <h1>Mis actividades organizadas</h1>
          <p>Crea, edita y administra tus actividades y consulta la lista de participantes inscritos.</p>
        </div>

        <button type="button" class="pill-btn pill-btn--primary" @click="abrirCreacion">
          <Plus :size="16" :stroke-width="2.4" /> Publicar nueva actividad
        </button>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando tus actividades...</p>

      <!-- Estado vacío -->
      <div v-else-if="eventsStore.actividades.length === 0" class="panel-card empty-card">
        <svg class="empty-card__glyph" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.35" />
          <rect x="20" y="20" width="24" height="24" rx="4" stroke="currentColor" stroke-width="1.8" />
          <path d="M20,28 H44" stroke="currentColor" stroke-width="1.6" />
          <path d="M32,32 V40 M28,36 H36" stroke="var(--ch-marigold)" stroke-width="2" stroke-linecap="round" />
        </svg>
        <h3>Aún no has creado ninguna actividad</h3>
        <p>Publica talleres, deportes, encuentros artísticos o iniciativas comunitarias para tu zona.</p>
        <button type="button" class="pill-btn pill-btn--primary" @click="abrirCreacion">
          <Plus :size="16" :stroke-width="2.4" /> Crear mi primera actividad
        </button>
      </div>

      <!-- Tabla de actividades organizadas -->
      <div v-else class="data-table-wrap panel-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Fecha y Lugar</th>
              <th>Ocupación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="act in eventsStore.actividades" :key="act._id">
              <td>
                <NuxtLink :to="`/actividad/${act._id}`" class="org-act-link">
                  <strong>{{ act.title }}</strong>
                  <span class="org-act-cat">{{ act.category?.name || 'General' }}</span>
                </NuxtLink>
              </td>
              <td>
                <span class="table-date">{{ new Date(act.date).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' }) }}</span>
                <span class="table-loc"> · {{ act.location }}</span>
              </td>
              <td>
                <div class="capacity-cell">
                  <div class="capacity-bar">
                    <div
                      class="capacity-fill"
                      :style="{ width: `${Math.min(100, Math.round(((act.registeredCount || 0) / (act.capacity || 1)) * 100))}%` }"
                    />
                  </div>
                  <span class="capacity-text">{{ act.registeredCount || 0 }}/{{ act.capacity }} inscritos</span>
                </div>
              </td>
              <td>
                <span
                  class="status-pill"
                  :class="getEventStatus(act.status, act.date, act.time).className"
                >
                  <span class="status-dot" />
                  {{ getEventStatus(act.status, act.date, act.time).label }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button
                    type="button"
                    class="action-btn"
                    title="Ver participantes"
                    @click="verParticipantes(act)"
                  >
                    <Users :size="15" :stroke-width="2" />
                  </button>
                  <button
                    type="button"
                    class="action-btn"
                    title="Editar actividad"
                    @click="abrirEdicion(act)"
                  >
                    <Pencil :size="15" :stroke-width="2" />
                  </button>
                  <button
                    v-if="act.status === 'active'"
                    type="button"
                    class="action-btn action-btn--warning"
                    title="Cancelar actividad"
                    @click="cancelarActividad(act)"
                  >
                    <Ban :size="15" :stroke-width="2" />
                  </button>
                  <button
                    type="button"
                    class="action-btn action-btn--danger"
                    title="Eliminar actividad"
                    @click="eliminarActividad(act)"
                  >
                    <Trash2 :size="15" :stroke-width="2" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- MODAL DE CREACIÓN / EDICIÓN -->
      <div v-if="mostrarFormulario" class="modal-backdrop" @click.self="mostrarFormulario = false">
        <div class="modal-box panel-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h2>{{ editandoId ? 'Editar actividad' : 'Publicar nueva actividad' }}</h2>
            <button type="button" class="modal-close" @click="mostrarFormulario = false">
              <X :size="18" :stroke-width="2.2" />
            </button>
          </div>

          <form novalidate @submit.prevent="guardar">
            <div class="field">
              <label for="act-title">Título de la actividad</label>
              <input id="act-title" v-model.trim="form.title" type="text" placeholder="Ej. Taller de Robótica Comunitaria" required />
            </div>

            <div class="field-row">
              <div class="field">
                <label for="act-cat">Categoría</label>
                <select id="act-cat" v-model="form.category" required>
                  <option v-for="cat in eventsStore.categorias" :key="cat._id" :value="cat._id">
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="field">
                <label for="act-cap">Cupo máximo (capacidad)</label>
                <input id="act-cap" v-model.number="form.capacity" type="number" min="1" required />
              </div>
            </div>

            <div class="field-row">
              <div class="field">
                <label for="act-date">Fecha</label>
                <input id="act-date" v-model="form.date" type="date" required />
              </div>

              <div class="field">
                <label for="act-time">Horario</label>
                <input id="act-time" v-model.trim="form.time" type="text" placeholder="Ej. 10:00 AM - 12:30 PM" required />
              </div>
            </div>

            <div class="field">
              <label for="act-loc">Punto de encuentro / Ubicación</label>
              <input id="act-loc" v-model.trim="form.location" type="text" placeholder="Ej. Centro Comunitario Norte, Salón 2" required />
            </div>

            <div class="field">
              <label for="act-desc">Descripción de la actividad</label>
              <textarea id="act-desc" v-model.trim="form.description" rows="4" placeholder="Explica los detalles, qué deben llevar los participantes y la dinámica del evento..." required />
            </div>

            <div class="field">
              <label for="act-image">URL de imagen de portada (opcional)</label>
              <input id="act-image" v-model.trim="form.image" type="url" placeholder="https://ejemplo.com/foto.jpg o enlace web de la imagen" />
              <div v-if="form.image" class="image-preview-wrap">
                <img :src="form.image" alt="Vista previa de portada" class="image-preview" />
              </div>
            </div>

            <p v-if="errorFormulario" class="form-error">{{ errorFormulario }}</p>

            <div class="modal-footer">
              <button type="button" class="pill-btn pill-btn--ghost" @click="mostrarFormulario = false">
                Cancelar
              </button>
              <button type="submit" class="pill-btn pill-btn--primary" :disabled="guardando">
                {{ guardando ? 'Guardando...' : editandoId ? 'Guardar cambios' : 'Publicar actividad' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL DE PARTICIPANTES -->
      <div v-if="mostrarParticipantes" class="modal-backdrop" @click.self="mostrarParticipantes = false">
        <div class="modal-box panel-card" role="dialog" aria-modal="true">
          <div class="modal-header">
            <div>
              <h2>Participantes inscritos</h2>
              <p class="modal-subtitle">{{ actividadSeleccionada?.title }}</p>
            </div>
            <button type="button" class="modal-close" @click="mostrarParticipantes = false">
              <X :size="18" :stroke-width="2.2" />
            </button>
          </div>

          <p v-if="cargandoParticipantes" class="panel-empty">Consultando lista de inscritos...</p>
          <div v-else-if="errorParticipantes" class="form-error">{{ errorParticipantes }}</div>

          <div v-else-if="participantes.length === 0" class="panel-empty">
            Aún no hay participantes inscritos en esta actividad.
          </div>

          <div v-else class="data-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Correo</th>
                  <th>Fecha de registro</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in participantes" :key="p.registrationId || p._id">
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      <span
                        style="width: 1.75rem; height: 1.75rem; border-radius: 50%; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; background: linear-gradient(135deg, var(--ch-coral) 0%, var(--ch-marigold) 100%); font-family: var(--ch-font-mono); font-size: 0.65rem; font-weight: 700; color: #04060c;"
                      >
                        <img
                          v-if="p.user?.profilePicture"
                          :src="p.user.profilePicture"
                          :alt="p.user?.firstName || 'Participante'"
                          style="width: 100%; height: 100%; object-fit: cover;"
                        />
                        <template v-else>
                          {{ (p.user?.firstName?.[0] || '') + (p.user?.lastName?.[0] || '') }}
                        </template>
                      </span>
                      <strong>{{ p.user?.firstName }} {{ p.user?.lastName }}</strong>
                    </div>
                  </td>
                  <td>{{ p.user?.email }}</td>
                  <td>{{ formatearFechaRegistro(p.registeredAt || p.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="modal-footer" style="margin-top: 1.5rem;">
            <button type="button" class="pill-btn pill-btn--secondary" @click="mostrarParticipantes = false">
              Cerrar lista
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.empty-card {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-card__glyph {
  width: 3.75rem;
  height: 3.75rem;
  color: var(--ch-coral-light);
  margin-bottom: 0.5rem;
}

.empty-card h3 {
  font-size: 1.35rem;
  margin: 0;
  color: #ffffff;
}

.empty-card p {
  color: var(--ch-text-on-paper-muted);
  max-width: 28rem;
  margin: 0 0 1.5rem;
}

.org-act-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: #ffffff;
  transition: color 0.15s ease;
}

.org-act-link:hover {
  color: var(--ch-coral-light);
}

.org-act-cat {
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  color: var(--ch-text-on-paper-dim);
  text-transform: uppercase;
}

.table-date {
  font-weight: 600;
  color: #ffffff;
}

.table-loc {
  font-size: 0.84rem;
  color: var(--ch-text-on-paper-muted);
}

.capacity-cell {
  width: 9rem;
}

.capacity-bar {
  height: 5px;
  border-radius: var(--ch-radius-full);
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  margin-bottom: 0.35rem;
}

.capacity-fill {
  height: 100%;
  background: var(--ch-coral-light);
  border-radius: var(--ch-radius-full);
}

.capacity-text {
  font-size: 0.76rem;
  font-family: var(--ch-font-mono);
  color: var(--ch-text-on-paper-muted);
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
}

.status-pill--active,
.status-pill--scheduled {
  background: rgba(16, 185, 129, 0.15);
  color: var(--ch-leaf);
}
.status-pill--active .status-dot,
.status-pill--scheduled .status-dot { background: var(--ch-leaf); }

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
.status-pill--cancelled .status-dot { background: var(--ch-rose); }

.status-pill--finished {
  background: rgba(148, 163, 184, 0.15);
  color: var(--ch-text-on-paper-muted);
}
.status-pill--finished .status-dot { background: var(--ch-text-on-paper-muted); }

.table-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--ch-line-strong);
  color: var(--ch-text-on-paper-muted);
  width: 2rem;
  height: 2rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--ch-paper-3);
  color: #ffffff;
  border-color: var(--ch-coral-light);
}

.action-btn--warning:hover {
  background: rgba(245, 158, 11, 0.15);
  color: var(--ch-marigold);
  border-color: var(--ch-marigold);
}

.action-btn--danger:hover {
  background: rgba(244, 63, 94, 0.15);
  color: var(--ch-rose);
  border-color: var(--ch-rose);
}

/* Modales */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(4, 6, 12, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-box {
  width: 100%;
  max-width: 36rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.4rem;
  margin: 0;
  color: #ffffff;
}

.modal-subtitle {
  font-size: 0.86rem;
  color: var(--ch-coral-light);
  margin: 0.2rem 0 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--ch-text-on-paper-muted);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 4px;
}

.modal-close:hover {
  color: #ffffff;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
.image-preview-wrap {
  margin-top: 0.5rem;
  border-radius: var(--ch-radius-sm);
  overflow: hidden;
  max-height: 130px;
  border: 1px solid var(--ch-line);
}

.image-preview {
  width: 100%;
  height: 130px;
  object-fit: cover;
  display: block;
}
</style>
