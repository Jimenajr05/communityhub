<!-- Componente raíz de la aplicación: define el layout global (banner offline, header y contenido de la página) -->
<script setup lang="ts">
const authStore = useAuthStore();
// Al montar la app, se intenta recuperar el usuario autenticado actual (por ejemplo, desde la sesión/cookie)
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

<style>
</style>
