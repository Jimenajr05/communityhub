<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
useHead({ title: 'Mis inscripciones · CommunityHub' });

const eventsStore = useEventsStore();
const cargando = ref(true);

onMounted(async () => {
  await eventsStore.obtenerMisInscripciones();
  cargando.value = false;
});

async function cancelar(eventId: string) {
  await eventsStore.cancelarInscripcion(eventId);
}

function esFutura(fecha: string) {
  return new Date(fecha) >= new Date();
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">

      <header class="panel-header">
        <span class="panel-eyebrow">Tu cuenta</span>
        <h1>Mis inscripciones</h1>
        <p>Actividades en las que ya confirmaste tu participación.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando…</p>

      <p v-else-if="eventsStore.misInscripciones.length === 0" class="panel-empty">
        Aún no te has inscrito en ninguna actividad.
      </p>

      <div v-else class="data-table-wrap panel-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Fecha</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ins in eventsStore.misInscripciones" :key="ins._id">
              <td><NuxtLink :to="`/actividad/${ins.event._id}`">{{ ins.event.title }}</NuxtLink></td>
              <td>{{ new Date(ins.event.date).toLocaleDateString('es-CR') }} · {{ ins.event.time }}</td>
              <td>{{ ins.event.location }}</td>
              <td>{{ esFutura(ins.event.date) ? 'Próxima' : 'Pasada' }}</td>
              <td>
                <button type="button" class="pill-btn pill-btn--danger" @click="cancelar(ins.event._id)">
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
