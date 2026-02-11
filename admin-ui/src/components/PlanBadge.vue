<template>
  <span class="plan-badge" :class="'plan--' + plan">{{ plan }}</span>
</template>

<script setup lang="ts">
defineProps<{ plan: string }>()
</script>

<style scoped>
.plan-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}
.plan--free { background: #f3f4f6; color: #6b7280; }
.plan--basic { background: #dbeafe; color: #2563eb; }
.plan--pro { background: #fef3c7; color: #d97706; }
.plan--enterprise { background: #f3e8ff; color: #9333ea; }
</style>
