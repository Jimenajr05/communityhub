<script setup lang="ts">
useHead({ title: 'Actividades · CommunityHub' });

const eventsStore = useEventsStore();
const searchTerm = ref('');
const categoriaSeleccionada = ref<string | null>(null);
const soloConCupo = ref(false);

onMounted(() => {
  eventsStore.buscar();
});

let debounceHandle: ReturnType<typeof setTimeout> | null = null;
watch(searchTerm, (value) => {
  if (debounceHandle) clearTimeout(debounceHandle);
  debounceHandle = setTimeout(() => {
    eventsStore.buscar({ search: value.trim() || undefined });
  }, 350);
});

function reintentar() {
  eventsStore.buscar({ search: searchTerm.value.trim() || undefined });
}

// Los chips de categoría se arman con lo que ya llegó del backend (no hay
// endpoint de categorías todavía), así que solo se muestran las que
// realmente tienen actividades activas en este momento.
const categoriasDisponibles = computed(() => {
  const nombres = new Set(eventsStore.actividades.map((a) => a.category?.name).filter(Boolean));
  return Array.from(nombres) as string[];
});

const actividadesFiltradas = computed(() => {
  return eventsStore.actividades.filter((actividad) => {
    if (categoriaSeleccionada.value && actividad.category?.name !== categoriaSeleccionada.value) {
      return false;
    }
    if (soloConCupo.value && actividad.spotsAvailable <= 0) {
      return false;
    }
    return true;
  });
});

function toggleCategoria(nombre: string) {
  categoriaSeleccionada.value = categoriaSeleccionada.value === nombre ? null : nombre;
}
</script>

<template>
  <div class="activities-page">
    <header class="activities-header">
      <div class="activities-header__grid" aria-hidden="true" />
      <div class="activities-header__blob activities-header__blob--1" aria-hidden="true" />
      <div class="activities-header__blob activities-header__blob--2" aria-hidden="true" />

      <div class="activities-header__content">
        <span class="activities-eyebrow">CommunityHub</span>
        <h1>Actividades</h1>
        <p>Talleres, deportes, arte y encuentros de tu comunidad.</p>

        <div class="search-box">
          <span class="search-box__icon" aria-hidden="true">🔍</span>
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Buscar por nombre de actividad…"
            aria-label="Buscar actividades"
          />
        </div>

        <div v-if="categoriasDisponibles.length > 0 || eventsStore.actividades.length > 0" class="filter-chips">
          <button
            v-for="nombre in categoriasDisponibles"
            :key="nombre"
            type="button"
            class="filter-chip"
            :class="{ 'filter-chip--active': categoriaSeleccionada === nombre }"
            @click="toggleCategoria(nombre)"
          >
            {{ nombre }}
          </button>

          <button
            type="button"
            class="filter-chip filter-chip--cupo"
            :class="{ 'filter-chip--active': soloConCupo }"
            @click="soloConCupo = !soloConCupo"
          >
            Con cupo disponible
          </button>
        </div>
      </div>
    </header>

    <main class="activities-body">
      <!-- Cargando: skeletons en vez de texto plano -->
      <div v-if="eventsStore.cargando" class="activities-grid" aria-hidden="true">
        <div v-for="n in 6" :key="n" class="skeleton-card">
          <div class="skeleton-card__cover" />
          <div class="skeleton-card__line skeleton-card__line--title" />
          <div class="skeleton-card__line skeleton-card__line--meta" />
        </div>
      </div>

      <!-- Error (p. ej. backend caído o sin base de datos conectada) -->
      <div v-else-if="eventsStore.error" class="state-message state-message--error" role="alert">
        <p>{{ eventsStore.error }}</p>
        <button type="button" class="submit-btn state-message__retry" @click="reintentar">
          Reintentar
        </button>
      </div>

      <!-- Sin resultados -->
      <div v-else-if="actividadesFiltradas.length === 0" class="state-message">
        <span class="state-message__emoji" aria-hidden="true">🗓️</span>
        <p>No encontramos actividades{{ searchTerm ? ` para “${searchTerm}”` : '' }}.</p>
      </div>

      <!-- Resultados -->
      <div v-else class="activities-grid">
        <EventCard v-for="actividad in actividadesFiltradas" :key="actividad._id" :actividad="actividad" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.activities-page {
  min-height: 100vh;
  background: var(--ch-ink-2);
}

.activities-header {
  position: relative;
  overflow: hidden;
  padding: 3rem 2rem 3.5rem;
  background: radial-gradient(120% 160% at 15% 0%, var(--ch-ink-soft) 0%, var(--ch-ink) 60%, var(--ch-ink-2) 100%);
}

.activities-header__grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(245, 241, 232, 0.14) 1.5px, transparent 1.5px);
  background-size: 26px 26px;
  mask-image: radial-gradient(circle at 20% 0%, black 0%, transparent 70%);
}

.activities-header__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.35;
  pointer-events: none;
}

.activities-header__blob--1 {
  width: 16rem;
  height: 16rem;
  background: var(--ch-coral);
  top: -6rem;
  right: 4rem;
}

.activities-header__blob--2 {
  width: 12rem;
  height: 12rem;
  background: var(--ch-violet);
  bottom: -6rem;
  right: 22rem;
}

.activities-header__content {
  position: relative;
  z-index: 1;
  max-width: 42rem;
}

.activities-eyebrow {
  display: inline-block;
  font-family: var(--ch-font-mono);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.78rem;
  color: var(--ch-marigold);
  margin-bottom: 1rem;
}

.activities-header__content h1 {
  font-family: var(--ch-font-display);
  font-weight: 400;
  font-size: clamp(2rem, 4vw, 2.6rem);
  margin: 0 0 0.6rem;
  color: var(--ch-text-on-ink);
}

.activities-header__content p {
  margin: 0 0 1.75rem;
  color: var(--ch-text-on-ink-muted);
  font-size: 1rem;
}

.search-box {
  position: relative;
  max-width: 26rem;
  margin-bottom: 1.1rem;
}

.search-box__icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.7;
}

.search-box input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.4rem;
  border-radius: var(--ch-radius-sm);
  border: 1.5px solid rgba(245, 241, 232, 0.2);
  background: rgba(245, 241, 232, 0.06);
  color: var(--ch-text-on-ink);
  font-family: var(--ch-font-body);
  font-size: 0.96rem;
}

.search-box input::placeholder {
  color: var(--ch-text-on-ink-muted);
}

.search-box input:focus-visible {
  outline: none;
  border-color: var(--ch-marigold);
  background: rgba(245, 241, 232, 0.1);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.filter-chip {
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  letter-spacing: 0.03em;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1.5px solid rgba(245, 241, 232, 0.22);
  background: rgba(245, 241, 232, 0.05);
  color: var(--ch-text-on-ink-muted);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.filter-chip:hover {
  border-color: rgba(245, 241, 232, 0.4);
  color: var(--ch-text-on-ink);
}

.filter-chip--active {
  background: var(--ch-marigold);
  border-color: var(--ch-marigold);
  color: var(--ch-text-on-paper);
  font-weight: 600;
}

.filter-chip--cupo {
  border-style: dashed;
}

.activities-body {
  padding: 2.5rem 2rem 4rem;
  max-width: 72rem;
  margin: 0 auto;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: 1.25rem;
}

.state-message {
  text-align: center;
  color: var(--ch-text-on-ink-muted);
  padding: 3.5rem 1rem;
  font-size: 1rem;
}

.state-message__emoji {
  display: block;
  font-size: 2.2rem;
  margin-bottom: 0.75rem;
}

.state-message--error {
  color: var(--ch-text-on-ink);
}

.state-message__retry {
  width: auto;
  display: inline-flex;
  margin-top: 1rem;
  padding: 0.6rem 1.5rem;
}

/* ---------- Skeletons de carga ---------- */
.skeleton-card {
  background: var(--ch-paper);
  border-radius: var(--ch-radius-md);
  overflow: hidden;
  padding-bottom: 1.3rem;
}

.skeleton-card__cover {
  height: 6.5rem;
  background: linear-gradient(90deg, var(--ch-paper-2) 25%, #f2ead2 37%, var(--ch-paper-2) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skeleton-card__line {
  height: 0.75rem;
  margin: 1rem 1.35rem 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--ch-paper-2) 25%, #f2ead2 37%, var(--ch-paper-2) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skeleton-card__line--title {
  width: 70%;
  height: 0.95rem;
}

.skeleton-card__line--meta {
  width: 45%;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (max-width: 640px) {
  .activities-header {
    padding: 2.25rem 1.25rem 2.75rem;
  }

  .activities-body {
    padding: 2rem 1.25rem 3rem;
  }
}
</style>