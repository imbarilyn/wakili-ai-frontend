
<script setup lang="ts">
import ChatbotBubble from '@/components/Bubble/ChatbotBubble.vue'
import UserBubble from '@/components/Bubble/UserBubble.vue'
import { io } from 'socket.io-client'
import UserInput from '@/components/UserInput.vue'
import { colorGenerator } from '@/composables/colorgenerator'
import { onMounted, ref, watch } from 'vue'
import { useAuthStore, useNotificationsStore, useChatbotStore} from '@/stores'
import hljs from 'highlight.js'
import { useRoute, useRouter } from 'vue-router'
import  { marked, type RendererObject, type Tokens } from 'marked'
import _ from 'lodash'
import DialogModal from '@/components/toasts/DialogModal.vue'
import moment from 'moment'
import LoadingPage from '@/components/LoadingPage.vue'

export interface Conversation {
  message: string
  isUser: boolean
  isTyping?: boolean
  hasError?: boolean
  uniqueId: string | number
  audioData?:{
    audio: Blob,
    audioUrl: string
  }
}

interface Subscription {
  message:string
  sessionId: string
  conversationId:string
  createdAt: 'string'
}

const route = useRouter()


onMounted(()=>{
  chatbotStore.convoId()
  setColor()
  // console.log(authStore.getToken)
  //   console.log(authStore.getUserInfo()?.picture)
return chatbotStore.isSubscription
})
const SOCKETS_URL = import.meta.env.VITE_APP_SOCKET_IO_URL as string
// const socket = io('ws://192.168.100.12:5001')
const socket = io(`${SOCKETS_URL}`)
const authStore = useAuthStore()
const chatbotStore = useChatbotStore()
const notification = useNotificationsStore()
const appIsFetching = ref(false)
const conversation =ref<Conversation []>([])
const placeholder = ref<string>('How can Wakili help you today?')
const isGeneratingResponses = ref(false)
const chatTextColor = ref('text-white')
const mesRes = ref('')
const conversationContainerRef = ref<HTMLDivElement | null>(null)


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

// const renderer: any = {
//   link(href: string, title: string, text: string) {
//     return `<a target="_blank" class="link link-primary" href="${href}" title="${title}">${text}</a>`
//   },
//   table(header: string, body: string) {
//     return `
//    <div class="bg-white p-2.5 rounded-xl shadow-lg shadow-slate-300/10 my-3">
//     <div class="overflow-x-auto py-4">
//         <table class="table table-zebra border">
//         <thead>
//             ${header}
//         </thead>
//         <tbody>
//             ${body}
//         </tbody>
//     </table>
//     </div>
//     </div>
//   `
//   },
//   tablerow(content: string) {
//     return `
//     <tr class="hover">${content}</tr>
//   `
//   },
//   tablecell(content: string) {
//     return `
//     <td>${content}</td>
//   `
//   },
//   code(code: string, language: string) {
//     // return `
//     //   <pre><div class="mockup-code my-3"><div class="px-4"><code>${code}</code></div></div></pre>
//     // `;
//
//     if (language) {
//       const ignoreIllegals = true
//       return `
//   <div class="p-2 flex w-full">
//        <pre class="w-full"><div class="mockup-code bg-neutral-800 my-3 relative shadow-xl w-full overflow-auto"><div class="px-4 flex-1 overflow-auto h-full w-full"><code class="language-${language}">${
//         hljs.highlight(code, {
//           language,
//           ignoreIllegals
//         }).value
//       }</code></div></div></pre>
//   </div>
//     `
//     } else {
//       return `
//   <div class="p-3 flex w-full">
//     <pre class="w-full"><div class="mockup-code bg-neutral-800 my-2.5 w-full overflow-auto"><div class="px-4 flex-1 overflow-auto h-full w-full"><code>${code}</code></div></div></pre>
//   </div>
//   `
//     }
//   },
//   list(body: string, ordered: boolean, start: number | undefined) {
//     console.log(body)
//     if (ordered) {
//       if (start) {
//         return `
//          <div class="my-2 py-2 mx-3">
//             <ol start="${start}" class="list-decimal list-outside mx-5 space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ol>
//          </div>
//       `
//       }
//       return `
//          <div class="my-2 py-2 mx-3">
//             <ol class="list-decimal mx-5 list-outside space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ol>
//          </div>
//     `
//     } else {
//       return `
//          <div class="my-2 py-2 mx-3">
//             <ul class="list-disc list-outside mx-5 space-y-0.5 md:space-y-1 lg:space-y-1.5">${body}</ul>
//          </div>
//     `
//     }
//   },
//   listitem(text: string) {
//     console.log(text)
//     return `
//     <li class="${chatTextColor.value}">${marked.parseInline(text)}</li>
//   `
//   },
//   paragraph(text: string) {
//     return `
//     <p class="${chatTextColor.value} leading-relaxed">${text}</p>
//   `
//   },
//   heading(text: string, level: string) {
//     return `
//     <h${level} class="text-2xl font-poppins-bold text-tertiary-color dark:text-neutral-50">${text}</h${level}>
//   `
//   },
//   hr() {
//     return `
//     <hr class="my-4 border-neutral-200 dark:border-neutral-700"/>
//   `
//   },
//   blockquote(quote: string) {
//     return `
//     <blockquote class="my-4 border-l-4 border-neutral-200 dark:border-neutral-700 pl-4">${quote}</blockquote>
//   `
//   },
//   image(href: string, title: string, text: string) {
//     return `
//     <img src="${href}" alt="${text}" title="${title}" class="w-full"/>
//   `
//   },
//   strong(text: string) {
//     return `
//     <strong class="font-poppins-semi-bold my-1 text-base">${text}</strong>
//   `
//   },
//   codespan(code: string) {
//     // return `
//     //   <pre><div class="mockup-code"><div class="px-4"><code>${code}</code></div></div></pre>
//     // `;
//
//     // we'll rather render this like in chatGPT
//     return `
//     <code class="font-poppins-semi-bold my-1">&acute;${code}&acute;</code>
//   `
//   },
//   // descriptionList(body: string) {
//   //   return `
//   //   <dl>${body}</dl>
//   // `
//   // },
//   // description(dt: string, dd: string) {
//   //   return `
//   //   <dt>${dt}</dt>
//   //   <dd>${dd}</dd>
//   // `
//   // }
// }
//
// create a custom description list renderer
const renderer: RendererObject = {
  link({href, title, text}: Tokens.Link) {
    return `<a target="_blank" class="link link-primary" href="${href}" title="${title}">${text}</a>`
  },
  table({header: hd, rows, align}: Tokens.Table) {
    const header = hd.map(({text, header}) => {
      return `
      <th class="text-base-content text-sm md:text-md">${marked.parseInline(text)}</th>
    `
    }).join('\n')

    const body = rows.map((row) => {
      return `
      <tr>${row.map(({text, header}) => {
        return `
        <td class="text-base-content text-sm md:text-md">${marked.parseInline(text)}</td>
      `
      }).join('\n')}</tr>
    `
    }).join('\n')

    return `
   <div class="bg-base-100 p-2.5 rounded-xl shadow-lg shadow-base-200 my-5">
    <div class="overflow-x-auto py-4">
        <table class="table table-sm md:text-md table-zebra border">
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
  // tablerow(content: string) {
  //   return `
  //   <tr class="hover">${content}</tr>
  // `
  // },
  // tablecell(content: string) {
  //   return `
  //   <td>${content}</td>
  // `
  // },
  code({text: code, lang:language, codeBlockStyle, escaped}: Tokens.Code) {
    // return `
    //   <pre><div class="mockup-code my-3"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    if (language) {
      const ignoreIllegals = true
      return `
  <div class="p-2 flex w-full">
       <pre class="w-full"><div class="mockup-code bg-neutral-800 my-3 relative shadow-xl w-full overflow-auto"><div class="px-4 flex-1 overflow-auto h-full w-full"><code class="language-${language}">${hljs.highlight(code, {
        language,
        ignoreIllegals
      }).value}</code></div></div></pre>
  </div>
    `
    } else {
      return `
  <div class="p-3 flex w-full">
    <div class="mockup-code bg-base-100 my-2.5 w-full overflow-auto max-w-full"><pre class="w-full text-sm md:text-md text-base-content"><div class="px-4 flex-1 overflow-auto h-full w-full"><code>${code}</code></div></pre></div>
  </div>
  `
    }
  },
  list({ordered, start, loose, items}: Tokens.List) {
    console.log('items is -> ', items)
    const body = items.map(({task, checked, loose, text}) => {
      return `
      <li class="text-base-accent text-sm md:text-md">${marked.parseInline(text)}</li>
      `;
    }).join('\n')

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
  listitem({task, checked, loose, text}: Tokens.ListItem) {
    return `
    <li class="text-base-accent text-sm lg:text-lg md:text-md">${marked.parseInline(text)}</li>
  `
  },
  paragraph({text, pre}: Tokens.Paragraph) {
    return `
    <p class="text-base-accent leading-relaxed text-sm md:text-md">${marked.parseInline(text)}</p>
  `
  },
  heading({text, depth: level}: Tokens.Heading) {
    let cssClassLevel = '!text-emerald-300 text-lg my-2';

    switch (level) {
      case 1:
        cssClassLevel = '!text-emerald-300 text-xl md:text-2xl my-2'
        break
      case 2:
        cssClassLevel = '!text-emerald-300  text-lg md:text-xl my-1.5 '
        break
      case 3:
        cssClassLevel = '!text-emerald-300  text-sm md:text-lg my-1.5'
        break
      case 4:
        cssClassLevel = '!text-emerald-300  text-xs md:text-base my-1'
        break
      case 5:
        cssClassLevel = '!text-emerald-300  text-xxs md:text-sm my-1'
        break
      case 6:
        cssClassLevel = ' !text-emerald-300  text-xxxs md:text-xs my-0.5'
        break
    }

    return `
    <h${level} class="${cssClassLevel} font-semibold text-base-accent text-emerald-300">${marked.parseInline(text)}</h${level}>
  `
  },
  hr() {
    return `
    <hr class="my-4 border-neutral-200"/>
  `
  },
  blockquote({text: quote}: Tokens.Blockquote) {
    return `
    <blockquote class="my-4 border-l-4 border-neutral-200 pl-4">${quote}</blockquote>
  `
  },
  image({href, title, text}: Tokens.Image) {
    return `
    <img src="${href}" alt="${text}" title="${title}" class="w-full"/>
  `
  },
  strong({text}: Tokens.Strong) {
    return `
    <strong class="!text-emerald-300 font-semi-bold  my-2.5 text-sm md:text-lg">${text}</strong>
  `
  },
  codespan({text: code}: Tokens.Codespan) {
    // return `
    //   <pre><div class="mockup-code"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    // we'll rather render this like in chatGPT
    return `
    <code class="font-semi-bold my-1">&acute;${code}&acute;</code>
  `
  },
  em({text}: Tokens.Em) {

    return `
    <em class="font-light my-1 text-sm md:text-md">${text}</em>
  `
  },
  del({text}: Tokens.Del) {
    return `
    <del class="font-poppins-light my-1 text-sm md:text-md">${text}</del>
  `
  },
  text({text, type}: Tokens.Text | Tokens.Escape | Tokens.Tag) {
    if (type === 'text') {
      return `
      <span class="text-md md:text-lg">${text}</span>
    `
    } else if (type === 'escape') {
      return `
      <span class="text-sm md:text-md">${text}</span>
    `
    } else {
      return `
      <span class="text-sm md:text-md">${text}</span>
    `
    }
  }
}



marked.use({
  renderer,
  breaks: true,
  gfm: true,
  useNewRenderer: true
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
  scrollBottom()
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
    scrollBottom()
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
    chatbotStore.setIsResponseGenerating(true)
    console.log(conversation.value)

    // if the end of stream is reached, stop typing and clear the message container
    if(value.includes('~~~ENDOFSTREAM~~~')){
      console.log('end of stream')
      isGeneratingResponses.value = false
      currentAiMessageObj.isTyping = false
      chatbotStore.setIsResponseGenerating(false)
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

const currentScrollPosition = ref(0)
const isBottom = ref(false)
const isScrolling = ref(false)
const conversationContainerHeight = ref(0)
const isScrollable = ref(false)

const scrollBottom =()=>{
  // if currentPosition is greater than 0 means the element is scrollable
  // console.log('currentScrollPosition', currentScrollPosition)
  if(currentScrollPosition.value > 0){
    isScrollable.value = true
  }
  // we want to scroll into the element #user-input-holder to bring it to view
  const conversationCon = document.querySelector('#user-input-placeholder')
  conversationCon?.scrollIntoView({
    behavior:'smooth',
    block: 'end',
    inline: 'nearest'
  })
  console.log('scrolling bottom')
}


document .addEventListener('scroll', ()=>{
  console.log('adding event listener for scrolling')
  //getting the height of the <html> tag
  currentScrollPosition.value = document.documentElement.scrollTop
  // we  know the user is at tbe bottom if scrollTop of the div container is greater or equal to the scrollHeight - clientHeight
  if(conversationContainerRef.value){
    isBottom.value = conversationContainerRef.value?.scrollTop >= conversationContainerRef.value?.scrollHeight - conversationContainerRef.value?.clientHeight
    // set isScrolling to true if the user is scrolling and is not at the bottom and the element is at the top
    isScrolling.value = currentScrollPosition.value > 0 && !isBottom.value
  }
})

// check if the conversation array has something and scrolling to the bottom
watch(conversation.value, ()=>{
  if(conversationContainerRef.value){
    conversationContainerHeight.value = conversationContainerRef.value.clientHeight || 0
  }
  console.log('conversation array changed')
  scrollBottom()
})

setTimeout(()=>{
  scrollBottom()
}, 1000)





</script>
<template>
  <div class="relative min-h-full  w-full flex justify-center flex-1 lg:max-w-screen-xl lg:mx-auto"
  ref="conversationContainerRef">
    <div class="w-full min-h-screen   lg:py-14 flex flex-col">
      <div class="top-0 sticky z-40 bg-white pt-6 ">
        <div class="lg:hidden block z-40 sm:ps-4 pt-3">
          <button class="btn btn-sm" @click="expandSidebar">
            <span class="material-icons-outlined">menu</span>
          </button>
        </div>
        <div class="">
          <div class="flex justify-center -z-10 w-full">
            <div class="flex justify-center backdrop-blur">
              <img class="w-10  h-10" src="../../../public/images/justice_scale.png">
            </div>
            <div class="text-nowrap">
              <h1 class="text-main-color font-semibold text-3xl sm:text-4xl text-center">Wakili Ai</h1>
              <p class="text-sm">Here to assist with legal questions</p>
            </div>
          </div>
        </div>
      </div>

      <div class="relative w-full h-full  mx-auto md:ps-8 lg:ps-10">
        <Transition mode="out-in" name="slide-in">
            <template v-if="!appIsFetching">
              <div class="px-2">
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
                  <div class="absolute h-64  w-full flex justify-center items-center ">
                    <div class="fixed">
                      <img src="../../../public/images/justice_scale.png" class="h-20 w-20 opacity-10">
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
                        :picture="authStore.getUserInfo()?.picture"
                        :darkBgColor="darkBgColor"
                        :userInput = conv.message
                        :isTyping="conv.isTyping"
                      />
                      <ChatbotBubble
                        v-else-if="!conv.isUser && chatbotStore.conversationId"
                        :chatbot-message ="marked.parse(conv.message) as string"
                        :is-typing="conv.isTyping"
                        :chatbot-name="'Wakili Ai'"
                      />
                    </template>
                  </ul>
                </div>
              </div>
            </template>
        </Transition>
      </div>
<!--      <div class="mb-14"></div>-->
      <div v-if="isBottom" class="py-12 bg-gradient-to-t from-main-color-light-color block"></div>
      <div class="fixed lg:ms-64 bottom-0 left-0  right-0 lg:pb-6 bg-white">
            <div class="w-full grid grid-cols">
              <div
                class=" w-11/12 lg:10/12 mx-auto">
                <UserInput
                  class="bg-secondary-color z-10 mb-6"
                  :disabled="false"
                  :isGenerating="isGeneratingResponses"
                  :placeholder="placeholder"
                  @user-input="handleUserInput"/>
              </div>
            </div>
      </div>
      <div id="user-input-placeholder"></div>
    </div>
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

        <template #body>
          <div>
            <p class="font-normal">Upgrade to keep using Wakili AI</p>
          </div>
        </template>

        <template #footer>
          <div>
            <button class="btn bg-main-color text-white" @click="subscribeToPlan">
              <span v-if="!subscriptionLoading">Subscribe</span>
              <span class="loading loading-spinner loading-sm" v-else></span>
            </button>
          </div>
        </template>
      </DialogModal>
    </teleport>
  </div>
</template>