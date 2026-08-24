<!--
  Página de administración de usuarios (ruta /admin/users).
  Solo accesible para administradores; permite listar, eliminar
  cuentas y cambiar el rol de los usuarios registrados.
-->
<script setup lang="ts">
definePageMeta({ middleware: 'admin' });
useHead({ title: 'Usuarios · Administración' });

const { apiFetch } = useApi();

// Estructura de un usuario tal como lo expone el endpoint de administración
interface UsuarioAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'administrador' | 'organizador' | 'usuario';
}

// Lista de usuarios registrados en la plataforma
const usuarios = ref<UsuarioAdmin[]>([]);
// Indica si la lista de usuarios todavía se está cargando
const cargando = ref(true);

/** Carga (o recarga) la lista de usuarios desde el API. */
async function cargar() {
  cargando.value = true;
  const res = await apiFetch<{ data: { users: UsuarioAdmin[] } }>('/users');
  usuarios.value = res.data.users;
  cargando.value = false;
}

// Al montar la página, carga la lista de usuarios
onMounted(cargar);

/** Elimina la cuenta de un usuario (previa confirmación) y refresca la lista. */
async function eliminar(usuario: UsuarioAdmin) {
  if (!confirm(`¿Eliminar la cuenta de ${usuario.firstName} ${usuario.lastName}?`)) return;
  await apiFetch(`/users/${usuario._id}`, { method: 'DELETE' });
  await cargar();
}

/** Cambia el rol asignado a un usuario y refresca la lista. */
async function cambiarRol(usuario: UsuarioAdmin, role: string) {
  await apiFetch(`/users/${usuario._id}`, { method: 'PUT', body: { role } });
  await cargar();
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">
      <AdminNav />

      <header class="panel-header">
        <span class="panel-eyebrow">Administración</span>
        <h1>Usuarios</h1>
        <p>Gestiona los roles y cuentas registradas en la plataforma.</p>
      </header>

      <p v-if="cargando" class="panel-empty">Cargando…</p>

      <div v-else class="data-table-wrap panel-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuarios" :key="usuario._id">
              <td>{{ usuario.firstName }} {{ usuario.lastName }}</td>
              <td>{{ usuario.email }}</td>
              <td>
                <select :value="usuario.role" @change="cambiarRol(usuario, ($event.target as HTMLSelectElement).value)">
                  <option value="usuario">Usuario</option>
                  <option value="organizador">Organizador</option>
                  <option value="administrador">Administrador</option>
                </select>
              </td>
              <td>
                <button type="button" class="pill-btn pill-btn--danger" @click="eliminar(usuario)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
