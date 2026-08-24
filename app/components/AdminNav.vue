<!-- Barra de navegación lateral del panel de administración -->
<script setup lang="ts">
import { LayoutGrid, Users, CalendarDays, Tag, BarChart3 } from 'lucide-vue-next';
</script>

<template>
  <nav class="panel-nav" aria-label="Navegación de administración">
    <NuxtLink to="/admin"><LayoutGrid :size="14" :stroke-width="2.2" /> Resumen</NuxtLink>
    <NuxtLink to="/admin/users"><Users :size="14" :stroke-width="2.2" /> Usuarios</NuxtLink>
    <NuxtLink to="/admin/events"><CalendarDays :size="14" :stroke-width="2.2" /> Actividades</NuxtLink>
    <NuxtLink to="/admin/categories"><Tag :size="14" :stroke-width="2.2" /> Categorías</NuxtLink>
    <NuxtLink to="/admin/statistics"><BarChart3 :size="14" :stroke-width="2.2" /> Estadísticas</NuxtLink>
  </nav>
</template>

<style scoped>
.panel-nav a {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
