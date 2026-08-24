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
  if (!confirm('¿Estás seguro de que deseas cancelar tu inscripción a esta actividad?')) return;
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
        <p>Actividades comunitarias en las que confirmaste tu cupo y participación.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando tus inscripciones…</p>

      <div v-else-if="eventsStore.misInscripciones.length === 0" class="panel-card empty-card">
        <h3>Aún no te has inscrito en ninguna actividad</h3>
        <p>Explora el catálogo de eventos comunitarios y asegura tu lugar en tus favoritos.</p>
        <NuxtLink to="/actividades" class="pill-btn pill-btn--primary">
          Explorar actividades
        </NuxtLink>
      </div>

      <div v-else class="data-table-wrap panel-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Fecha y Hora</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ins in eventsStore.misInscripciones" :key="ins._id">
              <td>
                <NuxtLink :to="`/actividad/${ins.event._id}`" class="activity-title-link">
                  <strong>{{ ins.event.title }}</strong>
                </NuxtLink>
              </td>
              <td>
                <span class="table-date">
                  {{ new Date(ins.event.date).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                </span>
                <span v-if="ins.event.time" class="table-time">· {{ ins.event.time }}</span>
              </td>
              <td>
                <span class="table-location">
                  {{ ins.event.location }}
                </span>
              </td>
              <td>
                <span class="status-pill" :class="esFutura(ins.event.date) ? 'status-pill--upcoming' : 'status-pill--past'">
                  <span class="status-dot" />
                  {{ esFutura(ins.event.date) ? 'Próxima' : 'Realizada' }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="action-pill action-pill--cancel"
                  title="Cancelar inscripción"
                  @click="cancelar(ins.event._id)"
                >
                  Cancelar cupo
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-card {
  text-align: center;
  padding: 3.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon {
  font-size: 2.5rem;
}

.empty-card h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--ch-text-on-paper);
}

.empty-card p {
  margin: 0 0 1.25rem;
  color: var(--ch-text-on-paper-muted);
  max-width: 26rem;
}

.activity-title-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ch-text-on-paper);
  text-decoration: none;
  font-size: 0.98rem;
  transition: color 0.15s ease;
}

.activity-title-link:hover {
  color: var(--ch-coral);
}

.activity-bullet {
  font-size: 1.1rem;
}

.table-date {
  font-weight: 600;
  color: var(--ch-text-on-paper);
  white-space: nowrap;
}

.table-time {
  font-size: 0.82rem;
  color: var(--ch-text-on-paper-muted);
}

.table-location {
  color: var(--ch-text-on-paper);
  font-size: 0.92rem;
  white-space: nowrap;
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

.status-pill--upcoming {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-pill--upcoming .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}

.status-pill--past {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}

.status-pill--past .status-dot {
  background: #94a3b8;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ch-font-body);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.4rem 0.85rem;
  border-radius: var(--ch-radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.action-pill--cancel {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.action-pill--cancel:hover {
  background: #ef4444;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}
</style>
