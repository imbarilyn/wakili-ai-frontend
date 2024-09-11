<script setup lang="ts">


import { type ChatHistoryTitle, useChatbotStore } from '@/stores'
import { useRouter } from 'vue-router'
import WakiliIcon from '@/components/BulletPoint.vue'

const props = defineProps<ChatHistoryTitle>()
const router = useRouter()
const chatbotStore = useChatbotStore()
console.log(props)

const viewChat = (conversationId: string) => {
  chatbotStore.setActiveHistoryButton(props.id)
  console.log('view chat', props)
  chatbotStore.setActiveHistoryButton(props.id)
  chatbotStore.displayChatHistoryContent(conversationId)
    .then((resp) => {
      console.log(resp)
      try {
        chatbotStore.setAppIsFetching(true)
        if (resp.result === 'ok') {
          chatbotStore.chatHistoryContent = resp.data
          setTimeout(() => {
            chatbotStore.setAppIsFetching(false)
            router.push({ name: 'chat-history', params: { conversationId: conversationId } })
          }, 1000)
        }
      } catch {
        console.log('error')
      }
      // finally{
      //   chatbotStore.setAppIsFetching(false)
      // }
    })
}


</script>

<template>
  <div
    :class="[chatbotStore.getActiveHistoryButton === props.id? 'bg-cadet-blue-300': '']"
    class="grid grid-cols-12 btn btn-sm btn-ghost gap-1.5 my-1" @click="viewChat(props.conversationId)">
    <div
      class="col-span-2 flex flex-row items-center justify-center" >
      <img src="../../../public/images/justice_scale.png" class="h-5 w-5" alt="justice_scale">
<!--      <img src="/public/images/justice_scale%20(4).svg" />-->
      <!--     <span class="material-icons-outlined !text-sm text-neutral-600"> chat_bubble_outline </span>-->
    </div>
    <div class="col-span-10 flex flex-row justify-start items-center">
      <p class="text-start line-clamp-1">{{ props.title }}</p>
    </div>
  </div>

</template>