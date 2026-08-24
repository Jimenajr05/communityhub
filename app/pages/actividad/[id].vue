<!--
  Página de detalle de actividad (ruta /actividad/[id]).
  Muestra la información completa de una actividad y permite
  inscribirse/cancelar inscripción y marcar/quitar de favoritos.
-->
<script setup lang="ts">
import type { Actividad } from '~/stores/events';

const route = useRoute();
const authStore = useAuthStore();
const eventsStore = useEventsStore();

// Actividad actualmente mostrada, obtenida por su id de ruta
const actividad = ref<Actividad | null>(null);
// Indica si todavía se está cargando la actividad
const cargando = ref(true);
// Mensaje de error al cargar la actividad (si aplica)
const error = ref<string | null>(null);

// Indica si hay una acción (inscripción/favorito) en curso, para deshabilitar botones
const procesandoAccion = ref(false);
// Mensaje de resultado (éxito o error) tras inscribirse/cancelar o marcar/quitar favorito
const mensajeAccion = ref<{ tipo: 'exito' | 'error'; texto: string } | null>(null);
// Indica si el usuario autenticado está inscrito en la actividad
const estaInscrito = ref(false);
// Indica si el usuario autenticado tiene la actividad marcada como favorita
const esFavorito = ref(false);

/**
 * Al montar la página, carga la actividad según el id de la ruta.
 * Si el usuario está autenticado, además verifica su estado de
 * inscripción y favorito para esa actividad.
 */
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

/**
 * Consulta al API si el usuario autenticado está inscrito y/o tiene
 * como favorita la actividad indicada, actualizando los refs correspondientes.
 */
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

/**
 * Inscribe o cancela la inscripción del usuario en la actividad actual,
 * según su estado actual. Redirige a login si no está autenticado.
 */
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
      mensajeAccion.value = { tipo: 'exito', texto: 'Inscripción cancelada exitosamente.' };
    } else {
      await eventsStore.inscribirse(actividad.value._id);
      estaInscrito.value = true;
      actividad.value.spotsAvailable--;
      mensajeAccion.value = { tipo: 'exito', texto: 'Te has inscrito exitosamente a la actividad.' };
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

/**
 * Marca o quita la actividad actual de los favoritos del usuario,
 * según su estado actual. Redirige a login si no está autenticado.
 */
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
      mensajeAccion.value = { tipo: 'exito', texto: 'Guardado en tus favoritos.' };
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

// Fecha de la actividad formateada en español (ej. "lunes, 3 de marzo de 2026")
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

// Indica si la actividad ya no tiene cupos disponibles
const sinCupo = computed(() => (actividad.value?.spotsAvailable ?? 0) <= 0);
</script>

<template>
  <div class="activity-detail-page">
    <div class="activity-detail-container">
      <NuxtLink to="/actividades" class="back-link">
        ← Volver a actividades
      </NuxtLink>

      <div v-if="cargando" class="state-message" role="status">
        Cargando detalles de la actividad…
      </div>

      <div v-else-if="error || !actividad" class="state-message state-message--error" role="alert">
        <p>{{ error || 'Actividad no encontrada' }}</p>
        <NuxtLink to="/actividades" class="submit-btn back-btn">
          Ver todas las actividades
        </NuxtLink>
      </div>

      <article v-else class="activity-card">
        <header class="activity-header">
          <div class="activity-header__top">
            <div class="activity-header__tags">
              <span class="activity-category">{{ actividad.category?.name ?? 'General' }}</span>
              <span class="activity-status" :class="`activity-status--${actividad.status}`">
                {{ actividad.status === 'active' ? 'Activa' : actividad.status === 'cancelled' ? 'Cancelada' :
                'Finalizada' }}
              </span>
            </div>

            <button class="fav-btn" :class="{ 'fav-btn--active': esFavorito }" :disabled="procesandoAccion"
              @click="alternarFavorito" :title="esFavorito ? 'Quitar de favoritos' : 'Guardar en favoritos'">
              {{ esFavorito ? 'Guardado' : 'Guardar' }}
            </button>
          </div>

          <h1 class="activity-title">{{ actividad.title }}</h1>
        </header>

        <div v-if="mensajeAccion" class="action-banner" :class="`action-banner--${mensajeAccion.tipo}`">
          {{ mensajeAccion.texto }}
        </div>

        <div class="activity-meta">
          <div class="meta-item">
            <div>
              <strong>Fecha y hora</strong>
              <p>{{ fechaFormateada }} a las {{ actividad.time }}</p>
            </div>
          </div>

          <div class="meta-item">
            <div>
              <strong>Ubicación</strong>
              <p>{{ actividad.location }}</p>
            </div>
          </div>

          <div class="meta-item">
            <div>
              <strong>Organizador</strong>
              <p>{{ actividad.organizer?.firstName }} {{ actividad.organizer?.lastName }}</p>
            </div>
          </div>

          <div class="meta-item">
            <div>
              <strong>Cupos disponibles</strong>
              <p :class="{ 'spots--full': sinCupo }">
                {{ sinCupo ? 'Sin cupos disponibles' : `${actividad.spotsAvailable} de ${actividad.capacity} cupos
                libres` }}
              </p>
            </div>
          </div>
        </div>

        <section class="activity-description">
          <h2>Descripción</h2>
          <p>{{ actividad.description }}</p>
        </section>

        <footer class="activity-actions">
          <div v-if="!authStore.estaAutenticado" class="auth-prompt">
            <p>Inicia sesión o regístrate para inscribirte en esta actividad.</p>
            <NuxtLink :to="`/login?redirect=${encodeURIComponent(route.fullPath)}`" class="action-btn action-btn--primary">Iniciar Sesión</NuxtLink>
          </div>

          <template v-else>
            <button v-if="!estaInscrito" class="action-btn action-btn--primary"
              :disabled="sinCupo || actividad.status !== 'active' || procesandoAccion" @click="alternarInscripcion">
              {{ procesandoAccion ? 'Procesando…' : sinCupo ? 'Cupos Agotados' : 'Inscribirse a esta Actividad' }}
            </button>

            <button v-else class="action-btn action-btn--danger" :disabled="procesandoAccion"
              @click="alternarInscripcion">
              {{ procesandoAccion ? 'Procesando…' : 'Cancelar mi Inscripción' }}
            </button>
          </template>
        </footer>
      </article>
    </div>
  </div>
</template>

<style scoped>
.activity-detail-page {
  min-height: 100vh;
  background: var(--ch-ink-2);
  padding: 3rem 1.5rem;
  color: var(--ch-text-on-ink);
}

.activity-detail-container {
  max-width: 48rem;
  margin: 0 auto;
}

.back-link {
  display: inline-block;
  color: var(--ch-marigold);
  text-decoration: none;
  font-family: var(--ch-font-mono);
  font-size: 0.9rem;
  margin-bottom: 2rem;
  transition: opacity 0.15s ease;
}

.back-link:hover {
  opacity: 0.8;
}

.state-message {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--ch-text-on-ink-muted);
}

.state-message--error {
  color: var(--ch-text-on-ink);
}

.back-btn {
  display: inline-flex;
  margin-top: 1.5rem;
  width: auto;
  padding: 0.6rem 1.5rem;
}

.activity-card {
  background: var(--ch-paper);
  color: var(--ch-text-on-paper);
  border-radius: var(--ch-radius-md);
  padding: 2.5rem;
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.5);
}

.activity-header__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.activity-header__tags {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.fav-btn {
  background: transparent;
  border: 1px solid var(--ch-line);
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: var(--ch-font-mono);
  transition: all 0.2s ease;
}

.fav-btn--active {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #dc2626;
}

.activity-category {
  font-family: var(--ch-font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 107, 74, 0.12);
  color: var(--ch-coral-dark);
}

.activity-status {
  font-family: var(--ch-font-mono);
  font-size: 0.75rem;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.activity-status--cancelled {
  background: rgba(239, 68, 68, 0.12);
  color: #b91c1c;
}

.activity-status--finished {
  background: rgba(107, 114, 128, 0.12);
  color: #4b5563;
}

.activity-title {
  font-family: var(--ch-font-display);
  font-weight: 400;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  margin: 0 0 1.5rem;
  line-height: 1.2;
}

.action-banner {
  padding: 0.8rem 1rem;
  border-radius: var(--ch-radius-sm);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.action-banner--exito {
  background: rgba(16, 185, 129, 0.15);
  color: #047857;
}

.action-banner--error {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
}

.activity-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-top: 1px dashed var(--ch-line);
  border-bottom: 1px dashed var(--ch-line);
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.meta-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.meta-item strong {
  display: block;
  font-size: 0.8rem;
  font-family: var(--ch-font-mono);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ch-text-on-paper-muted);
  margin-bottom: 0.2rem;
}

.meta-item p {
  margin: 0;
  font-size: 0.95rem;
  color: var(--ch-text-on-paper);
}

.spots--full {
  color: var(--ch-error);
  font-weight: 600;
}

.activity-description h2 {
  font-family: var(--ch-font-display);
  font-size: 1.3rem;
  margin: 0 0 0.8rem;
}

.activity-description p {
  margin: 0;
  line-height: 1.6;
  color: var(--ch-text-on-paper-muted);
  font-size: 1.02rem;
}

.activity-actions {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ch-line);
}

.auth-prompt {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: var(--ch-sand-light);
  padding: 1rem 1.25rem;
  border-radius: var(--ch-radius-sm);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.action-btn--primary {
  background: var(--ch-coral);
  color: #ffffff;
}

.action-btn--primary:hover:not(:disabled) {
  background: var(--ch-coral-dark);
}

.action-btn--danger {
  background: #ef4444;
  color: #ffffff;
}

.action-btn--danger:hover:not(:disabled) {
  background: #dc2626;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .activity-card {
    padding: 1.5rem;
  }

  .auth-prompt {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
</style>