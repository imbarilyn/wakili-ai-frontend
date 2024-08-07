<script setup lang="ts">

import { useChatbotStore } from '@/stores'

const chatbotStore = useChatbotStore()

const emits = defineEmits<{
  (event: 'purchasePlan', subscriptionId: number, price: string, subscriptionName: string, duration: string): void
}>()

const purchasePlan = (subscriptionId: number, price: string, subscriptionName: string, duration: string) => {
  emits('purchasePlan', subscriptionId, price, subscriptionName, duration)
}
</script>



<template>

<div class="pt-6 grid lg:grid-cols-4  md:grid-cols-2 gap-4 grid-cols-1 w-full"  >
<div v-for="plan in chatbotStore.subscription" :key="plan.subscriptionId" class="gap-1 flex justify-center items-center">
  <div class="card glass w-96 md:w-64 lg:w-96 text-white " :class="[plan.subscriptionName==='Weekly'? 'bg-secondary-color': 'bg-main-color']">
    <figure class="pt-2">
      <span class="material-icons-outlined pe-2 !text-2xl" :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']">star_border_purple500</span>
      <span class="font-bold" :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']">{{plan.subscriptionName}} plan</span>

    </figure>
    <div class="card-body">
      <h2 class="card-title inline-block !text-4xl" :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']">{{plan.price}}
        <span class="text-sm font-normal" v-if="plan.duration === '1'">/24 hours</span>
        <span class="text-sm font-normal" v-if="plan.duration === '7'">/week</span>
        <span class="text-sm font-normal" v-if="plan.duration === '30'">/month</span>
      </h2>
      <button class="btn btn-sm mt-4" :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']" @click="purchasePlan(plan.subscriptionId, plan.price, plan.subscriptionName, plan.duration)">Buy {{plan.subscriptionName}} Plan</button>
      <div class="space-y-2">
        <div class="flex">
          <span class="material-icons text-dark pe-2" :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']">check_circle</span>
          <span :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']">24hours access</span>
        </div>
        <div class="flex">
          <span class="material-icons text-dark pe-2" :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']">check_circle</span>
          <span :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']">Dedicated support </span>
        </div>
        <div class="flex">
          <span class="material-icons text-dark pe-2" :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']">check_circle</span>
          <span :class="[plan.subscriptionName==='Weekly'? 'text-main-color': '']">Email Support</span>
        </div>
      </div>
      <div v-if="plan.subscriptionName === 'Weekly'" class="flex justify-end">
        <button class="border border-main-color px-1 rounded">
          <span class="text-main-color text-sm">Popular plan</span>
        </button>
      </div>
      </div>

    </div>
  </div>
</div>
</template>
