
<script setup lang="ts">
import ChatbotBubble from '@/components/Bubble/ChatbotBubble.vue'
import UserBubble from '@/components/Bubble/UserBubble.vue'
import { io } from 'socket.io-client'
import UserInput from '@/components/UserInput.vue'


const socket = io()

socket.on('connect', ()=>{
  console.log('connected')
})

socket.on('disconnect', ()=>{
  console.log('disconnected')
})
const {darkBgColor, setColor } = colorGenerator(authStore.getUserInfo()?.firstName || 'You')
onMounted(()=>{
  setColor()
  console.log(authStore.getUserInfo()?.picture)
})

</script>

<template>
  <div class="w-full flex flex-col">
    <div class="text-center">
      <div class="sticky top-0 z-10 flex justify-center items-end ">
        <img class="h-10 w-10" src="@/assets/images/justice_scale.png">
        <h1 class="text-main-color font-semibold text-3xl sm:text-4xl ps-4">Wakiki Ai</h1>
      </div>
      <p>Here to assist with legal questions</p>

    </div>

    <div class="h-screen items-center justify-center">
      <ChatbotBubble />
      <UserBubble />

    </div>


    <div>
      <UserInput />

    </div>

  </div>

</template>