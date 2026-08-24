<!-- Tarjeta decorativa tipo "boleto/ticket" con talón perforado, usada para mostrar entradas de eventos -->
<script setup lang="ts">
// Props del ticket: etiqueta y código mostrados en el talón
interface Props {
  stubLabel?: string; // Texto del talón (por defecto "Entrada")
  stubCode?: string; // Código/número mostrado en el talón
}

withDefaults(defineProps<Props>(), {
  stubLabel: 'Entrada',
  stubCode: 'CH · N.º 000000',
});
</script>

<template>
  <div class="ticket">
    <div class="ticket__stub">
      <span class="ticket__stub-label">{{ stubLabel }}</span>
      <span class="ticket__stub-code">{{ stubCode }}</span>
    </div>

    <div class="ticket__perforation" aria-hidden="true">
      <span class="ticket__notch ticket__notch--left" />
      <span class="ticket__notch ticket__notch--right" />
    </div>

    <slot />
  </div>
</template>