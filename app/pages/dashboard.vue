<!--
  Página de dashboard del usuario autenticado (ruta /dashboard).
  Muestra un resumen y métricas personalizadas según el rol del
  usuario (usuario, organizador o administrador).
-->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
useHead({ title: 'Dashboard · CommunityHub' });

const authStore = useAuthStore();
const { apiFetch } = useApi();

// Forma de la respuesta del endpoint de dashboard
interface DashboardRespuesta {
  success: boolean;
  data: { role: string; metrics: Record<string, any> };
}

// Métricas del dashboard según el rol del usuario (o null mientras cargan)
const metrics = ref<Record<string, any> | null>(null);
// Indica si las métricas todavía se están cargando
const cargando = ref(true);
// Mensaje de error al cargar las métricas
const error = ref('');

/** Al montar la página, obtiene las métricas del dashboard correspondientes al usuario. */
onMounted(async () => {
  try {
    const res = await apiFetch<DashboardRespuesta>('/dashboard');
    metrics.value = res.data.metrics;
  } catch {
    error.value = 'No pudimos cargar tu dashboard. Intenta de nuevo más tarde.';
  } finally {
    cargando.value = false;
  }
});

// Rol del usuario autenticado, usado para decidir qué métricas y accesos mostrar
const rol = computed(() => authStore.usuario?.role);
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">

      <header class="dash-hero panel-card">
        <div class="dash-hero__info">
          <div class="dash-hero__avatar">
            <img
              v-if="authStore.usuario?.profilePicture"
              :src="authStore.usuario.profilePicture"
              alt="Foto de perfil"
              class="dash-hero__avatar-img"
            />
            <span v-else>
              {{ authStore.usuario?.firstName?.[0] || 'U' }}{{ authStore.usuario?.lastName?.[0] || '' }}
            </span>
          </div>
          <div>
            <div class="dash-hero__role-badge">
              <span class="role-dot" />
              {{ rol === 'administrador' ? 'Panel de Administrador' : rol === 'organizador' ? 'Perfil Organizador' : 'Miembro Comunitario' }}
            </div>
            <h1 class="dash-hero__title">Hola, {{ authStore.usuario?.firstName }}</h1>
            <p class="dash-hero__desc">Resumen en tiempo real de tu actividad y estadísticas en CommunityHub.</p>
          </div>
        </div>

        <div class="dash-hero__actions">
          <NuxtLink to="/actividades" class="pill-btn pill-btn--primary">
            Explorar actividades
          </NuxtLink>
          <NuxtLink v-if="rol === 'organizador' || rol === 'administrador'" to="/mis-actividades" class="pill-btn pill-btn--secondary">
            + Nueva actividad
          </NuxtLink>
          <NuxtLink v-if="rol === 'administrador'" to="/admin" class="pill-btn pill-btn--ghost">
            Administración
          </NuxtLink>
        </div>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando métricas de tu cuenta…</p>
      <p v-else-if="error" class="panel-empty">{{ error }}</p>

      <template v-else-if="metrics">
        <div v-if="rol === 'usuario'" class="metric-grid">
          <NuxtLink to="/mis-inscripciones" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.registrationsCount }}</span>
              <span class="metric-card__label">Inscripciones confirmadas</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/actividades" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.upcomingCount }}</span>
              <span class="metric-card__label">Próximas actividades</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/favoritos" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.favoritesCount }}</span>
              <span class="metric-card__label">Actividades favoritas</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/notificaciones" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.unreadNotificationsCount }}</span>
              <span class="metric-card__label">Notificaciones sin leer</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>
        </div>

        <div v-else-if="rol === 'organizador'" class="metric-grid">
          <NuxtLink to="/mis-actividades" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.totalEvents }}</span>
              <span class="metric-card__label">Actividades creadas</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/mis-actividades" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.activeEventsCount }}</span>
              <span class="metric-card__label">Actividades activas</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/mis-actividades" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.cancelledEventsCount }}</span>
              <span class="metric-card__label">Canceladas</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/mis-actividades" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.totalParticipants }}</span>
              <span class="metric-card__label">Participantes totales</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>
        </div>

        <div v-else-if="rol === 'administrador'" class="metric-grid">
          <NuxtLink to="/admin/users" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.totalUsers }}</span>
              <span class="metric-card__label">Usuarios registrados</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/users" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.totalOrganizers }}</span>
              <span class="metric-card__label">Organizadores</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/events" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.totalEvents }}</span>
              <span class="metric-card__label">Total actividades</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/events" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.totalRegistrations }}</span>
              <span class="metric-card__label">Inscripciones globales</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/events" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.activeEvents }}</span>
              <span class="metric-card__label">Actividades activas</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>

          <NuxtLink to="/admin/events" class="metric-card">
            <div class="metric-card__body">
              <span class="metric-card__value">{{ metrics.finishedEvents }}</span>
              <span class="metric-card__label">Finalizadas</span>
            </div>
            <span class="metric-card__arrow">→</span>
          </NuxtLink>
        </div>

        <div class="panel-card activity-feed" v-if="rol === 'usuario' && metrics.upcomingEvents?.length">
          <div class="activity-feed__header">
            <h3>Tus próximas actividades</h3>
            <NuxtLink to="/mis-inscripciones" class="feed-link">Ver todas →</NuxtLink>
          </div>
          <ul class="activity-feed__list">
            <li v-for="ev in metrics.upcomingEvents" :key="ev._id" class="activity-feed__item">
              <NuxtLink :to="`/actividad/${ev._id}`" class="feed-item-link">
                <span class="feed-item-title">{{ ev.title }}</span>
                <span class="feed-item-badge">Ver detalle →</span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="panel-card activity-feed" v-if="rol === 'organizador' && metrics.recentEvents?.length">
          <div class="activity-feed__header">
            <h3>Tus eventos recientes</h3>
            <NuxtLink to="/mis-actividades" class="feed-link">Administrar todos →</NuxtLink>
          </div>
          <ul class="activity-feed__list">
            <li v-for="ev in metrics.recentEvents" :key="ev._id" class="activity-feed__item">
              <NuxtLink :to="`/actividad/${ev._id}`" class="feed-item-link">
                <span class="feed-item-title">{{ ev.title }}</span>
                <span class="feed-item-badge">Gestionar →</span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </template>

    </div>
  </div>
</template>

<style scoped>
.dash-hero {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  border: 1px solid var(--ch-line);
  background: linear-gradient(135deg, rgba(18, 26, 44, 0.95) 0%, rgba(25, 36, 59, 0.95) 100%);
}

.dash-hero__info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.dash-hero__avatar {
  width: 4rem;
  height: 4rem;
  border-radius: var(--ch-radius-md);
  background: linear-gradient(135deg, var(--ch-coral) 0%, #8b5cf6 100%);
  color: #ffffff;
  font-family: var(--ch-font-display);
  font-weight: 700;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
  flex-shrink: 0;
  overflow: hidden;
}

.dash-hero__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dash-hero__role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  color: var(--ch-coral);
  background: rgba(99, 102, 241, 0.08);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  margin-bottom: 0.4rem;
}

.role-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 50%;
  background: var(--ch-coral);
}

.dash-hero__title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--ch-text-on-paper);
}

.dash-hero__desc {
  margin: 0.2rem 0 0;
  color: var(--ch-text-on-paper-muted);
  font-size: 0.92rem;
}

.dash-hero__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14.5rem, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: var(--ch-paper);
  border: 1px solid var(--ch-line);
  border-radius: var(--ch-radius-md);
  padding: 1.35rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 30px -10px rgba(0, 0, 0, 0.12);
  border-color: var(--ch-coral);
}

.metric-card__icon {
  width: 3.1rem;
  height: 3.1rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.metric-card__icon--indigo {
  background: rgba(99, 102, 241, 0.12);
}

.metric-card__icon--amber {
  background: rgba(245, 158, 11, 0.12);
}

.metric-card__icon--rose {
  background: rgba(244, 63, 94, 0.12);
}

.metric-card__icon--teal {
  background: rgba(6, 182, 212, 0.12);
}

.metric-card__icon--emerald {
  background: rgba(16, 185, 129, 0.12);
}

.metric-card__body {
  flex: 1;
}

.metric-card__value {
  display: block;
  font-family: var(--ch-font-display);
  font-weight: 700;
  font-size: 1.85rem;
  line-height: 1.1;
  color: var(--ch-text-on-paper);
}

.metric-card__label {
  font-size: 0.82rem;
  color: var(--ch-text-on-paper-muted);
  font-weight: 500;
}

.metric-card__arrow {
  font-family: var(--ch-font-mono);
  font-size: 1rem;
  color: var(--ch-text-on-paper-muted);
  opacity: 0.5;
  transition: all 0.2s ease;
}

.metric-card:hover .metric-card__arrow {
  opacity: 1;
  color: var(--ch-coral);
  transform: translateX(3px);
}

.activity-feed {
  margin-top: 1.5rem;
}

.activity-feed__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--ch-line);
}

.activity-feed__header h3 {
  margin: 0;
  font-size: 1.15rem;
}

.feed-link {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ch-coral);
  text-decoration: none;
}

.activity-feed__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feed-item-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--ch-paper-2);
  border-radius: var(--ch-radius-sm);
  text-decoration: none;
  color: var(--ch-text-on-paper);
  transition: background 0.15s ease;
}

.feed-item-link:hover {
  background: rgba(99, 102, 241, 0.08);
}

.feed-item-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.feed-item-badge {
  font-size: 0.82rem;
  color: var(--ch-coral);
  font-weight: 600;
}

@media (max-width: 768px) {
  .dash-hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

