<script setup lang="ts">
const { isOnline } = useOnlineStatus();

// Restaura la sesión (token en cookie -> GET /auth/me) al cargar la app,
// para que un refresh de página no cierre la sesión del usuario.
const authStore = useAuthStore();
onMounted(() => {
  authStore.obtenerUsuarioActual();
});
</script>

<template>
  <div>
    <NuxtPwaManifest />
    <NuxtRouteAnnouncer />

    <div v-if="!isOnline" class="offline-banner">
      Estás sin conexión — mostrando información guardada previamente.
    </div>

    <NuxtPage />
  </div>
</template>

<style>
.offline-banner {
  background-color: var(--ch-marigold);
  color: var(--ch-text-on-paper);
  text-align: center;
  padding: 0.6rem;
  font-family: var(--ch-font-body);
  font-weight: 600;
  font-size: 0.9rem;
  position: sticky;
  top: 0;
  z-index: 100;
}
</style>