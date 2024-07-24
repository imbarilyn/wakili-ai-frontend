<script setup lang="ts">
import { useChatbotStore} from '@/stores'
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationsStore} from '@/stores'
import ToastContainer from '@/components/toasts/ToastContainer.vue'
import ToastAlert from '@/components/toasts/ToastAlert.vue'

const chatbotStore = useChatbotStore()
const notificationsStore = useNotificationsStore()
const router = useRouter()

const currentYear = ()=>{
  return new Date().getFullYear();
}

const newChat = ()=>{
  router.push({name: 'new-chat'})
}
</script>


<template>
  <div class="w-full min-h-full relative flex">
<!--    sidebar nav-->
    <div class=" block relative w-64 h-screen border-e border-gray-300">
      <nav class=" h-screen fixed bg-secondary-color w-64 space-x-4">
        <div>
            <button>
              <span class="material-icons-outlined text-main-color">menu</span>
            </button>
          </div>

        <div class="pt-4">
          <button
            @click="newChat"
            class="btn btn-sm btn-ghost  rounded-full bg-main-color ">
            <span class="material-icons-outlined text-white ">add</span>
            <span class="text-white font-normal">New Chat</span>
          </button>
        </div>
<!--        History section-->
        <div class="">
          <p>History</p>
        </div>

<!--        Footer section-->
        <div class="absolute bottom-6 flex flex-col w-52">
          <button class="btn btn-sm flex justify-start bg-main-color hover:bg-gray-400">
            <span class="material-icons-outlined text-white">settings</span>
            <span class="text-white font-normal">Settings</span>
          </button>
          <button class="btn btn-sm flex justify-start mt-2 bg-main-color">
            <span class="material-icons-outlined text-white hover:text-main-color">logout</span>
            <span class="text-white font-normal">Logout</span>
          </button>
        </div>
        <div class="absolute bottom-0 flex w-full">
          <span class="text-xs text-center" >2009-{{currentYear()}} Powered by Mzawadi</span>
        </div>

      </nav>
    </div>
    <RouterView #default="{ Component, route }">
      <Transition>
        <template v-if="Component">
          <component :is="Component" :key="route.fullPath"  />
        </template>
      </Transition>
    </RouterView>
    <Teleport to="body">
      <ToastContainer v-if="notificationsStore.hasNotifications">
        <template v-for="notification in notificationsStore.getNotifications" :key="notification.id">
          <ToastAlert
            v-if="notification.id && notification.isShown"
            :id="notification.id"
            :is-shown="notification.isShown"
            :message="notification.message"
            :type="notification.type"
          />
        </template>
     </ToastContainer>


    </Teleport>
  </div>
</template>
