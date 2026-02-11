<template>
  <div class="request-log">
    <h1 class="page-title">Request Log</h1>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>
    <template v-else>
      <RequestTable
        :data="rows"
        :page="page"
        :total-pages="totalPages"
        @filter="onFilter"
        @page="onPage"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/use-api'
import RequestTable from '../components/RequestTable.vue'

const { fetchApi } = useApi()
const loading = ref(true)
const error = ref('')
const rows = ref<any[]>([])
const page = ref(1)
const totalPages = ref(1)
const currentFilters = ref<any>({})

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const params = new URLSearchParams()
    params.set('page', String(page.value))
    params.set('limit', '20')
    const f = currentFilters.value
    if (f.method) params.set('method', f.method)
    if (f.status) params.set('status', f.status)
    if (f.from) params.set('from', f.from)
    if (f.to) params.set('to', f.to)
    if (f.url) params.set('url', f.url)

    const result = await fetchApi(`/requests?${params}`)
    rows.value = result.data
    totalPages.value = result.totalPages
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function onFilter(filters: any) {
  currentFilters.value = { ...filters }
  page.value = 1
  loadData()
}

function onPage(p: number) {
  page.value = p
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
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
