
<script setup lang="ts">
import ChatbotBubble from '@/components/Bubble/ChatbotBubble.vue'
import UserBubble from '@/components/Bubble/UserBubble.vue'
import { io } from 'socket.io-client'
import UserInput from '@/components/UserInput.vue'


const socket = io()

socket.on('connect', ()=>{
  console.log('connected')
})

socket.on('disconnect', ()=>{
  console.log('disconnected')
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

</script>

<template>
  <div class="w-full flex flex-col">
    <div class="text-center">
      <div class="sticky top-0 z-10 flex justify-center items-end ">
        <img class="h-10 w-10" src="@/assets/images/justice_scale.png">
        <h1 class="text-main-color font-semibold text-3xl sm:text-4xl ps-4">Wakiki Ai</h1>
      </div>
      <p>Here to assist with legal questions</p>

    </div>

    <div class="h-screen items-center justify-center">
      <ChatbotBubble />
      <UserBubble />

    </div>


    <div>
      <UserInput />

    </div>

  </div>

</template>