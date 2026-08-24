<!-- Banner que se muestra cuando el usuario pierde la conexión a internet (modo offline de la PWA) -->
<script setup lang="ts">
import { WifiOff } from 'lucide-vue-next';

// Estado reactivo de conexión provisto por el composable useOnlineStatus
const { isOnline } = useOnlineStatus();
</script>

<template>
  <Transition name="slide-banner">
    <div v-if="!isOnline" class="offline-banner" role="status" aria-live="polite">
      <div class="offline-banner__content">
        <WifiOff :size="18" :stroke-width="2" class="offline-banner__icon" />
        <div>
          <strong>Sin conexión a Internet (Modo Offline)</strong>
          <p>Estás navegando con la versión en caché de la PWA. Algunas funciones interactivas como la inscripción requieren conexión.</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.offline-banner {
  background: var(--ch-coral);
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 9999;
}

.offline-banner__content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.offline-banner__icon {
  flex-shrink: 0;
}

.offline-banner strong {
  display: block;
  font-size: 0.95rem;
  font-family: var(--ch-font-mono);
  letter-spacing: 0.03em;
}

.offline-banner p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

.slide-banner-enter-active,
.slide-banner-leave-active {
  transition: all 0.3s ease;
}

.slide-banner-enter-from,
.slide-banner-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>