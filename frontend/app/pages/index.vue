<!--
  Página de inicio (ruta "/").
  Presentación asimétrica y viva inspirada en nodos y puntos de encuentro comunitarios.
-->
<script setup lang="ts">
import {
  ArrowRight,
  MapPin,
  Users,
  CalendarDays,
  Radar,
  Sparkles,
  Compass,
  Layers,
  Zap,
  Activity,
} from 'lucide-vue-next';
import { useCategoryStyle } from '~/composables/useCategoryStyle';

useHead({
  title: 'CommunityHub · Puntos de Encuentro y Actividades Comunitarias',
  meta: [
    {
      name: 'description',
      content:
        'Plataforma para descubrir, crear y participar en actividades, talleres, deportes y eventos comunitarios en tu zona.',
    },
  ],
});

const authStore = useAuthStore();
const eventsStore = useEventsStore();

onMounted(async () => {
  if (eventsStore.actividades.length === 0) {
    await eventsStore.buscar();
  }
  if (eventsStore.categorias.length === 0) {
    await eventsStore.cargarCategorias();
  }
});

// Actividades destacadas para la constelación del hero y la sección de exploración
const nodosHero = computed(() => eventsStore.actividades.slice(0, 3));
const actividadesExplorar = computed(() => eventsStore.actividades.slice(0, 6));
const totalDisponibles = computed(() => eventsStore.paginacion?.total ?? eventsStore.actividades.length);

function fechaCorta(fecha: string) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return new Intl.DateTimeFormat('es-CR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d).replace('.', '');
}

async function onLogout() {
  await authStore.logout();
}

const router = useRouter();
const promoviendoOrganizador = ref(false);

/** Promueve al usuario actual a organizador y lo redirige a /mis-actividades */
async function convertirseEnOrganizador() {
  promoviendoOrganizador.value = true;
  try {
    await authStore.convertirseEnOrganizador();
    router.push('/mis-actividades');
  } catch {
    // Si falla, al menos intentamos navegar
  } finally {
    promoviendoOrganizador.value = false;
  }
}

/** Indica si el usuario tiene permisos de organizador o superior */
const esOrganizadorOAdmin = computed(() =>
  authStore.usuario?.role === 'organizador' || authStore.usuario?.role === 'administrador'
);
</script>

<template>
  <main class="home">
    <!-- SECCIÓN HERO ASIMÉTRICO -->
    <section class="home-hero">
      <div class="ch-constellation home-hero__constellation" aria-hidden="true" />
      <div class="home-hero__aura" aria-hidden="true" />

      <div class="home-hero__inner">
        <!-- LADO IZQUIERDO: Mensaje, llamada a la acción y radar -->
        <div class="home-hero__pitch">
          <div class="home-hero__eyebrow">
            <span class="ch-beacon">
              <span class="ch-beacon-ring" />
              <span class="ch-beacon-dot" />
            </span>
            <span>Red Comunitaria Activa</span>
          </div>

          <template v-if="authStore.estaAutenticado">
            <h1 class="home-hero__headline">
              Hola, <span class="home-hero__gradient-text">{{ authStore.usuario?.firstName }}</span>.<br />
              Tu comunidad tiene movimiento hoy.
            </h1>
            <p class="home-hero__copy">
              Revisa tus próximas actividades inscritas, consulta los nuevos talleres disponibles o explora los puntos de encuentro cerca de ti.
            </p>
            <div class="home-hero__actions">
              <NuxtLink to="/actividades" class="pill-btn pill-btn--primary home-hero__btn">
                Explorar actividades <ArrowRight :size="16" :stroke-width="2.2" />
              </NuxtLink>
              <NuxtLink to="/dashboard" class="pill-btn pill-btn--secondary home-hero__btn">
                Mi Dashboard
              </NuxtLink>
            </div>
          </template>

          <template v-else>
            <h1 class="home-hero__headline">
              Donde las personas se conectan con <span class="home-hero__gradient-text">lugares y actividades</span>.
            </h1>
            <p class="home-hero__copy">
              Talleres, deportes, arte y voluntariado en tu zona. Descubre puntos de encuentro activos, asegura tu cupo y forma parte de lo que está sucediendo.
            </p>
            <div class="home-hero__actions">
              <NuxtLink to="/actividades" class="pill-btn pill-btn--primary home-hero__btn">
                Explorar actividades <ArrowRight :size="16" :stroke-width="2.2" />
              </NuxtLink>
              <NuxtLink to="/registro" class="pill-btn pill-btn--ghost home-hero__btn">
                Unirme a la comunidad
              </NuxtLink>
            </div>
          </template>

          <!-- Indicador de señal en tiempo real -->
          <div class="home-hero__signal">
            <div class="home-hero__signal-radar">
              <Radar :size="15" :stroke-width="2.2" />
            </div>
            <span class="home-hero__signal-text">
              <strong>{{ totalDisponibles }}</strong> actividades disponibles en la red
            </span>
          </div>
        </div>

        <!-- LADO DERECHO: Cluster dinámico de nodos y rutas conectadas -->
        <div
          class="home-hero__map"
          role="region"
          aria-label="Composición interactiva de actividades conectadas"
        >
          <!-- Rutas SVG conectoras de nodos -->
          <svg class="home-hero__routes" viewBox="0 0 460 420" preserveAspectRatio="none">
            <path d="M70,90 C150,130 180,180 250,150" />
            <path d="M250,150 C290,210 320,240 350,300" />
            <path d="M70,90 C50,210 90,280 140,330" />
          </svg>

          <!-- Pines geográficos de encuentro -->
          <div class="home-hero__pin home-hero__pin--a" title="Punto de encuentro norte">
            <div class="home-hero__pin-icon"><MapPin :size="12" :stroke-width="2.4" /></div>
            <span class="home-hero__pin-radar" />
          </div>

          <div class="home-hero__pin home-hero__pin--b" title="Punto de encuentro central">
            <div class="home-hero__pin-icon"><Compass :size="12" :stroke-width="2.4" /></div>
            <span class="home-hero__pin-radar" />
          </div>

          <!-- Nodos de actividades reales superpuestas -->
          <NuxtLink
            v-for="(actividad, i) in nodosHero"
            :key="actividad._id"
            :to="`/actividad/${actividad._id}`"
            class="hero-node"
            :class="[`hero-node--${i}`, useCategoryStyle(actividad.category?.name).className]"
          >
            <div class="hero-node__header">
              <span class="hero-node__cat">
                <span class="hero-node__cat-dot" />
                {{ actividad.category?.name ?? 'Comunidad' }}
              </span>
              <span class="hero-node__date">{{ fechaCorta(actividad.date) }}</span>
            </div>

            <h3 class="hero-node__title">{{ actividad.title }}</h3>

            <div class="hero-node__meta">
              <span><MapPin :size="11" :stroke-width="2.2" /> {{ actividad.location }}</span>
              <span><Users :size="11" :stroke-width="2.2" /> {{ actividad.registeredCount }}/{{ actividad.capacity }}</span>
            </div>
          </NuxtLink>

          <!-- Fallback en caso de estar cargando -->
          <div v-if="nodosHero.length === 0" class="hero-node hero-node--0 cover--default hero-node--loading">
            <div class="hero-node__header">
              <span class="hero-node__cat">Comunidad</span>
            </div>
            <h3 class="hero-node__title">Sincronizando actividades...</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN CÓMO FUNCIONA LA RED COMUNITARIA -->
    <section class="home-pillars">
      <div class="home-pillars__inner">
        <div class="home-section-header">
          <span class="home-section-tag">
            <Layers :size="13" :stroke-width="2.2" /> Dinámica Comunitaria
          </span>
          <h2>Cómo funciona la red de CommunityHub</h2>
          <p>Diseñado para que descubras, conectes y participes sin fricción.</p>
        </div>

        <div class="home-pillars__grid">
          <div class="pillar-card">
            <div class="pillar-card__badge">01</div>
            <div class="pillar-card__icon pillar-card__icon--violet">
              <Compass :size="22" :stroke-width="2" />
            </div>
            <h3>Descubre puntos de encuentro</h3>
            <p>Explora actividades clasificadas por categoría, fecha, ubicación y disponibilidad en tiempo real.</p>
          </div>

          <div class="pillar-card">
            <div class="pillar-card__badge">02</div>
            <div class="pillar-card__icon pillar-card__icon--amber">
              <Zap :size="22" :stroke-width="2" />
            </div>
            <h3>Asegura tu cupo al instante</h3>
            <p>Inscríbete con un solo clic, consulta el aforo en vivo y recibe recordatorios serverless sin complicaciones.</p>
          </div>

          <div class="pillar-card">
            <div class="pillar-card__badge">03</div>
            <div class="pillar-card__icon pillar-card__icon--emerald">
              <Users :size="22" :stroke-width="2" />
            </div>
            <h3>Conecta y participa</h3>
            <p>Asiste, conoce a personas con intereses compartidos o impulsa tus propios talleres como organizador.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECCIÓN EXPLORACIÓN DE ACTIVIDADES RECIENTES -->
    <section v-if="actividadesExplorar.length > 0" class="home-showcase">
      <div class="home-showcase__inner">
        <div class="home-showcase__top">
          <div>
            <span class="home-section-tag">
              <Activity :size="13" :stroke-width="2.2" /> Actividades en directo
            </span>
            <h2>Próximos puntos de encuentro</h2>
          </div>
          <NuxtLink to="/actividades" class="pill-btn pill-btn--ghost">
            Ver todas las actividades <ArrowRight :size="15" :stroke-width="2.2" />
          </NuxtLink>
        </div>

        <div class="home-showcase__grid">
          <EventCard
            v-for="(actividad, index) in actividadesExplorar"
            :key="actividad._id"
            :actividad="actividad"
            :featured="index === 0"
          />
        </div>
      </div>
    </section>

    <!-- BANNER DE LLAMADO A ORGANIZADORES -->
    <section class="home-cta">
      <div class="ch-constellation home-cta__grid" aria-hidden="true" />
      <div class="home-cta__inner">
        <div class="home-cta__content">
          <span class="home-cta__eyebrow">
            <Sparkles :size="14" :stroke-width="2.2" /> Únete como creador
          </span>
          <h2>¿Quieres organizar un evento o taller en tu comunidad?</h2>
          <p>
            Publica tus actividades, administra las inscripciones y conecta directamente con personas interesadas en tus iniciativas.
          </p>
          <div class="home-cta__buttons">
            <template v-if="authStore.estaAutenticado">
              <NuxtLink v-if="esOrganizadorOAdmin" to="/mis-actividades" class="pill-btn pill-btn--primary">
                Crear mi actividad
              </NuxtLink>
              <button
                v-else
                type="button"
                class="pill-btn pill-btn--primary"
                :disabled="promoviendoOrganizador"
                @click="convertirseEnOrganizador"
              >
                {{ promoviendoOrganizador ? 'Activando perfil...' : 'Convertirme en organizador' }}
              </button>
            </template>
            <NuxtLink v-else to="/registro?role=organizador" class="pill-btn pill-btn--primary">
              Crear cuenta de organizador
            </NuxtLink>
            <NuxtLink to="/actividades" class="pill-btn pill-btn--secondary">
              Explorar el catálogo
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  position: relative;
  background: var(--ch-ink);
  color: var(--ch-text-on-ink);
  overflow-x: hidden;
}

/* =====================================================================
   HERO SECTION
   ===================================================================== */
.home-hero {
  position: relative;
  min-height: calc(100vh - 4.5rem);
  display: flex;
  align-items: center;
  padding: 3.5rem 1.5rem 4.5rem;
  overflow: hidden;
}

.home-hero__constellation {
  mask-image: radial-gradient(75% 75% at 30% 30%, black 0%, transparent 80%);
  z-index: 0;
}

.home-hero__aura {
  position: absolute;
  top: -10%;
  left: 20%;
  width: 50vw;
  height: 50vw;
  max-width: 650px;
  max-height: 650px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 92, 252, 0.16) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 75%);
  filter: blur(50px);
  pointer-events: none;
  z-index: 0;
}

.home-hero__inner {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 3.5rem;
  align-items: center;
}

.home-hero__pitch {
  max-width: 36rem;
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-family: var(--ch-font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ch-marigold);
  margin-bottom: 1.25rem;
  padding: 0.35rem 0.85rem;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.22);
  border-radius: var(--ch-radius-full);
}

.home-hero__headline {
  font-family: var(--ch-font-display);
  font-weight: 700;
  font-size: clamp(2.3rem, 4.5vw, 3.5rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  margin: 0 0 1.25rem;
  color: #ffffff;
}

.home-hero__gradient-text {
  background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 60%, var(--ch-marigold-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.home-hero__copy {
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--ch-text-on-ink-muted);
  margin: 0 0 2rem;
  max-width: 31rem;
}

.home-hero__actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.home-hero__btn {
  padding: 0.75rem 1.6rem;
  font-size: 0.95rem;
}

.home-hero__signal {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem 1rem;
  border-radius: var(--ch-radius-full);
  border: 1px solid var(--ch-line);
  background: rgba(15, 21, 40, 0.6);
  backdrop-filter: blur(8px);
}

.home-hero__signal-radar {
  color: var(--ch-coral-light);
  display: flex;
  align-items: center;
}

.home-hero__signal-text {
  font-size: 0.84rem;
  color: var(--ch-text-on-ink-muted);
}

.home-hero__signal-text strong {
  color: #ffffff;
  font-family: var(--ch-font-mono);
}

/* =====================================================================
   CLUSTER DE NODOS DEL HERO
   ===================================================================== */
.home-hero__map {
  position: relative;
  min-height: 28rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-hero__routes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.home-hero__routes path {
  fill: none;
  stroke: var(--ch-line-strong);
  stroke-width: 1.5;
  stroke-dasharray: 4 6;
}

.home-hero__pin {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-hero__pin--a {
  top: 10%;
  left: 6%;
}

.home-hero__pin--b {
  bottom: 8%;
  left: 20%;
}

.home-hero__pin-icon {
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50% 50% 50% 0;
  background: var(--ch-paper-2);
  border: 1.5px solid var(--ch-marigold);
  color: var(--ch-marigold);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.home-hero__pin-icon svg {
  transform: rotate(-45deg);
}

.home-hero__pin-radar {
  position: absolute;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  border: 1px solid var(--ch-marigold);
  animation: pulse-ring 2.6s infinite;
  z-index: 1;
}

.hero-node {
  position: absolute;
  border-radius: var(--ch-radius-md);
  padding: 1rem 1.15rem;
  background: rgba(15, 21, 40, 0.88);
  backdrop-filter: blur(12px);
  border: 1px solid var(--ch-line);
  box-shadow: var(--ch-shadow-md);
  text-decoration: none;
  color: inherit;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 2;
}

.hero-node:hover {
  transform: translateY(-4px) scale(1.02);
  border-color: var(--ch-coral-light);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 20px -5px var(--ch-coral-glow);
}

.hero-node--0 {
  top: 2%;
  left: 4%;
  width: 14.5rem;
}

.hero-node--1 {
  top: 34%;
  right: 0%;
  width: 13.5rem;
}

.hero-node--2 {
  bottom: 2%;
  left: 24%;
  width: 14rem;
}

.hero-node--loading {
  opacity: 0.6;
}

.hero-node__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.hero-node__cat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--ch-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 600;
  color: currentColor;
}

.hero-node__cat-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.hero-node__date {
  font-family: var(--ch-font-mono);
  font-size: 0.68rem;
  color: var(--ch-text-on-paper-muted);
}

.hero-node__title {
  font-family: var(--ch-font-display);
  font-weight: 600;
  font-size: 0.98rem;
  line-height: 1.25;
  margin: 0 0 0.65rem;
  color: #ffffff;
}

.hero-node__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.74rem;
  color: var(--ch-text-on-paper-muted);
}

.hero-node__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

/* =====================================================================
   PILARES DE LA COMUNIDAD (CÓMO FUNCIONA)
   ===================================================================== */
.home-pillars {
  padding: 5rem 1.5rem;
  background: radial-gradient(circle at 50% 50%, var(--ch-ink-soft) 0%, var(--ch-ink-2) 100%);
  border-top: 1px solid var(--ch-line);
  border-bottom: 1px solid var(--ch-line);
}

.home-pillars__inner {
  max-width: 80rem;
  margin: 0 auto;
}

.home-section-header {
  text-align: center;
  max-width: 36rem;
  margin: 0 auto 3.5rem;
}

.home-section-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ch-coral-light);
  margin-bottom: 0.75rem;
}

.home-section-header h2 {
  font-size: clamp(1.8rem, 3.2vw, 2.4rem);
  margin: 0 0 0.6rem;
  color: #ffffff;
}

.home-section-header p {
  color: var(--ch-text-on-ink-muted);
  font-size: 1rem;
}

.home-pillars__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
}

.pillar-card {
  position: relative;
  background: var(--ch-paper);
  border: 1px solid var(--ch-line);
  border-radius: var(--ch-radius-md);
  padding: 2.25rem 1.75rem;
  box-shadow: var(--ch-shadow-md);
  transition: all 0.2s ease;
}

.pillar-card:hover {
  transform: translateY(-3px);
  border-color: var(--ch-line-strong);
}

.pillar-card__badge {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-family: var(--ch-font-mono);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ch-text-on-paper-dim);
}

.pillar-card__icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.pillar-card__icon--violet {
  background: rgba(124, 92, 252, 0.15);
  color: var(--ch-coral-light);
  border: 1px solid rgba(124, 92, 252, 0.3);
}

.pillar-card__icon--amber {
  background: rgba(245, 158, 11, 0.15);
  color: var(--ch-marigold);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.pillar-card__icon--emerald {
  background: rgba(16, 185, 129, 0.15);
  color: var(--ch-leaf);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.pillar-card h3 {
  font-size: 1.25rem;
  margin: 0 0 0.6rem;
  color: #ffffff;
}

.pillar-card p {
  color: var(--ch-text-on-paper-muted);
  font-size: 0.92rem;
  line-height: 1.55;
  margin: 0;
}

/* =====================================================================
   SECCIÓN DE EXPLORACIÓN
   ===================================================================== */
.home-showcase {
  padding: 5rem 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
}

.home-showcase__top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2.25rem;
}

.home-showcase__top h2 {
  font-size: clamp(1.8rem, 3vw, 2.25rem);
  margin: 0;
  color: #ffffff;
}

.home-showcase__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1.35rem;
}

/* =====================================================================
   BANNER DE LLAMADO A ORGANIZADORES
   ===================================================================== */
.home-cta {
  position: relative;
  padding: 5rem 1.5rem;
  background: radial-gradient(circle at 70% 30%, var(--ch-ink-soft) 0%, var(--ch-ink-2) 100%);
  border-top: 1px solid var(--ch-line);
  overflow: hidden;
}

.home-cta__grid {
  opacity: 0.5;
}

.home-cta__inner {
  position: relative;
  z-index: 1;
  max-width: 50rem;
  margin: 0 auto;
  text-align: center;
}

.home-cta__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ch-marigold);
  margin-bottom: 1rem;
}

.home-cta h2 {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  line-height: 1.18;
  margin: 0 0 1rem;
  color: #ffffff;
}

.home-cta p {
  color: var(--ch-text-on-ink-muted);
  font-size: 1.02rem;
  line-height: 1.6;
  margin: 0 0 2rem;
}

.home-cta__buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* =====================================================================
   RESPONSIVE MEDIA QUERIES
   ===================================================================== */
@media (max-width: 980px) {
  .home-hero__inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .home-hero__map {
    order: -1;
    min-height: 22rem;
  }
  .home-hero__pitch {
    max-width: none;
  }
  .home-pillars__grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  .home-showcase__top {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 600px) {
  .home-hero {
    padding: 2.5rem 1.25rem 3.5rem;
  }
  .hero-node {
    width: 10.5rem;
    padding: 0.75rem 0.85rem;
  }
  .hero-node--0 { top: 0; left: 0; width: 11.5rem; }
  .hero-node--1 { top: 38%; right: 0; }
  .hero-node--2 { bottom: 0; left: 15%; }
  .home-hero__pin { display: none; }
}
</style>
