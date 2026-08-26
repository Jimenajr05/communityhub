<!--
  Página de dashboard del usuario autenticado (ruta /dashboard).
  Muestra métricas visuales interactivas, gráficos SVG personalizados, medidores de actividad,
  radares de participación y resúmenes adaptados según el rol (usuario, organizador o administrador).
-->
<script setup lang="ts">
import {
  Ticket,
  CalendarDays,
  Heart,
  Bell,
  ArrowRight,
  ArrowUpRight,
  LayoutGrid,
  Users,
  XCircle,
  CalendarCheck2,
  ShieldCheck,
  UserCog,
  Layers,
  Sparkles,
  Compass,
  MapPin,
  Clock,
  Plus,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Radio,
  Award,
  CheckCircle2,
} from 'lucide-vue-next';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Dashboard · CommunityHub' });

const authStore = useAuthStore();
const eventsStore = useEventsStore();
const { apiFetch } = useApi();

interface DashboardRespuesta {
  success: boolean;
  data: { role: string; metrics: Record<string, any> };
}

const metrics = ref<Record<string, any> | null>(null);
const cargando = ref(true);
const error = ref('');

// Pestaña de periodo interactivo para gráficos
const periodoActivo = ref<'semana' | 'mes' | 'año'>('mes');

onMounted(async () => {
  try {
    const [res] = await Promise.all([
      apiFetch<DashboardRespuesta>('/dashboard'),
      eventsStore.cargarCategorias(),
    ]);
    metrics.value = res.data.metrics;
  } catch {
    error.value = 'No pudimos cargar tu dashboard en este momento. Intenta de nuevo más tarde.';
  } finally {
    cargando.value = false;
  }
});

const rol = computed(() => authStore.usuario?.role);

// Para rol usuario
const proximaActividad = computed(() => metrics.value?.upcomingEvents?.[0] ?? null);
const otrasProximas = computed(() => metrics.value?.upcomingEvents?.slice(1, 4) ?? []);
const actividadesHistorial = computed(() => metrics.value?.historyEvents ?? []);

function fechaLegible(fecha: string) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
}

// Cálculo de días restantes hasta la próxima actividad
const diasRestantes = computed(() => {
  if (!proximaActividad.value?.date) return null;
  const fechaEv = new Date(proximaActividad.value.date).getTime();
  const hoy = new Date().getTime();
  const diffDias = Math.ceil((fechaEv - hoy) / (1000 * 60 * 60 * 24));
  return diffDias >= 0 ? diffDias : 0;
});

// Gráfico de actividad semanal para usuarios (simulado reactivo con base en inscripciones y favoritos)
const puntosSemana = computed(() => {
  const regCount = metrics.value?.registrationsCount || 0;
  const favCount = metrics.value?.favoritesCount || 0;
  
  // Serie interactiva de 7 días
  const base = Math.max(1, regCount + favCount);
  return [
    { dia: 'Lun', valor: Math.round(base * 0.3) + 1, altura: 25 },
    { dia: 'Mar', valor: Math.round(base * 0.5) + 2, altura: 45 },
    { dia: 'Mié', valor: Math.round(base * 0.8) + 1, altura: 68 },
    { dia: 'Jue', valor: Math.round(base * 0.4) + 3, altura: 35 },
    { dia: 'Vie', valor: Math.round(base * 0.9) + 4, altura: 82 },
    { dia: 'Sáb', valor: Math.round(base * 1.2) + 5, altura: 95 },
    { dia: 'Dom', valor: Math.round(base * 0.7) + 2, altura: 58 },
  ];
});

// Gráfico de donut de roles para administradores
const totalUsuariosAdmin = computed(() => (metrics.value?.totalUsers || 0) + (metrics.value?.totalOrganizers || 0));
const porcentajeUsuarios = computed(() => {
  if (!totalUsuariosAdmin.value) return 80;
  return Math.round(((metrics.value?.totalUsers || 0) / totalUsuariosAdmin.value) * 100);
});
const porcentajeOrganizadores = computed(() => 100 - porcentajeUsuarios.value);

// Promedio de participantes por actividad para administradores
const promedioInscripcionesPorEvento = computed(() => {
  const events = metrics.value?.totalEvents || 0;
  const regs = metrics.value?.totalRegistrations || 0;
  if (!events) return '0.0';
  return (regs / events).toFixed(1);
});

// Tasa de actividad activa para organizadores
const tasaActivasOrg = computed(() => {
  const total = metrics.value?.totalEvents || 0;
  const activas = metrics.value?.activeEventsCount || 0;
  if (!total) return 0;
  return Math.round((activas / total) * 100);
});
</script>

<template>
  <div class="panel-page">
    <div class="ch-constellation panel-page__bg" aria-hidden="true" />
    <div class="panel-container">

      <!-- CABECERA DEL DASHBOARD CON EFECTO DE NODO ACTIVO -->
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
              <span>{{ rol === 'administrador' ? 'Centro de Mando Administrativo' : rol === 'organizador' ? 'Hub de Organizador Comunitario' : 'Miembro Comunitario Activo' }}</span>
            </div>
            <h1 class="dash-hero__title">Hola, {{ authStore.usuario?.firstName }}</h1>
            <p class="dash-hero__desc">Resumen visual de actividad, indicadores y conexiones en la red.</p>
          </div>
        </div>

        <div class="dash-hero__actions">
          <NuxtLink to="/actividades" class="pill-btn pill-btn--primary">
            <Compass :size="15" :stroke-width="2.2" /> Explorar catálogo
          </NuxtLink>
          <NuxtLink v-if="rol === 'organizador' || rol === 'administrador'" to="/mis-actividades" class="pill-btn pill-btn--secondary">
            <Plus :size="15" :stroke-width="2.2" /> Nueva actividad
          </NuxtLink>
          <NuxtLink v-if="rol === 'administrador'" to="/admin" class="pill-btn pill-btn--ghost">
            <ShieldCheck :size="15" :stroke-width="2.2" /> Administración
          </NuxtLink>
        </div>
      </header>

      <p v-if="cargando" class="panel-empty">Sincronizando métricas e indicadores de tu red...</p>
      <div v-else-if="error" class="form-error">{{ error }}</div>

      <template v-else-if="metrics">

        <!-- =============================================================
             ROL USUARIO: DASHBOARD CREATIVO CON GRÁFICOS Y RADAR
             ============================================================= -->
        <div v-if="rol === 'usuario'" class="user-dashboard-layout">
          
          <!-- FILA SUPERIOR: 4 TARJETAS SEÑAL CON GLOW Y MINI INDICADORES -->
          <div class="signals-row">
            <NuxtLink to="/mis-inscripciones" class="signal-card signal-card--tickets">
              <div class="signal-card__icon"><Ticket :size="20" :stroke-width="2" /></div>
              <div class="signal-card__body">
                <span class="signal-card__value">{{ metrics.registrationsCount ?? 0 }}</span>
                <span class="signal-card__label">Mis inscripciones</span>
              </div>
              <div class="signal-card__badge-sub">
                <Zap :size="12" :stroke-width="2.2" />
                <span>{{ metrics.upcomingCount ?? 0 }} activas</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/mis-inscripciones" class="signal-card signal-card--history">
              <div class="signal-card__icon"><Clock :size="20" :stroke-width="2" /></div>
              <div class="signal-card__body">
                <span class="signal-card__value">{{ metrics.historyCount ?? 0 }}</span>
                <span class="signal-card__label">Historial (Concluidas)</span>
              </div>
              <div class="signal-card__badge-sub">
                <CheckCircle2 :size="12" :stroke-width="2.2" />
                <span>Asistidas</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/favoritos" class="signal-card signal-card--favs">
              <div class="signal-card__icon"><Heart :size="20" :stroke-width="2" /></div>
              <div class="signal-card__body">
                <span class="signal-card__value">{{ metrics.favoritesCount ?? 0 }}</span>
                <span class="signal-card__label">Guardadas en favoritos</span>
              </div>
              <div class="signal-card__badge-sub">
                <Award :size="12" :stroke-width="2.2" />
                <span>Colección</span>
              </div>
            </NuxtLink>

            <NuxtLink to="/notificaciones" class="signal-card signal-card--notifs">
              <div class="signal-card__icon"><Bell :size="20" :stroke-width="2" /></div>
              <div class="signal-card__body">
                <span class="signal-card__value">{{ metrics.unreadNotificationsCount ?? 0 }}</span>
                <span class="signal-card__label">Avisos pendientes</span>
              </div>
              <div class="signal-card__badge-sub">
                <Radio :size="12" :stroke-width="2.2" />
                <span>Tiempo real</span>
              </div>
            </NuxtLink>
          </div>

          <!-- FILA CENTRAL: SPOTLIGHT PRÓXIMA ACTIVIDAD + GRÁFICO SVG DE MOMENTUM -->
          <div class="user-main-grid">
            
            <!-- TARJETA SPOTLIGHT DE PRÓXIMO ENCUENTRO -->
            <div v-if="proximaActividad" class="spotlight-card panel-card">
              <div class="spotlight-card__top">
                <div class="spotlight-card__badge">
                  <CalendarCheck2 :size="14" :stroke-width="2.2" />
                  <span>Tu próximo encuentro confirmado</span>
                </div>
                
                <div v-if="diasRestantes !== null" class="countdown-chip">
                  <Clock :size="12" :stroke-width="2.4" />
                  <span>{{ diasRestantes === 0 ? '¡Es hoy!' : `Faltan ${diasRestantes} días` }}</span>
                </div>
              </div>

              <NuxtLink :to="`/actividad/${proximaActividad._id}`" class="spotlight-card__title">
                <h2>{{ proximaActividad.title }}</h2>
              </NuxtLink>

              <div class="spotlight-card__meta">
                <span><CalendarDays :size="13" :stroke-width="2.2" /> {{ fechaLegible(proximaActividad.date) }}</span>
                <span v-if="proximaActividad.time"><Clock :size="13" :stroke-width="2.2" /> {{ proximaActividad.time }}</span>
                <span><MapPin :size="13" :stroke-width="2.2" /> {{ proximaActividad.location }}</span>
              </div>

              <!-- Barra de preparación -->
              <div class="spotlight-card__progress-wrap">
                <div class="spotlight-card__progress-info">
                  <span>Pase asegurado</span>
                  <span class="progress-pct">100% Confirmado</span>
                </div>
                <div class="spotlight-progress-bar">
                  <div class="spotlight-progress-fill" style="width: 100%;" />
                </div>
              </div>

              <div class="spotlight-card__footer">
                <NuxtLink :to="`/actividad/${proximaActividad._id}`" class="pill-btn pill-btn--primary">
                  Ver coordenadas de llegada <ArrowRight :size="15" :stroke-width="2.2" />
                </NuxtLink>
              </div>
            </div>

            <!-- VACÍO SI NO TIENE ACTIVIDADES AGENDADAS -->
            <div v-else class="spotlight-card spotlight-card--empty panel-card">
              <div class="spotlight-card__badge">
                <CalendarCheck2 :size="14" :stroke-width="2.2" />
                <span>Agenda Comunitaria</span>
              </div>
              <h2>Aún no tienes actividades confirmadas</h2>
              <p>Inscríbete en talleres de programación, deportes, senderismo y eventos de tu zona.</p>
              <NuxtLink to="/actividades" class="pill-btn pill-btn--primary">
                Descubrir actividades cerca de mí <ArrowUpRight :size="15" :stroke-width="2.2" />
              </NuxtLink>
            </div>

            <!-- GRÁFICO SVG: RITMO Y DINAMISMO COMUNITARIO -->
            <div class="panel-card chart-card">
              <div class="chart-card__header">
                <div>
                  <span class="chart-eyebrow">
                    <Activity :size="12" :stroke-width="2.4" /> Dinámica comunitaria
                  </span>
                  <h3>Frecuencia de Encuentros</h3>
                </div>
                <div class="chart-pill-tag">
                  <TrendingUp :size="13" :stroke-width="2.2" />
                  <span>En alta</span>
                </div>
              </div>

              <!-- Gráfico de barras SVG animado con gradientes -->
              <div class="svg-chart-container">
                <svg class="activity-bars-svg" viewBox="0 0 320 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#7c5cfc" />
                      <stop offset="100%" stop-color="#4c1d95" stop-opacity="0.3" />
                    </linearGradient>
                    <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#f59e0b" />
                      <stop offset="100%" stop-color="#78350f" stop-opacity="0.3" />
                    </linearGradient>
                  </defs>

                  <!-- Líneas guía -->
                  <line x1="0" y1="30" x2="320" y2="30" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
                  <line x1="0" y1="70" x2="320" y2="70" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
                  <line x1="0" y1="110" x2="320" y2="110" stroke="rgba(255,255,255,0.1)" />

                  <!-- Curva suave de tendencia de fondo -->
                  <path
                    d="M 20 90 Q 60 70, 105 45 T 195 30 T 285 20"
                    fill="none"
                    stroke="rgba(124, 92, 252, 0.25)"
                    stroke-width="2"
                    stroke-dasharray="4 4"
                  />

                  <!-- Barras SVG con interacción -->
                  <g v-for="(p, i) in puntosSemana" :key="p.dia">
                    <rect
                      :x="20 + i * 42"
                      :y="110 - p.altura"
                      width="20"
                      :height="p.altura"
                      rx="4"
                      fill="url(#barGrad)"
                      class="svg-bar"
                    />
                    <!-- Nodo brillante superior -->
                    <circle
                      :cx="30 + i * 42"
                      :cy="110 - p.altura"
                      r="3"
                      fill="#9d84fd"
                      class="svg-node-dot"
                    />
                    <!-- Etiqueta del día -->
                    <text
                      :x="30 + i * 42"
                      y="120"
                      text-anchor="middle"
                      fill="#64748b"
                      font-size="9"
                      font-family="var(--ch-font-mono)"
                    >
                      {{ p.dia }}
                    </text>
                  </g>
                </svg>
              </div>

              <div class="chart-card__footer">
                <div class="chart-stat">
                  <span class="chart-stat__num">{{ metrics.upcomingCount ?? 0 }}</span>
                  <span class="chart-stat__lbl">Próximos eventos</span>
                </div>
                <div class="chart-stat">
                  <span class="chart-stat__num">{{ metrics.favoritesCount ?? 0 }}</span>
                  <span class="chart-stat__lbl">Guardados</span>
                </div>
                <div class="chart-stat">
                  <span class="chart-stat__num text-emerald">Activo</span>
                  <span class="chart-stat__lbl">Estado de cuenta</span>
                </div>
              </div>
            </div>

          </div>

          <!-- FILA INFERIOR: OTRAS ACTIVIDADES + ACCESOS RÁPIDOS -->
          <div class="user-bottom-grid">
            <!-- MINI AGENDA -->
            <div class="mini-agenda panel-card">
              <div class="mini-agenda__header">
                <div>
                  <span class="chart-eyebrow"><CalendarDays :size="12" :stroke-width="2.2" /> Tu itinerario</span>
                  <h3>Pases confirmados</h3>
                </div>
                <NuxtLink to="/mis-inscripciones" class="mini-agenda__link">Ver todos →</NuxtLink>
              </div>

              <div v-if="otrasProximas.length === 0" class="mini-agenda__empty">
                <p>No tienes más actividades en cola después de la principal.</p>
                <NuxtLink to="/actividades" class="pill-btn pill-btn--ghost pill-btn--sm">
                  Explorar más actividades
                </NuxtLink>
              </div>

              <ul v-else class="mini-agenda__list">
                <li v-for="ev in otrasProximas" :key="ev._id" class="mini-agenda__item">
                  <NuxtLink :to="`/actividad/${ev._id}`" class="mini-agenda__item-link">
                    <span class="mini-agenda__dot" />
                    <div class="mini-agenda__item-info">
                      <strong>{{ ev.title }}</strong>
                      <span>{{ fechaLegible(ev.date) }} · {{ ev.location }}</span>
                    </div>
                    <ArrowRight :size="14" :stroke-width="2.2" class="mini-agenda__arrow" />
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <!-- TARJETA DE ACCIONES RÁPIDAS Y COORDINACIÓN -->
            <div class="panel-card quick-actions-card">
              <div class="quick-actions-card__header">
                <span class="chart-eyebrow"><Sparkles :size="12" :stroke-width="2.2" /> Acciones rápidas</span>
                <h3>Atajos del sistema</h3>
              </div>

              <div class="quick-actions-list">
                <NuxtLink to="/actividades" class="quick-action-item">
                  <div class="quick-action-item__icon quick-action--teal">
                    <Compass :size="16" :stroke-width="2" />
                  </div>
                  <div class="quick-action-item__text">
                    <strong>Explorar mapa y talleres</strong>
                    <span>Descubre novedades comunitarias</span>
                  </div>
                  <ArrowRight :size="14" :stroke-width="2.2" />
                </NuxtLink>

                <NuxtLink to="/notificaciones" class="quick-action-item">
                  <div class="quick-action-item__icon quick-action--amber">
                    <Radio :size="16" :stroke-width="2" />
                  </div>
                  <div class="quick-action-item__text">
                    <strong>Centro de avisos en vivo</strong>
                    <span>Ver alertas y confirmaciones</span>
                  </div>
                  <ArrowRight :size="14" :stroke-width="2.2" />
                </NuxtLink>

                <NuxtLink to="/perfil" class="quick-action-item">
                  <div class="quick-action-item__icon quick-action--violet">
                    <UserCog :size="16" :stroke-width="2" />
                  </div>
                  <div class="quick-action-item__text">
                    <strong>Personalizar mi perfil</strong>
                    <span>Actualizar foto y datos</span>
                  </div>
                  <ArrowRight :size="14" :stroke-width="2.2" />
                </NuxtLink>
              </div>
            </div>
          </div>

        </div>

        <!-- =============================================================
             ROL ORGANIZADOR: MÉTRICAS, TASA DE OCUPACIÓN Y FEED RECIENTE
             ============================================================= -->
        <div v-else-if="rol === 'organizador'" class="org-dashboard-layout">
          
          <!-- 5 TARJETAS KPI DE ORGANIZADOR -->
          <div class="org-stat-grid">
            <div class="org-stat-card panel-card">
              <div class="org-stat-card__icon org-stat-card__icon--primary">
                <LayoutGrid :size="18" :stroke-width="2" />
              </div>
              <span class="org-stat-card__value">{{ metrics.totalEvents ?? 0 }}</span>
              <span class="org-stat-card__label">Actividades Creadas</span>
              <div class="org-stat-card__pill">Total histórico</div>
            </div>

            <div class="org-stat-card panel-card">
              <div class="org-stat-card__icon org-stat-card__icon--leaf">
                <CalendarCheck2 :size="18" :stroke-width="2" />
              </div>
              <span class="org-stat-card__value text-leaf">{{ metrics.upcomingEventsCount ?? metrics.activeEventsCount ?? 0 }}</span>
              <span class="org-stat-card__label">Actividades Próximas</span>
              <div class="org-stat-card__pill org-stat-card__pill--leaf">Convocatoria en curso</div>
            </div>

            <div class="org-stat-card panel-card">
              <div class="org-stat-card__icon org-stat-card__icon--amber">
                <Users :size="18" :stroke-width="2" />
              </div>
              <span class="org-stat-card__value text-amber">{{ metrics.totalParticipants ?? 0 }}</span>
              <span class="org-stat-card__label">Número de Participantes</span>
              <div class="org-stat-card__pill org-stat-card__pill--amber">Inscritos confirmados</div>
            </div>

            <div class="org-stat-card panel-card">
              <div class="org-stat-card__icon org-stat-card__icon--primary">
                <CheckCircle2 :size="18" :stroke-width="2" />
              </div>
              <span class="org-stat-card__value" style="color: var(--ch-marigold);">{{ metrics.availableCapacity ?? 0 }}</span>
              <span class="org-stat-card__label">Capacidad Disponible</span>
              <div class="org-stat-card__pill">Cupos libres acumulados</div>
            </div>

            <div class="org-stat-card panel-card">
              <div class="org-stat-card__icon org-stat-card__icon--rose">
                <XCircle :size="18" :stroke-width="2" />
              </div>
              <span class="org-stat-card__value text-rose">{{ metrics.cancelledEventsCount ?? 0 }}</span>
              <span class="org-stat-card__label">Actividades Canceladas</span>
              <div class="org-stat-card__pill org-stat-card__pill--rose">Desactivadas</div>
            </div>
          </div>

          <!-- SECCIÓN CENTRAL: RADIAL DE EFICIENCIA + LISTA DE ACTIVIDADES -->
          <div class="org-main-grid">
            
            <!-- MEDIDOR DE CAPACIDAD Y OCUPACIÓN EN TIEMPO REAL -->
            <div class="panel-card org-capacity-card">
              <div class="chart-card__header">
                <div>
                  <span class="chart-eyebrow"><Target :size="12" :stroke-width="2.2" /> Rendimiento de convocatoria</span>
                  <h3>Tasa de Ocupación Global</h3>
                </div>
              </div>

              <div class="radial-meter-box">
                <svg class="radial-svg" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    stroke-width="12"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="65"
                    fill="none"
                    stroke="var(--ch-marigold)"
                    stroke-width="12"
                    stroke-linecap="round"
                    :stroke-dasharray="408"
                    :stroke-dashoffset="408 - (408 * (tasaActivasOrg / 100))"
                    transform="rotate(-90 80 80)"
                    class="radial-fill-circle"
                  />
                </svg>

                <div class="radial-center-text">
                  <span class="radial-val">{{ tasaActivasOrg }}%</span>
                  <span class="radial-lbl">Actividad activa</span>
                </div>
              </div>

              <div class="capacity-breakdown">
                <div class="capacity-row">
                  <span class="cap-indicator cap-indicator--leaf" />
                  <span class="cap-name">Activas</span>
                  <strong class="cap-num">{{ metrics.activeEventsCount ?? 0 }}</strong>
                </div>
                <div class="capacity-row">
                  <span class="cap-indicator cap-indicator--rose" />
                  <span class="cap-name">Canceladas</span>
                  <strong class="cap-num">{{ metrics.cancelledEventsCount ?? 0 }}</strong>
                </div>
              </div>
            </div>

            <!-- FEED DE ACTIVIDADES RECIENTES -->
            <div class="panel-card org-recent-feed">
              <div class="org-recent-feed__header">
                <div>
                  <span class="chart-eyebrow"><CalendarDays :size="12" :stroke-width="2.2" /> Panel en vivo</span>
                  <h3>Tus actividades publicadas</h3>
                </div>
                <NuxtLink to="/mis-actividades" class="feed-link">Gestionar todas →</NuxtLink>
              </div>

              <p v-if="!metrics.recentEvents?.length" class="panel-empty">
                Aún no has publicado actividades como organizador.
              </p>

              <ul v-else class="org-recent-feed__list">
                <li v-for="ev in metrics.recentEvents" :key="ev._id" class="org-recent-feed__item">
                  <NuxtLink :to="`/actividad/${ev._id}`" class="org-feed-link">
                    <div class="org-feed-title-block">
                      <strong>{{ ev.title }}</strong>
                      <span>{{ fechaLegible(ev.date) }} · {{ ev.location }}</span>
                    </div>
                    <span class="pill-btn pill-btn--ghost pill-btn--sm">Ver detalle →</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>

          </div>

        </div>

        <!-- =============================================================
             ROL ADMINISTRADOR: KPIs GLOBALES, DISTRIBUCIÓN Y RADAR
             ============================================================= -->
        <div v-else-if="rol === 'administrador'" class="admin-dashboard-layout">
          
          <!-- FILA SUPERIOR: 4 KPI CARDS GRANDES CON GLOW -->
          <div class="admin-kpi-grid">
            <NuxtLink to="/admin/users" class="admin-kpi-card panel-card">
              <div class="admin-kpi-card__icon admin-kpi-card__icon--teal"><Users :size="22" :stroke-width="1.8" /></div>
              <div class="admin-kpi-card__body">
                <span class="admin-kpi-card__value">{{ metrics.totalUsers ?? 0 }}</span>
                <span class="admin-kpi-card__label">Usuarios Registrados</span>
              </div>
              <ArrowRight :size="16" :stroke-width="2.2" class="admin-kpi-card__arrow" />
            </NuxtLink>

            <NuxtLink to="/admin/users" class="admin-kpi-card panel-card">
              <div class="admin-kpi-card__icon admin-kpi-card__icon--marigold"><UserCog :size="22" :stroke-width="1.8" /></div>
              <div class="admin-kpi-card__body">
                <span class="admin-kpi-card__value">{{ metrics.totalOrganizers ?? 0 }}</span>
                <span class="admin-kpi-card__label">Organizadores Activos</span>
              </div>
              <ArrowRight :size="16" :stroke-width="2.2" class="admin-kpi-card__arrow" />
            </NuxtLink>

            <NuxtLink to="/admin/events" class="admin-kpi-card panel-card">
              <div class="admin-kpi-card__icon admin-kpi-card__icon--violet"><Layers :size="22" :stroke-width="1.8" /></div>
              <div class="admin-kpi-card__body">
                <span class="admin-kpi-card__value">{{ metrics.totalEvents ?? 0 }}</span>
                <span class="admin-kpi-card__label">Total Actividades</span>
              </div>
              <ArrowRight :size="16" :stroke-width="2.2" class="admin-kpi-card__arrow" />
            </NuxtLink>

            <NuxtLink to="/admin/events" class="admin-kpi-card panel-card">
              <div class="admin-kpi-card__icon admin-kpi-card__icon--leaf"><Ticket :size="22" :stroke-width="1.8" /></div>
              <div class="admin-kpi-card__body">
                <span class="admin-kpi-card__value">{{ metrics.totalRegistrations ?? 0 }}</span>
                <span class="admin-kpi-card__label">Inscripciones Globales</span>
              </div>
              <ArrowRight :size="16" :stroke-width="2.2" class="admin-kpi-card__arrow" />
            </NuxtLink>
          </div>

          <!-- SECCIÓN CENTRAL DE GRÁFICOS Y DISTRIBUCIÓN -->
          <div class="admin-charts-grid">
            
            <!-- GRÁFICO DONUT DE DISTRIBUCIÓN DE CUENTAS -->
            <div class="panel-card chart-card">
              <div class="chart-card__header">
                <div>
                  <span class="chart-eyebrow"><PieChart :size="12" :stroke-width="2.2" /> Composición de la red</span>
                  <h3>Distribución de Roles</h3>
                </div>
                <NuxtLink to="/admin/users" class="feed-link">Ver usuarios →</NuxtLink>
              </div>

              <div class="donut-chart-row">
                <div class="donut-chart-svg-wrap">
                  <svg class="donut-svg" viewBox="0 0 140 140">
                    <circle cx="70" cy="70" r="50" fill="none" stroke="rgba(6, 182, 212, 0.2)" stroke-width="16" />
                    <!-- Segmento Usuarios -->
                    <circle
                      cx="70"
                      cy="70"
                      r="50"
                      fill="none"
                      stroke="#06b6d4"
                      stroke-width="16"
                      :stroke-dasharray="314"
                      :stroke-dashoffset="314 - (314 * (porcentajeUsuarios / 100))"
                      transform="rotate(-90 70 70)"
                    />
                    <!-- Segmento Organizadores -->
                    <circle
                      cx="70"
                      cy="70"
                      r="50"
                      fill="none"
                      stroke="#f59e0b"
                      stroke-width="16"
                      :stroke-dasharray="314"
                      :stroke-dashoffset="314 - (314 * (porcentajeOrganizadores / 100))"
                      :transform="`rotate(${-90 + (porcentajeUsuarios * 3.6)} 70 70)`"
                    />
                  </svg>
                  <div class="donut-center-num">
                    <strong>{{ totalUsuariosAdmin }}</strong>
                    <span>Cuentas</span>
                  </div>
                </div>

                <div class="donut-legend">
                  <div class="donut-legend__item">
                    <span class="donut-dot" style="background: #06b6d4;" />
                    <div class="donut-legend__info">
                      <span>Usuarios regulares</span>
                      <strong>{{ metrics.totalUsers ?? 0 }} ({{ porcentajeUsuarios }}%)</strong>
                    </div>
                  </div>

                  <div class="donut-legend__item">
                    <span class="donut-dot" style="background: #f59e0b;" />
                    <div class="donut-legend__info">
                      <span>Organizadores</span>
                      <strong>{{ metrics.totalOrganizers ?? 0 }} ({{ porcentajeOrganizadores }}%)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TARJETA DE SALUD DEL SISTEMA Y PROMEDIOS -->
            <div class="panel-card chart-card">
              <div class="chart-card__header">
                <div>
                  <span class="chart-eyebrow"><BarChart3 :size="12" :stroke-width="2.2" /> Rendimiento de la plataforma</span>
                  <h3>Salud y Estado del Ecosistema</h3>
                </div>
                <div class="chart-pill-tag chart-pill-tag--green">
                  <CheckCircle2 :size="13" :stroke-width="2.2" />
                  <span>Operativo</span>
                </div>
              </div>

              <div class="health-metrics-list">
                <div class="health-metric-item">
                  <div class="health-metric-info">
                    <span>Promedio de inscritos por actividad</span>
                    <strong>{{ promedioInscripcionesPorEvento }} personas / evento</strong>
                  </div>
                  <div class="health-meter-bar">
                    <div class="health-meter-fill" style="width: 72%;" />
                  </div>
                </div>

                <div class="health-metric-item">
                  <div class="health-metric-info">
                    <span>Actividades activas actualmente</span>
                    <strong>{{ metrics.activeEvents ?? 0 }} en curso / próximas</strong>
                  </div>
                  <div class="health-meter-bar">
                    <div class="health-meter-fill health-meter-fill--leaf" style="width: 85%;" />
                  </div>
                </div>

                <div class="health-metric-item">
                  <div class="health-metric-info">
                    <span>Actividades finalizadas</span>
                    <strong>{{ metrics.finishedEvents ?? 0 }} concluidas</strong>
                  </div>
                  <div class="health-meter-bar">
                    <div class="health-meter-fill" style="width: 65%; background: var(--ch-violet);" />
                  </div>
                </div>

                <div class="health-metric-item">
                  <div class="health-metric-info">
                    <span>Categorías registradas en el catálogo</span>
                    <strong>{{ metrics.totalCategories ?? 0 }} categorías activas</strong>
                  </div>
                  <div class="health-meter-bar">
                    <div class="health-meter-fill health-meter-fill--marigold" style="width: 60%;" />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
.panel-page__bg {
  mask-image: radial-gradient(70% 50% at 85% 0%, black 0%, transparent 80%);
}

.dash-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2.25rem;
  padding: 2rem 2.25rem;
}

.dash-hero__info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.dash-hero__avatar {
  width: 4.25rem;
  height: 4.25rem;
  border-radius: var(--ch-radius-md);
  background: linear-gradient(135deg, var(--ch-coral) 0%, var(--ch-violet) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--ch-font-display);
  font-size: 1.45rem;
  font-weight: 700;
  color: #ffffff;
  overflow: hidden;
  border: 1.5px solid var(--ch-line-strong);
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.dash-hero__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dash-hero__role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ch-marigold);
  margin-bottom: 0.25rem;
}

.role-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ch-marigold);
  box-shadow: 0 0 8px var(--ch-marigold-glow);
}

.dash-hero__title {
  font-size: 1.85rem;
  margin: 0 0 0.2rem;
  color: #ffffff;
}

.dash-hero__desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--ch-text-on-ink-muted);
}

.dash-hero__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* =====================================================================
   DASHBOARD USUARIO
   ===================================================================== */
.user-dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.signals-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 1200px) {
  .signals-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .signals-row {
    grid-template-columns: 1fr;
  }
}

.signal-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1.15rem 1.1rem;
  border-radius: var(--ch-radius-md);
  background: var(--ch-paper);
  border: 1px solid var(--ch-line);
  text-decoration: none;
  color: inherit;
  box-shadow: var(--ch-shadow-sm);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.signal-card:hover {
  transform: translateY(-3px);
  border-color: var(--ch-line-strong);
  box-shadow: var(--ch-shadow-md);
}

.signal-card__icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.signal-card--tickets .signal-card__icon {
  background: rgba(124, 92, 252, 0.15);
  color: var(--ch-coral-light);
  border: 1px solid rgba(124, 92, 252, 0.3);
}

.signal-card--history .signal-card__icon {
  background: rgba(16, 185, 129, 0.15);
  color: var(--ch-leaf);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.signal-card--favs .signal-card__icon {
  background: rgba(244, 63, 94, 0.15);
  color: var(--ch-rose);
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.signal-card--notifs .signal-card__icon {
  background: rgba(245, 158, 11, 0.15);
  color: var(--ch-marigold);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.signal-card__body {
  flex: 1;
  min-width: 0;
}

.signal-card__value {
  display: block;
  font-family: var(--ch-font-display);
  font-size: 1.65rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.2rem;
}

.signal-card__label {
  font-size: 0.78rem;
  color: var(--ch-text-on-paper-muted);
  line-height: 1.25;
  display: block;
}

.signal-card__badge-sub {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-family: var(--ch-font-mono);
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.22rem 0.52rem;
  border-radius: var(--ch-radius-full);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--ch-line);
  color: var(--ch-text-on-paper-muted);
  flex-shrink: 0;
  white-space: nowrap;
}

/* Grilla Central */
.user-main-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 1.5rem;
}

@media (max-width: 960px) {
  .user-main-grid {
    grid-template-columns: 1fr;
  }
}

.spotlight-card {
  background: linear-gradient(135deg, var(--ch-paper) 0%, var(--ch-paper-2) 100%);
  border: 1px solid var(--ch-line);
  border-left: 4px solid var(--ch-coral);
  border-radius: var(--ch-radius-md);
  padding: 2rem;
  box-shadow: var(--ch-shadow-md);
  display: flex;
  flex-direction: column;
}

.spotlight-card--empty {
  border-left-color: var(--ch-marigold);
}

.spotlight-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.spotlight-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ch-coral-light);
}

.countdown-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: var(--ch-radius-full);
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--ch-marigold);
}

.spotlight-card__title {
  text-decoration: none;
}

.spotlight-card__title h2 {
  font-size: 1.6rem;
  line-height: 1.25;
  margin: 0 0 1rem;
  color: #ffffff;
  transition: color 0.15s ease;
}

.spotlight-card__title:hover h2 {
  color: var(--ch-coral-light);
}

.spotlight-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  font-size: 0.86rem;
  color: var(--ch-text-on-paper-muted);
  margin-bottom: 1.5rem;
}

.spotlight-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.spotlight-card__progress-wrap {
  margin-bottom: 1.5rem;
}

.spotlight-card__progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  font-family: var(--ch-font-mono);
  color: var(--ch-text-on-paper-muted);
  margin-bottom: 0.4rem;
}

.progress-pct {
  color: var(--ch-leaf);
  font-weight: 600;
}

.spotlight-progress-bar {
  height: 5px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--ch-radius-full);
  overflow: hidden;
}

.spotlight-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ch-coral) 0%, var(--ch-leaf) 100%);
  border-radius: var(--ch-radius-full);
}

.spotlight-card__footer {
  margin-top: auto;
}

/* Tarjeta de Gráficos SVG */
.chart-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
}

.chart-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.chart-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ch-marigold);
  margin-bottom: 0.2rem;
}

.chart-card__header h3 {
  font-size: 1.15rem;
  margin: 0;
  color: #ffffff;
}

.chart-pill-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: var(--ch-radius-full);
  background: rgba(124, 92, 252, 0.15);
  border: 1px solid rgba(124, 92, 252, 0.3);
  color: var(--ch-coral-light);
}

.chart-pill-tag--green {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
  color: var(--ch-leaf);
}

.svg-chart-container {
  width: 100%;
  height: 120px;
  margin: 0.5rem 0 1.25rem;
}

.activity-bars-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.svg-bar {
  transition: all 0.2s ease;
  cursor: pointer;
}

.svg-bar:hover {
  fill: url(#barGradHover);
  transform: scaleY(1.05);
  transform-origin: bottom;
}

.svg-node-dot {
  transition: r 0.2s ease;
}

.svg-bar:hover + .svg-node-dot {
  r: 4.5;
  fill: var(--ch-marigold);
}

.chart-card__footer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--ch-line);
  margin-top: auto;
}

.chart-stat {
  display: flex;
  flex-direction: column;
}

.chart-stat__num {
  font-family: var(--ch-font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.1;
}

.chart-stat__lbl {
  font-size: 0.74rem;
  color: var(--ch-text-on-paper-muted);
}

.text-emerald {
  color: var(--ch-leaf) !important;
}

/* Grilla Inferior */
.user-bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 860px) {
  .user-bottom-grid {
    grid-template-columns: 1fr;
  }
}

.mini-agenda {
  padding: 1.75rem;
}

.mini-agenda__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.mini-agenda__header h3 {
  font-size: 1.15rem;
  margin: 0;
  color: #ffffff;
}

.mini-agenda__link {
  font-family: var(--ch-font-mono);
  font-size: 0.78rem;
  color: var(--ch-coral-light);
  text-decoration: none;
}

.mini-agenda__empty {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--ch-text-on-paper-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.mini-agenda__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.mini-agenda__item-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.75rem 1rem;
  border-radius: var(--ch-radius-sm);
  background: var(--ch-paper-2);
  border: 1px solid var(--ch-line);
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}

.mini-agenda__item-link:hover {
  border-color: var(--ch-coral-light);
  background: var(--ch-paper-3);
}

.mini-agenda__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--ch-marigold);
  flex-shrink: 0;
}

.mini-agenda__item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.mini-agenda__item-info strong {
  font-size: 0.92rem;
  color: #ffffff;
}

.mini-agenda__item-info span {
  font-size: 0.78rem;
  color: var(--ch-text-on-paper-muted);
}

.mini-agenda__arrow {
  color: var(--ch-text-on-paper-dim);
}

.quick-actions-card {
  padding: 1.75rem;
}

.quick-actions-card__header {
  margin-bottom: 1.25rem;
}

.quick-actions-card__header h3 {
  font-size: 1.15rem;
  margin: 0;
  color: #ffffff;
}

.quick-actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-action-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  border-radius: var(--ch-radius-sm);
  background: var(--ch-paper-2);
  border: 1px solid var(--ch-line);
  text-decoration: none;
  color: inherit;
  transition: all 0.18s ease;
}

.quick-action-item:hover {
  border-color: var(--ch-coral-light);
  background: var(--ch-paper-3);
  transform: translateX(3px);
}

.quick-action-item__icon {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-action--teal { background: rgba(6, 182, 212, 0.15); color: var(--ch-teal); }
.quick-action--amber { background: rgba(245, 158, 11, 0.15); color: var(--ch-marigold); }
.quick-action--violet { background: rgba(124, 92, 252, 0.15); color: var(--ch-coral-light); }

.quick-action-item__text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.quick-action-item__text strong {
  font-size: 0.9rem;
  color: #ffffff;
}

.quick-action-item__text span {
  font-size: 0.76rem;
  color: var(--ch-text-on-paper-muted);
}

/* =====================================================================
   DASHBOARD ORGANIZADOR
   ===================================================================== */
.org-dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.org-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1.25rem;
}

.org-stat-card {
  padding: 1.6rem;
  position: relative;
  overflow: hidden;
}

.org-stat-card__icon {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
}

.org-stat-card__icon--primary { background: rgba(124, 92, 252, 0.15); color: var(--ch-coral-light); border: 1px solid rgba(124, 92, 252, 0.3); }
.org-stat-card__icon--leaf { background: rgba(16, 185, 129, 0.15); color: var(--ch-leaf); border: 1px solid rgba(16, 185, 129, 0.3); }
.org-stat-card__icon--amber { background: rgba(245, 158, 11, 0.15); color: var(--ch-marigold); border: 1px solid rgba(245, 158, 11, 0.3); }
.org-stat-card__icon--rose { background: rgba(244, 63, 94, 0.15); color: var(--ch-rose); border: 1px solid rgba(244, 63, 94, 0.3); }

.org-stat-card__value {
  display: block;
  font-family: var(--ch-font-display);
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.35rem;
}

.org-stat-card__label {
  font-size: 0.84rem;
  color: var(--ch-text-on-paper-muted);
  display: block;
  margin-bottom: 0.6rem;
}

.org-stat-card__pill {
  display: inline-block;
  font-family: var(--ch-font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: var(--ch-radius-full);
  background: rgba(255, 255, 255, 0.05);
  color: var(--ch-text-on-paper-muted);
}

.org-stat-card__pill--leaf { background: rgba(16, 185, 129, 0.15); color: var(--ch-leaf); }
.org-stat-card__pill--amber { background: rgba(245, 158, 11, 0.15); color: var(--ch-marigold); }
.org-stat-card__pill--rose { background: rgba(244, 63, 94, 0.15); color: var(--ch-rose); }

.text-leaf { color: var(--ch-leaf) !important; }
.text-amber { color: var(--ch-marigold) !important; }
.text-rose { color: var(--ch-rose) !important; }

.org-main-grid {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .org-main-grid {
    grid-template-columns: 1fr;
  }
}

.org-capacity-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.radial-meter-box {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 1.25rem 0;
}

.radial-svg {
  width: 100%;
  height: 100%;
}

.radial-fill-circle {
  transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);
}

.radial-center-text {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.radial-val {
  font-family: var(--ch-font-display);
  font-size: 1.85rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.radial-lbl {
  font-size: 0.72rem;
  font-family: var(--ch-font-mono);
  color: var(--ch-text-on-paper-muted);
  margin-top: 0.2rem;
}

.capacity-breakdown {
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 1px dashed var(--ch-line);
  margin-top: auto;
}

.capacity-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.84rem;
}

.cap-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.cap-indicator--leaf { background: var(--ch-leaf); }
.cap-indicator--rose { background: var(--ch-rose); }

.cap-name { color: var(--ch-text-on-paper-muted); }
.cap-num { color: #ffffff; }

.org-recent-feed {
  padding: 1.75rem;
}

.org-recent-feed__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.org-recent-feed__header h3 {
  font-size: 1.15rem;
  margin: 0;
  color: #ffffff;
}

.feed-link {
  font-family: var(--ch-font-mono);
  font-size: 0.8rem;
  color: var(--ch-coral-light);
  text-decoration: none;
}

.org-recent-feed__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.org-feed-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.15rem;
  border-radius: var(--ch-radius-sm);
  background: var(--ch-paper-2);
  border: 1px solid var(--ch-line);
  text-decoration: none;
  color: inherit;
  transition: all 0.15s ease;
}

.org-feed-link:hover {
  border-color: var(--ch-coral-light);
  background: var(--ch-paper-3);
}

.org-feed-title-block strong {
  display: block;
  font-size: 0.94rem;
  color: #ffffff;
}

.org-feed-title-block span {
  font-size: 0.78rem;
  color: var(--ch-text-on-paper-muted);
}

.pill-btn--sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.8rem;
}

/* =====================================================================
   DASHBOARD ADMINISTRADOR
   ===================================================================== */
.admin-dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.admin-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.25rem;
}

.admin-kpi-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.admin-kpi-card:hover {
  transform: translateY(-3px);
  border-color: var(--ch-coral-light);
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.7);
}

.admin-kpi-card__icon {
  width: 3.1rem;
  height: 3.1rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid;
}

.admin-kpi-card__icon--teal { background: rgba(6, 182, 212, 0.12); color: var(--ch-teal); border-color: rgba(6, 182, 212, 0.3); }
.admin-kpi-card__icon--marigold { background: rgba(245, 158, 11, 0.12); color: var(--ch-marigold); border-color: rgba(245, 158, 11, 0.3); }
.admin-kpi-card__icon--violet { background: rgba(124, 92, 252, 0.12); color: var(--ch-coral-light); border-color: rgba(124, 92, 252, 0.3); }
.admin-kpi-card__icon--leaf { background: rgba(16, 185, 129, 0.12); color: var(--ch-leaf); border-color: rgba(16, 185, 129, 0.3); }

.admin-kpi-card__body {
  flex: 1;
}

.admin-kpi-card__value {
  display: block;
  font-family: var(--ch-font-display);
  font-size: 2.1rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.admin-kpi-card__label {
  font-size: 0.82rem;
  color: var(--ch-text-on-paper-muted);
}

.admin-kpi-card__arrow {
  color: var(--ch-text-on-paper-dim);
  transition: transform 0.15s ease;
}

.admin-kpi-card:hover .admin-kpi-card__arrow {
  transform: translateX(4px);
  color: var(--ch-coral-light);
}

/* Gráficos de Admin */
.admin-charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 900px) {
  .admin-charts-grid {
    grid-template-columns: 1fr;
  }
}

.donut-chart-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;
}

@media (max-width: 500px) {
  .donut-chart-row {
    flex-direction: column;
  }
}

.donut-chart-svg-wrap {
  position: relative;
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-center-num {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-center-num strong {
  font-family: var(--ch-font-display);
  font-size: 1.5rem;
  color: #ffffff;
  line-height: 1;
}

.donut-center-num span {
  font-family: var(--ch-font-mono);
  font-size: 0.68rem;
  color: var(--ch-text-on-paper-muted);
  text-transform: uppercase;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
}

.donut-legend__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.donut-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.donut-legend__info {
  display: flex;
  flex-direction: column;
}

.donut-legend__info span {
  font-size: 0.8rem;
  color: var(--ch-text-on-paper-muted);
}

.donut-legend__info strong {
  font-size: 0.94rem;
  color: #ffffff;
}

.health-metrics-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1rem;
}

.health-metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.health-metric-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.84rem;
}

.health-metric-info span {
  color: var(--ch-text-on-paper-muted);
}

.health-metric-info strong {
  color: #ffffff;
  font-family: var(--ch-font-mono);
  font-size: 0.82rem;
}

.health-meter-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--ch-radius-full);
  overflow: hidden;
}

.health-meter-fill {
  height: 100%;
  background: var(--ch-coral);
  border-radius: var(--ch-radius-full);
}

.health-meter-fill--leaf {
  background: var(--ch-leaf);
}

.health-meter-fill--marigold {
  background: var(--ch-marigold);
}
</style>
