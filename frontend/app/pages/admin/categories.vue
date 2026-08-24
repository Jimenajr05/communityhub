<!--
  Página de administración de categorías (ruta /admin/categories).
  Solo accesible para administradores; permite crear y eliminar
  las categorías disponibles para las actividades.
-->
<script setup lang="ts">
import { Plus, Trash2, Tag, Layers } from 'lucide-vue-next';

definePageMeta({ middleware: 'admin' });
useHead({ title: 'Categorías · Administración' });

const eventsStore = useEventsStore();
const { apiFetch } = useApi();

// Nombre de la nueva categoría a crear
const nombre = ref('');
// Descripción opcional de la nueva categoría
const descripcion = ref('');
// Indica si se está guardando (creando) la categoría
const guardando = ref(false);
// Mensaje de error al crear la categoría
const error = ref('');

/** Al montar la página, carga la lista de categorías existentes. */
onMounted(() => {
  eventsStore.cargarCategorias();
});

/** Crea una nueva categoría con el nombre y descripción ingresados y refresca la lista. */
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

/** Elimina una categoría (previa confirmación) y refresca la lista. */
async function eliminar(id: string) {
  if (!confirm('¿Eliminar esta categoría? Las actividades asociadas perderán su categoría.')) return;
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
        <h1>Categorías del sistema</h1>
        <p>Crea y elimina las categorías disponibles para clasificar las actividades comunitarias.</p>
      </header>

      <div class="cat-layout">
        <!-- Formulario de creación -->
        <div class="panel-card cat-form-card">
          <div class="cat-form-header">
            <Plus :size="16" :stroke-width="2.2" />
            <h3>Registrar nueva categoría</h3>
          </div>

          <form novalidate @submit.prevent="crear">
            <div class="field">
              <label for="cat-name">Nombre de la categoría</label>
              <input id="cat-name" v-model.trim="nombre" type="text" placeholder="Ej. Robótica, Bienestar, Cocina..." required />
            </div>
            <div class="field">
              <label for="cat-desc">Descripción (opcional)</label>
              <input id="cat-desc" v-model.trim="descripcion" type="text" placeholder="Breve descripción de la categoría" />
            </div>
            <p v-if="error" class="form-error">{{ error }}</p>
            <button type="submit" class="pill-btn pill-btn--primary" style="width: 100%;" :disabled="guardando || !nombre.trim()">
              <Plus :size="15" :stroke-width="2.4" />
              {{ guardando ? 'Creando...' : 'Crear categoría' }}
            </button>
          </form>
        </div>

        <!-- Lista de categorías existentes -->
        <div class="panel-card cat-list-card">
          <div class="cat-list-header">
            <Layers :size="15" :stroke-width="2" />
            <h3>Categorías registradas</h3>
            <span class="cat-count">{{ eventsStore.categorias.length }}</span>
          </div>

          <p v-if="eventsStore.categorias.length === 0" class="panel-empty" style="padding: 2rem 1rem;">
            No hay categorías registradas aún.
          </p>

          <ul v-else class="cat-list">
            <li v-for="cat in eventsStore.categorias" :key="cat._id" class="cat-list__item">
              <div class="cat-list__info">
                <Tag :size="13" :stroke-width="2" class="cat-list__icon" />
                <span class="cat-list__name">{{ cat.name }}</span>
              </div>
              <button type="button" class="cat-remove-btn" title="Eliminar categoría" @click="eliminar(cat._id)">
                <Trash2 :size="13" :stroke-width="2.2" /> Eliminar
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cat-layout {
  display: grid;
  grid-template-columns: minmax(0, 22rem) 1fr;
  gap: 1.5rem;
  align-items: start;
}

@media (max-width: 780px) {
  .cat-layout {
    grid-template-columns: 1fr;
  }
}

.cat-form-card {
  padding: 1.75rem;
}

.cat-form-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.25rem;
  color: var(--ch-coral-light);
}

.cat-form-header h3 {
  font-size: 1.05rem;
  margin: 0;
  color: #ffffff;
}

.cat-list-card {
  padding: 1.75rem;
}

.cat-list-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1.25rem;
  color: var(--ch-marigold);
}

.cat-list-header h3 {
  font-size: 1.05rem;
  margin: 0;
  color: #ffffff;
  flex: 1;
}

.cat-count {
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.15);
  color: var(--ch-marigold);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 0.15rem 0.55rem;
  border-radius: var(--ch-radius-full);
}

.cat-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.cat-list__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px dashed var(--ch-line);
  transition: background-color 0.15s ease;
}

.cat-list__item:last-child {
  border-bottom: none;
}

.cat-list__item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.cat-list__info {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.cat-list__icon {
  color: var(--ch-text-on-paper-dim);
}

.cat-list__name {
  font-size: 0.94rem;
  font-weight: 500;
  color: #ffffff;
}

.cat-remove-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--ch-font-body);
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: var(--ch-radius-full);
  border: 1px solid rgba(244, 63, 94, 0.3);
  background: rgba(244, 63, 94, 0.1);
  color: var(--ch-rose);
  cursor: pointer;
  transition: all 0.15s ease;
}

.cat-remove-btn:hover {
  background: var(--ch-rose);
  color: #ffffff;
  border-color: var(--ch-rose);
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.35);
}
</style>
