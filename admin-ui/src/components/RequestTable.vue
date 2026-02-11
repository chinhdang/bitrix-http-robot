<template>
  <div class="req-table-wrapper">
    <!-- Filters -->
    <div class="filters">
      <select v-model="filters.method" @change="emit('filter', filters)">
        <option value="">All Methods</option>
        <option v-for="m in ['GET','POST','PUT','PATCH','DELETE']" :key="m" :value="m">{{ m }}</option>
      </select>
      <select v-model="filters.status" @change="emit('filter', filters)">
        <option value="">All Status</option>
        <option value="success">Success</option>
        <option value="fail">Failed</option>
      </select>
      <input type="date" v-model="filters.from" @change="emit('filter', filters)" placeholder="From" />
      <input type="date" v-model="filters.to" @change="emit('filter', filters)" placeholder="To" />
      <input type="text" v-model="filters.url" @input="debouncedFilter" placeholder="Search URL..." class="url-search" />
    </div>

    <!-- Table -->
    <div class="table-scroll">
      <table class="req-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Method</th>
            <th>URL</th>
            <th>Status</th>
            <th>Time (ms)</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="data.length === 0">
            <td colspan="6" class="empty">No requests found</td>
          </tr>
          <tr v-for="row in data" :key="row.id">
            <td class="nowrap">{{ formatTime(row.created_at) }}</td>
            <td><span class="method-badge" :class="'method--' + row.method.toLowerCase()">{{ row.method }}</span></td>
            <td class="url-cell" :title="row.url">{{ truncUrl(row.url) }}</td>
            <td>
              <span class="status-badge" :class="row.success ? 'status--ok' : 'status--fail'">
                {{ row.status_code || '—' }}
              </span>
            </td>
            <td>{{ row.execution_time ?? '—' }}</td>
            <td class="error-cell">{{ row.error_message || '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="emit('page', page - 1)">&laquo; Prev</button>
      <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="emit('page', page + 1)">Next &raquo;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

defineProps<{
  data: any[]
  page: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'filter', filters: any): void
  (e: 'page', page: number): void
}>()

const filters = reactive({ method: '', status: '', from: '', to: '', url: '' })

let debounceTimer: ReturnType<typeof setTimeout>
function debouncedFilter() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => emit('filter', filters), 300)
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString()
}

function truncUrl(url: string) {
  return url.length > 60 ? url.substring(0, 57) + '...' : url
}
</script>

<style scoped>
.filters {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.filters select, .filters input {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
}

.url-search {
  flex: 1;
  min-width: 160px;
}

.table-scroll {
  overflow-x: auto;
}

.req-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.req-table th {
  text-align: left;
  padding: 8px 12px;
  background: #f9fafb;
  color: #6b7280;
  font-weight: 500;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.req-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.nowrap { white-space: nowrap; }

.url-cell {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: monospace;
  font-size: 12px;
}

.error-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #ef4444;
  font-size: 12px;
}

.method-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}
.method--get { background: #dbeafe; color: #2563eb; }
.method--post { background: #dcfce7; color: #16a34a; }
.method--put { background: #fef3c7; color: #d97706; }
.method--patch { background: #fce7f3; color: #db2777; }
.method--delete { background: #fee2e2; color: #dc2626; }

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
.status--ok { background: #dcfce7; color: #16a34a; }
.status--fail { background: #fee2e2; color: #dc2626; }

.empty {
  text-align: center;
  color: #9ca3af;
  padding: 32px 12px !important;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.pagination button {
  padding: 6px 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: default;
}

.page-info {
  font-size: 13px;
  color: #6b7280;
}
</style>
