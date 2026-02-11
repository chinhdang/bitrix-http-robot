<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from './components/AppSidebar.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  color: #333;
  background: #f5f7fa;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
</style>
