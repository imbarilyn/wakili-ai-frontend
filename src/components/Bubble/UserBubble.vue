<script setup lang="ts">

import { useAuthStore } from '@/stores'
import { computed } from 'vue'

export interface UserBubbleProps {
  userInput: string
  isTyping?: boolean
  isCopyable?: boolean
  hasError?: boolean
  picture?: string
  darkBgColor?: string
}
const authStore = useAuthStore()
const props =  defineProps<UserBubbleProps>()

const iconName= computed(()=>{
  console.log(authStore.getUserInfo()?.firstName.substring(0,2).toUpperCase())
  return authStore.getUserInfo()?.firstName.substring(0,2).toUpperCase()
})
</script>


<template>
  <div class="chat chat-end">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full" :class="[!props.picture? props.darkBgColor: 'bg-none' ]">
        <img v-if="props.picture"
          alt="user-profile-picture"
         :src="props.picture"/>
        <span v-else class="text-lg font-poppins-extra-bold text-white leading-none">{{iconName}}</span>
      </div>
    </div>
    <div class="chat-header">
      Anakin
      <time class="text-xs opacity-50">12:46</time>
    </div>
    <div class="chat-bubble">I hate you!</div>
    <div class="chat-footer opacity-50">Seen at 12:46</div>
  </div>

</template>
