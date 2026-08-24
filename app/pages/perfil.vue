<script setup lang="ts">
definePageMeta({ middleware: 'auth' });
useHead({ title: 'Mi perfil · CommunityHub' });

const authStore = useAuthStore();

const firstName = ref(authStore.usuario?.firstName ?? '');
const lastName = ref(authStore.usuario?.lastName ?? '');
const profilePicture = ref(authStore.usuario?.profilePicture ?? '');
const guardando = ref(false);
const mensaje = ref<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

const fileInputRef = ref<HTMLInputElement | null>(null);

const rolLegible: Record<string, string> = {
  administrador: 'Administrador',
  organizador: 'Organizador',
  usuario: 'Usuario',
};

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    mensaje.value = {
      tipo: 'error',
      texto: 'La imagen debe ser menor a 2MB.',
    };
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    profilePicture.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

function quitarFoto() {
  profilePicture.value = '';
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
}

async function guardar() {
  guardando.value = true;
  mensaje.value = null;
  try {
    await authStore.actualizarPerfil({
      firstName: firstName.value,
      lastName: lastName.value,
      profilePicture: profilePicture.value || null as any,
    });
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
        <p>Actualiza tu información personal y foto de perfil.</p>
      </header>

      <div class="panel-card" style="max-width: 36rem">
        <form novalidate @submit.prevent="guardar">

          <!-- Sección de Foto de Perfil -->
          <div class="profile-photo-section">
            <div class="profile-avatar-wrap">
              <img
                v-if="profilePicture"
                :src="profilePicture"
                alt="Foto de perfil"
                class="profile-avatar-img"
              />
              <div v-else class="profile-avatar-fallback">
                {{ firstName?.[0] || 'U' }}{{ lastName?.[0] || '' }}
              </div>
            </div>

            <div class="profile-photo-actions">
              <span class="profile-photo-label">Foto de perfil</span>
              <p class="profile-photo-hint">Recomendado: JPG o PNG (máx. 2MB).</p>

              <div class="profile-photo-buttons">
                <button
                  type="button"
                  class="pill-btn pill-btn--ghost"
                  @click="triggerFileInput"
                >
                  {{ profilePicture ? 'Cambiar foto' : 'Subir foto' }}
                </button>
                <button
                  v-if="profilePicture"
                  type="button"
                  class="pill-btn pill-btn--danger"
                  @click="quitarFoto"
                >
                  Quitar
                </button>
              </div>

              <!-- Input invisible para seleccionar archivo -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                style="display: none;"
                @change="handleFileChange"
              />
            </div>
          </div>

          <!-- O introducir URL directamente -->
          <div class="field" style="margin-top: 1.25rem;">
            <label for="picUrl">O enlace directo a imagen (URL)</label>
            <input
              id="picUrl"
              v-model.trim="profilePicture"
              type="url"
              placeholder="https://ejemplo.com/mi-foto.jpg"
            />
          </div>

          <div class="field-row">
            <div class="field">
              <label for="firstName">Nombre</label>
              <input id="firstName" v-model.trim="firstName" type="text" required />
            </div>

            <div class="field">
              <label for="lastName">Apellido</label>
              <input id="lastName" v-model.trim="lastName" type="text" required />
            </div>
          </div>

          <div class="field">
            <label>Correo electrónico</label>
            <input :value="authStore.usuario?.email" type="email" disabled />
          </div>

          <div class="field">
            <label>Rol asignado</label>
            <input :value="rolLegible[authStore.usuario?.role ?? 'usuario']" disabled />
          </div>

          <div
            v-if="mensaje"
            class="action-banner"
            :class="`action-banner--${mensaje.tipo}`"
          >
            {{ mensaje.texto }}
          </div>

          <button type="submit" class="pill-btn pill-btn--primary submit-btn" :disabled="guardando">
            {{ guardando ? 'Guardando cambios…' : 'Guardar cambios' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-photo-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--ch-line);
  margin-bottom: 1rem;
}

.profile-avatar-wrap {
  width: 5rem;
  height: 5rem;
  border-radius: var(--ch-radius-md);
  overflow: hidden;
  background: linear-gradient(135deg, var(--ch-coral) 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
  flex-shrink: 0;
}

.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar-fallback {
  font-family: var(--ch-font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
}

.profile-photo-actions {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-photo-label {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--ch-text-on-paper);
}

.profile-photo-hint {
  margin: 0 0 0.5rem;
  font-size: 0.8rem;
  color: var(--ch-text-on-paper-muted);
}

.profile-photo-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-banner {
  padding: 0.8rem 1rem;
  border-radius: var(--ch-radius-sm);
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.action-banner--exito {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.action-banner--error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}
</style>
