<script setup lang="ts">
import type { Notificacion } from '~/stores/notifications';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Notificaciones · CommunityHub' });

const notificationsStore = useNotificationsStore();
const filtroActivo = ref<'todas' | 'sin_leer'>('todas');

onMounted(async () => {
  await notificationsStore.obtenerNotificaciones();
});

const notificacionesFiltradas = computed(() => {
  if (filtroActivo.value === 'sin_leer') {
    return notificationsStore.notificaciones.filter((n) => !n.isRead);
  }
  return notificationsStore.notificaciones;
});

function obtenerIcono(tipo: string): string {
  switch (tipo) {
    case 'reminder':
      return '⏰';
    case 'registration':
      return '🎟️';
    case 'event_update':
      return '📢';
    case 'report':
      return '📊';
    case 'system':
    default:
      return '🔔';
  }
}

function obtenerEtiquetaTipo(tipo: string): string {
  switch (tipo) {
    case 'reminder':
      return 'Recordatorio';
    case 'registration':
      return 'Inscripción';
    case 'event_update':
      return 'Actualización';
    case 'report':
      return 'Reporte';
    case 'system':
    default:
      return 'Sistema';
  }
}

function formatearFecha(fechaIso: string): string {
  if (!fechaIso) return '';
  const fecha = new Date(fechaIso);
  const hoy = new Date();
  const esHoy = fecha.toDateString() === hoy.toDateString();

  if (esHoy) {
    return `Hoy a las ${fecha.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `${fecha.toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })} · ${fecha.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })}`;
}

async function marcarLeida(notif: Notificacion) {
  if (notif.isRead) return;
  await notificationsStore.marcarLeida(notif._id);
}

async function marcarTodas() {
  await notificationsStore.marcarTodasLeidas();
}

async function eliminar(id: string) {
  await notificationsStore.eliminarNotificacion(id);
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <header class="panel-header">
        <div class="panel-header__meta">
          <span class="panel-eyebrow">Tu cuenta</span>
          <h1>Centro de Notificaciones</h1>
          <p>Avisos, recordatorios serverless de actividades y novedades en tu cuenta.</p>
        </div>

        <div v-if="notificationsStore.sinLeerCount > 0" class="panel-header__actions">
          <button type="button" class="pill-btn pill-btn--ghost" @click="marcarTodas">
            ✓ Marcar todas como leídas
          </button>
        </div>
      </header>

      <!-- Filtros / Pestañas -->
      <div class="notif-tabs">
        <button
          type="button"
          class="notif-tab"
          :class="{ 'notif-tab--active': filtroActivo === 'todas' }"
          @click="filtroActivo = 'todas'"
        >
          Todas ({{ notificationsStore.notificaciones.length }})
        </button>
        <button
          type="button"
          class="notif-tab"
          :class="{ 'notif-tab--active': filtroActivo === 'sin_leer' }"
          @click="filtroActivo = 'sin_leer'"
        >
          Sin leer ({{ notificationsStore.sinLeerCount }})
        </button>
      </div>

      <!-- Estado cargando -->
      <div v-if="notificationsStore.cargando" class="panel-empty">
        Cargando tus notificaciones…
      </div>

      <!-- Estado vacío -->
      <div
        v-else-if="notificacionesFiltradas.length === 0"
        class="panel-card empty-card"
      >
        <span class="empty-icon">🔔</span>
        <h3>No tienes notificaciones {{ filtroActivo === 'sin_leer' ? 'sin leer' : 'por ahora' }}</h3>
        <p>Cuando te inscribas a una actividad o se procese un recordatorio, aparecerá aquí.</p>
        <NuxtLink to="/actividades" class="pill-btn pill-btn--primary">
          Explorar actividades
        </NuxtLink>
      </div>

      <!-- Lista de notificaciones -->
      <div v-else class="notif-list">
        <article
          v-for="notif in notificacionesFiltradas"
          :key="notif._id"
          class="notif-item panel-card"
          :class="{ 'notif-item--unread': !notif.isRead }"
          @click="marcarLeida(notif)"
        >
          <div class="notif-item__icon" aria-hidden="true">
            {{ obtenerIcono(notif.type) }}
          </div>

          <div class="notif-item__content">
            <div class="notif-item__top">
              <div class="notif-item__tags">
                <span class="notif-tag notif-tag--{{ notif.type }}">
                  {{ obtenerEtiquetaTipo(notif.type) }}
                </span>
                <span v-if="!notif.isRead" class="notif-unread-dot" title="No leída">● Nueva</span>
              </div>
              <time class="notif-time">{{ formatearFecha(notif.createdAt) }}</time>
            </div>

            <h3 class="notif-title">{{ notif.title }}</h3>
            <p class="notif-message">{{ notif.message }}</p>

            <div v-if="notif.event?._id" class="notif-event-link">
              <NuxtLink :to="`/actividad/${notif.event._id}`" class="event-pill">
                🎟️ Ver actividad: {{ notif.event.title || 'Ver detalles' }} →
              </NuxtLink>
            </div>
          </div>

          <div class="notif-item__actions" @click.stop>
            <button
              v-if="!notif.isRead"
              type="button"
              class="notif-action-btn"
              title="Marcar como leída"
              @click="marcarLeida(notif)"
            >
              ✓
            </button>
            <button
              type="button"
              class="notif-action-btn notif-action-btn--delete"
              title="Eliminar notificación"
              @click="eliminar(notif._id)"
            >
              ✕
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.panel-header__actions {
  margin-top: 0.5rem;
}

.notif-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--ch-line);
  padding-bottom: 0.5rem;
}

.notif-tab {
  background: none;
  border: none;
  font-family: var(--ch-font-body);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ch-text-on-ink-muted);
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.notif-tab:hover {
  color: var(--ch-text-on-ink);
  background: rgba(255, 255, 255, 0.05);
}

.notif-tab--active {
  background: var(--ch-coral) !important;
  color: #ffffff !important;
}

.empty-card {
  text-align: center;
  padding: 3.5rem 1.5rem;
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
  font-size: 1.25rem;
  color: var(--ch-text-on-paper);
}

.empty-card p {
  margin: 0 0 1rem;
  color: var(--ch-text-on-paper-muted);
  max-width: 26rem;
}

.notif-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notif-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.25rem;
  align-items: flex-start;
  padding: 1.25rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
  cursor: pointer;
}

.notif-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px rgba(0, 0, 0, 0.35);
}

.notif-item--unread {
  border-left: 4px solid var(--ch-coral);
  background: var(--ch-paper);
}

.notif-item__icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--ch-paper-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.notif-item__content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.notif-item__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.notif-item__tags {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notif-tag {
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(36, 27, 78, 0.08);
  color: var(--ch-text-on-paper-muted);
}

.notif-unread-dot {
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ch-coral);
}

.notif-time {
  font-family: var(--ch-font-mono);
  font-size: 0.75rem;
  color: var(--ch-text-on-paper-muted);
}

.notif-title {
  margin: 0.15rem 0 0;
  font-size: 1.05rem;
  color: var(--ch-text-on-paper);
  font-weight: 700;
}

.notif-message {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--ch-text-on-paper-muted);
}

.notif-event-link {
  margin-top: 0.4rem;
}

.event-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ch-coral);
  text-decoration: none;
  padding: 0.25rem 0.6rem;
  border-radius: var(--ch-radius-sm);
  background: rgba(255, 107, 74, 0.08);
  transition: background 0.15s ease;
}

.event-pill:hover {
  background: rgba(255, 107, 74, 0.18);
}

.notif-item__actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.notif-action-btn {
  background: none;
  border: 1px solid var(--ch-line);
  border-radius: 50%;
  width: 1.85rem;
  height: 1.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: var(--ch-text-on-paper-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.notif-action-btn:hover {
  border-color: var(--ch-coral);
  color: var(--ch-coral);
  background: rgba(255, 107, 74, 0.08);
}

.notif-action-btn--delete:hover {
  border-color: var(--ch-error);
  color: var(--ch-error);
  background: rgba(217, 59, 59, 0.08);
}

@media (max-width: 640px) {
  .notif-item {
    grid-template-columns: 1fr auto;
  }
  .notif-item__icon {
    display: none;
  }
}
</style>
