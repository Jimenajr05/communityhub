<!-- Modal global de confirmación con diseño moderno y soporte para teclado (Esc / Enter) -->
<script setup lang="ts">
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-vue-next';

const { isOpen, options, onConfirm, onCancel } = useConfirm();

function handleKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return;
  if (e.key === 'Escape') {
    onCancel();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="confirm-fade">
        <div
          v-if="isOpen"
          class="confirm-modal-overlay"
          role="dialog"
          aria-modal="true"
          :aria-label="options.title"
          @click.self="onCancel"
        >
      <div class="confirm-modal-box" :class="`confirm-modal-box--${options.type || 'warning'}`">
        <!-- Botón de cierre superior -->
        <button
          type="button"
          class="confirm-modal-close"
          aria-label="Cerrar ventana"
          @click="onCancel"
        >
          <X :size="16" :stroke-width="2.2" />
        </button>

        <div class="confirm-modal-content">
          <!-- Icono con halo y color dinámico -->
          <div class="confirm-modal-icon-wrap">
            <span class="confirm-modal-icon-halo" />
            <AlertCircle v-if="options.type === 'danger'" :size="24" :stroke-width="2.2" class="confirm-icon" />
            <AlertTriangle v-else-if="options.type === 'warning'" :size="24" :stroke-width="2.2" class="confirm-icon" />
            <Info v-else :size="24" :stroke-width="2.2" class="confirm-icon" />
          </div>

          <!-- Textos -->
          <div class="confirm-modal-text">
            <h3 class="confirm-modal-title">{{ options.title }}</h3>
            <p class="confirm-modal-message">{{ options.message }}</p>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="confirm-modal-actions">
          <button
            type="button"
            class="confirm-btn confirm-btn--cancel"
            @click="onCancel"
          >
            {{ options.cancelText || 'Cancelar' }}
          </button>
          <button
            type="button"
            class="confirm-btn"
            :class="`confirm-btn--${options.type || 'warning'}`"
            @click="onConfirm"
          >
            {{ options.confirmText || 'Confirmar' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.confirm-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(2, 4, 10, 0.78);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
}

.confirm-modal-box {
  position: relative;
  width: 100%;
  max-width: 27rem;
  background: linear-gradient(180deg, #111726 0%, #0b0f19 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.25rem;
  padding: 1.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              0 10px 30px -5px rgba(0, 0, 0, 0.5);
  animation: modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.confirm-modal-box--danger {
  border-color: rgba(244, 63, 94, 0.35);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85),
              0 0 40px -10px rgba(244, 63, 94, 0.15);
}

.confirm-modal-box--warning {
  border-color: rgba(245, 158, 11, 0.35);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.85),
              0 0 40px -10px rgba(245, 158, 11, 0.15);
}

.confirm-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--ch-text-on-ink-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.confirm-modal-close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--ch-text-on-ink);
}

.confirm-modal-content {
  display: flex;
  gap: 1.15rem;
  align-items: flex-start;
}

.confirm-modal-icon-wrap {
  position: relative;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.confirm-modal-box--danger .confirm-modal-icon-wrap {
  background: rgba(244, 63, 94, 0.14);
  color: #fb7185;
}

.confirm-modal-box--warning .confirm-modal-icon-wrap {
  background: rgba(245, 158, 11, 0.14);
  color: #fbbf24;
}

.confirm-modal-box--info .confirm-modal-icon-wrap {
  background: rgba(124, 92, 252, 0.14);
  color: #a78bfa;
}

.confirm-modal-text {
  flex: 1;
  padding-top: 0.15rem;
}

.confirm-modal-title {
  font-family: var(--ch-font-display);
  font-size: 1.12rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.45rem;
  letter-spacing: -0.01em;
}

.confirm-modal-message {
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--ch-text-on-ink-muted);
  margin: 0;
}

.confirm-modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.confirm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1.15rem;
  border-radius: var(--ch-radius-full);
  font-family: var(--ch-font-body);
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.16s ease;
  border: 1px solid transparent;
}

.confirm-btn--cancel {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--ch-text-on-ink);
}

.confirm-btn--cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.confirm-btn--danger {
  background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);
}

.confirm-btn--danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(225, 29, 72, 0.55);
}

.confirm-btn--warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #04060c;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
}

.confirm-btn--warning:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
}

.confirm-btn--info {
  background: linear-gradient(135deg, var(--ch-coral) 0%, var(--ch-violet) 100%);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(124, 92, 252, 0.4);
}

.confirm-btn--info:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(124, 92, 252, 0.55);
}

/* Transiciones */
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.2s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

@keyframes modal-pop {
  0% {
    opacity: 0;
    transform: scale(0.94) translateY(6px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
