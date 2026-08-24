<!--
  Página "Mi perfil" (ruta "/perfil", requiere autenticación).
  Permite al usuario ver y editar sus datos personales y foto de perfil.
-->
<script setup lang="ts">
import { Camera, Trash2, Check, CircleX, User, ShieldCheck, Mail, Sparkles } from 'lucide-vue-next';

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
  administrador: 'Administrador del Sistema',
  organizador: 'Organizador de Actividades',
  usuario: 'Miembro Comunitario',
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
      texto: 'El tamaño de la imagen debe ser menor a 2MB.',
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
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      profilePicture: profilePicture.value || null as any,
    });
    mensaje.value = { tipo: 'exito', texto: 'Tu información de perfil se ha actualizado correctamente.' };
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
        <span class="panel-eyebrow">Tu identidad</span>
        <h1>Mi perfil de usuario</h1>
        <p>Gestiona tu información personal, foto de perfil y presencia en la comunidad.</p>
      </header>

      <div class="panel-card profile-card">
        <form novalidate @submit.prevent="guardar">

          <!-- Sección de Avatar y Foto -->
          <div class="profile-photo-row">
            <div class="profile-avatar-box">
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

            <div class="profile-photo-info">
              <span class="profile-photo-title">Foto de perfil</span>
              <p class="profile-photo-hint">Formatos soportados: JPG, PNG o WebP (máximo 2MB).</p>

              <div class="profile-photo-btns">
                <button
                  type="button"
                  class="pill-btn pill-btn--ghost"
                  @click="triggerFileInput"
                >
                  <Camera :size="15" :stroke-width="2" /> {{ profilePicture ? 'Cambiar imagen' : 'Subir foto' }}
                </button>
                <button
                  v-if="profilePicture"
                  type="button"
                  class="pill-btn pill-btn--danger"
                  @click="quitarFoto"
                >
                  <Trash2 :size="15" :stroke-width="2" /> Quitar
                </button>
              </div>

              <input
                ref="fileInputRef"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                style="display: none;"
                @change="handleFileChange"
              />
            </div>
          </div>

          <!-- Opción de Enlace Directo (URL) -->
          <div class="field" style="margin-top: 1.5rem;">
            <label for="picUrl">O enlace directo a imagen (URL)</label>
            <input
              id="picUrl"
              v-model.trim="profilePicture"
              type="url"
              placeholder="https://ejemplo.com/mi-avatar.jpg"
            />
          </div>

          <!-- Nombre y Apellido -->
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

          <!-- Correo y Rol (Solo Lectura) -->
          <div class="field">
            <label>Correo electrónico (cuenta)</label>
            <input :value="authStore.usuario?.email" type="email" disabled />
          </div>

          <div class="field">
            <label>Rol comunitario asignado</label>
            <input :value="rolLegible[authStore.usuario?.role ?? 'usuario']" disabled />
          </div>

          <!-- Banner de Feedback -->
          <div
            v-if="mensaje"
            class="action-banner"
            :class="`action-banner--${mensaje.tipo}`"
          >
            <Check v-if="mensaje.tipo === 'exito'" :size="16" :stroke-width="2.2" />
            <CircleX v-else :size="16" :stroke-width="2.2" />
            <span>{{ mensaje.texto }}</span>
          </div>

          <button type="submit" class="pill-btn pill-btn--primary profile-submit-btn" :disabled="guardando">
            {{ guardando ? 'Guardando cambios...' : 'Guardar información del perfil' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<style scoped>
.profile-card {
  max-width: 38rem;
  padding: 2.25rem;
}

.profile-photo-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px dashed var(--ch-line);
}

.profile-avatar-box {
  width: 5rem;
  height: 5rem;
  border-radius: var(--ch-radius-md);
  overflow: hidden;
  background: linear-gradient(135deg, var(--ch-coral) 0%, var(--ch-violet) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--ch-line-strong);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
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

.profile-photo-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.profile-photo-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
}

.profile-photo-hint {
  font-size: 0.8rem;
  color: var(--ch-text-on-paper-muted);
  margin-bottom: 0.4rem;
}

.profile-photo-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-banner {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.85rem 1.15rem;
  border-radius: var(--ch-radius-sm);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.action-banner--exito {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #6ee7b7;
}

.action-banner--error {
  background: rgba(244, 63, 94, 0.15);
  border: 1px solid rgba(244, 63, 94, 0.35);
  color: #fca5a5;
}

.profile-submit-btn {
  width: 100%;
  padding: 0.85rem 1.25rem;
  font-size: 0.95rem;
  margin-top: 0.5rem;
}
</style>
