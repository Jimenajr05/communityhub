<script setup lang="ts">
const authStore = useAuthStore();
onMounted(() => {
  authStore.obtenerUsuarioActual();
});
</script>

<template>
  <div>
    <NuxtPwaManifest />
    <NuxtRouteAnnouncer />
    <OfflineBanner />
    <AppHeader />
    <NuxtPage />
  </div>
</template>