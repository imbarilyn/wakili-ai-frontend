<script lang="ts" setup>

import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useChatbotStore} from '@/stores'

export interface ChatbotBubbleProps {
  chatbotName?: string
  isTyping?: boolean
  isCopyable?: boolean
  hasError?: boolean
  picture?: string
  chatbotMessage: string
}

const props = withDefaults(defineProps<ChatbotBubbleProps>(), {
  isTyping: true,
  isCopyable: false,
  hasError: false
})

console.log("We are the chatbubble section**********",props.isTyping)

const hasText = computed(()=>{
  return props.chatbotMessage.length > 0
})
// const hasCopyButton = computed(()=>{
//   return props.isCopyable && props.chatbotMessage?.length > 0
// })

// onMounted(()=>{
//   console.log(props.chatbotMessage)
// })

console.log(props.chatbotMessage)
</script>

<template>
  <div class="chat chat-start pt-10">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <img src="../../../public/images/justice_scale.png" alt="wakili-ai" />

      </div>
    </div>
    <div class="chat-header">
      <span>{{props.chatbotName}}</span>
      <time class="text-xs opacity-50">12:45</time>
    </div>
<!--    Chatbubble div-->
    <div>
      <div  class="relative chat-bubble md:w-11/12 w-full text-sm md:text-lg flex flex-col">
        <div v-html="props.chatbotMessage"></div>
        <div v-if="!hasText"
          class="chat-bubble w-10/12">
          <span class="loading loading-ball loading-lg"></span>
        </div>
        <div v-if="props.isTyping && hasText">
          <BulletPoint fill="#B9ED79" class="ml-2"></BulletPoint>
        </div>
        </div>

<!--      <div v-html="props.chatbotMessage"-->
<!--           v-if="hasText"-->
<!--           class="chat-bubble md:w-11/12 w-full text-sm md:text-lg">-->
<!--      </div>-->
<!--      <div-->
<!--        v-if="props.isTyping"-->
<!--           class="chat-bubble w-10/12">-->
<!--        <span><BulletPoint fill="#B9ED79"></BulletPoint></span>-->
<!--        -->
<!--      </div>-->
    </div>

    <div class="chat-footer opacity-50">Delivered</div>
  </div>
</template>

<style scoped>




</style>