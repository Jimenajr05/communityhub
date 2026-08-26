<!--
  Página de favoritos del usuario (ruta /favoritos).
  Muestra las actividades que el usuario autenticado ha guardado como favoritas.
-->
<script setup lang="ts">
import { X, CalendarDays, MapPin, ArrowRight, Heart, Compass } from 'lucide-vue-next';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Mis favoritos · CommunityHub' });

const eventsStore = useEventsStore();
const cargando = ref(true);

onMounted(async () => {
  await eventsStore.obtenerMisFavoritos();
  cargando.value = false;
});

async function quitar(eventId: string) {
  await eventsStore.quitarFavorito(eventId);
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">

      <header class="panel-header">
        <span class="panel-eyebrow">Tu colección</span>
        <h1>Mis actividades favoritas</h1>
        <p>Actividades y talleres comunitarios guardados para no perderles la pista.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Consultando tus actividades guardadas...</p>

      <!-- Estado vacío personalizado -->
      <div v-else-if="eventsStore.misFavoritos.length === 0" class="panel-card empty-card">
        <svg class="empty-card__glyph" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path
            d="M32 46 C18 36 10 28 10 19 C10 12 15 8 21 8 C26 8 30 11 32 15 C34 11 38 8 43 8 C49 8 54 12 54 19 C54 28 46 36 32 46 Z"
            stroke="currentColor"
            stroke-width="1.8"
            opacity="0.4"
          />
          <circle cx="18" cy="48" r="3" fill="var(--ch-rose)" opacity="0.8" />
          <circle cx="46" cy="50" r="2.5" fill="var(--ch-marigold)" opacity="0.8" />
          <path d="M18 48 L32 46 L46 50" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 5" opacity="0.5" />
        </svg>
        <h3>No has encontrado tu próxima actividad todavía</h3>
        <p>Explora actividades y guarda las que quieras tener a mano para consultar sus cupos y fechas.</p>
        <NuxtLink to="/actividades" class="pill-btn pill-btn--primary">
          <Compass :size="16" :stroke-width="2.2" /> Explorar actividades
        </NuxtLink>
      </div>

      <!-- Cuadrícula de favoritos -->
      <div v-else class="fav-grid">
        <div v-for="fav in eventsStore.misFavoritos" :key="fav._id" class="fav-card panel-card">
          <div class="fav-card__header">
            <span class="fav-card__badge">
              <Heart :size="12" :stroke-width="2.4" fill="currentColor" /> Guardado
            </span>

            <button
              type="button"
              class="fav-card__remove-btn"
              title="Quitar de mis favoritos"
              @click="quitar(fav.event._id)"
            >
              <X :size="14" :stroke-width="2.4" />
            </button>
          </div>

          <NuxtLink :to="`/actividad/${fav.event._id}`" class="fav-card__title">
            <h3>{{ fav.event.title }}</h3>
          </NuxtLink>

          <div class="fav-card__meta">
            <span>
              <CalendarDays :size="13" :stroke-width="2.2" />
              {{ new Date(fav.event.date).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) }}
            </span>
            <span>
              <MapPin :size="13" :stroke-width="2.2" />
              {{ fav.event.location }}
            </span>
          </div>

          <div class="fav-card__footer">
            <NuxtLink :to="`/actividad/${fav.event._id}`" class="pill-btn pill-btn--primary" style="width: 100%;">
              Ver actividad y cupos <ArrowRight :size="15" :stroke-width="2.2" />
            </NuxtLink>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.empty-card {
  text-align: center;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-card__glyph {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--ch-rose);
  margin-bottom: 0.5rem;
}

.empty-card h3 {
  font-size: 1.35rem;
  margin: 0;
  color: #ffffff;
}

.empty-card p {
  color: var(--ch-text-on-paper-muted);
  max-width: 28rem;
  margin: 0 0 1.5rem;
}

.fav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1.35rem;
}

.fav-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  transition: all 0.2s ease;
}

.fav-card:hover {
  transform: translateY(-3px);
  border-color: var(--ch-coral-light);
  box-shadow: var(--ch-shadow-md);
}

.fav-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fav-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ch-rose);
  background: rgba(244, 63, 94, 0.12);
  border: 1px solid rgba(244, 63, 94, 0.25);
  padding: 0.25rem 0.65rem;
  border-radius: var(--ch-radius-full);
}

.fav-card__remove-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--ch-line-strong);
  color: var(--ch-text-on-paper-muted);
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.fav-card__remove-btn:hover {
  background: rgba(244, 63, 94, 0.15);
  border-color: var(--ch-rose);
  color: var(--ch-rose);
}

.fav-card__title {
  text-decoration: none;
}

.fav-card__title h3 {
  font-size: 1.15rem;
  line-height: 1.3;
  margin: 0;
  color: #ffffff;
  transition: color 0.15s ease;
}

.fav-card__title:hover h3 {
  color: var(--ch-coral-light);
}

.fav-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.84rem;
  color: var(--ch-text-on-paper-muted);
}

.fav-card__meta span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.fav-card__footer {
  margin-top: auto;
  padding-top: 0.85rem;
  border-top: 1px dashed var(--ch-line);
}
</style>
