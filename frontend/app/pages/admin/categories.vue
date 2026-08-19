<script setup lang="ts">
definePageMeta({ middleware: 'admin' });
useHead({ title: 'Categorías · Administración' });

const eventsStore = useEventsStore();
const { apiFetch } = useApi();

const nombre = ref('');
const descripcion = ref('');
const guardando = ref(false);
const error = ref('');

onMounted(() => {
  eventsStore.cargarCategorias();
});

async function crear() {
  if (!nombre.value.trim()) return;
  guardando.value = true;
  error.value = '';
  try {
    await apiFetch('/categories', { method: 'POST', body: { name: nombre.value, description: descripcion.value } });
    nombre.value = '';
    descripcion.value = '';
    await eventsStore.cargarCategorias();
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    error.value = fetchError?.data?.message ?? 'No pudimos crear la categoría.';
  } finally {
    guardando.value = false;
  }
}

async function eliminar(id: string) {
  if (!confirm('¿Eliminar esta categoría?')) return;
  await apiFetch(`/categories/${id}`, { method: 'DELETE' });
  await eventsStore.cargarCategorias();
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header">
        <span class="panel-eyebrow">Administración</span>
        <h1>Categorías</h1>
        <p>Crea y elimina las categorías disponibles para las actividades.</p>
      </header>

      <div class="panel-card" style="max-width: 30rem">
        <form novalidate @submit.prevent="crear">
          <div class="field">
            <label>Nombre</label>
            <input v-model.trim="nombre" type="text" required />
          </div>
          <div class="field">
            <label>Descripción (opcional)</label>
            <input v-model.trim="descripcion" type="text" />
          </div>
          <p v-if="error" class="form-error">{{ error }}</p>
          <button type="submit" class="submit-btn" :disabled="guardando">
            {{ guardando ? 'Creando…' : 'Crear categoría' }}
          </button>
        </form>
      </div>

      <div class="panel-card" style="margin-top: 1.25rem">
        <ul style="list-style: none; margin: 0; padding: 0">
          <li
            v-for="cat in eventsStore.categorias"
            :key="cat._id"
            style="display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0; border-bottom: 1px dashed var(--ch-line)"
          >
            <span>{{ cat.name }}</span>
            <button type="button" class="pill-btn pill-btn--danger" @click="eliminar(cat._id)">Eliminar</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
