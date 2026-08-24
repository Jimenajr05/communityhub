<script setup lang="ts">
definePageMeta({ middleware: 'admin' });
useHead({ title: 'Usuarios · Administración' });

const { apiFetch } = useApi();

interface UsuarioAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'administrador' | 'organizador' | 'usuario';
}

const usuarios = ref<UsuarioAdmin[]>([]);
const cargando = ref(true);

async function cargar() {
  cargando.value = true;
  const res = await apiFetch<{ data: { users: UsuarioAdmin[] } }>('/users');
  usuarios.value = res.data.users;
  cargando.value = false;
}

onMounted(cargar);

async function eliminar(usuario: UsuarioAdmin) {
  if (!confirm(`¿Eliminar la cuenta de ${usuario.firstName} ${usuario.lastName}?`)) return;
  await apiFetch(`/users/${usuario._id}`, { method: 'DELETE' });
  await cargar();
}

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
