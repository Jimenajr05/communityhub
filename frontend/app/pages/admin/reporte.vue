<!--
  Página "Reporte Lambda" (ruta /admin/reporte, requiere rol administrador).
  Muestra el último reporte periódico generado por AWS Lambda de forma visual y estructurada.
-->
<script setup lang="ts">
import {
  Users,
  UserCog,
  CalendarDays,
  Ticket,
  CalendarCheck2,
  CheckCircle2,
  Trophy,
  Tag,
  Zap,
  RotateCw,
  Clock,
  ChartBar,
} from 'lucide-vue-next';
import type { Notificacion } from '~/stores/notifications';

definePageMeta({ middleware: 'admin' });
useHead({ title: 'Reporte Lambda · Administración' });

const notificationsStore = useNotificationsStore();
const cargando = ref(true);
const refrescando = ref(false);

/** Devuelve la última notificación de tipo "report" o null si no existe. */
const ultimoReporte = computed<Notificacion | null>(() => {
  const reportes = notificationsStore.notificaciones.filter((n) => n.type === 'report');
  return reportes[0] ?? null;
});

/**
 * Parsea las estadísticas del mensaje del reporte.
 * El mensaje tiene el formato:
 * "📊 Reporte CommunityHub — N usuarios (N organizadores), N actividades (N activas, N finalizadas),
 *  N inscripciones confirmadas. Actividad más popular: "X". Categoría más usada: "Y"."
 */
const stats = computed(() => {
  if (!ultimoReporte.value?.message) return null;
  const msg = ultimoReporte.value.message;

  const usuarios = msg.match(/(\d+)\s+usuarios/)?.[1];
  const organizadores = msg.match(/\((\d+)\s+organizadores\)/)?.[1];
  const actividades = msg.match(/(\d+)\s+actividades/)?.[1];
  const activas = msg.match(/\((\d+)\s+activas/)?.[1];
  const finalizadas = msg.match(/(\d+)\s+finalizadas\)/)?.[1];
  const inscripciones = msg.match(/(\d+)\s+inscripciones/)?.[1];
  const popular = msg.match(/Actividad más popular: "([^"]+)"/)?.[1];
  const categoria = msg.match(/Categoría más usada: "([^"]+)"/)?.[1];

  return {
    usuarios: Number(usuarios ?? 0),
    organizadores: Number(organizadores ?? 0),
    actividades: Number(actividades ?? 0),
    activas: Number(activas ?? 0),
    finalizadas: Number(finalizadas ?? 0),
    inscripciones: Number(inscripciones ?? 0),
    popular: popular ?? null,
    categoria: categoria ?? null,
  };
});

function formatearFecha(fechaIso?: string) {
  if (!fechaIso) return '';
  return new Date(fechaIso).toLocaleString('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function cargar() {
  cargando.value = true;
  await notificationsStore.obtenerNotificaciones();
  cargando.value = false;
}

async function refrescar() {
  refrescando.value = true;
  await notificationsStore.obtenerNotificaciones();
  refrescando.value = false;
}

onMounted(cargar);
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header report-header">
        <div>
          <span class="panel-eyebrow">
            <Zap :size="12" :stroke-width="2.5" /> AWS Lambda · Serverless
          </span>
          <h1>Reporte Periódico de la Plataforma</h1>
          <p>Métricas generadas automáticamente por la función Lambda y enviadas a los administradores.</p>
        </div>
        <button
          type="button"
          class="pill-btn pill-btn--ghost"
          :disabled="refrescando"
          @click="refrescar"
        >
          <RotateCw :size="14" :stroke-width="2.2" :class="{ 'spin-anim': refrescando }" />
          {{ refrescando ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando el reporte más reciente...</p>

      <!-- Sin reportes aún -->
      <div v-else-if="!ultimoReporte" class="panel-card empty-report">
        <div class="empty-report__icon">
          <ChartBar :size="32" :stroke-width="1.4" />
        </div>
        <h3>Sin reportes generados aún</h3>
        <p>
          La función <strong>Lambda reportHandler</strong> todavía no ha enviado ningún reporte.
          Se genera automáticamente una vez al día vía AWS EventBridge, o puedes ejecutar
          <code>npm test</code> en la carpeta <code>lambda</code> para probarlo manualmente.
        </p>
      </div>

      <!-- REPORTE ENCONTRADO -->
      <template v-else>

        <!-- Timestamp del reporte -->
        <div class="report-timestamp">
          <Clock :size="13" :stroke-width="2.2" />
          <span>Último reporte generado el {{ formatearFecha(ultimoReporte.createdAt) }}</span>
          <span v-if="!ultimoReporte.isRead" class="report-badge-new">Nuevo</span>
        </div>

        <!-- TARJETAS DE MÉTRICAS -->
        <div v-if="stats" class="report-grid">
          <!-- Usuarios -->
          <div class="metric-card metric-card--teal">
            <div class="metric-card__icon">
              <Users :size="22" :stroke-width="1.8" />
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ stats.usuarios }}</span>
              <span class="metric-card__label">Usuarios registrados</span>
            </div>
          </div>

          <!-- Organizadores -->
          <div class="metric-card metric-card--amber">
            <div class="metric-card__icon">
              <UserCog :size="22" :stroke-width="1.8" />
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ stats.organizadores }}</span>
              <span class="metric-card__label">Organizadores</span>
            </div>
          </div>

          <!-- Actividades totales -->
          <div class="metric-card metric-card--violet">
            <div class="metric-card__icon">
              <CalendarDays :size="22" :stroke-width="1.8" />
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ stats.actividades }}</span>
              <span class="metric-card__label">Actividades totales</span>
            </div>
          </div>

          <!-- Activas -->
          <div class="metric-card metric-card--green">
            <div class="metric-card__icon">
              <CalendarCheck2 :size="22" :stroke-width="1.8" />
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ stats.activas }}</span>
              <span class="metric-card__label">Actividades activas</span>
            </div>
          </div>

          <!-- Finalizadas -->
          <div class="metric-card metric-card--muted">
            <div class="metric-card__icon">
              <CheckCircle2 :size="22" :stroke-width="1.8" />
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ stats.finalizadas }}</span>
              <span class="metric-card__label">Actividades finalizadas</span>
            </div>
          </div>

          <!-- Inscripciones -->
          <div class="metric-card metric-card--coral">
            <div class="metric-card__icon">
              <Ticket :size="22" :stroke-width="1.8" />
            </div>
            <div class="metric-card__body">
              <span class="metric-card__value">{{ stats.inscripciones }}</span>
              <span class="metric-card__label">Inscripciones confirmadas</span>
            </div>
          </div>
        </div>

        <!-- HIGHLIGHTS: Actividad más popular y Categoría top -->
        <div v-if="stats" class="report-highlights">
          <div v-if="stats.popular" class="highlight-card">
            <div class="highlight-card__icon">
              <Trophy :size="20" :stroke-width="1.8" />
            </div>
            <div class="highlight-card__body">
              <span class="highlight-card__eyebrow">Actividad más popular</span>
              <strong class="highlight-card__title">{{ stats.popular }}</strong>
            </div>
          </div>

          <div v-if="stats.categoria" class="highlight-card">
            <div class="highlight-card__icon highlight-card__icon--amber">
              <Tag :size="20" :stroke-width="1.8" />
            </div>
            <div class="highlight-card__body">
              <span class="highlight-card__eyebrow">Categoría más activa</span>
              <strong class="highlight-card__title">{{ stats.categoria }}</strong>
            </div>
          </div>
        </div>

        <!-- Desglose del mensaje enviado a administradores -->
        <div class="report-breakdown panel-card">
          <div class="breakdown-header">
            <p class="report-raw__label">Notificación enviada a administradores · Desglose</p>
          </div>

          <div v-if="stats" class="breakdown-list">
            <div class="breakdown-item">
              <div class="breakdown-item__key">
                <span class="breakdown-item__icon breakdown-item__icon--teal">
                  <Users :size="15" :stroke-width="2" />
                </span>
                <span>Usuarios registrados</span>
              </div>
              <span class="breakdown-item__val">{{ stats.usuarios }}</span>
            </div>

            <div class="breakdown-item">
              <div class="breakdown-item__key">
                <span class="breakdown-item__icon breakdown-item__icon--amber">
                  <UserCog :size="15" :stroke-width="2" />
                </span>
                <span>Organizadores</span>
              </div>
              <span class="breakdown-item__val">{{ stats.organizadores }}</span>
            </div>

            <div class="breakdown-item">
              <div class="breakdown-item__key">
                <span class="breakdown-item__icon breakdown-item__icon--violet">
                  <CalendarDays :size="15" :stroke-width="2" />
                </span>
                <span>Actividades totales</span>
              </div>
              <span class="breakdown-item__val">{{ stats.actividades }}</span>
            </div>

            <div class="breakdown-item breakdown-item--sub">
              <div class="breakdown-item__key">
                <span class="breakdown-item__icon breakdown-item__icon--green">
                  <CalendarCheck2 :size="14" :stroke-width="2" />
                </span>
                <span>Actividades activas</span>
              </div>
              <span class="breakdown-item__val breakdown-item__val--green">{{ stats.activas }}</span>
            </div>

            <div class="breakdown-item breakdown-item--sub">
              <div class="breakdown-item__key">
                <span class="breakdown-item__icon breakdown-item__icon--muted">
                  <CheckCircle2 :size="14" :stroke-width="2" />
                </span>
                <span>Actividades finalizadas</span>
              </div>
              <span class="breakdown-item__val breakdown-item__val--muted">{{ stats.finalizadas }}</span>
            </div>

            <div class="breakdown-item">
              <div class="breakdown-item__key">
                <span class="breakdown-item__icon breakdown-item__icon--coral">
                  <Ticket :size="15" :stroke-width="2" />
                </span>
                <span>Inscripciones confirmadas</span>
              </div>
              <span class="breakdown-item__val">{{ stats.inscripciones }}</span>
            </div>

            <div v-if="stats.popular" class="breakdown-item">
              <div class="breakdown-item__key">
                <span class="breakdown-item__icon breakdown-item__icon--gold">
                  <Trophy :size="15" :stroke-width="2" />
                </span>
                <span>Actividad más popular</span>
              </div>
              <span class="breakdown-item__val breakdown-item__val--highlight">{{ stats.popular }}</span>
            </div>

            <div v-if="stats.categoria" class="breakdown-item">
              <div class="breakdown-item__key">
                <span class="breakdown-item__icon breakdown-item__icon--amber">
                  <Tag :size="15" :stroke-width="2" />
                </span>
                <span>Categoría más usada</span>
              </div>
              <span class="breakdown-item__val breakdown-item__val--highlight">{{ stats.categoria }}</span>
            </div>
          </div>
        </div>

      </template>

      <p class="report-note">
        Este reporte es generado automáticamente por la función
        <code>reportHandler</code> de <strong>AWS Lambda</strong> cada 24 horas,
        sin intervención del servidor Express.
      </p>
    </div>
  </div>
</template>

<style scoped>
.report-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.report-timestamp {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--ch-font-mono);
  font-size: 0.8rem;
  color: var(--ch-text-on-paper-dim);
  margin-bottom: 1.75rem;
}

.report-badge-new {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0.1rem 0.5rem;
  border-radius: var(--ch-radius-full);
  background: rgba(16, 185, 129, 0.15);
  color: var(--ch-leaf);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* GRID DE MÉTRICAS */
.report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 1.1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.4rem 1.5rem;
  border-radius: var(--ch-radius);
  border: 1px solid transparent;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--ch-shadow-lg);
}

.metric-card--teal    { background: rgba(6, 182, 212, 0.08);   border-color: rgba(6, 182, 212, 0.2); }
.metric-card--amber   { background: rgba(245, 158, 11, 0.08);  border-color: rgba(245, 158, 11, 0.2); }
.metric-card--violet  { background: rgba(124, 92, 252, 0.08);  border-color: rgba(124, 92, 252, 0.2); }
.metric-card--green   { background: rgba(16, 185, 129, 0.08);  border-color: rgba(16, 185, 129, 0.2); }
.metric-card--muted   { background: rgba(148, 163, 184, 0.08); border-color: rgba(148, 163, 184, 0.2); }
.metric-card--coral   { background: rgba(244, 63, 94, 0.08);   border-color: rgba(244, 63, 94, 0.2); }

.metric-card__icon {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.metric-card--teal   .metric-card__icon { background: rgba(6, 182, 212, 0.15);   color: var(--ch-teal); }
.metric-card--amber  .metric-card__icon { background: rgba(245, 158, 11, 0.15);  color: var(--ch-marigold); }
.metric-card--violet .metric-card__icon { background: rgba(124, 92, 252, 0.15);  color: var(--ch-coral); }
.metric-card--green  .metric-card__icon { background: rgba(16, 185, 129, 0.15);  color: var(--ch-leaf); }
.metric-card--muted  .metric-card__icon { background: rgba(148, 163, 184, 0.12); color: var(--ch-text-on-paper-muted); }
.metric-card--coral  .metric-card__icon { background: rgba(244, 63, 94, 0.15);   color: var(--ch-rose); }

.metric-card__body {
  display: flex;
  flex-direction: column;
}

.metric-card__value {
  font-family: var(--ch-font-display);
  font-size: 2.1rem;
  font-weight: 700;
  line-height: 1;
  color: #ffffff;
}

.metric-card__label {
  font-family: var(--ch-font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ch-text-on-paper-muted);
  margin-top: 0.3rem;
}

/* HIGHLIGHTS */
.report-highlights {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 1.1rem;
  margin-bottom: 1.75rem;
}

.highlight-card {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.4rem 1.6rem;
  border-radius: var(--ch-radius);
  background: rgba(124, 92, 252, 0.07);
  border: 1px solid rgba(124, 92, 252, 0.2);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.highlight-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--ch-shadow-lg);
}

.highlight-card__icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(124, 92, 252, 0.15);
  color: var(--ch-coral);
}

.highlight-card__icon--amber {
  background: rgba(245, 158, 11, 0.15);
  color: var(--ch-marigold);
}

.highlight-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.highlight-card__eyebrow {
  font-family: var(--ch-font-mono);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--ch-text-on-paper-dim);
}

.highlight-card__title {
  font-family: var(--ch-font-display);
  font-size: 1.2rem;
  color: #ffffff;
  font-weight: 700;
}

/* DESGLOSE VISUAL */
.report-breakdown {
  margin-bottom: 2rem;
  padding: 1.6rem 1.8rem;
  border: 1px solid var(--ch-line-strong);
  background: rgba(15, 21, 40, 0.7);
}

.breakdown-header {
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--ch-line);
}

.report-raw__label {
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--ch-text-on-paper-dim);
  margin: 0;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breakdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem;
  border-radius: var(--ch-radius-sm);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s ease;
}

.breakdown-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.breakdown-item--sub {
  margin-left: 1.5rem;
  background: transparent;
  border-color: transparent;
  padding: 0.4rem 0.9rem;
}

.breakdown-item__key {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.9rem;
  color: var(--ch-text-on-paper);
}

.breakdown-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.65rem;
  height: 1.65rem;
  border-radius: 6px;
  flex-shrink: 0;
}

.breakdown-item__icon--teal   { background: rgba(6, 182, 212, 0.15);   color: var(--ch-teal); }
.breakdown-item__icon--amber  { background: rgba(245, 158, 11, 0.15);  color: var(--ch-marigold); }
.breakdown-item__icon--violet { background: rgba(124, 92, 252, 0.15);  color: var(--ch-coral-light); }
.breakdown-item__icon--green  { background: rgba(16, 185, 129, 0.15);  color: var(--ch-leaf); }
.breakdown-item__icon--muted  { background: rgba(148, 163, 184, 0.15); color: var(--ch-text-on-paper-muted); }
.breakdown-item__icon--coral  { background: rgba(244, 63, 94, 0.15);   color: var(--ch-rose); }
.breakdown-item__icon--gold   { background: rgba(245, 158, 11, 0.2);   color: #fbbf24; }

.breakdown-item__val {
  font-family: var(--ch-font-mono);
  font-weight: 700;
  font-size: 0.95rem;
  color: #ffffff;
}

.breakdown-item__val--green {
  color: var(--ch-leaf);
}

.breakdown-item__val--muted {
  color: var(--ch-text-on-paper-muted);
}

.breakdown-item__val--highlight {
  color: var(--ch-coral-light);
  font-family: var(--ch-font-body);
  font-weight: 600;
}

/* ESTADO VACÍO */
.empty-report {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.empty-report__icon {
  width: 4rem;
  height: 4rem;
  border-radius: var(--ch-radius);
  background: rgba(124, 92, 252, 0.1);
  border: 1px solid rgba(124, 92, 252, 0.2);
  color: var(--ch-coral);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.empty-report h3 {
  font-size: 1.25rem;
  color: #ffffff;
  margin: 0;
}

.empty-report p {
  color: var(--ch-text-on-paper-muted);
  max-width: 32rem;
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.6;
}

.empty-report code {
  font-family: var(--ch-font-mono);
  background: rgba(124, 92, 252, 0.12);
  color: var(--ch-coral-light);
  padding: 0.05rem 0.4rem;
  border-radius: 4px;
  font-size: 0.88rem;
}

/* NOTA AL PIE */
.report-note {
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  color: var(--ch-text-on-ink-dim);
  text-align: center;
  letter-spacing: 0.04em;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--ch-line);
}

.report-note code {
  background: rgba(124, 92, 252, 0.12);
  color: var(--ch-coral-light);
  padding: 0.05rem 0.4rem;
  border-radius: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
.spin-anim {
  animation: spin 0.8s linear infinite;
}
</style>
