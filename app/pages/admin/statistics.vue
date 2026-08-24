<!--
  Página de estadísticas generales (ruta /admin/statistics).
  Solo accesible para administradores; muestra métricas clave
  de toda la plataforma (usuarios, actividades, inscripciones, etc.).
-->
<script setup lang="ts">
import { Users, UserCog, CalendarDays, Ticket, CalendarCheck2, CheckCircle2, Tag, TrendingUp } from 'lucide-vue-next';

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

interface MetricItem {
  key: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
}

const metricCards: MetricItem[] = [
  { key: 'totalUsers', label: 'Usuarios registrados', icon: Users, color: 'var(--ch-teal)', bgColor: 'rgba(6, 182, 212, 0.12)', borderColor: 'rgba(6, 182, 212, 0.25)' },
  { key: 'totalOrganizers', label: 'Organizadores activos', icon: UserCog, color: 'var(--ch-marigold)', bgColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.25)' },
  { key: 'totalEvents', label: 'Actividades totales', icon: CalendarDays, color: 'var(--ch-coral)', bgColor: 'rgba(124, 92, 252, 0.12)', borderColor: 'rgba(124, 92, 252, 0.25)' },
  { key: 'totalRegistrations', label: 'Inscripciones totales', icon: Ticket, color: 'var(--ch-leaf)', bgColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)' },
  { key: 'activeEvents', label: 'Actividades activas', icon: CalendarCheck2, color: 'var(--ch-violet)', bgColor: 'rgba(139, 92, 246, 0.12)', borderColor: 'rgba(139, 92, 246, 0.25)' },
  { key: 'finishedEvents', label: 'Actividades finalizadas', icon: CheckCircle2, color: 'var(--ch-text-on-paper-muted)', bgColor: 'rgba(148, 163, 184, 0.12)', borderColor: 'rgba(148, 163, 184, 0.25)' },
  { key: 'totalCategories', label: 'Categorías del sistema', icon: Tag, color: 'var(--ch-rose)', bgColor: 'rgba(244, 63, 94, 0.12)', borderColor: 'rgba(244, 63, 94, 0.25)' },
];
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header">
        <span class="panel-eyebrow"><TrendingUp :size="12" :stroke-width="2.2" /> Métricas</span>
        <h1>Estadísticas de la plataforma</h1>
        <p>Indicadores clave de actividad, usuarios e inscripciones en toda la red comunitaria.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Consultando métricas del sistema...</p>

      <div v-else-if="metrics" class="stats-grid">
        <div
          v-for="item in metricCards"
          :key="item.key"
          class="stat-tile panel-card"
        >
          <div
            class="stat-tile__icon"
            :style="{ background: item.bgColor, color: item.color, borderColor: item.borderColor }"
          >
            <component :is="item.icon" :size="20" :stroke-width="1.8" />
          </div>

          <div class="stat-tile__body">
            <span class="stat-tile__value" :style="{ color: item.color }">
              {{ metrics[item.key] ?? 0 }}
            </span>
            <span class="stat-tile__label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <!-- Nota contextual al pie -->
      <p v-if="!cargando && metrics" class="stats-note">
        Métricas en tiempo real obtenidas desde el API del sistema.
      </p>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
  gap: 1.25rem;
}

.stat-tile {
  display: flex;
  align-items: center;
  gap: 1.15rem;
  padding: 1.5rem 1.65rem;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.stat-tile:hover {
  transform: translateY(-3px);
  box-shadow: var(--ch-shadow-lg);
  border-color: var(--ch-line-strong);
}

.stat-tile__icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid;
}

.stat-tile__body {
  display: flex;
  flex-direction: column;
}

.stat-tile__value {
  font-family: var(--ch-font-display);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
}

.stat-tile__label {
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ch-text-on-paper-muted);
  margin-top: 0.25rem;
}

.stats-note {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--ch-line);
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  color: var(--ch-text-on-ink-dim);
  text-align: center;
  letter-spacing: 0.04em;
}
</style>
