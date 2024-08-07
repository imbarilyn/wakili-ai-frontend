import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore, useNotificationsStore } from '@/stores'

export interface UserSubscriptionPayload {
  subscriptionId: number,
  subscriptionName: string,
  duration:string,
  price:string
}

export interface PurchaseSubscriptionPayload {
  phoneNo: string,
  amount: string | number,
  subscriptionId: number,
}

const BASE_URL = import.meta.env.VITE_APP_BASE_URL as string
export const  useChatbotStore = defineStore('chatbotStore', ()=>{

  const newChat = ref<boolean>(true)
  const conversationId =ref<string>('')
  const isSubscription = ref<boolean>(true)
  const appIsFetching = ref<boolean>(false)
  const isCollapsed = ref<boolean>(false)
  const subscription = ref<UserSubscriptionPayload []>([])
  const getSubscriptionData = computed(()=>subscription?.value)

    // setters

  const setNewChat = (value: boolean)=>{
    return newChat.value = value
  }

  const setCollapse = (value:boolean)=>{
   return isCollapsed.value = value

  }

  const setSubscription=(value: boolean)=>{
    return isSubscription.value = value
  }

  const setSubscriptionData = (value: UserSubscriptionPayload[])=> {
  subscription.value = {...value}
  }



  //actions
  async function convoId(){
    const authStore = useAuthStore()
    const notification = useNotificationsStore()
    try{
      const response = await fetch('http://192.168.100.12:5000/api/get-conversation-id/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.getToken}`
        },
        mode:'cors'
      })
      const data = await response.json()
      // console.log(data)
      if(data.result === 'ok'){
        // console.log('conversation id', data.conversationId)
        conversationId.value = data.conversationId
      }
      else{
        console.log('error', data)
        notification.addNotification('There is an error, please try again', 'error')
      }
    }
    catch(error){
      console.log('error-convId', error)
      notification.addNotification('There is an error, please try again', 'error')
    }
  }

  async function getSubscription(){
    try{
      const response  = await fetch(`${BASE_URL}/api/payments/subscriptions/`,{
        method: 'GET',
        headers:{
          'Content-Type': 'application/json'
        },
        mode:'cors'
      })
      const data = await response.json()
      console.log(data)
      if(data.result === 'success'){
        console.log(data)
        setSubscriptionData({...data.data})
        console.log(subscription.value)
        return data
      }
      else {
        return
      }
    }
    catch(error){
      console.log('error', error)
    }
  }

  async function purchaseSubscription(purchaseSubscriptionPayload: PurchaseSubscriptionPayload){
    const authStore = useAuthStore()
    const notification = useNotificationsStore()
    try{
      const response = await fetch(`${BASE_URL}/api/make-payment/`,{
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
          Authorization: `${authStore.getToken}`
        },
        mode:'cors',
        body: JSON.stringify(purchaseSubscriptionPayload)
      })
      const data = await response.json()
      console.log(data)
      if(data.result === 'ok'){
        notification.addNotification('Subscription purchased successfully', 'success')
        return data
      }
      else{
        notification.addNotification('There is an error, please try again', 'error')
        return data
      }
    }
    catch(error){
      console.log('error', error)
      notification.addNotification('There is an error, please try again', 'error')
    }


  }


    return{
      newChat,
      setNewChat,
      convoId,
      conversationId,
      setSubscription,
      isSubscription,
      isCollapsed,
      setCollapse,
      getSubscription,
      subscription,
      setSubscriptionData,
      getSubscriptionData,
      purchaseSubscription

  }
})