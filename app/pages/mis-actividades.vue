<script setup lang="ts">
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

const form = reactive({
  title: '',
  description: '',
  category: '',
  date: '',
  time: '',
  location: '',
  capacity: 20,
});

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
  mostrarFormulario.value = true;
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

async function cancelarActividad(actividad: any) {
  if (!confirm(`¿Cancelar la actividad "${actividad.title}"? Se notificará a los inscritos.`)) return;
  await eventsStore.actualizarActividad(actividad._id, { status: 'cancelled' });
  await eventsStore.buscar({ organizer: authStore.usuario?.id });
}

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
        <p>Crea, edita y administra las actividades que organizas.</p>
      </header>

      <button type="button" class="pill-btn" style="margin-bottom: 1.5rem" @click="abrirCreacion">
        + Nueva actividad
      </button>

      <div v-if="mostrarFormulario" class="panel-card">
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="actividad in eventsStore.actividades" :key="actividad._id">
              <td><NuxtLink :to="`/actividad/${actividad._id}`">{{ actividad.title }}</NuxtLink></td>
              <td>{{ new Date(actividad.date).toLocaleDateString('es-CR') }}</td>
              <td>{{ actividad.registeredCount }}</td>
              <td>{{ actividad.spotsAvailable }}</td>
              <td>{{ actividad.status }}</td>
              <td style="display: flex; gap: 0.4rem">
                <button type="button" class="pill-btn pill-btn--ghost" @click="abrirEdicion(actividad)">Editar</button>
                <button
                  v-if="actividad.status === 'active'"
                  type="button"
                  class="pill-btn pill-btn--danger"
                  @click="cancelarActividad(actividad)"
                >
                  Cancelar
                </button>
                <button type="button" class="pill-btn pill-btn--danger" @click="eliminarActividad(actividad)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
