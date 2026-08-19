<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
useHead({ title: 'Dashboard · CommunityHub' });

const authStore = useAuthStore();
const { apiFetch } = useApi();

interface DashboardRespuesta {
  success: boolean;
  data: { role: string; metrics: Record<string, any> };
}

const metrics = ref<Record<string, any> | null>(null);
const cargando = ref(true);
const error = ref('');

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

const rol = computed(() => authStore.usuario?.role);
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">

      <header class="panel-header">
        <span class="panel-eyebrow">Tu cuenta</span>
        <h1>Hola, {{ authStore.usuario?.firstName }}</h1>
        <p>Esto es lo que está pasando en tu cuenta de CommunityHub.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando…</p>
      <p v-else-if="error" class="panel-empty">{{ error }}</p>

      <template v-else-if="metrics">
        <!-- Dashboard de usuario -->
        <div v-if="rol === 'usuario'" class="stat-grid">
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.registrationsCount }}</span>
            <span class="stat-card__label">Inscripciones totales</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.upcomingCount }}</span>
            <span class="stat-card__label">Próximas actividades</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.favoritesCount }}</span>
            <span class="stat-card__label">Favoritos</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.unreadNotificationsCount }}</span>
            <span class="stat-card__label">Notificaciones sin leer</span>
          </div>
        </div>

        <!-- Dashboard de organizador -->
        <div v-else-if="rol === 'organizador'" class="stat-grid">
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.totalEvents }}</span>
            <span class="stat-card__label">Actividades creadas</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.activeEventsCount }}</span>
            <span class="stat-card__label">Activas</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.cancelledEventsCount }}</span>
            <span class="stat-card__label">Canceladas</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.totalParticipants }}</span>
            <span class="stat-card__label">Participantes totales</span>
          </div>
        </div>

        <!-- Dashboard de admin -->
        <div v-else-if="rol === 'administrador'" class="stat-grid">
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.totalUsers }}</span>
            <span class="stat-card__label">Usuarios</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.totalOrganizers }}</span>
            <span class="stat-card__label">Organizadores</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.totalEvents }}</span>
            <span class="stat-card__label">Actividades</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.totalRegistrations }}</span>
            <span class="stat-card__label">Inscripciones</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.activeEvents }}</span>
            <span class="stat-card__label">Actividades activas</span>
          </div>
          <div class="stat-card">
            <span class="stat-card__value">{{ metrics.finishedEvents }}</span>
            <span class="stat-card__label">Finalizadas</span>
          </div>
        </div>

        <div class="panel-card" v-if="rol === 'usuario' && metrics.upcomingEvents?.length">
          <h2>Próximas actividades</h2>
          <ul>
            <li v-for="ev in metrics.upcomingEvents" :key="ev._id">
              <NuxtLink :to="`/actividad/${ev._id}`">{{ ev.title }}</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="panel-card" v-if="rol === 'organizador' && metrics.recentEvents?.length">
          <h2>Tus próximas actividades</h2>
          <ul>
            <li v-for="ev in metrics.recentEvents" :key="ev._id">
              <NuxtLink :to="`/actividad/${ev._id}`">{{ ev.title }}</NuxtLink>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>
