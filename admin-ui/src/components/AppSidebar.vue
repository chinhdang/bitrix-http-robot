<template>
  <nav class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">S</div>
      <div class="sidebar-title">SYNITY HTTP</div>
    </div>
    <ul class="sidebar-nav">
      <li v-for="item in navItems" :key="item.path">
        <router-link
          :to="item.path"
          class="sidebar-link"
          active-class="sidebar-link--active"
        >
          <span class="sidebar-icon">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '\u25A0' },
  { path: '/requests', label: 'Request Log', icon: '\u2630' },
  { path: '/usage', label: 'Usage & Billing', icon: '\u2B24' },
  { path: '/guide', label: 'Guide', icon: '?' },
  { path: '/about', label: 'About', icon: 'i' }
]
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-logo {
  width: 32px;
  height: 32px;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
}

.sidebar-title {
  font-weight: 600;
  font-size: 13px;
  color: #1f2937;
}

.sidebar-nav {
  list-style: none;
  padding: 8px;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: #6b7280;
  text-decoration: none;
  font-size: 13px;
  transition: background 0.15s, color 0.15s;
}

.sidebar-link:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.sidebar-link--active {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.sidebar-icon {
  width: 18px;
  text-align: center;
  font-size: 12px;
}
</style>
