<!-- Barra de navegación lateral del panel de administración -->
<script setup lang="ts"></script>

<template>
  <nav class="panel-nav" aria-label="Navegación de administración">
    <NuxtLink to="/admin">Resumen</NuxtLink>
    <NuxtLink to="/admin/users">Usuarios</NuxtLink>
    <NuxtLink to="/admin/events">Actividades</NuxtLink>
    <NuxtLink to="/admin/categories">Categorías</NuxtLink>
    <NuxtLink to="/admin/statistics">Estadísticas</NuxtLink>
  </nav>
</template>
