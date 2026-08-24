<script setup lang="ts">
import type { Notificacion } from '~/stores/notifications';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Notificaciones · CommunityHub' });

const notificationsStore = useNotificationsStore();
const filtroActivo = ref<'todas' | 'sin_leer' | 'reminder' | 'registration'>('todas');
const refrescando = ref(false);

onMounted(async () => {
  await notificationsStore.obtenerNotificaciones();
});

async function refrescar() {
  refrescando.value = true;
  await notificationsStore.obtenerNotificaciones();
  refrescando.value = false;
}

const notificacionesFiltradas = computed(() => {
  if (filtroActivo.value === 'sin_leer') {
    return notificationsStore.notificaciones.filter((n) => !n.isRead);
  }
  if (filtroActivo.value === 'reminder') {
    return notificationsStore.notificaciones.filter((n) => n.type === 'reminder');
  }
  if (filtroActivo.value === 'registration') {
    return notificationsStore.notificaciones.filter((n) => n.type === 'registration');
  }
  return notificationsStore.notificaciones;
});

function obtenerIcono(tipo: string): string {
  switch (tipo) {
    case 'reminder':
      return 'REM';
    case 'registration':
      return 'INS';
    case 'event_update':
      return 'ACT';
    case 'report':
      return 'REP';
    case 'system':
    default:
      return 'NOT';
  }
}

function obtenerEtiquetaTipo(tipo: string): string {
  switch (tipo) {
    case 'reminder':
      return 'Recordatorio';
    case 'registration':
      return 'Inscripción Confirmada';
    case 'event_update':
      return 'Actualización';
    case 'report':
      return 'Reporte Serverless';
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

      <!-- Header Hero -->
      <header class="notif-hero panel-card">
        <div class="notif-hero__info">
          <div>
            <div class="notif-hero__badge">
              <span class="pulse-dot" />
              Notificaciones en tiempo real
            </div>
            <h1 class="notif-hero__title">Centro de Notificaciones</h1>
            <p class="notif-hero__desc">
              Avisos de eventos, confirmaciones de cupo y recordatorios serverless procesados por AWS Lambda.
            </p>
          </div>
        </div>

        <div class="notif-hero__actions">
          <button
            type="button"
            class="pill-btn pill-btn--ghost"
            :disabled="refrescando"
            @click="refrescar"
          >
            {{ refrescando ? 'Actualizando…' : 'Actualizar' }}
          </button>
          <button
            v-if="notificationsStore.sinLeerCount > 0"
            type="button"
            class="pill-btn pill-btn--primary"
            @click="marcarTodas"
          >
            Marcar todas como leídas
          </button>
        </div>
      </header>

      <!-- Segmented Control Tabs -->
      <div class="segmented-tabs-wrapper">
        <div class="segmented-tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn--active': filtroActivo === 'todas' }"
            @click="filtroActivo = 'todas'"
          >
            Todas
            <span class="tab-count">{{ notificationsStore.notificaciones.length }}</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn--active': filtroActivo === 'sin_leer' }"
            @click="filtroActivo = 'sin_leer'"
          >
            Sin leer
            <span v-if="notificationsStore.sinLeerCount > 0" class="tab-count tab-count--alert">
              {{ notificationsStore.sinLeerCount }}
            </span>
            <span v-else class="tab-count">0</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn--active': filtroActivo === 'reminder' }"
            @click="filtroActivo = 'reminder'"
          >
            Recordatorios
          </button>

          <button
            type="button"
            class="tab-btn"
            :class="{ 'tab-btn--active': filtroActivo === 'registration' }"
            @click="filtroActivo = 'registration'"
          >
            Inscripciones
          </button>
        </div>
      </div>

      <!-- Estado cargando -->
      <div v-if="notificationsStore.cargando" class="panel-empty">
        Consultando notificaciones en la plataforma…
      </div>

      <!-- Estado vacío estilizado -->
      <div
        v-else-if="notificacionesFiltradas.length === 0"
        class="panel-card empty-state"
      >
        <h3 class="empty-state__title">
          {{ filtroActivo === 'sin_leer' ? '¡Estás al día! No hay notificaciones sin leer' : 'No hay notificaciones en esta sección' }}
        </h3>
        <p class="empty-state__desc">
          Cuando te inscribas a una actividad comunitaria o se ejecuten procesos automatizados de AWS Lambda, recibirás aquí todos los avisos y recordatorios.
        </p>

        <div class="empty-state__tips">
          <div class="tip-card">
            <div>
              <strong>Inscripciones</strong>
              <p>Confirmación inmediata de tus cupos reservados.</p>
            </div>
          </div>
          <div class="tip-card">
            <div>
              <strong>AWS Lambda</strong>
              <p>Recordatorios serverless automáticos antes del inicio.</p>
            </div>
          </div>
        </div>

        <NuxtLink to="/actividades" class="pill-btn pill-btn--primary" style="margin-top: 0.5rem;">
          Explorar actividades comunitarias
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
          <div class="notif-item__content">
            <div class="notif-item__header">
              <div class="notif-item__tags">
                <span class="notif-type-tag" :class="`notif-type-tag--${notif.type}`">
                  {{ obtenerEtiquetaTipo(notif.type) }}
                </span>
                <span v-if="!notif.isRead" class="unread-pill">
                  ● Nueva
                </span>
              </div>
              <time class="notif-item__time">{{ formatearFecha(notif.createdAt) }}</time>
            </div>

            <h3 class="notif-item__title">{{ notif.title }}</h3>
            <p class="notif-item__message">{{ notif.message }}</p>

            <div v-if="notif.event?._id" class="notif-item__event">
              <NuxtLink :to="`/actividad/${notif.event._id}`" class="event-chip" @click.stop>
                Actividad: <strong>{{ notif.event.title || 'Ver detalles' }}</strong> →
              </NuxtLink>
            </div>
          </div>

          <div class="notif-item__actions" @click.stop>
            <button
              v-if="!notif.isRead"
              type="button"
              class="action-circle-btn"
              title="Marcar como leída"
              @click="marcarLeida(notif)"
            >
              ✓
            </button>
            <button
              type="button"
              class="action-circle-btn action-circle-btn--delete"
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
.notif-hero {
  margin-bottom: 1.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  border: 1px solid var(--ch-line);
  background: linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(25, 36, 59, 0.95) 100%);
}

.notif-hero__info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.notif-hero__icon {
  width: 3.75rem;
  height: 3.75rem;
  border-radius: var(--ch-radius-md);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.25) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  box-shadow: 0 8px 16px -4px rgba(99, 102, 241, 0.2);
}

.notif-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--ch-coral);
  background: rgba(99, 102, 241, 0.08);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  margin-bottom: 0.35rem;
}

.pulse-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
}

.notif-hero__title {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ch-text-on-paper);
}

.notif-hero__desc {
  margin: 0.2rem 0 0;
  color: var(--ch-text-on-paper-muted);
  font-size: 0.9rem;
  max-width: 32rem;
}

.notif-hero__actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

/* Segmented Control Tabs */
.segmented-tabs-wrapper {
  margin-bottom: 1.75rem;
}

.segmented-tabs {
  display: inline-flex;
  gap: 0.35rem;
  padding: 0.35rem;
  background: rgba(17, 24, 39, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  backdrop-filter: blur(8px);
  flex-wrap: wrap;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: transparent;
  border: none;
  font-family: var(--ch-font-body);
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--ch-text-on-ink-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: var(--ch-text-on-ink);
  background: rgba(255, 255, 255, 0.06);
}

.tab-btn--active {
  background: var(--ch-coral) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.tab-count {
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
}

.tab-count--alert {
  background: #f43f5e;
  color: #fff;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid var(--ch-line);
}

.empty-state__icon-box {
  width: 4.5rem;
  height: 4.5rem;
  border-radius: 50%;
  background: var(--ch-paper-2);
  border: 1px dashed var(--ch-line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.25rem;
}

.empty-state__title {
  margin: 0 0 0.5rem;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ch-text-on-paper);
}

.empty-state__desc {
  margin: 0 0 2rem;
  color: var(--ch-text-on-paper-muted);
  max-width: 28rem;
  font-size: 0.92rem;
  line-height: 1.5;
}

.empty-state__tips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1rem;
  width: 100%;
  max-width: 32rem;
  margin-bottom: 2rem;
}

.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--ch-paper-2);
  border-radius: var(--ch-radius-sm);
  border: 1px solid var(--ch-line);
  text-align: left;
}

.tip-icon {
  font-size: 1.35rem;
  line-height: 1;
}

.tip-card strong {
  display: block;
  font-size: 0.85rem;
  color: var(--ch-text-on-paper);
  margin-bottom: 0.15rem;
}

.tip-card p {
  margin: 0;
  font-size: 0.78rem;
  color: var(--ch-text-on-paper-muted);
  line-height: 1.35;
}

/* Notification List */
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.notif-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.25rem;
  align-items: flex-start;
  padding: 1.25rem 1.4rem;
  border: 1px solid var(--ch-line);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  position: relative;
  cursor: pointer;
}

.notif-item:hover {
  transform: translateY(-2px);
  border-color: var(--ch-coral);
  box-shadow: 0 12px 25px -8px rgba(0, 0, 0, 0.15);
}

.notif-item--unread {
  border-left: 4px solid var(--ch-coral);
  background: var(--ch-paper-2);
  box-shadow: 0 4px 15px -4px rgba(99, 102, 241, 0.2);
}

.notif-item__icon-wrap {
  width: 2.85rem;
  height: 2.85rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  flex-shrink: 0;
}

.notif-item__icon-wrap--reminder {
  background: rgba(245, 158, 11, 0.12);
}

.notif-item__icon-wrap--registration {
  background: rgba(99, 102, 241, 0.12);
}

.notif-item__icon-wrap--event_update {
  background: rgba(6, 182, 212, 0.12);
}

.notif-item__icon-wrap--report {
  background: rgba(16, 185, 129, 0.12);
}

.notif-item__content {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.notif-item__header {
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

.notif-type-tag {
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: var(--ch-paper-2);
  border: 1px solid var(--ch-line);
  color: var(--ch-text-on-paper-muted);
}

.unread-pill {
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ch-coral);
}

.notif-item__time {
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  color: var(--ch-text-on-paper-muted);
}

.notif-item__title {
  margin: 0.15rem 0 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--ch-text-on-paper);
}

.notif-item__message {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--ch-text-on-paper-muted);
}

.notif-item__event {
  margin-top: 0.45rem;
}

.event-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.84rem;
  color: var(--ch-coral);
  text-decoration: none;
  padding: 0.3rem 0.7rem;
  border-radius: var(--ch-radius-sm);
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  transition: all 0.15s ease;
}

.event-chip:hover {
  background: rgba(99, 102, 241, 0.16);
  border-color: var(--ch-coral);
}

.notif-item__actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.action-circle-btn {
  background: var(--ch-paper-2);
  border: 1px solid var(--ch-line);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  color: var(--ch-text-on-paper);
  cursor: pointer;
  transition: all 0.15s ease;
}

.action-circle-btn:hover {
  border-color: var(--ch-coral);
  color: var(--ch-coral);
  background: rgba(99, 102, 241, 0.08);
}

.action-circle-btn--delete:hover {
  border-color: var(--ch-error);
  color: var(--ch-error);
  background: rgba(239, 68, 68, 0.08);
}

@media (max-width: 640px) {
  .notif-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .notif-item {
    grid-template-columns: 1fr auto;
  }
  .notif-item__icon-wrap {
    display: none;
  }
}
</style>
