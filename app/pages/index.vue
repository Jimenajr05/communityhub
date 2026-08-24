<!--
  Página de inicio (ruta "/").
  Muestra una pantalla de bienvenida distinta según si el usuario está
  autenticado o no, con accesos rápidos a actividades, login o logout.
-->
<script setup lang="ts">
useHead({ title: 'CommunityHub' });

// Store de autenticación: se usa para saber si hay sesión activa y los datos del usuario.
const authStore = useAuthStore();

/** Cierra la sesión del usuario actual. */
async function onLogout() {
  await authStore.logout();
}
</script>

<template>
  <main class="home">
    <div class="home__grid" aria-hidden="true" />

    <div class="home__content">
      <span class="home__eyebrow">CommunityHub</span>

      <template v-if="authStore.estaAutenticado">
        <h1 class="home__headline">
          Hola, {{ authStore.usuario?.firstName }}<span class="home__wave"></span>
        </h1>
        <p class="home__copy">Sesión iniciada. ¿Qué quieres hacer hoy?</p>
        <div class="home__actions">
          <NuxtLink to="/actividades" class="submit-btn home__btn">Ver actividades</NuxtLink>
          <button type="button" class="home__btn home__btn--ghost" @click="onLogout">Cerrar sesión</button>
        </div>
      </template>

      <template v-else>
        <h1 class="home__headline">Encuentra tu<br />próxima actividad</h1>
        <p class="home__copy">
          Talleres, deportes, arte y encuentros de tu comunidad — todo en un solo lugar.
        </p>
        <div class="home__actions">
          <NuxtLink to="/actividades" class="submit-btn home__btn">Ver actividades</NuxtLink>
          <NuxtLink to="/login" class="home__btn home__btn--ghost">Iniciar sesión</NuxtLink>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
.home {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(120% 140% at 50% 20%, var(--ch-ink-soft) 0%, var(--ch-ink) 60%, var(--ch-ink-2) 100%);
  padding: 2rem;
  text-align: center;
}

.home__grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(245, 241, 232, 0.14) 1.5px, transparent 1.5px);
  background-size: 26px 26px;
  mask-image: radial-gradient(circle at 50% 30%, black 0%, transparent 70%);
}

.home__content {
  position: relative;
  z-index: 1;
  max-width: 32rem;
}

.home__eyebrow {
  display: inline-block;
  font-family: var(--ch-font-mono);
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: var(--ch-marigold);
  margin-bottom: 1.5rem;
}

.home__headline {
  font-family: var(--ch-font-display);
  font-weight: 400;
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  line-height: 1.08;
  margin: 0 0 1.25rem;
  color: var(--ch-text-on-ink);
}

.home__wave {
  display: inline-block;
  margin-left: 0.4rem;
}

.home__copy {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--ch-text-on-ink-muted);
  margin: 0 0 2.25rem;
}

.home__actions {
  display: flex;
  gap: 0.9rem;
  justify-content: center;
  flex-wrap: wrap;
}

.home__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.75rem;
  border-radius: var(--ch-radius-sm);
  font-weight: 700;
  font-size: 0.98rem;
  text-decoration: none;
  cursor: pointer;
  width: auto;
}

.home__btn--ghost {
  background: transparent;
  border: 1.5px solid rgba(245, 241, 232, 0.35);
  color: var(--ch-text-on-ink);
}

.home__btn--ghost:hover {
  border-color: var(--ch-marigold);
  color: var(--ch-marigold);
}
</style>