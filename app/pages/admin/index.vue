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
        <NuxtLink to="/admin/users" class="admin-feature-card panel-card">
          <div class="admin-feature-card__content">
            <h3>Usuarios</h3>
            <p>Consulta, gestiona y asigna roles a cuentas de usuario.</p>
          </div>
          <span class="admin-feature-card__arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/admin/events" class="admin-feature-card panel-card">
          <div class="admin-feature-card__content">
            <h3>Actividades</h3>
            <p>Modera y administra todas las actividades de la plataforma.</p>
          </div>
          <span class="admin-feature-card__arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/admin/categories" class="admin-feature-card panel-card">
          <div class="admin-feature-card__content">
            <h3>Categorías</h3>
            <p>Crea, edita y elimina categorías para eventos.</p>
          </div>
          <span class="admin-feature-card__arrow">→</span>
        </NuxtLink>

        <NuxtLink to="/admin/statistics" class="admin-feature-card panel-card">
          <div class="admin-feature-card__content">
            <h3>Estadísticas</h3>
            <p>Consulta métricas clave y números generales del sistema.</p>
          </div>
          <span class="admin-feature-card__arrow">→</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-feature-card {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  text-decoration: none;
  background: var(--ch-paper);
  color: var(--ch-text-on-paper);
  border: 1px solid var(--ch-line);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
}

.admin-feature-card:hover {
  transform: translateY(-4px);
  border-color: var(--ch-coral);
  box-shadow: 0 20px 35px -15px rgba(0, 0, 0, 0.45);
}

.admin-feature-card__icon {
  font-size: 2rem;
  line-height: 1;
  background: var(--ch-paper-2);
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.admin-feature-card__content {
  flex: 1;
}

.admin-feature-card__content h3 {
  margin: 0 0 0.35rem;
  font-family: var(--ch-font-display);
  font-weight: 400;
  font-size: 1.2rem;
  color: var(--ch-text-on-paper) !important;
}

.admin-feature-card__content p {
  margin: 0;
  color: var(--ch-text-on-paper-muted);
  font-size: 0.9rem;
  line-height: 1.45;
}

.admin-feature-card__arrow {
  font-family: var(--ch-font-mono);
  font-size: 1.2rem;
  color: var(--ch-coral);
  transition: transform 0.2s ease;
}

.admin-feature-card:hover .admin-feature-card__arrow {
  transform: translateX(4px);
}
</style>
