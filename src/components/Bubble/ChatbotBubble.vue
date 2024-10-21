<script lang="ts" setup>

import { computed, onBeforeMount, onMounted, ref, watch } from 'vue'
import { useChatbotStore } from '@/stores'
import BulletPoint from '@/components/BulletPoint.vue'

export interface ChatbotBubbleProps {
  chatbotName?: string
  isTyping?: boolean
  isCopyable?: boolean
  hasError?: boolean
  picture?: string
  chatbotMessage: string
  originalMessage?: string
  createdAt?: string
}


const props = withDefaults(defineProps<ChatbotBubbleProps>(), {
  isTyping: true,
  isCopyable: false,
  hasError: false
})

console.log('Here in the copy', props.isCopyable)

console.log('We are the chatbubble section**********', props.isTyping)
const chatbotStore = useChatbotStore()
const hasText = computed(() => {
  return props.chatbotMessage.length > 0
})

const hasCopyButton = computed(() => {
  return props.isCopyable && props.chatbotMessage.length > 0
})
const isCopied = ref<boolean>(false)
const copyChat = () => {
  console.log('Original message', props.originalMessage)
  // check if ClipboardAPI is supported
  if (!navigator.clipboard) {
    return
  } else {
    if (navigator.clipboard && typeof navigator.clipboard.writeText !== 'function') {
      alert('Your browser does not support clipboard feature, switch to a different browser')
    } else {
      try {
        navigator.clipboard.writeText(props.originalMessage as string)
        isCopied.value = true
      } catch (error) {
        alert('Failed to copy, please try again')
      } finally {
        setTimeout(() => {
          isCopied.value = false
        }, 3000)
      }
    }
  }
}



const emits = defineEmits<{
  (event: 'thumbDown'): void
  (event: 'thumbUp'): void
}>()

// share positive feedback
const thumbUp = () => {
  console.log('Thumb up')
  emits('thumbUp')
}

// Report an issue
const thumbDown = () => {
  emits('thumbDown')
}
</script>

<template>
  <div class="chat chat-start py-10">
    <div class="chat-image avatar">
      <div class="w-10 rounded-full">
        <img src="../../../public/images/justice_scale.png" alt="wakili-ai" />

      </div>
    </div>
    <div class="chat-header">
      <span>{{ props.chatbotName }}</span>
      <time v-if='props.createdAt' class="text-xs opacity-50">12:45</time>
    </div>
    <!--    Chatbubble div-->
    <div>
      <div class="relative chat-bubble md:w-11/12 w-full text-sm md:text-lg flex flex-col">
        <div v-html="props.chatbotMessage"></div>
        <div v-if="!hasText"
             class="chat-bubble w-10/12">
          <span class="loading loading-ball loading-lg"></span>
        </div>
        <div v-if="chatbotStore.isResponseGenerating && hasText">
          <BulletPoint fill="#B9ED79" class="ml-2"></BulletPoint>
        </div>
      </div>
    </div>

    <div v-if="hasCopyButton" class="chat-footer space-x-3 mt-0.5 right-0 flex flex-row ">

      <div class="relative hover:cursor-pointer group"
           @click="copyChat"
      >
        <span class="material-icons-outlined md:!text-lg !text-lg" v-if="!isCopied">content_copy</span>
        <div v-if="isCopied" class="flex items-end justify-center text-emerald-500">
          <span class="material-icons-outlined text-sm">done</span>
          <span class="text-sm">Copied to clipboard</span>
        </div>
        <span v-if="!isCopied"
              class="absolute top-6 text-nowrap left-10 bg-main-color text-white py-0 px-0 rounded-lg w-0 group-hover:w-fit group-hover:px-1 group-hover:py-1 group-hover:left-2 group-hover:duration-700">copy chat</span>
      </div>
      <div class="relative hover:cursor-pointer group"
           @click="thumbUp"
      >
        <span class="material-icons-outlined !text-lg">thumb_up</span>
        <span
          class="absolute  top-6 text-nowrap left-16 bg-main-color text-white py-0 px-0 rounded-lg w-0 group-hover:px-1 group-hover:py-1 group-hover:duration-700 group-hover:w-fit group-hover:left-2">positive feedback</span>
      </div>
      <div class="relative group hover:cursor-pointer" @click="thumbDown">
        <span class="material-icons-outlined !text-lg">thumb_down</span>
        <span
          class="absolute text-nowrap top-6 left-32 bg-main-color text-white py-0 px-0 rounded-lg w-0 group-hover:px-1 group-hover:py-1 group-hover:left-2 group-hover:duration-700 group-hover:w-fit">Report issue</span>
      </div>


    </div>
  </div>
</template>

<style scoped>


</style>