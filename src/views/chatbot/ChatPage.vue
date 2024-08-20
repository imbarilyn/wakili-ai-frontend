<script setup lang="ts">
import { useAuthStore, useChatbotStore, useNotificationsStore } from '@/stores'
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ToastContainer from '@/components/toasts/ToastContainer.vue'
import ToastAlert from '@/components/toasts/ToastAlert.vue'
import SidebarComponent from '@/components/SidebarComponent.vue'
import DialogModal from '@/components/toasts/DialogModal.vue'



const chatbotStore = useChatbotStore()
const notificationsStore = useNotificationsStore()
const authStore = useAuthStore()
const router = useRouter()

const currentYear = ()=>{
  return new Date().getFullYear();
}

const newChat = ()=>{
  router.push({name: 'new-chat'})


}
const collapseSidebar = ()=>{
  chatbotStore.setCollapse(true)
}
const windowSize = ref<number>(window.innerWidth)
watch(()=>windowSize.value, (value)=>{
  console.log(value)
if(!chatbotStore.isCollapsed &&  value <= 768){
  chatbotStore.setCollapse(true)
}
})

const logOut = ()=>{
  authStore.setOpenLogoutDialog()
}

const signOut = ()=>{
  authStore.logout()
  setTimeout(()=>{
    router.push({name: 'user-login'})
    authStore.setCloseLogoutDialog()
  }, 1000)


}


</script>


<template>
  <div class="w-full min-h-screen relative flex">
    <SidebarComponent @logout = 'logOut'/>
    <RouterView #default="{ Component, route }">
      <Transition class="lg:px-20">
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

      <DialogModal
        :is-open="authStore.openLogoutDialog.isOpen"
        @closeModal="authStore.setCloseLogoutDialog"
      >
        <template #title>
          <div class="flex justify-center">
            <span class="material-icons-outlined !text-6xl"> logout </span>
          </div>
        </template>
        <template #body>
          <div class="flex justify-center">
            <h1 class="text-xl font-bold">Oh no! You're leaving...</h1>
          </div>
          <div class="flex justify-center">
            <p class="text-lg font-semibold">Are you sure?</p>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-center">
            <button class="btn bg-main-color text-white me-5" @click="signOut">Sign Out</button>
            <button class="btn bg-secondary-color w-[200px]" @click="authStore.setCloseLogoutDialog()">
              Cancel
            </button>
          </div>
        </template>
      </DialogModal>


    </Teleport>
  </div>

</template>


