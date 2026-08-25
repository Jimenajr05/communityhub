<!-- Encabezado global de la aplicación: marca interactiva, navegación centrada por rol y menú responsive -->
<script setup lang="ts">
import { Menu, X, Bell, Heart, Ticket, LayoutGrid, ShieldCheck, User, LogOut, Compass } from 'lucide-vue-next';

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
      <!-- 1. Marca principal (Izquierda) -->
      <NuxtLink to="/" class="app-header__brand" @click="menuAbierto = false">
        <span class="app-header__brand-orbit" aria-hidden="true">
          <span class="app-header__brand-node app-header__brand-node--main" />
          <span class="app-header__brand-link" />
          <span class="app-header__brand-node app-header__brand-node--satellite" />
        </span>
        <span class="app-header__brand-text">Community<strong>Hub</strong></span>
      </NuxtLink>

      <!-- 2. Navegación principal (Centrada en Desktop) -->
      <nav class="app-header__nav" :class="{ 'app-header__nav--open': menuAbierto }">
        <NuxtLink to="/actividades" class="app-header__link" @click="menuAbierto = false">
          <Compass :size="15" :stroke-width="2" />
          <span>Actividades</span>
        </NuxtLink>

        <ClientOnly>
          <template v-if="authStore.estaAutenticado">
            <NuxtLink to="/dashboard" class="app-header__link" @click="menuAbierto = false">
              <LayoutGrid :size="15" :stroke-width="2" />
              <span>Dashboard</span>
            </NuxtLink>

            <NuxtLink to="/notificaciones" class="app-header__link app-header__notif-link" @click="menuAbierto = false">
              <Bell :size="15" :stroke-width="2" />
              <span>Avisos</span>
              <span v-if="notificationsStore.sinLeerCount > 0" class="app-header__badge">
                <span class="app-header__badge-pulse" />
                {{ notificationsStore.sinLeerCount }}
              </span>
            </NuxtLink>

            <NuxtLink to="/favoritos" class="app-header__link" @click="menuAbierto = false">
              <Heart :size="15" :stroke-width="2" />
              <span>Favoritos</span>
            </NuxtLink>

            <NuxtLink to="/mis-inscripciones" class="app-header__link" @click="menuAbierto = false">
              <Ticket :size="15" :stroke-width="2" />
              <span>Pases</span>
            </NuxtLink>

            <NuxtLink
              v-if="authStore.usuario?.role === 'organizador' || authStore.usuario?.role === 'administrador'"
              to="/mis-actividades"
              class="app-header__link"
              @click="menuAbierto = false"
            >
              <LayoutGrid :size="15" :stroke-width="2" />
              <span>Mis actividades</span>
            </NuxtLink>

            <NuxtLink
              v-if="authStore.usuario?.role === 'administrador'"
              to="/admin"
              class="app-header__link app-header__link--admin"
              @click="menuAbierto = false"
            >
              <ShieldCheck :size="15" :stroke-width="2" />
              <span>Admin</span>
            </NuxtLink>
          </template>
        </ClientOnly>

        <!-- Bloque de usuario para drawer en móvil -->
        <ClientOnly>
          <div v-if="authStore.estaAutenticado" class="app-header__mobile-user-group">
            <NuxtLink to="/perfil" class="app-header__profile" @click="menuAbierto = false">
              <span class="app-header__avatar">
                <img
                  v-if="authStore.usuario?.profilePicture"
                  :src="authStore.usuario.profilePicture"
                  alt="Foto"
                  class="app-header__avatar-img"
                />
                <User v-else :size="13" :stroke-width="2.2" />
              </span>
              <span class="app-header__username">{{ authStore.usuario?.firstName }}</span>
            </NuxtLink>

            <button type="button" class="app-header__logout" title="Cerrar sesión" @click="cerrarSesion">
              <LogOut :size="14" :stroke-width="2" />
              <span class="app-header__logout-text">Salir</span>
            </button>
          </div>

          <div v-else class="app-header__mobile-auth">
            <NuxtLink to="/login" class="app-header__link app-header__link--login" @click="menuAbierto = false">
              Iniciar sesión
            </NuxtLink>
            <NuxtLink to="/registro" class="pill-btn pill-btn--primary app-header__cta" @click="menuAbierto = false">
              Crear cuenta
            </NuxtLink>
          </div>
        </ClientOnly>
      </nav>

      <!-- 3. Acciones de usuario / Auth (Derecha en Desktop) + Botón hamburguesa -->
      <div class="app-header__actions">
        <ClientOnly>
          <template v-if="authStore.estaAutenticado">
            <div class="app-header__user-group">
              <NuxtLink to="/perfil" class="app-header__profile" @click="menuAbierto = false">
                <span class="app-header__avatar">
                  <img
                    v-if="authStore.usuario?.profilePicture"
                    :src="authStore.usuario.profilePicture"
                    alt="Foto"
                    class="app-header__avatar-img"
                  />
                  <User v-else :size="13" :stroke-width="2.2" />
                </span>
                <span class="app-header__username">{{ authStore.usuario?.firstName }}</span>
              </NuxtLink>

              <button type="button" class="app-header__logout" title="Cerrar sesión" @click="cerrarSesion">
                <LogOut :size="14" :stroke-width="2" />
                <span class="app-header__logout-text">Salir</span>
              </button>
            </div>
          </template>

          <template v-else>
            <div class="app-header__desktop-auth">
              <NuxtLink to="/login" class="app-header__link app-header__link--login">
                Iniciar sesión
              </NuxtLink>
              <NuxtLink to="/registro" class="pill-btn pill-btn--primary app-header__cta">
                Crear cuenta
              </NuxtLink>
            </div>
          </template>
        </ClientOnly>

        <!-- Botón hamburguesa para móvil y tablet -->
        <button
          type="button"
          class="app-header__toggle"
          :aria-expanded="menuAbierto"
          aria-label="Abrir menú de navegación"
          @click="menuAbierto = !menuAbierto"
        >
          <X v-if="menuAbierto" :size="20" :stroke-width="2" />
          <Menu v-else :size="20" :stroke-width="2" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(4, 6, 12, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--ch-line);
  width: 100%;
}

.app-header__inner {
  max-width: 86rem;
  margin: 0 auto;
  padding: 0.65rem 1.25rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

/* Marca con isotipo de dos nodos conectados (Izquierda) */
.app-header__brand {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  text-decoration: none;
  color: var(--ch-text-on-ink);
  transition: opacity 0.15s ease;
  flex-shrink: 0;
}

.app-header__brand:hover {
  opacity: 0.92;
}

.app-header__brand-orbit {
  position: relative;
  width: 1.4rem;
  height: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.app-header__brand-node {
  position: absolute;
  border-radius: 50%;
}

.app-header__brand-node--main {
  left: 2px;
  top: 2px;
  width: 8px;
  height: 8px;
  background: var(--ch-coral);
  box-shadow: 0 0 10px var(--ch-coral-glow);
}

.app-header__brand-node--satellite {
  right: 2px;
  bottom: 2px;
  width: 6px;
  height: 6px;
  background: var(--ch-marigold);
  box-shadow: 0 0 8px var(--ch-marigold-glow);
}

.app-header__brand-link {
  position: absolute;
  width: 14px;
  height: 1.5px;
  background: linear-gradient(90deg, var(--ch-coral), var(--ch-marigold));
  transform: rotate(35deg);
  opacity: 0.8;
}

.app-header__brand-text {
  font-family: var(--ch-font-display);
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--ch-text-on-ink);
}

.app-header__brand-text strong {
  font-weight: 800;
  color: var(--ch-coral-light);
}

/* Navegación central (Centro en Desktop) */
.app-header__nav {
  justify-self: center;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: nowrap;
}

.app-header__link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--ch-text-on-ink-muted);
  text-decoration: none;
  padding: 0.35rem 0.6rem;
  border-radius: var(--ch-radius-full);
  transition: all 0.18s ease;
  white-space: nowrap;
}

.app-header__link svg {
  opacity: 0.75;
  transition: opacity 0.18s ease;
  flex-shrink: 0;
}

.app-header__link:hover {
  color: var(--ch-text-on-ink);
  background: rgba(255, 255, 255, 0.05);
}

.app-header__link:hover svg {
  opacity: 1;
}

.app-header__link.router-link-exact-active,
.app-header__link.router-link-active {
  color: #ffffff;
  background: rgba(124, 92, 252, 0.15);
  border: 1px solid rgba(124, 92, 252, 0.35);
}

.app-header__link.router-link-exact-active svg,
.app-header__link.router-link-active svg {
  opacity: 1;
  color: var(--ch-coral-light);
}

.app-header__notif-link {
  position: relative;
}

.app-header__badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.1rem;
  height: 1.1rem;
  padding: 0 0.3rem;
  border-radius: var(--ch-radius-full);
  background: var(--ch-marigold);
  color: #04060c;
  font-size: 0.65rem;
  font-family: var(--ch-font-mono);
  font-weight: 700;
  line-height: 1;
  margin-left: 0.15rem;
}

.app-header__badge-pulse {
  position: absolute;
  inset: -2px;
  border-radius: var(--ch-radius-full);
  border: 1px solid var(--ch-marigold);
  animation: pulse-ring 2s infinite;
}

/* Acciones y Grupo de usuario (Derecha en Desktop) */
.app-header__actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-header__desktop-auth {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.app-header__user-group {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
}

.app-header__profile {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ch-text-on-ink);
  text-decoration: none;
  padding: 0.25rem 0.6rem 0.25rem 0.25rem;
  border-radius: var(--ch-radius-full);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--ch-line-strong);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.app-header__profile:hover {
  border-color: var(--ch-coral-light);
  background: rgba(124, 92, 252, 0.12);
}

.app-header__avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ch-coral) 0%, var(--ch-violet) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #ffffff;
  flex-shrink: 0;
}

.app-header__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-header__username {
  max-width: 6.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__logout {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: transparent;
  border: 1px solid var(--ch-line-strong);
  border-radius: var(--ch-radius-full);
  color: var(--ch-text-on-ink-muted);
  font-family: var(--ch-font-body);
  font-size: 0.78rem;
  padding: 0.32rem 0.65rem;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.app-header__logout:hover {
  border-color: var(--ch-rose);
  color: var(--ch-rose);
  background: rgba(244, 63, 94, 0.1);
}

.app-header__cta {
  padding: 0.45rem 1rem;
  font-size: 0.82rem;
}

.app-header__mobile-user-group,
.app-header__mobile-auth {
  display: none;
}

.app-header__toggle {
  display: none;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--ch-line-strong);
  border-radius: var(--ch-radius-sm);
  color: var(--ch-text-on-ink);
  padding: 0.45rem;
  cursor: pointer;
}

/* =====================================================================
   RESPONSIVE BREAKPOINTS
   ===================================================================== */
@media (max-width: 1100px) {
  .app-header__inner {
    display: flex;
    justify-content: space-between;
    position: relative;
  }

  .app-header__toggle {
    display: inline-flex;
  }

  .app-header__actions .app-header__user-group,
  .app-header__actions .app-header__desktop-auth {
    display: none;
  }

  .app-header__nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    gap: 0.4rem;
    background: var(--ch-ink-2);
    border-bottom: 1px solid var(--ch-line-strong);
    padding: 1.25rem 1.5rem 1.75rem;
    box-shadow: var(--ch-shadow-lg);
    justify-self: stretch;
  }

  .app-header__nav--open {
    display: flex;
  }

  .app-header__link {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
    border-radius: var(--ch-radius-sm);
  }

  .app-header__mobile-user-group {
    display: flex;
    border-top: 1px solid var(--ch-line);
    padding-top: 1rem;
    margin-top: 0.5rem;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .app-header__mobile-auth {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border-top: 1px solid var(--ch-line);
    padding-top: 1rem;
    margin-top: 0.5rem;
  }

  .app-header__profile {
    flex: 1;
    padding: 0.5rem 0.85rem 0.5rem 0.5rem;
  }

  .app-header__username {
    max-width: none;
  }

  .app-header__logout {
    padding: 0.5rem 1rem;
  }
}
</style>
