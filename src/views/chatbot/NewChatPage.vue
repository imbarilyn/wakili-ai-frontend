
<script setup lang="ts">
import ChatbotBubble from '@/components/Bubble/ChatbotBubble.vue'
import UserBubble from '@/components/Bubble/UserBubble.vue'
import { io } from 'socket.io-client'
import UserInput from '@/components/UserInput.vue'


})
const socket = io('ws://192.168.100.12:5001')
const authStore = useAuthStore()
const chatbotStore = useChatbotStore()
const notification = useNotificationsStore()
const appIsFetching = ref(false)
const conversation =ref<Conversation []>([])
const placeholder = ref<string>('How can Wakili help you today?')
const isGeneratingResponses = ref(false)
const chatTextColor = ref('text-white')
const mesRes = ref('')


socket.on('connect', ()=>{
  console.log('connected successfully')
})

//  any errrors associated with the socket connection
socket.on('error', (err)=>{
  console.log('error connecting to the server', err )
})

const isPlanExpired = ref(false)


// subscriptions
socket.on('payment_required', (message)=>{
  chatbotStore.setSubscription(false)
  console.log(message)
  isPlanExpired.value = true

})
const {darkBgColor, setColor } = colorGenerator(authStore.getUserInfo()?.firstName || 'You')

const renderer: any = {
  link(href: string, title: string, text: string) {
    return `<a target="_blank" class="link link-primary" href="${href}" title="${title}">${text}</a>`
  },
  table(header: string, body: string) {
    return `
   <div class="bg-white p-2.5 rounded-xl shadow-lg shadow-slate-300/10 my-3">
    <div class="overflow-x-auto py-4">
        <table class="table table-zebra border">
        <thead>
            ${header}
        </thead>
        <tbody>
            ${body}
        </tbody>
    </table>
    </div>
    </div>
  `
  },
  tablerow(content: string) {
    return `
    <tr class="hover">${content}</tr>
  `
  },
  tablecell(content: string) {
    return `
    <td>${content}</td>
  `
  },
  code(code: string, language: string) {
    // return `
    //   <pre><div class="mockup-code my-3"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    if (language) {
      const ignoreIllegals = true
      return `
  <div class="p-2 flex w-full">
       <pre class="w-full"><div class="mockup-code bg-neutral-800 my-3 relative shadow-xl w-full overflow-auto"><div class="px-4 flex-1 overflow-auto h-full w-full"><code class="language-${language}">${
        hljs.highlight(code, {
          language,
          ignoreIllegals
        }).value
      }</code></div></div></pre>
  </div>
    `
    } else {
      return `
  <div class="p-3 flex w-full">
    <pre class="w-full"><div class="mockup-code bg-neutral-800 my-2.5 w-full overflow-auto"><div class="px-4 flex-1 overflow-auto h-full w-full"><code>${code}</code></div></div></pre>
  </div>
  `
    }
  },
  list(body: string, ordered: boolean, start: number | undefined) {
    if (ordered) {
      if (start) {
        return `
         <div class="my-2 py-2 mx-3">
            <ol start="${start}" class="list-decimal list-outside mx-5 space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ol>
         </div>
      `
      }
      return `
         <div class="my-2 py-2 mx-3">
            <ol class="list-decimal mx-5 list-outside space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ol>
         </div>
    `
    } else {
      return `
         <div class="my-2 py-2 mx-3">
            <ul class="list-disc list-outside mx-5 space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ul>
         </div>
    `
    }
  },
  listitem(text: string) {
    return `
    <li class="${chatTextColor.value}">${text}</li>
  `
  },
  paragraph(text: string) {
    return `
    <p class="${chatTextColor.value} leading-relaxed">${text}</p>
  `
  },
  heading(text: string, level: string) {
    return `
    <h${level} class="text-2xl font-poppins-bold text-tertiary-color dark:text-neutral-50">${text}</h${level}>
  `
  },
  hr() {
    return `
    <hr class="my-4 border-neutral-200 dark:border-neutral-700"/>
  `
  },
  blockquote(quote: string) {
    return `
    <blockquote class="my-4 border-l-4 border-neutral-200 dark:border-neutral-700 pl-4">${quote}</blockquote>
  `
  },
  image(href: string, title: string, text: string) {
    return `
    <img src="${href}" alt="${text}" title="${title}" class="w-full"/>
  `
  },
  strong(text: string) {
    return `
    <strong class="font-poppins-semi-bold my-1 text-base">${text}</strong>
  `
  },
  codespan(code: string) {
    // return `
    //   <pre><div class="mockup-code"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    // we'll rather render this like in chatGPT
    return `
    <code class="font-poppins-semi-bold my-1">&acute;${code}&acute;</code>
  `
  },
  // descriptionList(body: string) {
  //   return `
  //   <dl>${body}</dl>
  // `
  // },
  // description(dt: string, dd: string) {
  //   return `
  //   <dt>${dt}</dt>
  //   <dd>${dd}</dd>
  // `
  // }
}

// create a custom description list renderer

marked.use({
  renderer,
  breaks: true,
  gfm: true
})

const handleUserInput = (
  value: string,
  formatted: string,
  audioData?:{
    audio: Blob,
    audioUrl: string
})=>{
  console.log(formatted)
  // create user message container
  const userMessage= ref<Conversation>({
    message: formatted,
    isUser: true,
    uniqueId: _.uniqueId('user-'),
    audioData
  })
  // push the user message to the conversation array
  conversation.value.push(userMessage.value)
  console.log(conversation.value)

  // create container for ai-message
  const aiMessage = ref<Conversation>({
    message: '',
    isUser: false,
    uniqueId: _.uniqueId('ai-'),
    isTyping:true,
  })

  // push the ai-message to the conversation array
  setTimeout(()=>{
    conversation.value.push(aiMessage.value)
  }, 500)

  try{
    socket.emit('message', {
      message:formatted,
      conversationId: chatbotStore.conversationId
    })
  }
  catch(e){
    console.log(e)
    aiMessage.value.hasError = true
    aiMessage.value.message += `
    <div class="bg-rose-100 border border-rose-400 text-rose-700 px-4 py-3 rounded-lg relative text-sm" role="alert">
    <strong class="font-bold">Opps!</strong>
    <span class="block sm:inline">Something went wrong. Please try again</span>
</div>`
    aiMessage.value.isTyping = false
    isGeneratingResponses.value = false
    notification.addNotification('Oops!Something went wrong. Please try again', 'error')
  }
}

socket.on('message', (response)=>{
  // console.log(response)
  // const parsedResponse = JSON.parse(response)
  mesRes.value += response.message
})

  watch(()=>mesRes.value,(value: string)=>{
    if(!value){
      return
    }
    const responseArray = value.split("~~~ENDOFSTREAM~~~")
    const currMessage = responseArray[0]
    const aiResponseArray = conversation.value.filter((convo)=> !convo.isUser)
    const currentAiMessageObj = aiResponseArray[aiResponseArray.length - 1]
    currentAiMessageObj.message = currMessage
    console.log(conversation.value)

    // if the end of stream is reached, stop typing and clear the message container
    if(value.includes('~~~ENDOFSTREAM~~~')){
      console.log('end of stream')
      isGeneratingResponses.value = false
      currentAiMessageObj.isTyping = false
      mesRes.value = ''
    }
  })
const subscriptionLoading = ref(false)
const subscribeToPlan = ()=> {
  // chatbotStore.setSubscription(true)
  subscriptionLoading.value = true

  chatbotStore.getSubscription()
    .then((response) => {
      console.log(chatbotStore.subscription)
      if (response.result === 'success') {
        // chatbotStore.setSubscriptionData(response.data)
        notification.addNotification('Subscription data fetched successfully', 'success')
        route.push({
          name: 'chat-subscription'
        })
      } else {
        console.log('failed to fetch subscription data', response.result)
        // notification.addNotification('Failed to fetch subscription data kindly try again', 'error')
      }
    })
    .catch((error) => {
      console.log(error)
      notification.addNotification('Failed to fetch subscription data kindly try again', 'error')
    })
    .finally(() => {
      setTimeout(() => {
        subscriptionLoading.value = false
        chatbotStore.setSubscription(true)
      }, 1000)
    })
}


const expandSidebar = ()=>{
  chatbotStore.setCollapse(false)


  console.log(window.innerWidth)
}




</script>

<template>
  <div class="relative min-h-full  w-full  flex-1 max-w-screen-xl mx-auto overflow-y-auto">
    <div class="lg:hidden pt-6 ps-6">
      <button class="btn btn-sm" @click="expandSidebar">
        <span class="material-icons-outlined">menu</span>
      </button>

    </div>
    <div class="w-full min-h-screen py-10 lg:py-14 flex flex-col md:px-16 px-10">
      <div class="sticky top-0 z-10 lg:z-0 max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto flex">
        <div class="flex justify-center w-full">
          <div class="flex justify-center backdrop-blur">
            <img class="h-10 w-10" src="@/assets/images/justice_scale.png">
          </div>
          <div class="text-nowrap">
            <h1 class="text-main-color font-semibold text-3xl sm:text-4xl text-center">Wakili Ai</h1>
            <p class="text-sm">Here to assist with legal questions</p>
          </div>
        </div>


      </div>

      <div class="relative w-full h-full px-4">
        <Transition mode="out-in" name="slide-in">

            <template v-if="!appIsFetching">

              <div>
                <ChatbotBubble
                  :key="1"
                  :chatbot-name="'Wakili Ai'"
                  :chatbot-message="'Hello there! How can I help you today?'"
                  :is-typing="false"
                  :is-copyable="false"
                  :has-error="false"
                  :placeholder="placeholder"
                />

                <div class="relative" v-if="!isPlanExpired">
                  <div class="absolute z-10 h-64  w-full flex justify-center items-center ">
                    <div class="fixed">
                      <img src="@/assets/images/justice_scale.png" class="h-20 w-20 opacity-35">
                    </div>
                  </div>
                  <ul>
                    <template v-for="(conv, index) in conversation" :key="index" >
                      <UserBubble
                        v-if="
                                conv.isUser &&
                                conv.message &&
                                conv.message.length > 0 &&
                                !conv.isTyping &&
                                chatbotStore.conversationId

                                "
                        :picture?="authStore.getUserInfo()?.picture"
                        :darkBgColor="darkBgColor"
                        :userInput = conv.message
                        :isTyping="conv.isTyping"
                      />
                      <ChatbotBubble
                        v-else-if="!conv.isUser && chatbotStore.conversationId"
                        :chatbot-message="marked.parse(conv.message)"
                        :is-typing="conv.isTyping"
                        :chatbot-name="'Wakili Ai'"
                      />
                    </template>
                  </ul>
                </div>
              </div>
            </template>
<!--            <template v-else>-->
<!--              <LoadingPage />-->
<!--            </template>-->
        </Transition>
      </div>

      <div class="absolute bottom-0 left-0 right-0 pb-6 ">
            <div class="grid grid-cols">
              <div class="w-11/12 lg:w-10/12 lg:ps-80 lg:ms-10 ps-12">
                <UserInput
                  class="fixed bg-secondary-color z-10 mb-14 lg:mb-0"
                  :disabled="false"
                  :isGenerating="isGeneratingResponses"
                  :placeholder="placeholder"
                  @user-input="handleUserInput"/>
              </div>
            </div>
      </div>
      <p>Here to assist with legal questions</p>

    </div>

<!--    </div>-->
    <teleport to="body">
      <DialogModal
        :is-open="!chatbotStore.isSubscription"
        @closeModal="chatbotStore.setSubscription(true)"
      >
        <template #title>
          <div class="flex justify-end">
            <button class="btn btn-sm btn-circle" @click="chatbotStore.setSubscription(true)"><span class="material-icons-outlined">close</span></button>
          </div>
          <div>
            <span class="font-bold text-xl">Limited Credits(2 free credits a day)</span>
          </div>
        </template>

    </div>


    <div>
      <UserInput />

    </div>

  </div>

</template>