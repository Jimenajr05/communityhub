<!--
  Página de estadísticas generales (ruta /admin/statistics).
  Solo accesible para administradores; muestra métricas clave
  de toda la plataforma (usuarios, actividades, inscripciones, etc.).
-->
<script setup lang="ts">
definePageMeta({ middleware: 'admin' });
useHead({ title: 'Estadísticas · Administración' });

const { apiFetch } = useApi();
// Métricas generales de la plataforma obtenidas del API (o null mientras cargan)
const metrics = ref<Record<string, number> | null>(null);
// Indica si las métricas todavía se están cargando
const cargando = ref(true);

/** Al montar la página, obtiene las métricas generales del dashboard desde el API. */
onMounted(async () => {
  const res = await apiFetch<{ data: { metrics: Record<string, number> } }>('/dashboard');
  metrics.value = res.data.metrics;
  cargando.value = false;
});
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header">
        <span class="panel-eyebrow">Administración</span>
        <h1>Estadísticas generales</h1>
        <p>Números clave de toda la plataforma.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando…</p>

      <div v-else-if="metrics" class="stat-grid">
        <div class="stat-card">
          <span class="stat-card__value">{{ metrics.totalUsers }}</span>
          <span class="stat-card__label">Usuarios registrados</span>
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
          <span class="stat-card__label">Actividades finalizadas</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__value">{{ metrics.totalCategories }}</span>
          <span class="stat-card__label">Categorías</span>
        </div>
      </div>
    </div>
  </div>
</template>
