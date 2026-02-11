<template>
  <div class="quota-bar">
    <div class="quota-header">
      <span class="quota-label">Monthly Usage</span>
      <span class="quota-text">{{ usage }} / {{ quotaLabel }}</span>
    </div>
    <div class="quota-track">
      <div
        class="quota-fill"
        :style="{ width: percentage + '%' }"
        :class="{ 'quota-fill--warning': percentage >= 80, 'quota-fill--danger': percentage >= 95 }"
      />
    </div>
    <div class="quota-footer">
      <span>{{ percentage }}% used</span>
      <span class="quota-plan">{{ plan }} plan</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  usage: number
  quota: number
  plan: string
}>()

const percentage = computed(() => {
  if (props.quota === Infinity || props.quota === 0) return 0
  return Math.min(Math.round((props.usage / props.quota) * 100), 100)
})

const quotaLabel = computed(() => {
  return props.quota === Infinity ? 'Unlimited' : String(props.quota)
})
</script>

<style scoped>
.quota-bar {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.quota-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.quota-label {
  font-weight: 600;
  color: #1f2937;
}

.quota-text {
  font-size: 13px;
  color: #6b7280;
}

.quota-track {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.quota-fill {
  height: 100%;
  background: #2563eb;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.quota-fill--warning {
  background: #f59e0b;
}

.quota-fill--danger {
  background: #ef4444;
}

.quota-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.quota-plan {
  text-transform: capitalize;
}
</style>
