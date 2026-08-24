<script setup lang="ts">
/**
 * Barra de navegación global: aparece en toda la app (se monta una sola vez
 * desde app.vue) para que siempre haya cómo volver al inicio, ir a
 * actividades o acceder a tu cuenta, sin depender de que cada página arme
 * su propio link de "volver".
 */
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const router = useRouter();
const menuAbierto = ref(false);

onMounted(() => {
  if (authStore.estaAutenticado) {
    notificationsStore.obtenerNotificaciones();
  }
});

watch(
  () => authStore.estaAutenticado,
  (autenticado) => {
    if (autenticado) {
      notificationsStore.obtenerNotificaciones();
    }
  }
);

async function cerrarSesion() {
  menuAbierto.value = false;
  await authStore.logout();
  router.push('/');
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner">
      <NuxtLink to="/" class="app-header__brand" @click="menuAbierto = false">
        <span class="app-header__brand-dot" aria-hidden="true" />
        CommunityHub
      </NuxtLink>

      <button
        type="button"
        class="app-header__toggle"
        :aria-expanded="menuAbierto"
        aria-label="Abrir menú"
        @click="menuAbierto = !menuAbierto"
      >
        ☰
      </button>

      <nav class="app-header__nav" :class="{ 'app-header__nav--open': menuAbierto }">
        <NuxtLink to="/actividades" @click="menuAbierto = false">Actividades</NuxtLink>

        <template v-if="authStore.estaAutenticado">
          <NuxtLink to="/dashboard" @click="menuAbierto = false">Dashboard</NuxtLink>
          <NuxtLink to="/notificaciones" class="app-header__notif-link" @click="menuAbierto = false">
            <span>Notificaciones</span>
            <span v-if="notificationsStore.sinLeerCount > 0" class="app-header__badge">
              {{ notificationsStore.sinLeerCount }}
            </span>
          </NuxtLink>
          <NuxtLink to="/favoritos" @click="menuAbierto = false">Favoritos</NuxtLink>
          <NuxtLink to="/mis-inscripciones" @click="menuAbierto = false">Mis inscripciones</NuxtLink>
          <NuxtLink
            v-if="authStore.usuario?.role === 'organizador' || authStore.usuario?.role === 'administrador'"
            to="/mis-actividades"
            @click="menuAbierto = false"
          >
            Mis actividades
          </NuxtLink>
          <NuxtLink
            v-if="authStore.usuario?.role === 'administrador'"
            to="/admin"
            @click="menuAbierto = false"
          >
            Administración
          </NuxtLink>
          <NuxtLink to="/perfil" @click="menuAbierto = false">Perfil</NuxtLink>
          <button type="button" class="app-header__logout" @click="cerrarSesion">Salir</button>
        </template>

        <template v-else>
          <NuxtLink to="/login" @click="menuAbierto = false">Iniciar sesión</NuxtLink>
          <NuxtLink to="/registro" class="app-header__cta" @click="menuAbierto = false">Crear cuenta</NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: var(--ch-ink);
  border-bottom: 1px solid rgba(245, 241, 232, 0.1);
}

.app-header__inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 0.85rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.app-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--ch-font-display);
  font-weight: 700;
  letter-spacing: -0.02em;
  font-size: 1.15rem;
  color: var(--ch-text-on-ink);
  text-decoration: none;
  white-space: nowrap;
}

.app-header__brand-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: var(--ch-coral);
}

.app-header__toggle {
  display: none;
  background: none;
  border: 1px solid rgba(245, 241, 232, 0.25);
  border-radius: var(--ch-radius-sm);
  color: var(--ch-text-on-ink);
  font-size: 1.1rem;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: 1.35rem;
  flex-wrap: wrap;
}

.app-header__nav a {
  font-size: 0.9rem;
  color: var(--ch-text-on-ink-muted);
  text-decoration: none;
  transition: color 0.15s ease;
  white-space: nowrap;
}

.app-header__nav a:hover,
.app-header__nav a.router-link-exact-active {
  color: var(--ch-text-on-ink);
}

.app-header__notif-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.app-header__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.3rem;
  border-radius: 999px;
  background: var(--ch-coral);
  color: #ffffff;
  font-size: 0.72rem;
  font-family: var(--ch-font-mono);
  font-weight: 700;
  line-height: 1;
}

.app-header__cta {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: var(--ch-coral);
  color: #fff !important;
  font-weight: 600;
}

.app-header__cta:hover {
  background: var(--ch-coral-dark);
}

.app-header__logout {
  background: none;
  border: 1px solid rgba(245, 241, 232, 0.25);
  border-radius: 999px;
  color: var(--ch-text-on-ink-muted);
  font-family: var(--ch-font-body);
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.app-header__logout:hover {
  border-color: var(--ch-coral);
  color: var(--ch-text-on-ink);
}

@media (max-width: 780px) {
  .app-header__toggle {
    display: inline-flex;
  }

  .app-header__nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.15rem;
    background: var(--ch-ink);
    border-bottom: 1px solid rgba(245, 241, 232, 0.1);
    padding: 0.5rem 1.5rem 1rem;
  }

  .app-header__nav--open {
    display: flex;
  }

  .app-header__nav a,
  .app-header__logout {
    width: 100%;
    padding: 0.6rem 0;
  }

  .app-header {
    position: sticky;
  }

  .app-header__inner {
    position: relative;
  }
}
</style>
