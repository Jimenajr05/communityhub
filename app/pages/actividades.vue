<!--
  Página de listado de actividades (ruta /actividades).
  Permite buscar y filtrar actividades por texto, categoría,
  disponibilidad de cupo y fecha.
-->
<script setup lang="ts">
useHead({ title: 'Actividades · CommunityHub' });

const eventsStore = useEventsStore();
// Texto de búsqueda ingresado por el usuario
const searchTerm = ref('');
// Id de la categoría seleccionada como filtro (null = sin filtro)
const categoriaSeleccionada = ref<string | null>(null);
// Filtro: mostrar solo actividades con cupo disponible
const soloConCupo = ref(false);
// Filtro: fecha seleccionada para las actividades
const fechaSeleccionada = ref('');

/** Ejecuta la búsqueda de actividades en el store aplicando los filtros actuales. */
function buscarConFiltros() {
  eventsStore.buscar({
    search: searchTerm.value.trim() || undefined,
    category: categoriaSeleccionada.value || undefined,
    available: soloConCupo.value || undefined,
    date: fechaSeleccionada.value || undefined,
  });
}

/** Al montar la página, carga las categorías disponibles y realiza la búsqueda inicial. */
onMounted(() => {
  eventsStore.cargarCategorias();
  buscarConFiltros();
});

// Referencia al temporizador usado para aplicar debounce a la búsqueda por texto
let debounceHandle: ReturnType<typeof setTimeout> | null = null;
// Aplica debounce: espera a que el usuario deje de escribir antes de buscar
watch(searchTerm, () => {
  if (debounceHandle) clearTimeout(debounceHandle);
  debounceHandle = setTimeout(buscarConFiltros, 350);
});

/** Reintenta la búsqueda tras un error. */
function reintentar() {
  buscarConFiltros();
}

/** Selecciona o deselecciona (toggle) una categoría como filtro y vuelve a buscar. */
function toggleCategoria(id: string) {
  categoriaSeleccionada.value = categoriaSeleccionada.value === id ? null : id;
  buscarConFiltros();
}

/** Activa o desactiva el filtro de "solo con cupo disponible" y vuelve a buscar. */
function toggleCupo() {
  soloConCupo.value = !soloConCupo.value;
  buscarConFiltros();
}

/** Se ejecuta cuando el usuario cambia la fecha del filtro. */
function onFechaChange() {
  buscarConFiltros();
}

/** Limpia el filtro de fecha y vuelve a buscar. */
function limpiarFecha() {
  fechaSeleccionada.value = '';
  buscarConFiltros();
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
          <span class="search-box__icon" aria-hidden="true"></span>
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Buscar por nombre de actividad…"
            aria-label="Buscar actividades"
          />
        </div>

        <div v-if="eventsStore.categorias.length > 0" class="filter-chips">
          <button
            v-for="categoria in eventsStore.categorias"
            :key="categoria._id"
            type="button"
            class="filter-chip"
            :class="{ 'filter-chip--active': categoriaSeleccionada === categoria._id }"
            @click="toggleCategoria(categoria._id)"
          >
            {{ categoria.name }}
          </button>

          <button
            type="button"
            class="filter-chip filter-chip--cupo"
            :class="{ 'filter-chip--active': soloConCupo }"
            @click="toggleCupo"
          >
            Con cupo disponible
          </button>

          <label class="filter-chip filter-chip--date" :class="{ 'filter-chip--active': fechaSeleccionada }">
            <input
              v-model="fechaSeleccionada"
              type="date"
              aria-label="Filtrar por fecha"
              @change="onFechaChange"
            />
          </label>

          <button v-if="fechaSeleccionada" type="button" class="filter-chip filter-chip--clear" @click="limpiarFecha">
            ✕ fecha
          </button>
        </div>
      </div>
    </header>

    <main class="activities-body">
      <div v-if="eventsStore.cargando" class="activities-grid" aria-hidden="true">
        <div v-for="n in 6" :key="n" class="skeleton-card">
          <div class="skeleton-card__cover" />
          <div class="skeleton-card__line skeleton-card__line--title" />
          <div class="skeleton-card__line skeleton-card__line--meta" />
        </div>
      </div>

      <div v-else-if="eventsStore.error" class="state-message state-message--error" role="alert">
        <p>{{ eventsStore.error }}</p>
        <button type="button" class="submit-btn state-message__retry" @click="reintentar">
          Reintentar
        </button>
      </div>

      <div v-else-if="eventsStore.actividades.length === 0" class="state-message">
        <span class="state-message__emoji" aria-hidden="true"></span>
        <p>No encontramos actividades{{ searchTerm ? ` para “${searchTerm}”` : '' }}.</p>
      </div>

      <div v-else class="activities-grid">
        <EventCard v-for="actividad in eventsStore.actividades" :key="actividad._id" :actividad="actividad" />
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

.filter-chip--date {
  padding: 0.35rem 0.7rem;
  display: inline-flex;
  align-items: center;
}

.filter-chip--date input[type='date'] {
  background: transparent;
  border: none;
  color: inherit;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  cursor: pointer;
}

.filter-chip--date input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
  cursor: pointer;
}

.filter-chip--clear {
  border-style: dashed;
  opacity: 0.8;
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