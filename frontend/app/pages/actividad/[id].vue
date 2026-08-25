<!--
  Página de detalle de actividad (ruta /actividad/[id]).
  Diseño tipo dossier con panel lateral sticky para reserva de cupos e interacción comunitaria.
-->
<script setup lang="ts">
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  User,
  Users,
  Heart,
  CircleCheck,
  CircleX,
  Clock,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-vue-next';
import type { Actividad } from '~/stores/events';
import { useCategoryStyle } from '~/composables/useCategoryStyle';

const route = useRoute();
const authStore = useAuthStore();
const eventsStore = useEventsStore();

const actividad = ref<Actividad | null>(null);
const cargando = ref(true);
const error = ref<string | null>(null);

const procesandoAccion = ref(false);
const mensajeAccion = ref<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
const estaInscrito = ref(false);
const esFavorito = ref(false);

onMounted(async () => {
  const id = route.params.id as string;
  if (!id) {
    error.value = 'ID de actividad no válido.';
    cargando.value = false;
    return;
  }

  const res = await eventsStore.obtenerPorId(id);
  if (res) {
    actividad.value = res;
    useHead({ title: `${res.title} · CommunityHub` });

    if (authStore.estaAutenticado) {
      await verificarEstados(id);
    }
  } else {
    error.value = 'No se encontró la actividad solicitada.';
  }
  cargando.value = false;
});

async function verificarEstados(eventId: string) {
  const { apiFetch } = useApi();
  try {
    const [regRes, favRes] = await Promise.all([
      apiFetch<{ data: { isRegistered: boolean } }>(`/events/${eventId}/register/status`),
      apiFetch<{ data: { isFavorite: boolean } }>(`/events/${eventId}/favorite/status`),
    ]);
    estaInscrito.value = regRes.data.isRegistered;
    esFavorito.value = favRes.data.isFavorite;
  } catch {
  }
}

async function alternarInscripcion() {
  if (!authStore.estaAutenticado) {
    navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }
  if (!actividad.value || procesandoAccion.value) return;

  procesandoAccion.value = true;
  mensajeAccion.value = null;

  try {
    if (estaInscrito.value) {
      await eventsStore.cancelarInscripcion(actividad.value._id);
      estaInscrito.value = false;
      actividad.value.spotsAvailable++;
      actividad.value.registeredCount = Math.max(0, (actividad.value.registeredCount || 1) - 1);
      mensajeAccion.value = { tipo: 'exito', texto: 'Inscripción cancelada exitosamente.' };
    } else {
      await eventsStore.inscribirse(actividad.value._id);
      estaInscrito.value = true;
      actividad.value.spotsAvailable--;
      actividad.value.registeredCount = (actividad.value.registeredCount || 0) + 1;
      mensajeAccion.value = { tipo: 'exito', texto: 'Te has inscrito exitosamente. Tu cupo está confirmado.' };
    }
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    mensajeAccion.value = {
      tipo: 'error',
      texto: fetchError?.data?.message || 'Ocurrió un error al procesar la inscripción.',
    };
  } finally {
    procesandoAccion.value = false;
  }
}

async function alternarFavorito() {
  if (!authStore.estaAutenticado) {
    navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`);
    return;
  }
  if (!actividad.value || procesandoAccion.value) return;

  procesandoAccion.value = true;
  mensajeAccion.value = null;

  try {
    if (esFavorito.value) {
      await eventsStore.quitarFavorito(actividad.value._id);
      esFavorito.value = false;
      mensajeAccion.value = { tipo: 'exito', texto: 'Removido de tus favoritos.' };
    } else {
      await eventsStore.marcarFavorito(actividad.value._id);
      esFavorito.value = true;
      mensajeAccion.value = { tipo: 'exito', texto: 'Guardado en tus actividades favoritas.' };
    }
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    mensajeAccion.value = {
      tipo: 'error',
      texto: fetchError?.data?.message || 'Error al actualizar favoritos.',
    };
  } finally {
    procesandoAccion.value = false;
  }
}

const fechaFormateada = computed(() => {
  if (!actividad.value?.date) return '';
  const fecha = new Date(actividad.value.date);
  return new Intl.DateTimeFormat('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fecha);
});

const sinCupo = computed(() => (actividad.value?.spotsAvailable ?? 0) <= 0);

const ocupacion = computed(() => {
  if (!actividad.value || !actividad.value.capacity || actividad.value.capacity <= 0) return 0;
  return Math.min(Math.round((actividad.value.registeredCount / actividad.value.capacity) * 100), 100);
});

const categoryStyle = computed(() => useCategoryStyle(actividad.value?.category?.name));

const organizadorNombre = computed(() => {
  if (!actividad.value?.organizer) return 'Organizador Comunitario';
  return `${actividad.value.organizer.firstName || ''} ${actividad.value.organizer.lastName || ''}`.trim() || 'Organizador';
});

const organizadorIniciales = computed(() => {
  const f = actividad.value?.organizer?.firstName?.[0] || '';
  const l = actividad.value?.organizer?.lastName?.[0] || '';
  return `${f}${l}`.toUpperCase() || 'ORG';
});
</script>

<template>
  <div class="activity-detail-page">
    <div class="activity-detail-container">
      <NuxtLink to="/actividades" class="back-link">
        <ArrowLeft :size="15" :stroke-width="2.2" /> Volver a actividades
      </NuxtLink>

      <div v-if="cargando" class="state-message" role="status">
        Cargando detalles de la actividad...
      </div>

      <div v-else-if="error || !actividad" class="state-message state-message--error" role="alert">
        <p>{{ error || 'Actividad no encontrada' }}</p>
        <NuxtLink to="/actividades" class="pill-btn pill-btn--primary back-btn">
          Ver todas las actividades
        </NuxtLink>
      </div>

      <div v-else class="activity-layout" :class="categoryStyle.className">
        <!-- COLUMNA PRINCIPAL: DOSSIER DE LA ACTIVIDAD -->
        <article class="activity-dossier">
          <header class="dossier-header">
            <div class="dossier-header__badges">
              <span class="dossier-category">
                <span class="dossier-category__dot" />
                {{ actividad.category?.name ?? 'Comunidad' }}
              </span>

              <span class="dossier-status" :class="`dossier-status--${actividad.status}`">
                <span class="status-dot" />
                {{ actividad.status === 'active' ? 'Activa' : actividad.status === 'cancelled' ? 'Cancelada' : 'Finalizada' }}
              </span>
            </div>

            <h1 class="dossier-title">{{ actividad.title }}</h1>

            <div class="dossier-organizer">
              <div class="dossier-organizer__avatar">
                <img
                  v-if="actividad.organizer?.profilePicture"
                  :src="actividad.organizer.profilePicture"
                  :alt="organizadorNombre"
                  class="dossier-organizer__avatar-img"
                />
                <span v-else>{{ organizadorIniciales }}</span>
              </div>
              <div class="dossier-organizer__info">
                <span class="dossier-organizer__label">Organizado por</span>
                <strong class="dossier-organizer__name">{{ organizadorNombre }}</strong>
              </div>
            </div>
          </header>

          <!-- Banner de feedback de inscripción / favorito -->
          <div v-if="mensajeAccion" class="action-banner" :class="`action-banner--${mensajeAccion.tipo}`">
            <Check v-if="mensajeAccion.tipo === 'exito'" :size="16" :stroke-width="2.2" />
            <CircleX v-else :size="16" :stroke-width="2.2" />
            <span>{{ mensajeAccion.texto }}</span>
          </div>

          <!-- Cuadrícula de coordenadas y metadatos de encuentro -->
          <div class="dossier-meta-grid">
            <div class="dossier-meta-item">
              <div class="dossier-meta-icon"><CalendarDays :size="20" :stroke-width="2" /></div>
              <div>
                <strong>Fecha</strong>
                <p>{{ fechaFormateada }}</p>
              </div>
            </div>

            <div class="dossier-meta-item">
              <div class="dossier-meta-icon"><Clock :size="20" :stroke-width="2" /></div>
              <div>
                <strong>Horario</strong>
                <p>{{ actividad.time || 'Por confirmar' }}</p>
              </div>
            </div>

            <div class="dossier-meta-item">
              <div class="dossier-meta-icon"><MapPin :size="20" :stroke-width="2" /></div>
              <div>
                <strong>Punto de encuentro</strong>
                <p>{{ actividad.location }}</p>
              </div>
            </div>
          </div>

          <!-- Descripción detallada -->
          <section class="dossier-description">
            <h2>Acerca de esta actividad</h2>
            <p>{{ actividad.description }}</p>
          </section>

          <!-- Compromiso comunitario -->
          <section class="dossier-community-note">
            <div class="community-note-icon">
              <ShieldCheck :size="20" :stroke-width="2" />
            </div>
            <div>
              <h3>Participación en Comunidad</h3>
              <p>
                Al inscribirte te comprometes a asistir puntualmente. Si no puedes acudir, cancela tu inscripción desde este mismo panel para liberar tu cupo a otra persona.
              </p>
            </div>
          </section>
        </article>

        <!-- COLUMNA LATERAL: PASE DE PARTICIPACIÓN (STICKY) -->
        <aside class="activity-sidebar">
          <div class="reservation-box">
            <div class="reservation-box__top">
              <span class="reservation-box__badge">
                <Sparkles :size="13" :stroke-width="2.2" /> Pase de Actividad
              </span>

              <button
                type="button"
                class="fav-toggle-btn"
                :class="{ 'fav-toggle-btn--active': esFavorito }"
                :disabled="procesandoAccion"
                :title="esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'"
                @click="alternarFavorito"
              >
                <Heart :size="16" :stroke-width="2.2" :fill="esFavorito ? 'currentColor' : 'none'" />
              </button>
            </div>

            <!-- Medidor de capacidad -->
            <div class="reservation-capacity">
              <div class="reservation-capacity__header">
                <span class="reservation-capacity__label">
                  <Users :size="14" :stroke-width="2.2" />
                  {{ actividad.registeredCount }} de {{ actividad.capacity }} inscritos
                </span>
                <span class="reservation-capacity__pct">{{ ocupacion }}%</span>
              </div>

              <div class="reservation-capacity__bar">
                <div
                  class="reservation-capacity__fill"
                  :class="{ 'reservation-capacity__fill--full': sinCupo }"
                  :style="{ width: `${ocupacion}%` }"
                />
              </div>

              <div class="reservation-capacity__spots" :class="{ 'spots--full': sinCupo }">
                <component :is="sinCupo ? CircleX : CircleCheck" :size="14" :stroke-width="2.2" />
                <span>{{ sinCupo ? 'Cupos agotados para esta actividad' : `${actividad.spotsAvailable} cupos disponibles ahora` }}</span>
              </div>
            </div>

            <!-- Botones de acción según autenticación y rol -->
            <div v-if="!authStore.estaAutenticado" class="reservation-auth-prompt">
              <p>Inicia sesión o regístrate para asegurar tu lugar en esta actividad.</p>
              <NuxtLink
                :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`"
                class="pill-btn pill-btn--primary reservation-btn"
              >
                Iniciar sesión para inscribirme
              </NuxtLink>
            </div>

            <template v-else>
              <button
                v-if="!estaInscrito"
                class="pill-btn pill-btn--primary reservation-btn"
                :disabled="sinCupo || actividad.status !== 'active' || procesandoAccion"
                @click="alternarInscripcion"
              >
                {{ procesandoAccion ? 'Procesando...' : sinCupo ? 'Cupos agotados' : 'Inscribirme a esta actividad' }}
              </button>

              <button
                v-else
                class="pill-btn pill-btn--danger reservation-btn"
                :disabled="procesandoAccion"
                @click="alternarInscripcion"
              >
                {{ procesandoAccion ? 'Cancelando...' : 'Cancelar mi inscripción' }}
              </button>
            </template>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.activity-detail-page {
  min-height: calc(100vh - 4.5rem);
  background: radial-gradient(circle at 50% 0%, var(--ch-ink-soft) 0%, var(--ch-ink-2) 100%);
  padding: 2.75rem 1.5rem 5rem;
  color: var(--ch-text-on-ink);
}

.activity-detail-container {
  max-width: 76rem;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--ch-text-on-ink-muted);
  text-decoration: none;
  font-family: var(--ch-font-mono);
  font-size: 0.84rem;
  margin-bottom: 2rem;
  transition: color 0.15s ease;
}

.back-link:hover {
  color: var(--ch-coral-light);
}

.state-message {
  text-align: center;
  padding: 4.5rem 1rem;
  color: var(--ch-text-on-ink-muted);
  font-size: 1.05rem;
}

.state-message--error {
  color: var(--ch-rose);
}

.back-btn {
  margin-top: 1.5rem;
}

.activity-layout {
  display: grid;
  grid-template-columns: 1fr 22rem;
  gap: 2rem;
  align-items: start;
}

/* Columna principal */
.activity-dossier {
  background: var(--ch-paper);
  border: 1px solid var(--ch-line);
  border-radius: var(--ch-radius-md);
  padding: 2.5rem;
  box-shadow: var(--ch-shadow-md);
  position: relative;
  overflow: hidden;
}

.activity-dossier::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--cat-color, var(--ch-coral)), var(--ch-marigold));
}

.dossier-header__badges {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-bottom: 1.25rem;
}

.dossier-category {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: var(--ch-radius-full);
  background: rgba(124, 92, 252, 0.12);
  color: var(--cat-color, var(--ch-coral-light));
  border: 1px solid rgba(124, 92, 252, 0.3);
}

.dossier-category__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.dossier-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  padding: 0.3rem 0.8rem;
  border-radius: var(--ch-radius-full);
  background: rgba(16, 185, 129, 0.12);
  color: var(--ch-leaf);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.dossier-status--cancelled {
  background: rgba(244, 63, 94, 0.12);
  color: var(--ch-rose);
  border-color: rgba(244, 63, 94, 0.3);
}

.dossier-status--finished {
  background: rgba(148, 163, 184, 0.12);
  color: var(--ch-text-on-paper-muted);
  border-color: var(--ch-line-strong);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.dossier-title {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  line-height: 1.15;
  margin: 0 0 1.25rem;
  color: #ffffff;
}

.dossier-organizer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: var(--ch-radius-sm);
  background: var(--ch-paper-2);
  border: 1px solid var(--ch-line);
  margin-bottom: 2rem;
  width: fit-content;
}

.dossier-organizer__avatar {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ch-coral) 0%, var(--ch-marigold) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ch-font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  color: #04060c;
  overflow: hidden;
  flex-shrink: 0;
}

.dossier-organizer__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dossier-organizer__info {
  display: flex;
  flex-direction: column;
}

.dossier-organizer__label {
  font-size: 0.72rem;
  color: var(--ch-text-on-paper-dim);
  font-family: var(--ch-font-mono);
  text-transform: uppercase;
}

.dossier-organizer__name {
  font-size: 0.92rem;
  color: #ffffff;
}

.action-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.9rem 1.15rem;
  border-radius: var(--ch-radius-sm);
  margin-bottom: 1.75rem;
  font-size: 0.92rem;
  font-weight: 500;
}

.action-banner--exito {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #6ee7b7;
}

.action-banner--error {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fca5a5;
}

.dossier-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1.25rem;
  padding: 1.75rem 0;
  border-top: 1px dashed var(--ch-line);
  border-bottom: 1px dashed var(--ch-line);
  margin-bottom: 2rem;
}

.dossier-meta-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.dossier-meta-icon {
  color: var(--ch-coral-light);
  background: rgba(124, 92, 252, 0.1);
  padding: 0.5rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dossier-meta-item strong {
  display: block;
  font-size: 0.74rem;
  font-family: var(--ch-font-mono);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ch-text-on-paper-muted);
  margin-bottom: 0.2rem;
}

.dossier-meta-item p {
  margin: 0;
  font-size: 0.96rem;
  color: #ffffff;
}

.dossier-description {
  margin-bottom: 2rem;
}

.dossier-description h2 {
  font-size: 1.25rem;
  margin: 0 0 0.85rem;
  color: #ffffff;
}

.dossier-description p {
  margin: 0;
  line-height: 1.7;
  color: var(--ch-text-on-paper-muted);
  font-size: 1.02rem;
  white-space: pre-line;
}

.dossier-community-note {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.4rem;
  border-radius: var(--ch-radius-sm);
  background: rgba(15, 21, 40, 0.6);
  border: 1px solid var(--ch-line);
}

.community-note-icon {
  color: var(--ch-leaf);
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.dossier-community-note h3 {
  font-size: 0.95rem;
  margin: 0 0 0.25rem;
  color: #ffffff;
}

.dossier-community-note p {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: var(--ch-text-on-paper-muted);
}

/* Barra lateral */
.activity-sidebar {
  position: sticky;
  top: 5.5rem;
}

.reservation-box {
  background: var(--ch-paper);
  border: 1px solid var(--ch-line);
  border-radius: var(--ch-radius-md);
  padding: 1.75rem;
  box-shadow: var(--ch-shadow-lg);
}

.reservation-box__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.reservation-box__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ch-marigold);
}

.fav-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--ch-line-strong);
  color: var(--ch-text-on-paper-muted);
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.fav-toggle-btn:hover {
  border-color: var(--ch-rose);
  color: var(--ch-rose);
  background: rgba(244, 63, 94, 0.1);
  transform: scale(1.05);
}

.fav-toggle-btn--active {
  background: rgba(244, 63, 94, 0.15);
  border-color: var(--ch-rose);
  color: var(--ch-rose);
}

.reservation-capacity {
  margin-bottom: 1.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--ch-line);
}

.reservation-capacity__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.reservation-capacity__label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.84rem;
  color: var(--ch-text-on-paper-muted);
}

.reservation-capacity__pct {
  font-family: var(--ch-font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
}

.reservation-capacity__bar {
  height: 7px;
  border-radius: var(--ch-radius-full);
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-bottom: 0.65rem;
}

.reservation-capacity__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ch-coral) 0%, var(--ch-marigold) 100%);
  border-radius: var(--ch-radius-full);
  transition: width 0.4s ease;
}

.reservation-capacity__fill--full {
  background: var(--ch-error);
}

.reservation-capacity__spots {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-family: var(--ch-font-mono);
  color: var(--ch-leaf);
}

.spots--full {
  color: var(--ch-rose);
  font-weight: 600;
}

.reservation-auth-prompt p {
  font-size: 0.88rem;
  color: var(--ch-text-on-paper-muted);
  margin-bottom: 1rem;
}

.reservation-btn {
  width: 100%;
  padding: 0.85rem 1.25rem;
  font-size: 0.95rem;
}

@media (max-width: 940px) {
  .activity-layout {
    grid-template-columns: 1fr;
  }
  .activity-sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .activity-dossier {
    padding: 1.5rem;
  }
}
</style>
