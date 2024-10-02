<script lang="ts" setup>
import { type UserSubscription } from '@/views/chatbot/SubscriptionPage.vue'
import { useChatbotStore } from '@/stores'
import {computed} from 'vue'

const useChatbot = useChatbotStore()
const props = defineProps<UserSubscription>()
console.log(props.cost)
const formattedsubscriptionEndDate = computed(()=>{
  const date = new Date(props.subscriptionEndDate)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })


})
</script>

<template>

<div>
  <div v-if="!useChatbot.isErrorUserPlan" class="grid lg:grid-cols-4  grid-cols-2 w-full gap-3 pt-4">
    <div class="bg-main-color text-white rounded-lg p-4 flex items-center">
      <div class="pe-4 flex items-center ">
        <span class="material-icons-outlined">subscriptions</span>
      </div>
      <div class=" ">
        <p class="lg:!text-xl md:text-lg text-sm">Subscription</p>
        <h2 class="lg:text-xl md:text-lg text-sm">{{props.subscriptionName}} Plan</h2>
      </div>
    </div>
    <div class="bg-main-color text-white rounded-lg flex p-4 items-center" >
      <div class="pe-4 flex items-center">
        <span class="material-icons-outlined">work_outline</span>
      </div>
      <div>
        <p class="lg:!text-xl md:text-lg text-sm">Limit</p>
        <h2  class="lg:text-xl md:text-lg  text-sm">{{
         props.subscriptionDuration=='1'? '24 hours': props.subscriptionDuration=='7'? '1 week': '1 month'
          }}</h2>
      </div>


    </div>
    <div class="bg-main-color text-white rounded-lg flex p-4 items-center" >
      <div class="pe-4 flex items-center">
        <span class="material-icons-outlined">payments</span>
      </div>
      <div>
        <p class="lg:!text-xl md:text-lg  text-sm">Plan Cost</p>
        <h2 class="lg:text-xl md:text-lg  text-sm">{{props.cost}}</h2>
      </div>


    </div>
    <div class="bg-main-color text-white rounded-lg flex p-4" >
      <div class="pe-4 flex items-center">
        <span class="material-icons-outlined">schedule</span>
      </div>
      <div>
        <p  class="lg:!text-xl md:text-lg  text-sm">Expires on</p>
        <h2 class="lg:text-xl md:text-lg  text-sm" >{{formattedsubscriptionEndDate}}</h2>
      </div>


    </div>
  </div>
  <div v-else>
    <p>Subscription Not Found</p>
  </div>

</div>


</template>