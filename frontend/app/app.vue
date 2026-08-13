<script setup lang="ts">
const { isOnline } = useOnlineStatus();
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />

    <div v-if="!isOnline" class="offline-banner">
      Estás sin conexión — mostrando información guardada previamente.
    </div>

    <NuxtWelcome />
  </div>
</template>

<style>
.offline-banner {
  background-color: #f59e0b;
  color: #1f2937;
  text-align: center;
  padding: 0.5rem;
  font-family: sans-serif;
  font-size: 0.9rem;
}
</style>
