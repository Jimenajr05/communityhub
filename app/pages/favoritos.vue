<!--
  Página de favoritos del usuario (ruta /favoritos).
  Muestra las actividades que el usuario autenticado ha marcado
  como favoritas y permite quitarlas de la lista.
-->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
useHead({ title: 'Mis favoritos · CommunityHub' });

const eventsStore = useEventsStore();
// Indica si la lista de favoritos todavía se está cargando
const cargando = ref(true);

/** Al montar la página, carga los favoritos del usuario autenticado. */
onMounted(async () => {
  await eventsStore.obtenerMisFavoritos();
  cargando.value = false;
});

/** Quita una actividad de la lista de favoritos del usuario. */
async function quitar(eventId: string) {
  await eventsStore.quitarFavorito(eventId);
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">

      <header class="panel-header">
        <span class="panel-eyebrow">Tu cuenta</span>
        <h1>Mis favoritos</h1>
        <p>Actividades y eventos guardados para no perderlos de vista.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando tus favoritos…</p>

      <div v-else-if="eventsStore.misFavoritos.length === 0" class="panel-card empty-card">
        <h3>Todavía no has guardado actividades como favoritas</h3>
        <p>Explora los eventos comunitarios y presiona el botón de guardar para verlos aquí.</p>
        <NuxtLink to="/actividades" class="pill-btn pill-btn--primary">
          Explorar actividades
        </NuxtLink>
      </div>

      <div v-else class="fav-grid">
        <div v-for="fav in eventsStore.misFavoritos" :key="fav._id" class="fav-card panel-card">
          <div class="fav-card__header">
            <span class="fav-card__badge">Guardado</span>
            <button
              type="button"
              class="fav-remove-btn"
              title="Quitar de favoritos"
              @click="quitar(fav.event._id)"
            >
              ✕
            </button>
          </div>

          <NuxtLink :to="`/actividad/${fav.event._id}`" class="fav-card__title">
            <h3>{{ fav.event.title }}</h3>
          </NuxtLink>

          <div class="fav-card__meta">
            <span>{{ new Date(fav.event.date).toLocaleDateString('es-CR', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
            <span>{{ fav.event.location }}</span>
          </div>

          <div class="fav-card__footer">
            <NuxtLink :to="`/actividad/${fav.event._id}`" class="pill-btn pill-btn--primary" style="width: 100%;">
              Ver actividad →
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
  padding: 3.5rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon {
  font-size: 2.5rem;
}

.empty-card h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--ch-text-on-paper);
}

.empty-card p {
  margin: 0 0 1.25rem;
  color: var(--ch-text-on-paper-muted);
  max-width: 26rem;
}

.fav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: 1.25rem;
}

.fav-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border: 1px solid var(--ch-line);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.fav-card:hover {
  transform: translateY(-3px);
  border-color: var(--ch-coral);
  box-shadow: 0 14px 28px -8px rgba(0, 0, 0, 0.25);
}

.fav-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fav-card__badge {
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  font-weight: 600;
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.12);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.fav-remove-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--ch-line);
  color: var(--ch-text-on-paper-muted);
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.15s ease;
}

.fav-remove-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
}

.fav-card__title {
  text-decoration: none;
}

.fav-card__title h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ch-text-on-paper) !important;
  transition: color 0.15s ease;
}

.fav-card__title:hover h3 {
  color: var(--ch-coral) !important;
}

.fav-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.88rem;
  color: var(--ch-text-on-paper-muted);
}

.fav-card__footer {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid var(--ch-line);
}
</style>
