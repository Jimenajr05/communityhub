<!--
  Página principal del panel de administración (ruta /admin).
  Solo accesible para administradores; sirve de menú de acceso
  a las secciones de usuarios, actividades, categorías y estadísticas.
-->
<script setup lang="ts">
import { Users, CalendarDays, Tag, BarChart3, ArrowRight, Shield, Waypoints } from 'lucide-vue-next';

definePageMeta({ middleware: 'admin' });
useHead({ title: 'Administración · CommunityHub' });
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header">
        <span class="panel-eyebrow"><Shield :size="12" :stroke-width="2.2" /> Centro de Mando</span>
        <h1>Panel de administración</h1>
        <p>Gestiona usuarios, actividades, categorías y consulta las estadísticas de la plataforma comunitaria.</p>
      </header>

      <!-- Tarjetas con efecto de borde luminoso -->
      <div class="admin-grid">
        <NuxtLink to="/admin/users" class="admin-module">
          <div class="admin-module__icon-wrap admin-module__icon-wrap--users">
            <Users :size="22" :stroke-width="1.8" />
          </div>
          <div class="admin-module__content">
            <h3>Gestión de Usuarios</h3>
            <p>Consulta, busca y asigna roles a las cuentas de usuario registradas en la plataforma.</p>
          </div>
          <ArrowRight class="admin-module__arrow" :size="17" :stroke-width="2.2" />
        </NuxtLink>

        <NuxtLink to="/admin/events" class="admin-module">
          <div class="admin-module__icon-wrap admin-module__icon-wrap--events">
            <CalendarDays :size="22" :stroke-width="1.8" />
          </div>
          <div class="admin-module__content">
            <h3>Moderación de Actividades</h3>
            <p>Modera cualquier actividad independientemente de su organizador. Elimina contenido inadecuado.</p>
          </div>
          <ArrowRight class="admin-module__arrow" :size="17" :stroke-width="2.2" />
        </NuxtLink>

        <NuxtLink to="/admin/categories" class="admin-module">
          <div class="admin-module__icon-wrap admin-module__icon-wrap--categories">
            <Tag :size="22" :stroke-width="1.8" />
          </div>
          <div class="admin-module__content">
            <h3>Categorías del Sistema</h3>
            <p>Crea, edita y elimina las categorías que organizadores usan al publicar sus actividades.</p>
          </div>
          <ArrowRight class="admin-module__arrow" :size="17" :stroke-width="2.2" />
        </NuxtLink>

        <NuxtLink to="/admin/statistics" class="admin-module">
          <div class="admin-module__icon-wrap admin-module__icon-wrap--stats">
            <BarChart3 :size="22" :stroke-width="1.8" />
          </div>
          <div class="admin-module__content">
            <h3>Estadísticas y Métricas</h3>
            <p>Consulta usuarios registrados, actividades publicadas, inscripciones y categorías activas.</p>
          </div>
          <ArrowRight class="admin-module__arrow" :size="17" :stroke-width="2.2" />
        </NuxtLink>
      </div>

      <!-- Sello decorativo de red comunitaria -->
      <div class="admin-footer-mark" aria-hidden="true">
        <Waypoints :size="16" :stroke-width="1.8" />
        <span>Red Comunitaria · Panel Administrativo</span>
      </div>

    </div>
  </div>
</template>

<style scoped>
.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: 1.35rem;
}

.admin-module {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  text-decoration: none;
  background: var(--ch-paper);
  color: var(--ch-text-on-paper);
  border: 1px solid var(--ch-line);
  border-radius: var(--ch-radius-md);
  padding: 1.75rem;
  box-shadow: var(--ch-shadow-md);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.admin-module::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(124, 92, 252, 0.06) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.admin-module:hover {
  transform: translateY(-4px);
  border-color: var(--ch-coral);
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(124, 92, 252, 0.15);
}

.admin-module:hover::before {
  opacity: 1;
}

.admin-module__icon-wrap {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: var(--ch-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid transparent;
}

.admin-module__icon-wrap--users {
  background: rgba(6, 182, 212, 0.12);
  border-color: rgba(6, 182, 212, 0.25);
  color: var(--ch-teal);
}

.admin-module__icon-wrap--events {
  background: rgba(124, 92, 252, 0.12);
  border-color: rgba(124, 92, 252, 0.25);
  color: var(--ch-coral);
}

.admin-module__icon-wrap--categories {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
  color: var(--ch-marigold);
}

.admin-module__icon-wrap--stats {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.25);
  color: var(--ch-leaf);
}

.admin-module__content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.admin-module__content h3 {
  margin: 0 0 0.4rem;
  font-family: var(--ch-font-display);
  font-weight: 600;
  font-size: 1.15rem;
  color: #ffffff;
}

.admin-module__content p {
  margin: 0;
  color: var(--ch-text-on-paper-muted);
  font-size: 0.88rem;
  line-height: 1.5;
}

.admin-module__arrow {
  color: var(--ch-text-on-paper-dim);
  flex-shrink: 0;
  margin-top: 0.4rem;
  transition: all 0.25s ease;
  position: relative;
  z-index: 1;
}

.admin-module:hover .admin-module__arrow {
  transform: translateX(5px);
  color: var(--ch-coral-light);
}

.admin-footer-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  margin-top: 3.5rem;
  padding-top: 2rem;
  border-top: 1px dashed var(--ch-line);
  font-family: var(--ch-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ch-text-on-ink-dim);
}
</style>
