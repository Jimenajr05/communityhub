<script setup lang="ts">
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
        <span class="panel-eyebrow">Tu cuenta</span>
        <h1>Mis favoritos</h1>
        <p>Actividades que guardaste para no perderlas de vista.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando…</p>

      <p v-else-if="eventsStore.misFavoritos.length === 0" class="panel-empty">
        Todavía no has guardado ninguna actividad como favorita.
      </p>

      <div v-else class="panel-grid">
        <div v-for="fav in eventsStore.misFavoritos" :key="fav._id" class="panel-card">
          <NuxtLink :to="`/actividad/${fav.event._id}`">
            <h3>{{ fav.event.title }}</h3>
          </NuxtLink>
          <p>📅 {{ new Date(fav.event.date).toLocaleDateString('es-CR') }} · 📍 {{ fav.event.location }}</p>
          <button type="button" class="pill-btn pill-btn--ghost" @click="quitar(fav.event._id)">
            Quitar de favoritos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
