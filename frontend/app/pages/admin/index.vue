<script setup lang="ts">
definePageMeta({ middleware: 'admin' });
useHead({ title: 'Administración · CommunityHub' });
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header">
        <span class="panel-eyebrow">Administración</span>
        <h1>Panel de administrador</h1>
        <p>Gestiona usuarios, actividades, categorías y estadísticas de la plataforma.</p>
      </header>

      <div class="panel-grid">
        <NuxtLink to="/admin/users" class="panel-card">
          <h3>Usuarios</h3>
          <p>Consulta y elimina cuentas de usuario.</p>
        </NuxtLink>
        <NuxtLink to="/admin/events" class="panel-card">
          <h3>Actividades</h3>
          <p>Modera todas las actividades de la plataforma.</p>
        </NuxtLink>
        <NuxtLink to="/admin/categories" class="panel-card">
          <h3>Categorías</h3>
          <p>Crea, edita y elimina categorías.</p>
        </NuxtLink>
        <NuxtLink to="/admin/statistics" class="panel-card">
          <h3>Estadísticas</h3>
          <p>Números generales de la plataforma.</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.15s ease;
}

.panel-card:hover {
  transform: translateY(-3px);
}

.panel-card h3 {
  margin: 0 0 0.4rem;
  font-family: var(--ch-font-display);
  font-weight: 400;
}

.panel-card p {
  margin: 0;
  color: var(--ch-text-on-paper-muted);
  font-size: 0.9rem;
}
</style>
