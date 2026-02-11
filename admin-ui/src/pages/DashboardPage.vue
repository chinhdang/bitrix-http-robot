<template>
  <div class="dashboard">
    <h1 class="page-title">Dashboard</h1>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <template v-else>
      <div class="stats-grid">
        <StatsCard :value="data.totalRequests" label="Total Requests" color="#2563eb" subtitle="Last 30 days" />
        <StatsCard :value="data.successCount" label="Successful" color="#22c55e" />
        <StatsCard :value="data.failCount" label="Failed" color="#ef4444" />
        <StatsCard :value="data.avgResponseTime" label="Avg Response (ms)" color="#8b5cf6" />
      </div>

      <div class="section-row">
        <QuotaBar :usage="data.monthlyUsage" :quota="data.quota" :plan="data.plan" />
      </div>

      <RequestChart :data="data.chartData || []" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/use-api'
import StatsCard from '../components/StatsCard.vue'
import QuotaBar from '../components/QuotaBar.vue'
import RequestChart from '../components/RequestChart.vue'

const { fetchApi } = useApi()
const loading = ref(true)
const error = ref('')
const data = ref<any>({})

onMounted(async () => {
  try {
    data.value = await fetchApi('/dashboard')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.section-row {
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #9ca3af;
}

.error-msg {
  text-align: center;
  padding: 24px;
  color: #ef4444;
  background: #fee2e2;
  border-radius: 8px;
}
</style>
