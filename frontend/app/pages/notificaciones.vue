<!--
  Página "Centro de notificaciones" (ruta "/notificaciones", requiere autenticación).
  Muestra las notificaciones en tiempo real, recordatorios y confirmaciones.
-->
<script setup lang="ts">
import {
  Check,
  X,
  RadioTower,
  BellRing,
  RotateCw,
  Clock,
  Ticket,
  CalendarCheck2,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-vue-next';
import type { Notificacion } from '~/stores/notifications';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Centro de Notificaciones · CommunityHub' });

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

function obtenerEtiquetaTipo(tipo: string): string {
  switch (tipo) {
    case 'reminder':
      return 'Recordatorio de actividad';
    case 'registration':
      return 'Inscripción confirmada';
    case 'event_update':
      return 'Actualización de evento';
    case 'report':
      return 'Reporte comunitario';
    case 'system':
    default:
      return 'Aviso del sistema';
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

      <!-- CABECERA DEL CENTRO DE NOTIFICACIONES -->
      <header class="notif-hero panel-card">
        <div class="notif-hero__info">
          <div class="notif-hero__badge">
            <RadioTower :size="13" :stroke-width="2.2" />
            <span>Señal en tiempo real · Serveless AWS Lambda</span>
          </div>
          <h1 class="notif-hero__title">Centro de Avisos y Notificaciones</h1>
          <p class="notif-hero__desc">
            Confirmaciones de cupo, recordatorios automáticos de tus actividades y avisos de la comunidad.
          </p>
        </div>

        <div class="notif-hero__actions">
          <button
            type="button"
            class="pill-btn pill-btn--ghost"
            :disabled="refrescando"
            @click="refrescar"
          >
            <RotateCw :size="14" :stroke-width="2.2" :class="{ 'spin-anim': refrescando }" />
            <span>{{ refrescando ? 'Actualizando...' : 'Actualizar' }}</span>
          </button>

          <button
            v-if="notificationsStore.sinLeerCount > 0"
            type="button"
            class="pill-btn pill-btn--primary"
            @click="marcarTodas"
          >
            <Check :size="15" :stroke-width="2.4" /> Marcar todas leídas
          </button>
        </div>
      </header>

      <!-- PESTAÑAS DE FILTRO SEGMENTADAS -->
      <div class="tabs-bar">
        <button
          type="button"
          class="tab-pill"
          :class="{ 'tab-pill--active': filtroActivo === 'todas' }"
          @click="filtroActivo = 'todas'"
        >
          Todas
          <span class="tab-count">{{ notificationsStore.notificaciones.length }}</span>
        </button>

        <button
          type="button"
          class="tab-pill"
          :class="{ 'tab-pill--active': filtroActivo === 'sin_leer' }"
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
          class="tab-pill"
          :class="{ 'tab-pill--active': filtroActivo === 'reminder' }"
          @click="filtroActivo = 'reminder'"
        >
          Recordatorios
        </button>

        <button
          type="button"
          class="tab-pill"
          :class="{ 'tab-pill--active': filtroActivo === 'registration' }"
          @click="filtroActivo = 'registration'"
        >
          Inscripciones
        </button>
      </div>

      <!-- ESTADO DE CARGA -->
      <p v-if="notificationsStore.cargando" class="panel-empty">Consultando avisos en la red...</p>

      <!-- ESTADO VACÍO -->
      <div v-else-if="notificacionesFiltradas.length === 0" class="panel-card empty-card">
        <svg class="empty-card__glyph" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 6" opacity="0.35" />
          <path d="M32 18 C25 18 20 23 20 30 C20 38 16 42 16 42 H48 C48 42 44 38 44 30 C44 23 39 18 32 18 Z" stroke="currentColor" stroke-width="1.8" />
          <circle cx="32" cy="48" r="3" fill="var(--ch-marigold)" />
        </svg>
        <h3>No tienes notificaciones en esta sección</h3>
        <p>Los recordatorios de actividades, cambios de horario y confirmaciones de cupos aparecerán aquí.</p>
      </div>

      <!-- LISTA DE NOTIFICACIONES -->
      <div v-else class="notif-list">
        <article
          v-for="notif in notificacionesFiltradas"
          :key="notif._id"
          class="notif-item panel-card"
          :class="{ 'notif-item--unread': !notif.isRead }"
          @click="marcarLeida(notif)"
        >
          <div class="notif-item__icon-wrap" :class="`notif-icon--${notif.type || 'system'}`">
            <CalendarCheck2 v-if="notif.type === 'reminder'" :size="18" :stroke-width="2" />
            <Ticket v-else-if="notif.type === 'registration'" :size="18" :stroke-width="2" />
            <AlertCircle v-else-if="notif.type === 'event_update'" :size="18" :stroke-width="2" />
            <BellRing v-else :size="18" :stroke-width="2" />
          </div>

          <div class="notif-item__body">
            <div class="notif-item__top">
              <span class="notif-item__type-tag">{{ obtenerEtiquetaTipo(notif.type) }}</span>
              <span class="notif-item__time">{{ formatearFecha(notif.createdAt) }}</span>
            </div>

            <p class="notif-item__message">{{ notif.message }}</p>

            <div v-if="notif.event" class="notif-item__event-link">
              <NuxtLink :to="`/actividad/${notif.event._id || notif.event}`" class="event-ref">
                Ver actividad relacionada →
              </NuxtLink>
            </div>
          </div>

          <div class="notif-item__actions" @click.stop>
            <span v-if="!notif.isRead" class="unread-dot" title="Aviso no leído" />
            <button
              type="button"
              class="notif-delete-btn"
              title="Eliminar notificación"
              @click="eliminar(notif._id)"
            >
              <X :size="14" :stroke-width="2.2" />
            </button>
          </div>
        </article>
      </div>

    </div>
  </div>
</template>

<style scoped>
.notif-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 2rem 2.25rem;
}

.notif-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ch-marigold);
  margin-bottom: 0.45rem;
}

.notif-hero__title {
  font-size: 1.75rem;
  margin: 0 0 0.35rem;
  color: #ffffff;
}

.notif-hero__desc {
  margin: 0;
  color: var(--ch-text-on-ink-muted);
  font-size: 0.94rem;
}

.notif-hero__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pestañas de filtro */
.tabs-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
}

.tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--ch-font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  padding: 0.45rem 1rem;
  border-radius: var(--ch-radius-full);
  border: 1px solid var(--ch-line-strong);
  background: rgba(15, 21, 40, 0.7);
  color: var(--ch-text-on-ink-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab-pill:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.tab-pill--active {
  background: var(--ch-coral) !important;
  border-color: var(--ch-coral) !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 2px 10px var(--ch-coral-glow);
}

.tab-count {
  font-size: 0.7rem;
  font-family: var(--ch-font-mono);
  background: rgba(255, 255, 255, 0.1);
  padding: 0.1rem 0.45rem;
  border-radius: var(--ch-radius-full);
}

.tab-count--alert {
  background: var(--ch-marigold);
  color: #04060c;
  font-weight: 700;
}

/* Estado vacío */
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
  margin: 0;
}

/* Lista de notificaciones */
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.notif-item:hover {
  border-color: var(--ch-line-strong);
  background: var(--ch-paper-2);
}

.notif-item--unread {
  border-left: 3px solid var(--ch-coral);
  background: linear-gradient(90deg, rgba(124, 92, 252, 0.08) 0%, var(--ch-paper) 40%);
}

.notif-item__icon-wrap {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon--reminder {
  background: rgba(245, 158, 11, 0.15);
  color: var(--ch-marigold);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.notif-icon--registration {
  background: rgba(16, 185, 129, 0.15);
  color: var(--ch-leaf);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.notif-icon--event_update {
  background: rgba(124, 92, 252, 0.15);
  color: var(--ch-coral-light);
  border: 1px solid rgba(124, 92, 252, 0.3);
}

.notif-icon--system {
  background: rgba(148, 163, 184, 0.15);
  color: var(--ch-text-on-paper-muted);
  border: 1px solid var(--ch-line-strong);
}

.notif-item__body {
  flex: 1;
}

.notif-item__top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.notif-item__type-tag {
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
  color: #ffffff;
}

.notif-item__time {
  font-size: 0.76rem;
  font-family: var(--ch-font-mono);
  color: var(--ch-text-on-paper-dim);
}

.notif-item__message {
  margin: 0 0 0.4rem;
  font-size: 0.94rem;
  color: var(--ch-text-on-paper);
  line-height: 1.5;
}

.event-ref {
  font-family: var(--ch-font-mono);
  font-size: 0.8rem;
  color: var(--ch-coral-light);
  text-decoration: none;
}

.event-ref:hover {
  text-decoration: underline;
}

.notif-item__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ch-coral);
  box-shadow: 0 0 8px var(--ch-coral-glow);
}

.notif-delete-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--ch-line-strong);
  color: var(--ch-text-on-paper-muted);
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.notif-delete-btn:hover {
  background: rgba(244, 63, 94, 0.15);
  border-color: var(--ch-rose);
  color: var(--ch-rose);
}

@media (max-width: 780px) {
  .notif-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
  }
}
</style>
