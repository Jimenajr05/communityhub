<script setup lang="ts">
import type { Actividad } from '~/stores/events';

definePageMeta({ middleware: 'admin' });
useHead({ title: 'Actividades · Administración' });

const eventsStore = useEventsStore();
const { apiFetch } = useApi();
const cargando = ref(true);
const actividades = ref<Actividad[]>([]);

// El listado admin debe ver todas las actividades sin importar su estado;
// el backend solo omite el filtro de "active" por defecto cuando se pasa
// `status` explícito, así que se consultan los tres estados y se combinan.
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

onMounted(cargar);

async function eliminar(actividad: Actividad) {
  if (!confirm(`¿Eliminar definitivamente "${actividad.title}"?`)) return;
  await eventsStore.eliminarActividad(actividad._id);
  await cargar();
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header">
        <span class="panel-eyebrow">Administración</span>
        <h1>Actividades</h1>
        <p>Modera cualquier actividad de la plataforma, sin importar el organizador.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando…</p>

      <div v-else class="data-table-wrap panel-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Organizador</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="actividad in actividades" :key="actividad._id">
              <td><NuxtLink :to="`/actividad/${actividad._id}`">{{ actividad.title }}</NuxtLink></td>
              <td>{{ actividad.organizer?.firstName }} {{ actividad.organizer?.lastName }}</td>
              <td>{{ new Date(actividad.date).toLocaleDateString('es-CR') }}</td>
              <td>{{ actividad.status }}</td>
              <td>
                <button type="button" class="pill-btn pill-btn--danger" @click="eliminar(actividad)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
