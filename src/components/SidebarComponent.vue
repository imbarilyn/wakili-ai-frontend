<script lang="ts" setup>
import { type ChatHistoryTitle, useAuthStore, useChatbotStore, useNotificationsStore } from '@/stores'
import { useRouter } from 'vue-router'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ref, watch } from 'vue'
import ChatHistory from '@/views/chatbot/ChatHistory.vue'
import moment from 'moment'



const chatbotStore = useChatbotStore()

const router = useRouter()

const currentYear = ()=>{
  return new Date().getFullYear();
}

const newChat = ()=>{
  chatbotStore.setAppIsFetching(true)
  setTimeout(()=>{
    window.location.href = '/'
  }, 1000)

  // router.push({
  //   name: 'new-chat',
  //   params: {chat: 'new-chat'}
  // })
}


const emits = defineEmits<{
  (event: 'logout'):void
}>()
const collapseLargeScreen = ref<boolean>(false)
const screenSize = ref<number>()
const collapseSidebar = ()=>{
  screenSize.value = window.innerWidth
  // if(screenSize.value >= 1024){
  //   return
  // }
  console.log(screenSize.value)
  chatbotStore.setCollapse(true)
}

const closeSidebar = ()=>{
  const windowSize = window.innerWidth
  if(windowSize >= 1024){
    return
  }
  else{
    chatbotStore.setCollapse(false)

  }
  return chatbotStore.isCollapsed = true
}
 const collapseSidebarOnLarge = ref<boolean>(false)
const collapseonLarge = ()=>{
  console.log("Clicking the collapse arrow")
  collapseSidebarOnLarge.value = !collapseSidebarOnLarge.value
}

const showNewChat = ref<boolean>(false)

const logout = ()=>{
  emits('logout')
}

const subscribePage = ()=>{
  router.push({name: 'chat-subscription'})
}

const showSubscription = ref<boolean>(false)
const showSettings = ref<boolean>(false)
const showLogout = ref<boolean>(false)


chatbotStore.getChatHistoryTitles()
  .then((resp)=>{
    if(resp.result == 'ok'){
      chatbotStore.chatHistoryTitle = resp.data
    }
  })

const groupChatbyDate = () => {
  console.log(chatbotStore.chatHistoryTitle)
  const grouped = chatbotStore.chatHistoryTitle.reduce(
    (acc, chat) => {
      let date = moment(chat.createdAt).toISOString()
      let now = moment()
      if (now.isSame(date, 'day')) {
        date = 'Today'
      } else if (now.subtract(1, 'days').isSame(date, 'day')) {
        date = 'Yesterday'
      } else if (now.subtract(1, 'weeks').isBefore(date)) {
        date = 'Previous 7 Days'
      } else {
        date = moment(chat.createdAt).format('MMMM-YYYY')
      }
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(chat)
      return acc
    },
    {} as Record<string, ChatHistoryTitle[]>
  )
  console.log(grouped)
  return grouped
}
watch(()=> chatbotStore.isResponseGenerating, (value)=>{
  if(!value){
    chatbotStore.getChatHistoryTitles()
      .then((resp)=>{
        if(resp.result == 'ok'){
          chatbotStore.chatHistoryTitle = resp.data
        }
      })
  }
})


</script>




<template>
  <div class="h-screen">
<!--   sidenav on large screen-->
    <div class="hidden  lg:block top-0 bottom-0 h-screen">
      <div
        :class="[collapseSidebarOnLarge? 'w-[64px] duration-1000 overflow-y-hidden overflow-x-hidden' : 'duration-700']"
        class="relative w-64 flex h-full flex-col">
        <div
          :class="[collapseSidebarOnLarge? 'w-[64px] duration-1000 overflow-y-hidden overflow-x-hidden' : 'duration-700']"
          class="fixed py-4 px-4 bg-secondary-color w-64 h-screen">
          <div :class="[collapseSidebarOnLarge? '': '']">
            <button class="btn btn-sm btn-ghost" @click="collapseonLarge" :class="[collapseSidebarOnLarge? 'px-1': '']">
              <span class="material-icons-outlined text-main-color !text-2xl">menu</span>
            </button>
          </div>
          <div class="pt-10 group">
            <button
              :class="[collapseSidebarOnLarge? 'btn-circle flex': 'delay-1000 overflow-hidden']"
              @mouseover ='showNewChat = true'
              @mouseleave = 'showNewChat = false'
              class="btn btn-sm btn-ghost rounded-full bg-main-color" @click="newChat" >
              <span class="material-icons-outlined text-white" >add</span>
              <span class="text-white font-normal" v-if="!collapseSidebarOnLarge">New Chat</span>
            </button>
            <div class="absolute left-64 bg-main-color font-md text-white rounded-lg whitespace-pre drop-shadow-lg px-0 py-0 w-0 group-hover:px-2 group-hover:py-2 group-hover:left-14  group-hover:duration-700 group-hover:w-fit  " v-if="collapseSidebarOnLarge">
              <p>New Chat</p>
            </div>
          </div>
          <div v-if="!collapseSidebarOnLarge && chatbotStore.chatHistoryTitle" class="overflow-y-auto max-h-[480px] mt-4">
            <div v-for="(chats, date) in groupChatbyDate()" :key="date">
              <h1 class="font-bold sticky top-0 backdrop-blur pb-2">{{date}}</h1>
              <div v-for="chat in chats" :key="chat.id" class="px-2">
                <ChatHistory
                  :conversationId = "chat.conversationId"
                  :createdAt = "chat.createdAt"
                  :title="chat.title"
                  :content="chat.content"
                  :id="chat.id"
                />
              </div>
            </div>
          </div>

            <div class="absolute bottom-6 flex flex-col w-52">
              <div class="relative  group flex flex-col py-3">
                <button
                  @click="subscribePage"
                  @mouseover="showSubscription=true"
                  @mouseleave="showSubscription=false"
                  :class="[collapseSidebarOnLarge? 'btn-circle btn-ghost flex bg-transparent justify-center text-sm': '']"
                  class="btn btn-sm flex duration-500 justify-start mt-2 bg-main-color">
                  <span class="material-icons-outlined text-white" :class="[collapseSidebarOnLarge? 'text-main-color': 'text-white']">subscriptions</span>
                  <span class="text-white font-normal" v-if="!collapseSidebarOnLarge">Subscriptions</span>
                </button>
                <div
                  :class="[!collapseSidebarOnLarge?'hidden': '']"
                  class="absolute w-0 top-1 z-30 left-52 text-white  bg-main-color rounded-lg px-0 py-0 group-hover:px-2 group-hover:py-2 group-hover:duration-700 group-hover:left-14 group-hover:w-fit" v-if="showSubscription">
                  <p class="text-nowrap text-sm">Subscription</p>
                </div>
              </div>
              <div>
                <div class="relative flex-col flex group" >
                  <button
                    @mouseover="showSettings = true"
                    @mouseleave="showSettings = false"
                    :class="[collapseSidebarOnLarge? 'btn-circle btn-ghost flex bg-transparent justify-center text-sm': '']"
                    class="btn btn-sm flex justify-start bg-main-color hover:bg-gray-400 duration-500">
                    <span class="material-icons-outlined" :class="[collapseSidebarOnLarge? 'text-main-color !text-xxs': 'text-white']">settings</span>
                    <span class="text-white font-normal" v-if="!collapseSidebarOnLarge">Settings</span>
                  </button>
                  <div
                    :class="[!collapseSidebarOnLarge?'hidden': '']"
                    class="absolute w-0 top-1 z-30 left-52 text-white  bg-main-color rounded-lg px-0 py-0 group-hover:px-2 group-hover:py-2 group-hover:duration-700 group-hover:left-14 group-hover:w-fit" v-if="showSettings">
                    <p class="text-nowrap text-sm">settings</p>
                  </div>
                </div>

              </div>

              <div class="relative flex flex-col">
                <div class="relative group flex flex-col">
                  <button
                    @click="logout"
                    @mouseover="showLogout = true"
                    @mouseleave="showLogout = false"
                    :class="[collapseSidebarOnLarge? 'btn-circle btn-ghost flex bg-transparent justify-center text-sm': '']"
                    class="btn btn-sm flex duration-500 justify-start mt-2 bg-main-color">
                    <span class="material-icons-outlined  hover:text-main-color" :class="[collapseSidebarOnLarge? 'text-main-color': 'text-white']">logout</span>
                    <span class="text-white font-normal" v-if="!collapseSidebarOnLarge">Logout</span>
                  </button>
                  <div
                    :class="[!collapseSidebarOnLarge?'hidden': '']"
                    class="absolute w-0 top-1 z-30 left-52 text-white  bg-main-color rounded-lg px-0 py-0 group-hover:px-2 group-hover:py-2 group-hover:duration-700 group-hover:left-14 group-hover:w-fit" v-if="showLogout">
                    <p class="text-nowrap text-sm">Log out</p>
                  </div>
                </div>

              </div>


            </div>
          <div class="absolute bottom-0 flex" v-if="!collapseSidebarOnLarge">
            <span class="text-xs text-center" >2009-{{currentYear()}} Powered by Mzawadi</span>
          </div>
        </div>
      </div>
      </div>
    </div>
    <div>
      <TransitionRoot as="template" :show="!chatbotStore.isCollapsed" class="duration 500 block lg:hidden" id="sidebar">
        <Dialog class="relative z-50" @close="closeSidebar">
          <div class="fixed inset-x-0  overflow-hidden">
            <div class="absolute inset-0 overflow-hidden">
              <div class="pointer-events-none fixed inset-y-0 left-0 flex">
                <TransitionChild as="template"
                                 v-if="!collapseLargeScreen"
                                 id="transitionChild"
                                 enter="transform transition ease-in-out duration-500 sm:duration-700"
                                 enter-from="-translate-x-full"
                                 enter-to="translate-x-0"
                                 leave="transform transition ease-in-out duration-500 sm:duration-700"
                                 leave-from="translate-x-0"
                                 leave-to="-translate-x-full">
                  <DialogPanel class="w-64 pointer-events-auto h-screen relative top-0 bottom-0 overflow-y-hidden" id="SidebarDialog">
                    <div class="flex h-screen flex-col overflow-y-auto bg-secondary-color py-4 shadow-xl">
                      <div class="px-2 sm:px-4">
                        <TransitionChild as="template" enter="ease-in-out duration 500"  enter-from="opacity-0" leave="ease-in-out duration 500" leave-from="opacity-100">
                          <div class="" >
                            <button @click="collapseSidebar" class="btn btn-sm btn-ghost">
                              <span class="material-icons-outlined ">menu</span>
                            </button>
                          </div>
                        </TransitionChild>

                        <!--                      <DialogTitle class="text-base font-semibold leading-6 text-gray-900">Panel title</DialogTitle>-->
                      </div>
                      <!--                    sidebar content goes here-->
                      <div class="pt-6 flex-1 px-2 sm:px-4">
                        <div class="relative">
                          <div>
                            <button class="btn btn-sm btn-ghost rounded-full bg-main-color" @click.stop="newChat" >
                              <span class="material-icons-outlined text-white">add</span>
                              <span class="text-white font-normal">New Chat</span>
                            </button>
                          </div>

                        </div>
                        <div>
                          <div v-if="chatbotStore.chatHistoryTitle" class="overflow-y-auto max-h-[480px] mt-4">
                            <div v-for="(chats, date) in groupChatbyDate()" :key="date">
                              <h1 class="font-bold text-lg sticky top-0 backdrop-blur pb-2">{{date}}</h1>
                              <div v-for="chat in chats" :key="chat.id">
                                <ChatHistory
                                  :conversationId = "chat.conversationId"
                                  :createdAt = "chat.createdAt"
                                  :title="chat.title"
                                  :content="chat.content"
                                  :id="chat.id"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="absolute bottom-6 flex flex-col w-52">
                          <button
                            @click="subscribePage"
                            :class="[collapseSidebarOnLarge? 'btn-circle btn-ghost flex bg-transparent justify-center text-sm': '']"
                            class="btn btn-sm flex duration-500 justify-start mt-2 bg-main-color">
                            <span class="material-icons-outlined text-white" :class="[collapseSidebarOnLarge? 'text-blue-950': '']">subscriptions</span>
                            <span class="text-white font-normal" v-if="!collapseSidebarOnLarge">Subscription</span>
                          </button>

                            <button class="btn btn-sm flex justify-start bg-main-color hover:bg-gray-400">
                              <span class="material-icons-outlined text-white">settings</span>
                              <span class="text-white font-normal">Settings</span>
                            </button>


                          <button class="btn btn-sm flex justify-start bg-main-color"
                          @click="logout">
                            <span class="material-icons-outlined text-white hover:text-main-color">logout</span>
                            <span class="text-white font-normal">Logout</span>
                          </button>
                        </div>
                        <div class="absolute bottom-0 flex">
                          <span class="text-xs text-center" >2009-{{currentYear()}} Powered by Mzawadi</span>
                        </div>

                        <!-- Your content -->
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>
    </div>
</template>
