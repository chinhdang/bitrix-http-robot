<template>
  <div class="usage-billing">
    <h1 class="page-title">Usage & Billing</h1>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <template v-else>
      <div class="usage-section">
        <div class="usage-header">
          <span>Current Plan: </span>
          <PlanBadge :plan="usage.plan" />
        </div>
        <QuotaBar :usage="usage.monthlyUsage" :quota="usage.quota" :plan="usage.plan" />
        <p class="installed-info" v-if="usage.installedAt">
          Installed: {{ new Date(usage.installedAt).toLocaleDateString() }}
        </p>
      </div>

      <h2 class="section-title">Plans</h2>
      <PricingTable :current-plan="usage.plan" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/use-api'
import QuotaBar from '../components/QuotaBar.vue'
import PlanBadge from '../components/PlanBadge.vue'
import PricingTable from '../components/PricingTable.vue'

const { fetchApi } = useApi()
const loading = ref(true)
const error = ref('')
const usage = ref<any>({})

onMounted(async () => {
  try {
    usage.value = await fetchApi('/usage')
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

.usage-section {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.usage-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
}

.installed-info {
  margin-top: 12px;
  font-size: 13px;
  color: #9ca3af;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
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
