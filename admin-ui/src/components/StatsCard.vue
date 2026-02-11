<template>
  <div class="stats-card" :style="{ borderLeftColor: color }">
    <div class="stats-value">{{ formattedValue }}</div>
    <div class="stats-label">{{ label }}</div>
    <div v-if="subtitle" class="stats-subtitle">{{ subtitle }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number
  label: string
  color?: string
  subtitle?: string
}>()

const formattedValue = computed(() => {
  if (props.value >= 1000000) return (props.value / 1000000).toFixed(1) + 'M'
  if (props.value >= 1000) return (props.value / 1000).toFixed(1) + 'K'
  return String(props.value)
})
</script>

<style scoped>
.stats-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stats-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.stats-label {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.stats-subtitle {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}
</style>
