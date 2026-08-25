<!--
  Página de administración de usuarios (ruta /admin/users).
  Solo accesible para administradores; permite listar, eliminar
  cuentas y cambiar el rol de los usuarios registrados.
-->
<script setup lang="ts">
import { Trash2, ShieldCheck, UserCog, User, Search, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-vue-next';

definePageMeta({ middleware: 'admin' });
useHead({ title: 'Usuarios · Administración' });

const authStore = useAuthStore();
const { apiFetch } = useApi();

// Estructura de un usuario tal como lo expone el endpoint de administración
interface UsuarioAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'administrador' | 'organizador' | 'usuario';
  profilePicture?: string;
}

// Lista de usuarios registrados en la plataforma
const usuarios = ref<UsuarioAdmin[]>([]);
// Indica si la lista de usuarios todavía se está cargando
const cargando = ref(true);
// Búsqueda de usuario por nombre o correo
const busqueda = ref('');
// Mensajes de retroalimentación (error o éxito)
const mensajeAlerta = ref<{ tipo: 'error' | 'exito'; texto: string } | null>(null);

/** Cantidad total de administradores registrados actualmente */
const cantidadAdmins = computed(() => usuarios.value.filter((u) => u.role === 'administrador').length);

/** Carga (o recarga) la lista de usuarios desde el API. */
async function cargar() {
  cargando.value = true;
  try {
    const res = await apiFetch<{ data: { users: UsuarioAdmin[] } }>('/users');
    usuarios.value = res.data.users;
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    mensajeAlerta.value = {
      tipo: 'error',
      texto: fetchError?.data?.message || 'Error al cargar la lista de usuarios.',
    };
  } finally {
    cargando.value = false;
  }
}

// Al montar la página, carga la lista de usuarios
onMounted(cargar);

/** Comprueba si el usuario de la fila es el usuario actualmente autenticado */
function esUsuarioLogueado(usuario: UsuarioAdmin): boolean {
  return usuario._id === authStore.usuario?.id || usuario.email === authStore.usuario?.email;
}

/** Comprueba si el usuario es el único administrador del sistema */
function esUnicoAdmin(usuario: UsuarioAdmin): boolean {
  return usuario.role === 'administrador' && cantidadAdmins.value <= 1;
}

/** Elimina la cuenta de un usuario (previa validación y confirmación). */
async function eliminar(usuario: UsuarioAdmin) {
  mensajeAlerta.value = null;

  if (esUsuarioLogueado(usuario)) {
    mensajeAlerta.value = {
      tipo: 'error',
      texto: 'No puedes eliminar tu propia cuenta mientras estás logueado en la plataforma.',
    };
    return;
  }

  if (esUnicoAdmin(usuario)) {
    mensajeAlerta.value = {
      tipo: 'error',
      texto: 'No se puede eliminar este usuario porque es el único administrador del sistema.',
    };
    return;
  }

  const { confirmar } = useConfirm();
  const aceptado = await confirmar({
    title: '¿Eliminar usuario?',
    message: `¿Estás seguro de eliminar definitivamente la cuenta de ${usuario.firstName} ${usuario.lastName} (${usuario.email})? Esta acción borrará permanentemente sus accesos.`,
    confirmText: 'Sí, eliminar usuario',
    cancelText: 'Cancelar',
    type: 'danger',
  });
  if (!aceptado) return;

  try {
    await apiFetch(`/users/${usuario._id}`, { method: 'DELETE' });
    mensajeAlerta.value = {
      tipo: 'exito',
      texto: `La cuenta de ${usuario.firstName} ${usuario.lastName} ha sido eliminada correctamente.`,
    };
    await cargar();
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    mensajeAlerta.value = {
      tipo: 'error',
      texto: fetchError?.data?.message || 'No se pudo eliminar el usuario.',
    };
  }
}

/** Cambia el rol asignado a un usuario y refresca la lista. */
async function cambiarRol(usuario: UsuarioAdmin, nuevoRol: string) {
  mensajeAlerta.value = null;

  if (usuario.role === 'administrador' && nuevoRol !== 'administrador' && cantidadAdmins.value <= 1) {
    mensajeAlerta.value = {
      tipo: 'error',
      texto: 'No se puede cambiar el rol del único administrador del sistema. Debe existir al menos un administrador.',
    };
    await cargar(); // Restablece el valor en pantalla
    return;
  }

  try {
    await apiFetch(`/users/${usuario._id}`, { method: 'PUT', body: { role: nuevoRol } });
    mensajeAlerta.value = {
      tipo: 'exito',
      texto: `Rol de ${usuario.firstName} actualizado a "${rolLabel(nuevoRol)}".`,
    };
    await cargar();
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    mensajeAlerta.value = {
      tipo: 'error',
      texto: fetchError?.data?.message || 'No se pudo cambiar el rol del usuario.',
    };
    await cargar();
  }
}

/** Iniciales del usuario, usadas en su avatar dentro de la tabla. */
function iniciales(usuario: UsuarioAdmin) {
  return `${usuario.firstName?.[0] ?? ''}${usuario.lastName?.[0] ?? ''}`.toUpperCase();
}

/** Etiqueta legible del rol en español. */
function rolLabel(role: string) {
  if (role === 'administrador') return 'Admin';
  if (role === 'organizador') return 'Organizador';
  return 'Usuario';
}

const usuariosFiltrados = computed(() => {
  if (!busqueda.value) return usuarios.value;
  const q = busqueda.value.toLowerCase();
  return usuarios.value.filter(
    (u) =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
  );
});
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="panel-eyebrow">Administración</span>
          <h1>Usuarios del sistema</h1>
          <p>Gestiona los roles y cuentas registradas en la plataforma.</p>
        </div>

        <div class="header-search">
          <Search :size="14" :stroke-width="2.2" class="header-search__icon" />
          <input
            v-model.trim="busqueda"
            type="text"
            placeholder="Buscar por nombre o correo..."
            class="header-search__input"
          />
        </div>
      </header>

      <!-- Banner de Notificación / Alerta de Acción -->
      <div
        v-if="mensajeAlerta"
        class="admin-alert"
        :class="`admin-alert--${mensajeAlerta.tipo}`"
      >
        <CheckCircle2 v-if="mensajeAlerta.tipo === 'exito'" :size="16" :stroke-width="2.2" />
        <ShieldAlert v-else :size="16" :stroke-width="2.2" />
        <span>{{ mensajeAlerta.texto }}</span>
      </div>

      <p v-if="cargando" class="panel-empty">Cargando usuarios del sistema...</p>

      <div v-else-if="usuariosFiltrados.length === 0" class="panel-card panel-empty">
        No se encontraron usuarios que coincidan con tu búsqueda.
      </div>

      <div v-else class="data-table-wrap panel-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Persona</th>
              <th>Correo electrónico</th>
              <th>Rol asignado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuariosFiltrados" :key="usuario._id">
              <td>
                <div class="person-cell">
                  <span class="person-avatar" :class="`person-avatar--${usuario.role}`">
                    <img
                      v-if="usuario.profilePicture"
                      :src="usuario.profilePicture"
                      :alt="`${usuario.firstName} ${usuario.lastName}`"
                      class="person-avatar-img"
                    />
                    <template v-else>
                      {{ iniciales(usuario) }}
                    </template>
                  </span>
                  <div class="person-info">
                    <div class="person-name-row">
                      <strong>{{ usuario.firstName }} {{ usuario.lastName }}</strong>
                      <span v-if="esUsuarioLogueado(usuario)" class="self-badge">Tú</span>
                    </div>
                    <span class="person-role-tag">{{ rolLabel(usuario.role) }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="email-cell">{{ usuario.email }}</span>
              </td>
              <td>
                <select
                  :value="usuario.role"
                  class="role-select"
                  @change="cambiarRol(usuario, ($event.target as HTMLSelectElement).value)"
                >
                  <option value="usuario">Usuario</option>
                  <option value="organizador">Organizador</option>
                  <option value="administrador">Administrador</option>
                </select>
              </td>
              <td>
                <!-- Si es el usuario logueado o el único admin, deshabilitar eliminación -->
                <button
                  v-if="esUsuarioLogueado(usuario)"
                  type="button"
                  class="pill-btn pill-btn--ghost action-btn--disabled"
                  title="No puedes eliminar tu propia cuenta mientras estás logueado"
                  disabled
                >
                  <Trash2 :size="14" :stroke-width="2.2" /> Activo (Tú)
                </button>

                <button
                  v-else-if="esUnicoAdmin(usuario)"
                  type="button"
                  class="pill-btn pill-btn--ghost action-btn--disabled"
                  title="No se puede eliminar el único administrador del sistema"
                  disabled
                >
                  <ShieldCheck :size="14" :stroke-width="2.2" /> Único Admin
                </button>

                <button
                  v-else
                  type="button"
                  class="pill-btn pill-btn--danger"
                  @click="eliminar(usuario)"
                >
                  <Trash2 :size="14" :stroke-width="2.2" /> Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!cargando" class="results-count">
        {{ usuariosFiltrados.length }} usuario{{ usuariosFiltrados.length !== 1 ? 's' : '' }} en el sistema · {{ cantidadAdmins }} administrador{{ cantidadAdmins !== 1 ? 'es' : '' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.header-search {
  position: relative;
  display: flex;
  align-items: center;
}

.header-search__icon {
  position: absolute;
  left: 0.85rem;
  color: var(--ch-text-on-paper-dim);
  pointer-events: none;
}

.header-search__input {
  font-family: var(--ch-font-body);
  font-size: 0.88rem;
  padding: 0.6rem 1rem 0.6rem 2.5rem;
  border-radius: var(--ch-radius-full);
  border: 1px solid var(--ch-line-strong);
  background: rgba(15, 21, 40, 0.75);
  color: var(--ch-text-on-paper);
  width: 17rem;
  transition: all 0.18s ease;
}

.header-search__input:focus-visible {
  outline: none;
  border-color: var(--ch-coral-light);
  box-shadow: 0 0 0 3px var(--ch-coral-glow);
  width: 20rem;
}

.admin-alert {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.15rem;
  border-radius: var(--ch-radius-sm);
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
  font-weight: 500;
}

.admin-alert--exito {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #6ee7b7;
}

.admin-alert--error {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fca5a5;
}

.person-cell {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.person-info {
  display: flex;
  flex-direction: column;
}

.person-name-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.person-info strong {
  color: #ffffff;
  font-size: 0.92rem;
}

.self-badge {
  font-family: var(--ch-font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: var(--ch-radius-full);
  background: rgba(124, 92, 252, 0.2);
  color: var(--ch-coral-light);
  border: 1px solid rgba(124, 92, 252, 0.4);
  text-transform: uppercase;
}

.person-role-tag {
  font-family: var(--ch-font-mono);
  font-size: 0.7rem;
  color: var(--ch-text-on-paper-dim);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.person-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.35rem;
  height: 2.35rem;
  border-radius: var(--ch-radius-sm);
  flex-shrink: 0;
  font-family: var(--ch-font-display);
  font-size: 0.78rem;
  font-weight: 700;
  color: #04060c;
  border: 1px solid transparent;
  overflow: hidden;
}

.person-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.person-avatar--usuario {
  background: var(--ch-teal);
  border-color: rgba(6, 182, 212, 0.4);
}

.person-avatar--organizador {
  background: var(--ch-marigold);
  border-color: rgba(245, 158, 11, 0.4);
}

.person-avatar--administrador {
  background: var(--ch-coral);
  color: #ffffff;
  border-color: rgba(124, 92, 252, 0.4);
}

.email-cell {
  font-size: 0.88rem;
  color: var(--ch-text-on-paper-muted);
}

.role-select {
  font-family: var(--ch-font-body);
  font-size: 0.86rem;
  padding: 0.5rem 2.2rem 0.5rem 0.85rem;
  border-radius: var(--ch-radius-sm);
  border: 1px solid var(--ch-line-strong);
  background-color: rgba(15, 21, 40, 0.75);
  color: var(--ch-text-on-paper);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.6rem center;
  background-size: 1rem;
  transition: all 0.15s ease;
}

.role-select:focus-visible {
  outline: none;
  border-color: var(--ch-coral-light);
  box-shadow: 0 0 0 3px var(--ch-coral-glow);
}

.action-btn--disabled {
  opacity: 0.6;
  cursor: not-allowed !important;
  font-size: 0.76rem !important;
  padding: 0.35rem 0.75rem !important;
}

.results-count {
  margin-top: 1.25rem;
  font-family: var(--ch-font-mono);
  font-size: 0.76rem;
  color: var(--ch-text-on-ink-dim);
  text-align: right;
  letter-spacing: 0.04em;
}
</style>
