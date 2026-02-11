<template>
  <div class="about">
    <h1 class="page-title">About</h1>

    <section class="card">
      <div class="about-header">
        <div class="about-logo">S</div>
        <div>
          <h2>SYNITY HTTP Request</h2>
          <p class="version">Version 1.0.0</p>
        </div>
      </div>
      <p class="about-desc">
        A custom Bitrix24 automation robot for making HTTP requests to external APIs.
        Built by SYNITY to help businesses automate their workflows with powerful API integrations.
      </p>
    </section>

    <section class="card">
      <h3>Developer</h3>
      <p><strong>SYNITY</strong></p>
      <p class="about-detail">Bitrix24 automation solutions and custom integrations.</p>
    </section>

    <section class="card">
      <h3>Support</h3>
      <p>Need help? Contact us:</p>
      <ul>
        <li>Email: <a href="mailto:support@synity.vn">support@synity.vn</a></li>
      </ul>
    </section>

    <section class="card">
      <h3>Account</h3>
      <div v-if="loading" class="loading-sm">Loading...</div>
      <div v-else-if="account">
        <table class="info-table">
          <tr><td>Portal</td><td>{{ account.domain }}</td></tr>
          <tr><td>Member ID</td><td><code>{{ account.memberId }}</code></td></tr>
          <tr><td>Plan</td><td><PlanBadge :plan="account.plan" /></td></tr>
          <tr><td>Installed</td><td>{{ account.installedAt ? new Date(account.installedAt).toLocaleDateString() : '—' }}</td></tr>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/use-api'
import PlanBadge from '../components/PlanBadge.vue'

const { fetchApi } = useApi()
const loading = ref(true)
const account = ref<any>(null)

onMounted(async () => {
  try {
    account.value = await fetchApi('/account')
  } catch {
    // silently fail
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

.card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.card h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 10px;
}

.about-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.about-logo {
  width: 48px;
  height: 48px;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 700;
  font-size: 22px;
}

.version {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 2px;
}

.about-desc {
  color: #4b5563;
  line-height: 1.6;
}

.about-detail {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.card ul {
  list-style: none;
  margin-top: 8px;
}

.card ul li {
  padding: 4px 0;
  font-size: 14px;
  color: #4b5563;
}

.card a {
  color: #2563eb;
  text-decoration: none;
}

.card a:hover {
  text-decoration: underline;
}

.info-table {
  width: 100%;
  font-size: 13px;
}

.info-table td {
  padding: 6px 0;
  vertical-align: middle;
}

.info-table td:first-child {
  color: #6b7280;
  width: 120px;
  font-weight: 500;
}

.info-table code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.loading-sm {
  color: #9ca3af;
  font-size: 13px;
}
</style>
