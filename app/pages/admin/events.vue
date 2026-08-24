<!--
  Página de administración de actividades (ruta /admin/events).
  Solo accesible para administradores; permite moderar (listar y
  eliminar) cualquier actividad de la plataforma.
-->
<script setup lang="ts">
import type { Actividad } from '~/stores/events';

definePageMeta({ middleware: 'admin' });
useHead({ title: 'Actividades · Administración' });

const eventsStore = useEventsStore();
const { apiFetch } = useApi();
// Indica si las actividades todavía se están cargando
const cargando = ref(true);
// Lista combinada de actividades (activas, canceladas y finalizadas)
const actividades = ref<Actividad[]>([]);

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

/** Elimina definitivamente una actividad (previa confirmación) y refresca la lista. */
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
