<!--
  Página de catálogo y descubrimiento de actividades (ruta /actividades).
  Consola integrada de búsqueda por texto, categorías, disponibilidad y fecha.
-->
<script setup lang="ts">
import { Search, CalendarDays, CheckCircle, X, SlidersHorizontal, RotateCcw, Sparkles, User, ChevronDown, Check } from 'lucide-vue-next';
import { useCategoryStyle } from '~/composables/useCategoryStyle';

useHead({
  title: 'Catálogo de Actividades · CommunityHub',
  meta: [
    {
      name: 'description',
      content: 'Descubre y filtra actividades comunitarias, talleres, eventos deportivos y encuentros en tu localidad.',
    },
  ],
});

const eventsStore = useEventsStore();

const searchTerm = ref('');
const categoriaSeleccionada = ref<string | null>(null);
const soloConCupo = ref(false);
const fechaSeleccionada = ref('');
const organizadorSeleccionado = ref<string | null>(null);
const orgDropdownOpen = ref(false);

function cerrarOrgDropdown(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.org-combobox')) {
    orgDropdownOpen.value = false;
  }
}

function buscarConFiltros() {
  eventsStore.buscar({
    search: searchTerm.value.trim() || undefined,
    category: categoriaSeleccionada.value || undefined,
    available: soloConCupo.value || undefined,
    date: fechaSeleccionada.value || undefined,
    organizer: organizadorSeleccionado.value || undefined,
  });
}

onMounted(() => {
  eventsStore.cargarCategorias();
  eventsStore.cargarOrganizadores();
  buscarConFiltros();
  document.addEventListener('click', cerrarOrgDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', cerrarOrgDropdown);
});

let debounceHandle: ReturnType<typeof setTimeout> | null = null;
watch(searchTerm, () => {
  if (debounceHandle) clearTimeout(debounceHandle);
  debounceHandle = setTimeout(buscarConFiltros, 350);
});

function reintentar() {
  buscarConFiltros();
}

function toggleCategoria(id: string) {
  categoriaSeleccionada.value = categoriaSeleccionada.value === id ? null : id;
  buscarConFiltros();
}

function toggleCupo() {
  soloConCupo.value = !soloConCupo.value;
  buscarConFiltros();
}

function onFechaChange() {
  buscarConFiltros();
}

function limpiarFecha() {
  fechaSeleccionada.value = '';
  buscarConFiltros();
}

function limpiarTodosLosFiltros() {
  searchTerm.value = '';
  categoriaSeleccionada.value = null;
  soloConCupo.value = false;
  fechaSeleccionada.value = '';
  organizadorSeleccionado.value = null;
  buscarConFiltros();
}

const filtrosActivosCount = computed(() => {
  let count = 0;
  if (searchTerm.value.trim()) count++;
  if (categoriaSeleccionada.value) count++;
  if (soloConCupo.value) count++;
  if (fechaSeleccionada.value) count++;
  if (organizadorSeleccionado.value) count++;
  return count;
});

// Primera actividad como pieza destacada cuando no hay filtros de búsqueda específicos activos
const destacada = computed(() => (filtrosActivosCount.value === 0 && eventsStore.actividades.length > 0 ? eventsStore.actividades[0] : null));
const listaActividades = computed(() => (destacada.value ? eventsStore.actividades.slice(1) : eventsStore.actividades));
</script>

<template>
  <div class="catalog-page">
    <!-- CABECERA Y CONSOLA DE BÚSQUEDA -->
    <header class="catalog-header">
      <div class="ch-constellation catalog-header__grid" aria-hidden="true" />

      <div class="catalog-header__inner">
        <div class="catalog-header__title-group">
          <span class="catalog-eyebrow">
            <SlidersHorizontal :size="13" :stroke-width="2.2" /> Explorador de Comunidad
          </span>
          <h1>Encuentra tu próximo punto de encuentro</h1>
          <p>Explora actividades locales organizadas por y para la comunidad.</p>
        </div>

        <!-- Consola de búsqueda unificada -->
        <div class="filter-console">
          <!-- Barra de texto -->
          <div class="search-field">
            <Search class="search-field__icon" :size="18" :stroke-width="2" aria-hidden="true" />
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Buscar por título, taller o temática..."
              aria-label="Buscar actividades"
            />
            <button
              v-if="searchTerm"
              type="button"
              class="search-field__clear"
              title="Limpiar búsqueda"
              @click="searchTerm = ''"
            >
              <X :size="14" :stroke-width="2.2" />
            </button>
          </div>

          <!-- Chips de categorías y controles rápidos -->
          <div class="filter-console__chips">
            <button
              type="button"
              class="console-chip"
              :class="{ 'console-chip--active': !categoriaSeleccionada }"
              @click="categoriaSeleccionada = null; buscarConFiltros();"
            >
              Todas las categorías
            </button>

            <button
              v-for="categoria in eventsStore.categorias"
              :key="categoria._id"
              type="button"
              class="console-chip"
              :class="[
                useCategoryStyle(categoria.name).className,
                { 'console-chip--active': categoriaSeleccionada === categoria._id }
              ]"
              @click="toggleCategoria(categoria._id)"
            >
              <span class="console-chip__dot" />
              {{ categoria.name }}
            </button>

            <!-- Filtro de cupos -->
            <button
              type="button"
              class="console-chip console-chip--toggle"
              :class="{ 'console-chip--active': soloConCupo }"
              @click="toggleCupo"
            >
              <CheckCircle :size="13" :stroke-width="2.2" />
              Con cupo libre
            </button>

            <!-- Selector de fecha -->
            <label class="console-chip console-chip--date" :class="{ 'console-chip--active': fechaSeleccionada }">
              <CalendarDays :size="13" :stroke-width="2.2" />
              <input
                v-model="fechaSeleccionada"
                type="date"
                aria-label="Filtrar por fecha"
                @change="onFechaChange"
              />
              <button
                v-if="fechaSeleccionada"
                type="button"
                class="console-chip__date-clear"
                title="Quitar fecha"
                @click.stop.prevent="limpiarFecha"
              >
                <X :size="12" :stroke-width="2.4" />
              </button>
            </label>

            <!-- Combobox de organizador -->
            <div class="org-combobox" v-if="eventsStore.organizadores.length > 0">
              <button
                type="button"
                class="console-chip org-combobox__trigger"
                :class="{ 'console-chip--active': organizadorSeleccionado }"
                @click.stop="orgDropdownOpen = !orgDropdownOpen"
              >
                <User :size="13" :stroke-width="2.2" />
                <span class="org-combobox__label">
                  {{ organizadorSeleccionado
                    ? eventsStore.organizadores.find(o => o._id === organizadorSeleccionado)?.firstName + ' ' + eventsStore.organizadores.find(o => o._id === organizadorSeleccionado)?.lastName
                    : 'Organizador' }}
                </span>
                <ChevronDown :size="11" :stroke-width="2.2" class="org-combobox__arrow" :class="{ 'org-combobox__arrow--open': orgDropdownOpen }" />
              </button>

              <Transition name="dropdown">
                <ul v-if="orgDropdownOpen" class="org-combobox__list">
                  <li>
                    <button
                      type="button"
                      class="org-combobox__option"
                      :class="{ 'org-combobox__option--active': !organizadorSeleccionado }"
                      @click="organizadorSeleccionado = null; buscarConFiltros(); orgDropdownOpen = false;"
                    >
                      <span>Todos los organizadores</span>
                    </button>
                  </li>
                  <li v-for="org in eventsStore.organizadores" :key="org._id">
                    <button
                      type="button"
                      class="org-combobox__option"
                      :class="{ 'org-combobox__option--active': organizadorSeleccionado === org._id }"
                      @click="organizadorSeleccionado = org._id; buscarConFiltros(); orgDropdownOpen = false;"
                    >
                      <span>{{ org.firstName }} {{ org.lastName }}</span>
                      <Check v-if="organizadorSeleccionado === org._id" :size="12" :stroke-width="2.4" />
                    </button>
                  </li>
                </ul>
              </Transition>
            </div>

            <!-- Botón para resetear todos los filtros -->
            <button
              v-if="filtrosActivosCount > 0"
              type="button"
              class="console-chip console-chip--reset"
              title="Restablecer filtros"
              @click="limpiarTodosLosFiltros"
            >
              <RotateCcw :size="12" :stroke-width="2.2" /> Limpiar filtros ({{ filtrosActivosCount }})
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- RESULTADOS Y CUADRÍCULA -->
    <main class="catalog-main">
      <!-- Estado de carga con esqueletos -->
      <div v-if="eventsStore.cargando" class="catalog-grid" aria-hidden="true">
        <div v-for="n in 6" :key="n" class="skeleton-node">
          <div class="skeleton-node__cover" />
          <div class="skeleton-node__body">
            <div class="skeleton-node__line skeleton-node__line--title" />
            <div class="skeleton-node__line skeleton-node__line--sub" />
            <div class="skeleton-node__line skeleton-node__line--meta" />
          </div>
        </div>
      </div>

      <!-- Estado de error -->
      <div v-else-if="eventsStore.error" class="catalog-state catalog-state--error" role="alert">
        <p>{{ eventsStore.error }}</p>
        <button type="button" class="pill-btn pill-btn--primary" @click="reintentar">
          Reintentar conexión
        </button>
      </div>

      <!-- Estado vacío personalizado con gráficos vectoriales -->
      <div v-else-if="eventsStore.actividades.length === 0" class="catalog-state">
        <svg class="catalog-state__glyph" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="28" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.3" />
          <circle cx="20" cy="40" r="4" fill="currentColor" opacity="0.5" />
          <circle cx="44" cy="24" r="4" fill="currentColor" opacity="0.5" />
          <path d="M20,40 L32,28 L44,24" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.6" />
          <circle cx="32" cy="28" r="6" stroke="var(--ch-marigold)" stroke-width="1.5" />
        </svg>
        <h3>No encontramos actividades que coincidan</h3>
        <p class="catalog-state__desc">
          No hay actividades disponibles para los criterios seleccionados{{ searchTerm ? ` (“${searchTerm}”)` : '' }}.
        </p>
        <p class="catalog-state__hint">Prueba seleccionando otra categoría o limpiando los filtros actuales.</p>
        <button type="button" class="pill-btn pill-btn--secondary" @click="limpiarTodosLosFiltros">
          Ver todas las actividades
        </button>
      </div>

      <!-- Cuadrícula con resultados -->
      <template v-else>
        <!-- Actividad destacada en cabecera cuando no hay búsqueda de texto -->
        <div v-if="destacada" class="catalog-featured-wrap">
          <div class="catalog-featured-header">
            <span class="catalog-featured-tag">
              <Sparkles :size="13" :stroke-width="2.2" /> Actividad Recomendada
            </span>
          </div>
          <EventCard :actividad="destacada" featured />
        </div>

        <!-- Cuadrícula de actividades secundarias -->
        <div v-if="listaActividades.length > 0" class="catalog-grid">
          <EventCard
            v-for="actividad in listaActividades"
            :key="actividad._id"
            :actividad="actividad"
          />
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.catalog-page {
  min-height: calc(100vh - 4.5rem);
  background: var(--ch-ink-2);
}

.catalog-header {
  position: relative;
  z-index: 10;
  padding: 3.5rem 1.5rem 3rem;
  background: radial-gradient(circle at 50% 0%, var(--ch-ink-soft) 0%, var(--ch-ink-2) 100%);
  border-bottom: 1px solid var(--ch-line);
}

.catalog-header__grid {
  overflow: hidden;
  position: absolute;
  inset: 0;
  mask-image: radial-gradient(circle at 30% 0%, black 0%, transparent 75%);
}

.catalog-header__inner {
  position: relative;
  z-index: 1;
  max-width: 80rem;
  margin: 0 auto;
}

.catalog-header__title-group {
  max-width: 44rem;
  margin-bottom: 2rem;
}

.catalog-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ch-marigold);
  margin-bottom: 0.65rem;
}

.catalog-header__title-group h1 {
  font-size: clamp(2rem, 3.8vw, 2.75rem);
  line-height: 1.15;
  margin: 0 0 0.6rem;
  color: #ffffff;
}

.catalog-header__title-group p {
  color: var(--ch-text-on-ink-muted);
  font-size: 1.02rem;
  margin: 0;
}

/* Consola de filtros integrada */
.filter-console {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.search-field {
  position: relative;
  max-width: 32rem;
}

.search-field__icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ch-text-on-ink-muted);
  pointer-events: none;
}

.search-field input {
  width: 100%;
  padding: 0.85rem 2.8rem 0.85rem 2.8rem;
  border-radius: var(--ch-radius-full);
  border: 1px solid var(--ch-line-strong);
  background: rgba(15, 21, 40, 0.85);
  backdrop-filter: blur(10px);
  color: #ffffff;
  font-family: var(--ch-font-body);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: var(--ch-shadow-sm);
}

.search-field input::placeholder {
  color: var(--ch-text-on-ink-muted);
}

.search-field input:focus-visible {
  outline: none;
  border-color: var(--ch-coral-light);
  box-shadow: 0 0 0 3px var(--ch-coral-glow);
  background: var(--ch-paper-2);
}

.search-field__clear {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ch-text-on-ink-muted);
  cursor: pointer;
}

.search-field__clear:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
}

.filter-console__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.55rem;
  position: relative;
  z-index: 50;
}

.console-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  letter-spacing: 0.02em;
  padding: 0.42rem 0.9rem;
  border-radius: var(--ch-radius-full);
  border: 1px solid var(--ch-line-strong);
  background: rgba(15, 21, 40, 0.6);
  color: var(--ch-text-on-ink-muted);
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
}

.console-chip:hover {
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.console-chip--active {
  background: var(--ch-coral) !important;
  border-color: var(--ch-coral) !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 2px 10px var(--ch-coral-glow);
}

.console-chip__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.console-chip--toggle {
  border-style: dashed;
}

.console-chip--date {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.console-chip--date input[type='date'] {
  background: transparent;
  border: none;
  color: inherit;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  cursor: pointer;
  outline: none;
  padding: 0;
}

.console-chip--date input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}

.console-chip__date-clear {
  background: none;
  border: none;
  color: inherit;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0;
  margin-left: 0.2rem;
}

.console-chip--reset {
  background: rgba(244, 63, 94, 0.1);
  border-color: rgba(244, 63, 94, 0.3);
  color: var(--ch-rose);
}

.console-chip--reset:hover {
  background: var(--ch-rose);
  color: #ffffff;
}

.console-chip--select {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

.console-chip--select select {
  background: transparent;
  border: none;
  color: inherit;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  cursor: pointer;
  outline: none;
  padding: 0;
  appearance: none;
  -webkit-appearance: none;
  max-width: 160px;
}

.console-chip--select select option {
  background: var(--ch-surface-2, #1a1a2e);
  color: var(--ch-text-primary, #e2e8f0);
}

/* Combobox de organizador */
.org-combobox {
  position: relative;
  display: inline-block;
}

.org-combobox__trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.org-combobox__label {
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-combobox__arrow {
  flex-shrink: 0;
  transition: transform 0.2s ease;
  opacity: 0.7;
}

.org-combobox__arrow--open {
  transform: rotate(180deg);
}

.org-combobox__list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 200;
  min-width: 200px;
  background: var(--ch-surface-2, #141428);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 0.4rem;
  list-style: none;
  margin: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(12px);
}

.org-combobox__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  padding: 0.45rem 0.75rem;
  background: none;
  border: none;
  border-radius: 0.5rem;
  color: var(--ch-text-muted, #94a3b8);
  font-size: 0.8rem;
  font-family: var(--ch-font-mono);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.org-combobox__option:hover {
  background: rgba(255, 255, 255, 0.07);
  color: var(--ch-text-primary, #e2e8f0);
}

.org-combobox__option--active {
  background: rgba(139, 92, 246, 0.15);
  color: var(--ch-violet, #8b5cf6);
  font-weight: 600;
}

/* Transición del dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Área de catálogo principal */
.catalog-main {
  max-width: 80rem;
  margin: 0 auto;
  padding: 3rem 1.5rem 5rem;
}

.catalog-featured-wrap {
  margin-bottom: 2.5rem;
}

.catalog-featured-header {
  margin-bottom: 0.85rem;
}

.catalog-featured-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--ch-font-mono);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ch-marigold);
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1.35rem;
}

/* Mensajes de estado y empty state */
.catalog-state {
  text-align: center;
  padding: 4.5rem 1.5rem;
  max-width: 34rem;
  margin: 0 auto;
}

.catalog-state__glyph {
  width: 4rem;
  height: 4rem;
  color: var(--ch-coral-light);
  margin-bottom: 1.5rem;
}

.catalog-state h3 {
  font-size: 1.35rem;
  margin: 0 0 0.5rem;
  color: #ffffff;
}

.catalog-state__desc {
  color: var(--ch-text-on-ink-muted);
  font-size: 0.96rem;
  margin: 0 0 0.35rem;
}

.catalog-state__hint {
  font-size: 0.85rem;
  color: var(--ch-text-on-ink-dim);
  margin: 0 0 1.75rem;
}

.catalog-state--error {
  color: var(--ch-rose);
}

/* Esqueletos de carga */
.skeleton-node {
  background: var(--ch-paper);
  border-radius: var(--ch-radius-md);
  overflow: hidden;
  border: 1px solid var(--ch-line);
}

.skeleton-node__cover {
  height: 6.8rem;
  background: linear-gradient(90deg, var(--ch-paper-2) 25%, var(--ch-paper-3) 37%, var(--ch-paper-2) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-node__body {
  padding: 1.25rem;
}

.skeleton-node__line {
  border-radius: var(--ch-radius-full);
  background: linear-gradient(90deg, var(--ch-paper-2) 25%, var(--ch-paper-3) 37%, var(--ch-paper-2) 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
  margin-bottom: 0.65rem;
}

.skeleton-node__line--title {
  height: 1.1rem;
  width: 75%;
}

.skeleton-node__line--sub {
  height: 0.85rem;
  width: 50%;
}

.skeleton-node__line--meta {
  height: 0.75rem;
  width: 90%;
  margin-top: 1rem;
}

@keyframes shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

@media (max-width: 640px) {
  .catalog-header {
    padding: 2.5rem 1.25rem 2.5rem;
  }
  .catalog-main {
    padding: 2rem 1.25rem 4rem;
  }
}
</style>