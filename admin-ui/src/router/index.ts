import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage.vue'
import RequestLogPage from '../pages/RequestLogPage.vue'
import UsageBillingPage from '../pages/UsageBillingPage.vue'
import GuidePage from '../pages/GuidePage.vue'
import AboutPage from '../pages/AboutPage.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', component: DashboardPage },
    { path: '/requests', component: RequestLogPage },
    { path: '/usage', component: UsageBillingPage },
    { path: '/guide', component: GuidePage },
    { path: '/about', component: AboutPage }
  ]
})
