<!-- Tarjeta rediseñada de actividad: estética de nodo de encuentro, medidor de cupos dinámico y auras de categoría -->
<script setup lang="ts">
import { MapPin, Clock, ArrowUpRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-vue-next';
import { useCategoryStyle } from '~/composables/useCategoryStyle';
import type { Actividad } from '~/stores/events';

const props = withDefaults(defineProps<{ actividad: Actividad; featured?: boolean }>(), {
  featured: false,
});

const categoryStyle = computed(() => useCategoryStyle(props.actividad.category?.name));

const fechaCorta = computed(() => {
  const fecha = new Date(props.actividad.date);
  return {
    dia: new Intl.DateTimeFormat('es-CR', { day: 'numeric' }).format(fecha),
    mes: new Intl.DateTimeFormat('es-CR', { month: 'short' }).format(fecha).replace('.', '').toUpperCase(),
  };
});

const ocupacion = computed(() => {
  const { capacity, registeredCount } = props.actividad;
  if (!capacity || capacity <= 0) return 0;
  return Math.min(Math.round((registeredCount / capacity) * 100), 100);
});

const sinCupo = computed(() => (props.actividad.spotsAvailable ?? 0) <= 0);

const organizadorIniciales = computed(() => {
  const f = props.actividad.organizer?.firstName?.[0] || '';
  const l = props.actividad.organizer?.lastName?.[0] || '';
  return `${f}${l}`.toUpperCase() || 'ORG';
});
</script>

<template>
  <NuxtLink
    :to="`/actividad/${actividad._id}`"
    class="event-node-card"
    :class="[categoryStyle.className, { 'event-node-card--featured': featured }]"
  >
    <!-- Cabecera de la tarjeta con aura de color e indicador de fecha -->
    <div class="event-node-card__cover">
      <img
        v-if="actividad.image"
        :src="actividad.image"
        :alt="actividad.title"
        class="event-node-card__cover-img"
      />
      <div v-else class="ch-constellation event-node-card__cover-pattern" aria-hidden="true" />
      <div class="event-node-card__glow-layer" />

      <!-- Chip de fecha tipo sello técnico -->
      <div class="event-node-card__date-stamp">
        <span class="event-node-card__date-day">{{ fechaCorta.dia }}</span>
        <span class="event-node-card__date-month">{{ fechaCorta.mes }}</span>
      </div>

      <!-- Badge de categoría -->
      <span class="event-node-card__cat-badge">
        <span class="event-node-card__cat-dot" />
        {{ actividad.category?.name ?? 'Comunidad' }}
      </span>

      <!-- Distintivo para actividad destacada -->
      <span v-if="featured" class="event-node-card__featured-badge">
        <Sparkles :size="13" :stroke-width="2.2" /> Destacada
      </span>

      <!-- Flecha de acceso rápido en hover -->
      <span class="event-node-card__action-arrow" aria-hidden="true">
        <ArrowUpRight :size="16" :stroke-width="2.4" />
      </span>
    </div>

    <!-- Cuerpo de información -->
    <div class="event-node-card__body">
      <h3 class="event-node-card__title">{{ actividad.title }}</h3>
      <p v-if="featured && actividad.description" class="event-node-card__desc">
        {{ actividad.description }}
      </p>

      <div class="event-node-card__meta-list">
        <span v-if="actividad.time" class="event-node-card__meta-item">
          <Clock :size="13" :stroke-width="2.2" />
          {{ actividad.time }}
        </span>
        <span class="event-node-card__meta-item">
          <MapPin :size="13" :stroke-width="2.2" />
          <span class="meta-location-text">{{ actividad.location }}</span>
        </span>
      </div>

      <!-- Pie con medidor de capacidad y organizador -->
      <div class="event-node-card__footer">
        <div class="event-node-card__capacity">
          <div class="event-node-card__progress-wrap">
            <div
              class="event-node-card__progress-bar"
              :class="{ 'event-node-card__progress-bar--full': sinCupo }"
              :style="{ width: `${ocupacion}%` }"
            />
          </div>
          <div class="event-node-card__capacity-label">
            <span v-if="sinCupo" class="status-alert">
              <AlertCircle :size="11" :stroke-width="2.4" /> Sin cupo disponible
            </span>
            <span v-else class="status-available">
              <CheckCircle2 :size="11" :stroke-width="2.4" /> {{ actividad.spotsAvailable }} cupos libres
            </span>
          </div>
        </div>

        <div class="event-node-card__organizer" :title="`Organizado por ${actividad.organizer?.firstName || 'Comunidad'}`">
          <span class="event-node-card__organizer-avatar">
            <img
              v-if="actividad.organizer?.profilePicture"
              :src="actividad.organizer.profilePicture"
              :alt="actividad.organizer?.firstName || 'Organizador'"
              class="event-node-card__organizer-avatar-img"
            />
            <template v-else>{{ organizadorIniciales }}</template>
          </span>
          <span class="event-node-card__organizer-name">
            {{ actividad.organizer?.firstName }} {{ actividad.organizer?.lastName }}
          </span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<style scoped>
.event-node-card {
  display: flex;
  flex-direction: column;
  background: var(--ch-paper);
  border: 1px solid var(--ch-line);
  border-radius: var(--ch-radius-md);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: var(--ch-shadow-sm);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.event-node-card:hover {
  transform: translateY(-4px);
  border-color: var(--ch-line-strong);
  box-shadow: 0 16px 36px -12px rgba(0, 0, 0, 0.7), 0 0 20px -6px rgba(124, 92, 252, 0.25);
}

.event-node-card:focus-visible {
  outline: 2px solid var(--ch-coral-light);
  outline-offset: 2px;
}

/* Cabecera visual */
.event-node-card__cover {
  position: relative;
  height: 6.8rem;
  background: radial-gradient(circle at 75% 20%, var(--ch-paper-3) 0%, var(--ch-paper-2) 100%);
  border-bottom: 1px solid var(--ch-line);
  overflow: hidden;
}

.event-node-card__cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.event-node-card:hover .event-node-card__cover-img {
  transform: scale(1.05);
}

.event-node-card__cover-pattern {
  opacity: 0.45;
}

.event-node-card__glow-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 10% 10%, currentColor 0%, transparent 65%);
  opacity: 0.16;
  transition: opacity 0.25s ease;
}

.event-node-card:hover .event-node-card__glow-layer {
  opacity: 0.26;
}

/* Sello de fecha */
.event-node-card__date-stamp {
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  z-index: 2;
  background: rgba(4, 6, 12, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--ch-line-strong);
  border-radius: var(--ch-radius-sm);
  padding: 0.35rem 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.event-node-card__date-day {
  font-family: var(--ch-font-display);
  font-weight: 700;
  font-size: 1.15rem;
  color: #ffffff;
}

.event-node-card__date-month {
  font-family: var(--ch-font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--ch-marigold);
  font-weight: 600;
  margin-top: 0.15rem;
}

/* Badge de categoría */
.event-node-card__cat-badge {
  position: absolute;
  left: 0.8rem;
  bottom: 0.8rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--ch-font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 600;
  color: currentColor;
  background: rgba(4, 6, 12, 0.75);
  backdrop-filter: blur(6px);
  border: 1px solid currentColor;
  padding: 0.25rem 0.65rem;
  border-radius: var(--ch-radius-full);
}

.event-node-card__cat-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}

.event-node-card__featured-badge {
  position: absolute;
  left: 0.8rem;
  top: 0.8rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--ch-font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #04060c;
  background: var(--ch-marigold);
  padding: 0.3rem 0.75rem;
  border-radius: var(--ch-radius-full);
  box-shadow: 0 4px 12px var(--ch-marigold-glow);
}

.event-node-card__action-arrow {
  position: absolute;
  right: 0.8rem;
  bottom: 0.8rem;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--ch-line-strong);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  z-index: 2;
}

.event-node-card:hover .event-node-card__action-arrow {
  opacity: 1;
  transform: scale(1);
  background: var(--ch-coral);
}

/* Cuerpo de la tarjeta */
.event-node-card__body {
  padding: 1.25rem 1.4rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.event-node-card--featured .event-node-card__body {
  padding: 1.5rem 1.75rem;
}

.event-node-card__title {
  font-family: var(--ch-font-display);
  font-weight: 600;
  font-size: 1.15rem;
  line-height: 1.3;
  margin: 0 0 0.5rem;
  color: var(--ch-text-on-paper);
  transition: color 0.15s ease;
}

.event-node-card:hover .event-node-card__title {
  color: #ffffff;
}

.event-node-card--featured .event-node-card__title {
  font-size: 1.55rem;
}

.event-node-card__desc {
  margin: 0 0 0.85rem;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--ch-text-on-paper-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-node-card__meta-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.85rem;
  margin: 0 0 1.1rem;
  font-size: 0.82rem;
  color: var(--ch-text-on-paper-muted);
}

.event-node-card__meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.event-node-card__meta-item svg {
  color: var(--ch-coral-light);
  flex-shrink: 0;
}

.meta-location-text {
  max-width: 14rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Pie con capacidad y organizador */
.event-node-card__footer {
  margin-top: auto;
  padding-top: 0.9rem;
  border-top: 1px dashed var(--ch-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.event-node-card__capacity {
  flex: 1;
  min-width: 0;
}

.event-node-card__progress-wrap {
  height: 5px;
  border-radius: var(--ch-radius-full);
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-bottom: 0.35rem;
}

.event-node-card__progress-bar {
  height: 100%;
  background: currentColor;
  border-radius: var(--ch-radius-full);
  transition: width 0.3s ease;
}

.event-node-card__progress-bar--full {
  background: var(--ch-error) !important;
}

.event-node-card__capacity-label {
  font-size: 0.74rem;
  font-family: var(--ch-font-mono);
}

.status-available {
  color: var(--ch-leaf);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.status-alert {
  color: var(--ch-rose);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
}

.event-node-card__organizer {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  color: var(--ch-text-on-paper-muted);
  max-width: 8.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-node-card__organizer-avatar {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 50%;
  background: var(--ch-paper-3);
  border: 1px solid var(--ch-line-strong);
  font-family: var(--ch-font-mono);
  font-size: 0.62rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.event-node-card__organizer-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-node-card__organizer-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
