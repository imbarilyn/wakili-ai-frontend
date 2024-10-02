import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore, useNotificationsStore } from '@/stores'

export interface AvailableSubscriptionPayload {
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

export interface ChatHistoryTitle {
  conversationId: string,
  id: string,
  title: string,
  createdAt: string,
  content: string
}
export interface ChatHistoryContent {
  chatId: number,
  content: string,
  conversationId: string,
  createdAt: string,
  isUser: string
}

export interface UserSubscription {
  cost: string
  subscriptionDuration: string
  subscriptionEndDate: string
  subscriptionName: string
  subscriptionStatus: string
  userId: string
  isSubscribed: boolean
}





const BASE_URL = import.meta.env.VITE_APP_BASE_URL as string
export const  useChatbotStore = defineStore('chatbotStore', ()=>{

  const newChat = ref<boolean>(true)
  const conversationId =ref<string>('')
  const isSubscription = ref<boolean>(true)
  const appIsFetching = ref<boolean>(false)
  const isCollapsed = ref<boolean>(true)
  const availableSubscription = ref<AvailableSubscriptionPayload []>([])
  const chatHistoryTitle = ref<ChatHistoryTitle[]>([])
  const chatHistoryContent = ref<ChatHistoryContent[]>([])
  const getAvailableSubscription = computed(()=>availableSubscription?.value)
  const activeHistoryButton = ref<string>()
  const getActiveHistoryButton = computed(()=>activeHistoryButton.value)
  const paymentCheckoutId = ref<string>()
  const isResponseGenerating = ref<boolean>(false)
  const isOpenPositiveFeedback = ref({
    isOpen: false
  })



    // setters

  const setIsResponseGenerating = (value: boolean)=>{
    return isResponseGenerating.value = value
  }
  const setPositiveFeedback = (value: boolean)=>{
    return isOpenPositiveFeedback.value.isOpen = value

  }


  const setActiveHistoryButton = (value: string)=>{
    return activeHistoryButton.value = value
  }
  const setNewChat = (value: boolean)=>{
    return newChat.value = value
  }

  const setCollapse = (value:boolean)=>{
   return isCollapsed.value = value

  }

  const setSubscription=(value: boolean)=>{
    return isSubscription.value = value
  }

  const setSubscriptionData = (value: AvailableSubscriptionPayload[])=> {
  availableSubscription.value = {...value}
  }

  const setAppIsFetching = (value: boolean) => {
    return appIsFetching.value = value
  }
  //actions
  async function convoId(){
    const authStore = useAuthStore()
    const notification = useNotificationsStore()
    console.log(authStore.getToken)
    try{
      const response = await fetch(`${BASE_URL}/api/get-conversation-id/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.getToken}`
        },
        mode:'cors'
      })
      const data = await response.json()
      console.log(data)
      if(data.result === 'ok'){
        // console.log('conversation id', data.conversationId)
        conversationId.value = data.conversationId
        notification.addNotification('Wakili Ai is set up and ready to assist you', 'success')
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
        // setSubscriptionData({...data.data})
        // console.log(subscription.value)
        return data
      }
      else {
        return
      }
    }
    catch(error){
      console.log('error', error)
    }
    finally {
      console.log('finally')
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
        // notification.addNotification('Subscription purchased successfully', 'success')
        paymentCheckoutId.value = data.checkoutId
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
  // https://wakiliorgapi.mzawadi.com/api/payments/check-payment/

  async function checkPaymentStatus (){
    const authStore = useAuthStore()
    try{
      const response =  await fetch(`${BASE_URL}/api/payments/check-payment/?checkoutId=${paymentCheckoutId.value}`,{
        method: 'GET',
        headers:{
          'Content-Type': 'application/json',
          Authorization: `${authStore.getToken}`
        },
        mode:'cors'
      })
      const resp = await response.json()
      console.log(resp)
      return resp
    }
    catch(error){
      console.log(error)
    }
  }

  async function getChatHistoryTitles() {
    const authStore = useAuthStore()
    const notification = useNotificationsStore()
    const email = authStore.getUserInfo()?.email
    console.log(email)
    try {
      const response = await fetch(`${BASE_URL}/api/chat-history/titles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.getToken}`
        },
        mode: 'cors',
        body: JSON.stringify({
          email: email
        })
      })
      const resp = await response.json()
      if(resp.result == 'ok'){
        console.log('Chat titles are available')
        // notification.addNotification('Chat history fetched successfully', 'success')
      }
      else {
        notification.addNotification('There is an error fetching chat history', 'error')
      }
      return resp
    } catch (error) {
      console.log(error)
      // notification.addNotification('There is an error fetching chat history', 'error')
    }
  }

  async function displayChatHistoryContent(convId: string) {
    const notification = useNotificationsStore()
    try {
      const response = await fetch(`${BASE_URL}/api/chat-history/chats/${convId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      })
      const resp = await response.json()
      console.log(resp)
      return resp
    } catch (error) {
      console.log(error)
      notification.addNotification('There is an error fetching chat history', 'error')
    } finally {
      console.log('finally')
    }
  }
const isErrorUserPlan = ref<boolean>(false)
  async function getUserSubscription(){
    const authStore = useAuthStore()
    try{
      const response = await fetch(`${BASE_URL}/api/subscriptions/get-user-subscriptions/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authStore.getToken}`
        },
        mode: 'cors'
      })
      return await response.json()
    }
    catch(error){
      isErrorUserPlan.value = true
      console.error(error)
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
      subscription: availableSubscription,
      setSubscriptionData,
      getSubscriptionData: getAvailableSubscription,
      purchaseSubscription,
      getChatHistoryTitles,
      chatHistoryTitle,
      chatHistoryContent,
      displayChatHistoryContent,
      appIsFetching,
      setAppIsFetching,
      setActiveHistoryButton,
      activeHistoryButton,
      checkPaymentStatus,
      getActiveHistoryButton,
      setIsResponseGenerating,
      isResponseGenerating,
      getUserSubscription,
      isErrorUserPlan,
      isOpenPositiveFeedback,
      setPositiveFeedback


    }
})