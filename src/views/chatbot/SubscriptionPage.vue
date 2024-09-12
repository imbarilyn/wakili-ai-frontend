<script setup lang="ts">
import { useAuthStore, useChatbotStore, useNotificationsStore} from '@/stores'
import { onMounted, ref, watch } from 'vue'
import DialogModal from '@/components/toasts/DialogModal.vue'
import SubscriptionPlan from '@/components/SubscriptionPlan.vue'
import { useField } from 'vee-validate'
import UserPlan from '@/components/UserPlan.vue'
import { useRouter } from 'vue-router'
import WakiliIcon from '@/components/BulletPoint.vue'



const authStore = useAuthStore()
const chatbotStore = useChatbotStore()
const notificationsStore = useNotificationsStore()
const firstName = authStore.getUserInfo()?.firstName
const openSubscriptionModal = ref(false)
const router = useRouter()
interface Subscription {
  subscriptionId: number;
  price: string;
  subscriptionName: string,
  duration: string
}
  const subscriptionArray =  ref<Subscription[]>([])


const handlePurchase = (subscriptionId: number, price: string, subscriptionName: string, duration: string)=> {
  openSubscriptionModal.value = true
  subscriptionArray.value.push({ subscriptionId, price, subscriptionName, duration})
}

const userPhoneNo = ref('')
const  purchaseLoading = ref(false)
const paymentFail = ref()
let intervalId = ref()
watch(()=>paymentFail.value, (value)=>{
  console.log(paymentFail.value)
  if(value?.isPaid === 'Success' || value?.isPaid === 'Fail'){
    clearInterval(intervalId.value)
  }
})




const subscribeToPlan = ()=>{
  if(!userPhoneNo.value){
    notificationsStore.addNotification('Please enter your phone number', 'error')
    return
  }
  else {

    if (phoneNoMeta.valid && phoneNoMeta.validated) {
      purchaseLoading.value = true

      const subscriptionPayload = {
        phoneNo: userPhoneNo.value,
        amount: parseInt((subscriptionArray.value[0].price)),
        subscriptionId: subscriptionArray.value[0].subscriptionId

      }
      chatbotStore.purchaseSubscription(subscriptionPayload)
        .then((response) => {
          if (response.result === 'ok') {
            return
          } else {
            openSubscriptionModal.value = false
          }

          console.log(response)

        })
        .catch((error) => {
          console.log(error)

        })
        .finally(() => {
          setTimeout(() => {
            purchaseLoading.value = false
            // openSubscriptionModal.value = false
            subscriptionArray.value.splice(0, subscriptionArray.value.length)
          }, 1000)


        })
    } else {
      notificationsStore.addNotification('Please enter a valid phone number', 'error')
    }
  }

}


const phoneNoValidator = (value: string) => {
  if (!value) {
    return 'Phone number required'
  }

  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneNoRegex = /^[0-9]{10}$/

  if (!phoneNoRegex.test(value)) {
    return 'Phone number must be valid'
  }

  if (value.length > 10 && value.length < 10) {
    return 'Phone number must be 10 digits'
  }

  return true
}

const {
  value: phoneNo,
  errorMessage: phoneNoErrorMessage,
  meta: phoneNoMeta
} = useField('phoneNo', phoneNoValidator)

watch(
  () => userPhoneNo.value,
  (value) => {
    phoneNo.value = value
  }
)

const closeModal = ()=>{
  openSubscriptionModal.value = false
  // subscriptionArray.value.splice(0, subscriptionArray.value.length)
}

</script>


<template>
  <div class="h-screen w-full fixed overflow-y-auto lg:px-20 lg:pb-20 lg:top-12 px-10 pb:10 top-8 ">
    <div class="top-0 sticky z-50 backdrop-blur">
    <div class="grid grid-cols-3 w-full">
      <div class="md:col-span-2 col-span-3">
        <h1 class="!text-2xl font-bold capitalize" v-if="firstName?.substring(firstName.length-2, firstName.length-1) !== 's'">{{firstName}}'s  Subscription</h1>
        <h1 v-else class="!text-4xl capitalize">{{firstName}}' Subscription</h1>
      </div>
      <div class="md:col-span-1 col-span-2 flex md:justify-end">
        <button class="bg-main-color text-white rounded-lg btn btn-sm">
          <span class="material-icons-outlined">change_circle</span>
          <span>Change Plan</span>
        </button>
      </div>
    </div>
    <!--    <div v-for="plan in subscriptionArray" :key="plan.subscriptionId">-->
    <!--      <UserPlan-->
    <!--        :subscription="plan.subscriptionName"-->
    <!--        :price="plan.price"-->
    <!--        :duration="plan.duration"-->
    <!--      />-->
    <!--    </div>-->
    <UserPlan  />
    </div>



<div class="pt-8">
  <h1 class="text-2xl font-semibold">Available Subscription Plans</h1>
</div>

    <!--    subscription cards-->

   <SubscriptionPlan @purchase-plan = 'handlePurchase'/>
    <teleport to="body">
      <DialogModal
        :is-open="openSubscriptionModal"
        @closeModal="closeModal"
        v-for="subscription in subscriptionArray" :key="subscription.subscriptionId"
      >
        <template #title>
          <div class="flex justify-end">
            <button class="btn btn-sm btn-circle" @click="closeModal">
              <span class="material-icons-outlined">close</span>
            </button>
          </div>
          <div class="">
            <span class="font-bold text-xl">Enter Mpesa Number </span>
          </div>
        </template>

        <template #body>
          <div class="pt-4">
            <input v-model="userPhoneNo" type="text" class="input input-bordered input-main-color w-full"
                   :class="{'input-error': phoneNoMeta.validated && !phoneNoMeta.valid,
                   'input-main-color': phoneNoMeta.validated && phoneNoMeta.valid}"
                   placeholder="Enter Mpesa Number" />
          </div>
          <span v-if="phoneNoMeta.validated && !phoneNoMeta.valid" class="text-rose-500">{{phoneNoErrorMessage}}</span>
          <p class="font-bold text-lg">Kes. {{subscription.price}}</p>
        </template>

        <template #footer>
          <div class="w-full">
            <button class="btn bg-main-color text-white w-full" @click="subscribeToPlan">
              <span v-if="!purchaseLoading">Complete Purchase</span>
              <span class="loading loading-spinner loading-sm" v-else></span>
            </button>
          </div>
        </template>
      </DialogModal>
    </teleport>
  </div>
</template>