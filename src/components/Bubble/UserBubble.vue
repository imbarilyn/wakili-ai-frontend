<script setup lang="ts">

import { useAuthStore } from '@/stores'
import { computed, ref } from 'vue'

export interface UserBubbleProps {
  userInput?: string
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
        <div v-else class="flex justify-center h-full items-center">
          <span class="font-poppins-extra-bold !text-xl  text-white leading-none">{{iconName}}</span>
        </div>

      </div>
    </div>
    <div class="chat-header">
      <span>{{authStore.getUserInfo()?.firstName}}</span>
      <time class="text-xs opacity-50">12:46</time>
    </div>
    <div class="chat-bubble bg-secondary-color text-main-color" v-html="props.userInput"></div>
<!--    <div class="chat-footer opacity-50">Seen at 12:46</div>-->
  </div>

</template>
