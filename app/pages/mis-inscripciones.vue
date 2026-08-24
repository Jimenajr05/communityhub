<!--
  Página "Mis inscripciones" (ruta "/mis-inscripciones", requiere autenticación).
  Lista las actividades a las que el usuario está inscrito y permite cancelar la participación.
-->
<script setup lang="ts">
import { XCircle, Compass, CalendarDays, MapPin, Clock, Ticket } from 'lucide-vue-next';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Mis inscripciones · CommunityHub' });

const eventsStore = useEventsStore();
const cargando = ref(true);

onMounted(async () => {
  await eventsStore.obtenerMisInscripciones();
  cargando.value = false;
});

async function cancelar(eventId: string) {
  if (!confirm('¿Estás seguro de que deseas cancelar tu inscripción a esta actividad? Tu cupo será liberado para otra persona.')) return;
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
        <span class="panel-eyebrow">Tu agenda comunitaria</span>
        <h1>Mis inscripciones y pases</h1>
        <p>Actividades y encuentros comunitarios en los que tienes un cupo confirmado.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Consultando tus pases activos...</p>

      <!-- Estado vacío personalizado -->
      <div v-else-if="eventsStore.misInscripciones.length === 0" class="panel-card empty-card">
        <svg class="empty-card__glyph" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <rect x="10" y="16" width="44" height="32" rx="4" stroke="currentColor" stroke-width="1.8" opacity="0.4" />
          <path d="M10 26 H54" stroke="currentColor" stroke-width="1.8" opacity="0.4" />
          <circle cx="20" cy="36" r="3" fill="var(--ch-marigold)" opacity="0.8" />
          <circle cx="34" cy="38" r="2.5" fill="var(--ch-coral)" opacity="0.7" />
          <path d="M20 36 L34 38" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 5" opacity="0.5" />
        </svg>
        <h3>Aún no te has inscrito en ninguna actividad</h3>
        <p>Explora los talleres, deportes y eventos de la comunidad para asegurar tu lugar.</p>
        <NuxtLink to="/actividades" class="pill-btn pill-btn--primary">
          <Compass :size="16" :stroke-width="2.2" /> Explorar catálogo de actividades
        </NuxtLink>
      </div>

      <!-- Tabla de pases e inscripciones -->
      <div v-else class="data-table-wrap panel-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Actividad</th>
              <th>Fecha y Horario</th>
              <th>Punto de encuentro</th>
              <th>Estado del pase</th>
              <th>Gestión</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ins in eventsStore.misInscripciones" :key="ins._id">
              <td>
                <NuxtLink :to="`/actividad/${ins.event._id}`" class="activity-link">
                  <strong>{{ ins.event.title }}</strong>
                </NuxtLink>
              </td>
              <td>
                <div class="date-cell">
                  <span class="table-date">
                    {{ new Date(ins.event.date).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                  </span>
                  <span v-if="ins.event.time" class="table-time">{{ ins.event.time }}</span>
                </div>
              </td>
              <td>
                <span class="table-location">{{ ins.event.location }}</span>
              </td>
              <td>
                <span class="status-pill" :class="esFutura(ins.event.date) ? 'status-pill--upcoming' : 'status-pill--past'">
                  <span class="status-dot" />
                  {{ esFutura(ins.event.date) ? 'Confirmada (Próxima)' : 'Finalizada' }}
                </span>
              </td>
              <td>
                <button
                  type="button"
                  class="action-pill action-pill--cancel"
                  title="Cancelar inscripción y liberar cupo"
                  @click="cancelar(ins.event._id)"
                >
                  <XCircle :size="14" :stroke-width="2.2" /> Cancelar cupo
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
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-card__glyph {
  width: 3.5rem;
  height: 3.5rem;
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

.activity-link {
  color: #ffffff;
  text-decoration: none;
  font-size: 0.96rem;
  transition: color 0.15s ease;
}

.activity-link:hover {
  color: var(--ch-coral-light);
}

.date-cell {
  display: flex;
  flex-direction: column;
}

.table-date {
  font-weight: 600;
  color: #ffffff;
}

.table-time {
  font-size: 0.78rem;
  font-family: var(--ch-font-mono);
  color: var(--ch-text-on-paper-muted);
}

.table-location {
  color: var(--ch-text-on-paper-muted);
  font-size: 0.9rem;
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

.status-pill--upcoming {
  background: rgba(16, 185, 129, 0.15);
  color: var(--ch-leaf);
}
.status-pill--upcoming .status-dot {
  background: var(--ch-leaf);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}

.status-pill--past {
  background: rgba(148, 163, 184, 0.15);
  color: var(--ch-text-on-paper-muted);
}
.status-pill--past .status-dot {
  background: var(--ch-text-on-paper-muted);
}

.action-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-body);
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.35rem 0.85rem;
  border-radius: var(--ch-radius-full);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-pill--cancel {
  background: rgba(244, 63, 94, 0.12);
  border-color: rgba(244, 63, 94, 0.3);
  color: var(--ch-rose);
}

.action-pill--cancel:hover {
  background: var(--ch-rose);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(244, 63, 94, 0.35);
}
</style>
