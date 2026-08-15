<script setup lang="ts">
interface Props {
  eyebrow?: string;
  headlineLines: string[];
  copy: string;
  tags: string[];
  sealLines?: [string, string];
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: 'CommunityHub',
  sealLines: () => ['MIEMBRO', '2026'],
});

// Rotaciones fijas para que las etiquetas se vean "pegadas" a mano,
// sin depender de Math.random (evitaría mismatches de hidratación SSR).
const rotations = [-4, 3, -2, 5, -6, 4, -3];
</script>

<template>
  <section class="poster-panel" aria-hidden="true">
    <div class="poster-panel__grid" />

    <div class="poster-panel__content">
      <span class="poster-eyebrow">{{ props.eyebrow }}</span>
      <h1 class="poster-headline">
        <template v-for="(line, i) in props.headlineLines" :key="i">
          {{ line }}<br v-if="i < props.headlineLines.length - 1" />
        </template>
      </h1>
      <p class="poster-copy">{{ props.copy }}</p>

      <ul class="poster-tags">
        <li v-for="(tag, i) in props.tags" :key="tag" :style="{ '--r': `${rotations[i % rotations.length]}deg` }">
          {{ tag }}
        </li>
      </ul>
    </div>

    <div class="poster-seal">
      <span>{{ props.sealLines[0] }}</span>
      <span>{{ props.sealLines[1] }}</span>
    </div>
  </section>
</template>

<style scoped>
.poster-panel {
  position: relative;
  overflow: hidden;
  padding: 4rem 3.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: radial-gradient(120% 140% at 15% 10%, var(--ch-ink-soft) 0%, var(--ch-ink) 55%, var(--ch-ink-2) 100%);
}

.poster-panel__grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(245, 241, 232, 0.14) 1.5px, transparent 1.5px);
  background-size: 26px 26px;
  mask-image: radial-gradient(circle at 30% 30%, black 0%, transparent 75%);
}

.poster-panel__content {
  position: relative;
  z-index: 1;
  max-width: 30rem;
}

.poster-eyebrow {
  display: inline-block;
  font-family: var(--ch-font-mono);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: var(--ch-marigold);
  margin-bottom: 1.75rem;
}

.poster-headline {
  font-family: var(--ch-font-display);
  font-weight: 400;
  font-size: clamp(2.5rem, 4.2vw, 3.6rem);
  line-height: 1.04;
  letter-spacing: -0.01em;
  margin: 0 0 1.5rem;
  color: var(--ch-text-on-ink);
}

.poster-copy {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--ch-text-on-ink-muted);
  margin: 0 0 2.5rem;
  max-width: 26rem;
}

.poster-tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin: 0;
  padding: 0;
}

.poster-tags li {
  font-family: var(--ch-font-mono);
  font-size: 0.82rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid rgba(245, 241, 232, 0.25);
  border-radius: 999px;
  color: var(--ch-text-on-ink);
  transform: rotate(var(--r));
  background: rgba(245, 241, 232, 0.04);
}

.poster-seal {
  position: absolute;
  top: 3rem;
  right: 3rem;
  width: 92px;
  height: 92px;
  border-radius: 50%;
  border: 1.5px dashed rgba(255, 201, 60, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: var(--ch-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: var(--ch-marigold);
  transform: rotate(12deg);
}

@media (max-width: 900px) {
  .poster-panel {
    padding: 2.5rem 1.75rem 3rem;
  }

  .poster-headline {
    font-size: clamp(2rem, 8vw, 2.6rem);
  }

  .poster-copy {
    margin-bottom: 1.75rem;
  }

  .poster-seal {
    top: 1.75rem;
    right: 1.75rem;
    width: 72px;
    height: 72px;
  }
}
</style>