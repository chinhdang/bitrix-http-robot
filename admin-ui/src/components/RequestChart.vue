<template>
  <div class="chart-container">
    <div class="chart-title">Requests (Last 30 Days)</div>
    <div class="chart-body" ref="chartEl">
      <div class="chart-bars">
        <div
          v-for="(day, i) in data"
          :key="i"
          class="chart-bar-group"
          :title="`${formatDate(day.date)}: ${day.total} total (${day.success} ok, ${day.fail} fail)`"
        >
          <div class="chart-bar-stack" :style="{ height: barHeight(day.total) + 'px' }">
            <div class="chart-bar chart-bar--fail" :style="{ height: barSegment(day.fail, day.total) + 'px' }" />
            <div class="chart-bar chart-bar--success" :style="{ height: barSegment(day.success, day.total) + 'px' }" />
          </div>
          <div class="chart-date" v-if="i % 5 === 0">{{ shortDate(day.date) }}</div>
        </div>
      </div>
    </div>
    <div class="chart-legend">
      <span class="chart-legend-item"><span class="dot dot--success" /> Success</span>
      <span class="chart-legend-item"><span class="dot dot--fail" /> Failed</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ChartDay {
  date: string
  total: number
  success: number
  fail: number
}

const props = defineProps<{ data: ChartDay[] }>()

const maxVal = computed(() => Math.max(...props.data.map(d => d.total), 1))

function barHeight(total: number) {
  return Math.max((total / maxVal.value) * 120, total > 0 ? 2 : 0)
}

function barSegment(val: number, total: number) {
  if (total === 0) return 0
  return (val / total) * barHeight(total)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString()
}

function shortDate(d: string) {
  const dt = new Date(d)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
}
</script>

<style scoped>
.chart-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.chart-body {
  overflow-x: auto;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  min-height: 140px;
  padding-bottom: 20px;
}

.chart-bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 12px;
  position: relative;
}

.chart-bar-stack {
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
  border-radius: 2px;
  overflow: hidden;
}

.chart-bar--success {
  background: #22c55e;
}

.chart-bar--fail {
  background: #ef4444;
}

.chart-date {
  position: absolute;
  bottom: -18px;
  font-size: 10px;
  color: #9ca3af;
  white-space: nowrap;
}

.chart-legend {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.chart-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot--success { background: #22c55e; }
.dot--fail { background: #ef4444; }
</style>
