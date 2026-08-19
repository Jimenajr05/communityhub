<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
useHead({ title: 'Mi perfil · CommunityHub' });

const authStore = useAuthStore();

const firstName = ref(authStore.usuario?.firstName ?? '');
const lastName = ref(authStore.usuario?.lastName ?? '');
const guardando = ref(false);
const mensaje = ref<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

const rolLegible: Record<string, string> = {
  administrador: 'Administrador',
  organizador: 'Organizador',
  usuario: 'Usuario',
};

async function guardar() {
  guardando.value = true;
  mensaje.value = null;
  try {
    await authStore.actualizarPerfil({ firstName: firstName.value, lastName: lastName.value });
    mensaje.value = { tipo: 'exito', texto: 'Perfil actualizado correctamente.' };
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    mensaje.value = {
      tipo: 'error',
      texto: fetchError?.data?.message ?? 'No pudimos actualizar tu perfil.',
    };
  } finally {
    guardando.value = false;
  }
}
</script>

<template>
  <div class="panel-page">
    <div class="panel-container">

      <header class="panel-header">
        <span class="panel-eyebrow">Tu cuenta</span>
        <h1>Mi perfil</h1>
        <p>Actualiza tu información personal.</p>
      </header>

      <div class="panel-card" style="max-width: 32rem">
        <form novalidate @submit.prevent="guardar">
          <div class="field">
            <label for="firstName">Nombre</label>
            <input id="firstName" v-model.trim="firstName" type="text" required />
          </div>

          <div class="field">
            <label for="lastName">Apellido</label>
            <input id="lastName" v-model.trim="lastName" type="text" required />
          </div>

          <div class="field">
            <label>Correo electrónico</label>
            <input :value="authStore.usuario?.email" type="email" disabled />
          </div>

          <div class="field">
            <label>Rol</label>
            <input :value="rolLegible[authStore.usuario?.role ?? 'usuario']" disabled />
          </div>

          <p v-if="mensaje" class="form-error" :style="mensaje.tipo === 'exito' ? { background: 'rgba(16,185,129,.12)', borderColor: 'rgba(16,185,129,.35)', color: '#047857' } : {}">
            {{ mensaje.texto }}
          </p>

          <button type="submit" class="submit-btn" :disabled="guardando">
            {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
