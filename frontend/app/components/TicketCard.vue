<script setup lang="ts">
interface Props {
  stubLabel?: string;
  stubCode?: string;
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