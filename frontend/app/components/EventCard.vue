<script setup lang="ts">
import { useCategoryStyle } from '~/composables/useCategoryStyle';
import type { Actividad } from '~/stores/events';

const props = defineProps<{ actividad: Actividad }>();

const categoryStyle = computed(() => useCategoryStyle(props.actividad.category?.name));

const fechaCorta = computed(() => {
  const fecha = new Date(props.actividad.date);
  return {
    dia: new Intl.DateTimeFormat('es-CR', { day: 'numeric' }).format(fecha),
    mes: new Intl.DateTimeFormat('es-CR', { month: 'short' }).format(fecha).replace('.', ''),
  };
});

const ocupacion = computed(() => {
  const { capacity, registeredCount } = props.actividad;
  if (capacity <= 0) return 0;
  return Math.min(Math.round((registeredCount / capacity) * 100), 100);
});

const sinCupo = computed(() => props.actividad.spotsAvailable <= 0);
</script>

<template>
  <NuxtLink :to="`/actividad/${actividad._id}`" class="event-card">
    <div class="event-card__cover" :class="categoryStyle.className">
      <div class="event-card__cover-grid" aria-hidden="true" />
      <span class="event-card__cover-emoji" aria-hidden="true">{{ categoryStyle.emoji }}</span>

      <span class="event-card__date-chip">
        <strong>{{ fechaCorta.dia }}</strong>
        <span>{{ fechaCorta.mes }}</span>
      </span>

      <span class="event-card__category-chip">{{ actividad.category?.name ?? 'General' }}</span>
    </div>

    <div class="event-card__body">
      <h3 class="event-card__title">{{ actividad.title }}</h3>
      <p class="event-card__meta">🕒 {{ actividad.time }} &nbsp;·&nbsp; 📍 {{ actividad.location }}</p>

      <div class="event-card__footer">
        <div class="event-card__capacity">
          <div class="event-card__bar">
            <div
              class="event-card__bar-fill"
              :class="{ 'event-card__bar-fill--full': sinCupo }"
              :style="{ width: `${ocupacion}%` }"
            />
          </div>
          <span class="event-card__spots" :class="{ 'event-card__spots--full': sinCupo }">
            {{ sinCupo ? 'Sin cupo' : `${actividad.spotsAvailable} cupos libres` }}
          </span>
        </div>

        <span class="event-card__organizer">
          {{ actividad.organizer?.firstName }} {{ actividad.organizer?.lastName }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.event-card {
  display: block;
  background: var(--ch-paper);
  border-radius: var(--ch-radius-md);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 12px 30px -18px rgba(0, 0, 0, 0.45);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 38px -16px rgba(0, 0, 0, 0.5);
}

.event-card:focus-visible {
  outline: 3px solid var(--ch-marigold);
  outline-offset: 2px;
}

/* ---------- Portada tipo póster, con color por categoría ---------- */
.event-card__cover {
  position: relative;
  height: 6.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-card__cover-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.22) 1.3px, transparent 1.3px);
  background-size: 16px 16px;
  opacity: 0.5;
}

.event-card__cover-emoji {
  font-size: 2.6rem;
  transform: rotate(-6deg);
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25));
}

.event-card__date-chip {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  background: var(--ch-paper);
  color: var(--ch-text-on-paper);
  border-radius: var(--ch-radius-sm);
  padding: 0.3rem 0.55rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.05;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.event-card__date-chip strong {
  font-family: var(--ch-font-display);
  font-weight: 400;
  font-size: 1rem;
}

.event-card__date-chip span {
  font-family: var(--ch-font-mono);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ch-text-on-paper-muted);
}

.event-card__category-chip {
  position: absolute;
  left: 0.7rem;
  bottom: 0.6rem;
  font-family: var(--ch-font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
  background: rgba(0, 0, 0, 0.22);
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
}

.cover--talleres {
  background: linear-gradient(135deg, var(--ch-coral) 0%, var(--ch-coral-dark) 100%);
}
.cover--deportes {
  background: linear-gradient(135deg, var(--ch-teal) 0%, var(--ch-teal-dark) 100%);
}
.cover--arte {
  background: linear-gradient(135deg, var(--ch-rose) 0%, var(--ch-rose-dark) 100%);
}
.cover--networking {
  background: linear-gradient(135deg, var(--ch-violet) 0%, var(--ch-violet-dark) 100%);
}
.cover--voluntariado {
  background: linear-gradient(135deg, var(--ch-leaf) 0%, var(--ch-leaf-dark) 100%);
}
.cover--default {
  background: linear-gradient(135deg, var(--ch-marigold) 0%, var(--ch-coral) 100%);
}

/* ---------- Cuerpo de la tarjeta ---------- */
.event-card__body {
  padding: 1.1rem 1.35rem 1.3rem;
}

.event-card__title {
  font-family: var(--ch-font-display);
  font-weight: 400;
  font-size: 1.15rem;
  line-height: 1.25;
  margin: 0 0 0.5rem;
  color: var(--ch-text-on-paper);
}

.event-card__meta {
  margin: 0 0 1.05rem;
  font-size: 0.85rem;
  color: var(--ch-text-on-paper-muted);
}

.event-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.85rem;
  border-top: 1px dashed var(--ch-line);
}

.event-card__capacity {
  flex: 1;
  min-width: 0;
}

.event-card__bar {
  height: 5px;
  border-radius: 999px;
  background: var(--ch-paper-2);
  overflow: hidden;
  margin-bottom: 0.35rem;
}

.event-card__bar-fill {
  height: 100%;
  background: var(--ch-coral);
  border-radius: 999px;
}

.event-card__bar-fill--full {
  background: var(--ch-error);
}

.event-card__spots {
  font-size: 0.76rem;
  color: var(--ch-text-on-paper-muted);
}

.event-card__spots--full {
  color: var(--ch-error);
  font-weight: 600;
}

.event-card__organizer {
  font-size: 0.76rem;
  color: var(--ch-text-on-paper-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 9rem;
}
</style>