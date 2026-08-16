<script setup lang="ts">
useHead({ title: 'Crear cuenta · CommunityHub' });

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

const authStore = useAuthStore();
const router = useRouter();

const cargando = computed(() => authStore.cargando);
const isFormValid = computed(
  () =>
    firstName.value.trim().length > 0 &&
    lastName.value.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email.value) &&
    password.value.length >= 8,
);

const headlineLines = ['Sé parte', 'de tu', 'comunidad'];
const tags = ['Voluntariado', 'Networking', 'Deportes', 'Arte', 'Talleres'];

async function onSubmit() {
  errorMessage.value = '';
  if (!isFormValid.value) return;

  try {
    await authStore.registrar({
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      password: password.value,
    });
    router.push('/');
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    errorMessage.value = fetchError?.data?.message ?? 'No pudimos crear tu cuenta. Intenta de nuevo.';
  }
}
</script>

<template>
  <div class="auth-screen">
    <AuthPosterPanel
      :headline-lines="headlineLines"
      copy="Crea tu cuenta y empieza a inscribirte en talleres, deportes y encuentros cerca de ti."
      :tags="tags"
      :seal-lines="['ÚNETE', 'HOY']"
    />

    <section class="auth-screen__side">
      <TicketCard stub-label="Nueva entrada" stub-code="CH · N.º 004522">
        <form class="ticket__form" novalidate @submit.prevent="onSubmit">
          <h2>Crea tu cuenta</h2>
          <p class="ticket__subtitle">Regístrate para inscribirte y guardar tus actividades favoritas.</p>

          <div class="field-row">
            <div class="field">
              <label for="firstName">Nombre</label>
              <input
                id="firstName"
                v-model.trim="firstName"
                type="text"
                autocomplete="given-name"
                required
                placeholder="María"
                :disabled="cargando"
              />
            </div>

            <div class="field">
              <label for="lastName">Apellido</label>
              <input
                id="lastName"
                v-model.trim="lastName"
                type="text"
                autocomplete="family-name"
                required
                placeholder="Fernández"
                :disabled="cargando"
              />
            </div>
          </div>

          <div class="field">
            <label for="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              v-model.trim="email"
              type="email"
              autocomplete="email"
              required
              placeholder="tu@correo.com"
              :disabled="cargando"
            />
          </div>

          <div class="field">
            <label for="reg-password">Contraseña</label>
            <div class="password-input">
              <input
                id="reg-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                minlength="8"
                placeholder="••••••••"
                :disabled="cargando"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
            <span class="field-hint">Mínimo 8 caracteres.</span>
          </div>

          <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

          <button type="submit" class="submit-btn" :disabled="cargando || !isFormValid">
            <span v-if="!cargando">Crear cuenta</span>
            <span v-else>Creando cuenta…</span>
          </button>

          <p class="ticket__footer">
            ¿Ya tienes cuenta?
            <NuxtLink to="/login">Inicia sesión aquí</NuxtLink>
          </p>
        </form>
      </TicketCard>
    </section>
  </div>
</template>

<style scoped>
</style>