<!-- Panel póster decorativo para pantallas de autenticación (Login/Registro) con estética de red comunitaria -->
<script setup lang="ts">
import { MapPin, Sparkles, Compass } from 'lucide-vue-next';

interface Props {
  eyebrow?: string;
  headlineLines: string[];
  copy: string;
  tags: string[];
  sealLines?: [string, string];
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: 'Red Comunitaria',
  sealLines: () => ['ACCESO', '2026'],
});

const rotations = [-3, 2.5, -2, 3.5, -4, 3, -2.5];
</script>

<template>
  <section class="auth-poster" aria-hidden="true">
    <div class="ch-constellation auth-poster__grid" />
    
    <!-- Rutas y trayectorias SVG conectando puntos de interés -->
    <svg class="auth-poster__routes" viewBox="0 0 400 600" preserveAspectRatio="none">
      <path d="M40,90 C120,150 90,260 180,310 C270,360 220,460 320,530" />
      <path d="M300,100 C200,180 240,290 140,400" stroke-dasharray="3 5" />
    </svg>

    <div class="auth-poster__pin auth-poster__pin--a">
      <div class="auth-poster__pin-core"><MapPin :size="13" :stroke-width="2.2" /></div>
      <span class="auth-poster__pin-pulse" />
    </div>

    <div class="auth-poster__pin auth-poster__pin--b">
      <div class="auth-poster__pin-core"><Compass :size="13" :stroke-width="2.2" /></div>
      <span class="auth-poster__pin-pulse" />
    </div>

    <div class="auth-poster__content">
      <div class="auth-poster__eyebrow">
        <span class="ch-beacon">
          <span class="ch-beacon-ring" />
          <span class="ch-beacon-dot" />
        </span>
        <span>{{ props.eyebrow }}</span>
      </div>

      <h1 class="auth-poster__headline">
        <template v-for="(line, i) in props.headlineLines" :key="i">
          {{ line }}<br v-if="i < props.headlineLines.length - 1" />
        </template>
      </h1>

      <p class="auth-poster__copy">{{ props.copy }}</p>

      <ul class="auth-poster__tags">
        <li
          v-for="(tag, i) in props.tags"
          :key="tag"
          :style="{ '--r': `${rotations[i % rotations.length]}deg` }"
        >
          <span class="auth-poster__tag-dot" />
          {{ tag }}
        </li>
      </ul>
    </div>

    <!-- Sello circular de pertenencia comunitaria -->
    <div class="auth-poster__seal">
      <Sparkles :size="16" :stroke-width="2" class="auth-poster__seal-icon" />
      <span>{{ props.sealLines[0] }}</span>
      <span class="auth-poster__seal-sub">{{ props.sealLines[1] }}</span>
    </div>
  </section>
</template>

<style scoped>
.auth-poster {
  position: relative;
  overflow: hidden;
  padding: 4.5rem 3.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: radial-gradient(120% 140% at 20% 20%, var(--ch-ink-soft) 0%, var(--ch-ink-2) 60%, var(--ch-ink) 100%);
  min-height: 100%;
}

.auth-poster__grid {
  mask-image: radial-gradient(circle at 35% 35%, black 0%, transparent 80%);
}

.auth-poster__routes {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.auth-poster__routes path {
  fill: none;
  stroke: var(--ch-line-strong);
  stroke-width: 1.5;
  stroke-dasharray: 4 7;
}

.auth-poster__pin {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-poster__pin--a {
  top: 14%;
  left: 8%;
}

.auth-poster__pin--b {
  bottom: 15%;
  right: 18%;
}

.auth-poster__pin-core {
  width: 2rem;
  height: 2rem;
  border-radius: 50% 50% 50% 0;
  background: var(--ch-paper-2);
  border: 1.5px solid var(--ch-coral-light);
  color: var(--ch-marigold);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
  z-index: 2;
}

.auth-poster__pin-core svg {
  transform: rotate(-45deg);
}

.auth-poster__pin-pulse {
  position: absolute;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  border: 1px solid var(--ch-coral);
  animation: pulse-ring 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
  z-index: 1;
}

.auth-poster__content {
  position: relative;
  z-index: 2;
  max-width: 32rem;
}

.auth-poster__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-family: var(--ch-font-mono);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ch-marigold);
  margin-bottom: 1.75rem;
}

.auth-poster__headline {
  font-family: var(--ch-font-display);
  font-weight: 700;
  font-size: clamp(2.4rem, 4.5vw, 3.6rem);
  line-height: 1.06;
  letter-spacing: -0.025em;
  margin: 0 0 1.25rem;
  color: #ffffff;
}

.auth-poster__copy {
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--ch-text-on-ink-muted);
  margin: 0 0 2.25rem;
  max-width: 27rem;
}

.auth-poster__tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
}

.auth-poster__tags li {
  font-family: var(--ch-font-mono);
  font-size: 0.78rem;
  padding: 0.4rem 0.9rem;
  border: 1px solid var(--ch-line-strong);
  border-radius: var(--ch-radius-full);
  color: var(--ch-text-on-ink);
  transform: rotate(var(--r));
  background: rgba(15, 21, 40, 0.6);
  backdrop-filter: blur(6px);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.auth-poster__tag-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--ch-coral-light);
}

.auth-poster__seal {
  position: absolute;
  top: 3rem;
  right: 3rem;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 1.5px dashed rgba(245, 158, 11, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--ch-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  color: var(--ch-marigold);
  transform: rotate(10deg);
  background: rgba(4, 6, 12, 0.4);
}

.auth-poster__seal-icon {
  margin-bottom: 0.2rem;
}

.auth-poster__seal-sub {
  font-size: 0.58rem;
  opacity: 0.8;
}

@media (max-width: 900px) {
  .auth-poster {
    padding: 3rem 1.75rem;
  }
  .auth-poster__headline {
    font-size: clamp(2rem, 7.5vw, 2.75rem);
  }
  .auth-poster__seal {
    top: 1.5rem;
    right: 1.5rem;
    width: 72px;
    height: 72px;
  }
}
</style>