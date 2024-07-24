import { defineStore } from 'pinia'
import { ref } from 'vue'


export const  useChatbotStore = defineStore('chatbotStore', ()=>{

  const newChat = ref<boolean>(true)

    // setters

  const setNewChat = (value: boolean)=>{
    return newChat.value = value

  }

    return{
      newChat,
      setNewChat

  }
})