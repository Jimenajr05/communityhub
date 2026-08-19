<script setup lang="ts">
useHead({ title: 'Iniciar sesión · CommunityHub' });

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const cargando = computed(() => authStore.cargando);
const isFormValid = computed(() => /\S+@\S+\.\S+/.test(email.value) && password.value.length > 0);

const headlineLines = ['Tu próxima', 'actividad', 'empieza aquí'];
const tags = ['Talleres', 'Arte', 'Deportes', 'Networking', 'Voluntariado'];

async function onSubmit() {
  errorMessage.value = '';
  if (!isFormValid.value) return;

  try {
    await authStore.login(email.value, password.value);
    // Si vinimos empujados por un middleware (auth/admin/organizer) con
    // ?redirect=/ruta-original, volvemos ahí en vez de mandar siempre a "/".
    // Solo se acepta una ruta interna (empieza con "/", no "//") para evitar
    // un open-redirect si alguien manipula el query param.
    const redirectParam = route.query.redirect;
    const destino =
      typeof redirectParam === 'string' && redirectParam.startsWith('/') && !redirectParam.startsWith('//')
        ? redirectParam
        : '/';
    router.push(destino);
  } catch (err: unknown) {
    const fetchError = err as { data?: { message?: string } };
    errorMessage.value =
      fetchError?.data?.message ?? 'No pudimos iniciar sesión. Verifica tu correo y contraseña.';
  }
}
</script>

<template>
  <div class="auth-screen">
    <AuthPosterPanel
      :headline-lines="headlineLines"
      copy="Talleres, deportes, arte y encuentros de tu comunidad — todo en un solo lugar."
      :tags="tags"
    />

    <section class="auth-screen__side">
      <TicketCard stub-label="Entrada" stub-code="CH · N.º 004521">
        <form class="ticket__form" novalidate @submit.prevent="onSubmit">
          <h2>Bienvenida de vuelta</h2>
          <p class="ticket__subtitle">Inicia sesión para ver tus actividades e inscripciones.</p>

          <div class="field">
            <label for="email">Correo electrónico</label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              autocomplete="email"
              placeholder=""
              :disabled="cargando"
            />
          </div>

          <div class="field">
            <label for="password">Contraseña</label>
            <div class="password-input">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
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
          </div>

          <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>

          <button type="submit" class="submit-btn" :disabled="cargando || !isFormValid">
            <span v-if="!cargando">Iniciar sesión</span>
            <span v-else>Entrando…</span>
          </button>

          <p class="ticket__footer">
            ¿No tienes cuenta todavía?
            <NuxtLink to="/registro">Regístrate aquí</NuxtLink>
          </p>
        </form>
      </TicketCard>
    </section>
  </div>
</template>

<style scoped>
</style>