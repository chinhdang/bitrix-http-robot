<template>
  <div class="pricing-grid">
    <div
      v-for="tier in tiers"
      :key="tier.name"
      class="pricing-card"
      :class="{ 'pricing-card--current': tier.name === currentPlan, 'pricing-card--highlight': tier.highlight }"
    >
      <div class="pricing-name">{{ tier.label }}</div>
      <div class="pricing-price">
        <span class="pricing-amount">{{ tier.price }}</span>
        <span class="pricing-period" v-if="tier.price !== 'Free'">/mo</span>
      </div>
      <div class="pricing-quota">{{ tier.quotaLabel }} requests/month</div>
      <ul class="pricing-features">
        <li v-for="f in tier.features" :key="f">{{ f }}</li>
      </ul>
      <div class="pricing-action">
        <span v-if="tier.name === currentPlan" class="pricing-current">Current Plan</span>
        <button v-else class="pricing-btn" :class="{ 'pricing-btn--primary': tier.highlight }">
          {{ tier.name === 'free' ? 'Downgrade' : 'Upgrade' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ currentPlan: string }>()

const tiers = [
  {
    name: 'free', label: 'Free', price: 'Free', quotaLabel: '100', highlight: false,
    features: ['100 requests/month', 'Basic dashboard', 'Request log (7 days)']
  },
  {
    name: 'basic', label: 'Basic', price: '$5', quotaLabel: '1,000', highlight: false,
    features: ['1,000 requests/month', 'Full dashboard', 'Request log (30 days)', 'Email support']
  },
  {
    name: 'pro', label: 'Pro', price: '$15', quotaLabel: '10,000', highlight: true,
    features: ['10,000 requests/month', 'Full dashboard', 'Request log (90 days)', 'Priority support']
  },
  {
    name: 'enterprise', label: 'Enterprise', price: '$29', quotaLabel: 'Unlimited', highlight: false,
    features: ['Unlimited requests', 'Full dashboard', 'Unlimited log history', 'Dedicated support']
  }
]
</script>

<style scoped>
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.pricing-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
}

.pricing-card--current {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.pricing-card--highlight {
  border-color: #f59e0b;
}

.pricing-name {
  font-weight: 600;
  font-size: 16px;
  color: #1f2937;
}

.pricing-price {
  margin-top: 8px;
}

.pricing-amount {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.pricing-period {
  font-size: 14px;
  color: #9ca3af;
}

.pricing-quota {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

.pricing-features {
  list-style: none;
  margin-top: 16px;
  flex: 1;
}

.pricing-features li {
  padding: 4px 0;
  font-size: 13px;
  color: #4b5563;
}

.pricing-features li::before {
  content: '\2713 ';
  color: #22c55e;
  font-weight: 700;
}

.pricing-action {
  margin-top: 16px;
}

.pricing-current {
  display: block;
  text-align: center;
  padding: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #2563eb;
}

.pricing-btn {
  display: block;
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.pricing-btn:hover {
  background: #f9fafb;
}

.pricing-btn--primary {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

.pricing-btn--primary:hover {
  background: #1d4ed8;
}
</style>
