<script lang="ts" setup>
import { useAuthStore, useChatbotStore, useNotificationsStore } from '@/stores'
import { useRouter } from 'vue-router'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ref, watch } from 'vue'



const chatbotStore = useChatbotStore()

const router = useRouter()

const currentYear = ()=>{
  return new Date().getFullYear();
}

const newChat = ()=>{
  router.push({name: 'new-chat'})


}

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



</script>




<template>
  <TransitionRoot as="template" :show="!chatbotStore.isCollapsed" class="duration 500" id="sidebar">
    <Dialog class="relative z-10" @close="chatbotStore.isCollapsed">
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
              <DialogPanel class="w-64 pointer-events-auto relative overflow-x-auto" id="SidebarDialog">
                <div class="flex h-full flex-col overflow-y-scroll bg-secondary-color py-4 shadow-xl">
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
                  <div class="relative pt-6 flex-1 px-2 sm:px-4">
                    <div class="relative">
                      <div>
                        <button class="btn btn-sm btn-ghost rounded-full bg-main-color" @click.stop="newChat" >
                          <span class="material-icons-outlined text-white">add</span>
                          <span class="text-white font-normal">New Chat</span>
                        </button>
                      </div>
                      <div class="absolute bg-main-color rounded-lg px-2 right-2">
                        <span class="text-white ">New chat</span>
                      </div>

                    </div>
                    <div>
                      <p>History section</p>
                    </div>
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
</template>

<style scoped>

@media(max-width: 1024px){
  #sidebar{
    display: none;
  }

}


</style>