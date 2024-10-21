<script setup lang="ts">

import UserBubble from '@/components/Bubble/UserBubble.vue'
import ChatbotBubble from '@/components/Bubble/ChatbotBubble.vue'
import { computed, nextTick, onMounted, ref } from 'vue'
import { useChatbotStore, useNotificationsStore } from '@/stores'
import { marked, type RendererObject, type Tokens } from 'marked'
import hljs from 'highlight.js'
import { useRouter } from 'vue-router'

interface ShareChat {
  shareId: string
}

const notificationStore = useNotificationsStore()

interface Conversation {
  content: string
  role: string
}

interface SharedConversation {
  conversations: Conversation[]
  lastChatDate: string
  title: string
}

const sharedConversationArray = ref<SharedConversation>()
const props = defineProps<ShareChat>()
const isChatShare = ref(false)
const router = useRouter()


const chatbotStore = useChatbotStore()
onMounted(() => {
  nextTick(() => {
    chatbotStore.loadShareChat(props.shareId)
      .then((response) => {
        if (response.result === 'ok') {
          sharedConversationArray.value = { ...response.data }
        } else {
          notificationStore.addNotification('Failed to load chat xxx', 'error')
          setTimeout(()=>{
            router.push({name: 'not-found'})

          }, 1000)
        }
      })
      .catch((error) => {
        console.error(error)
        notificationStore.addNotification('Failed to load chat', 'error')
        setTimeout(()=>{
          router.push({name: 'not-found'})
        }, 1000)
      })
      .finally(() => {
        isChatShare.value = true
        console.log(sharedConversationArray.value)
      })
  })
})

const formattedDate = computed(() => {
  const date = new Date(sharedConversationArray.value?.lastChatDate as string)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  })
})

// create a custom description list renderer
const renderer: RendererObject = {
  link({ href, title, text }: Tokens.Link) {
    return `<a target="_blank" class="link link-primary" href="${href}" title="${title}">${text}</a>`
  },
  table({ header: hd, rows, align }: Tokens.Table) {
    const header = hd.map(({ text, header }) => {
      return `
      <th class="text-base-content text-sm md:text-md">${marked.parseInline(text)}</th>
    `
    }).join('\n')

    const body = rows.map((row) => {
      return `
      <tr>${row.map(({ text, header }) => {
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
  code({ text: code, lang: language, codeBlockStyle, escaped }: Tokens.Code) {
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
  list({ ordered, start, loose, items }: Tokens.List) {
    console.log('items is -> ', items)
    const body = items.map(({ task, checked, loose, text }) => {
      return `
      <li class="text-base-accent text-sm md:text-md">${marked.parseInline(text)}</li>
      `
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
  listitem({ task, checked, loose, text }: Tokens.ListItem) {
    return `
    <li class="text-base-accent text-sm lg:text-lg md:text-md">${marked.parseInline(text)}</li>
  `
  },
  paragraph({ text, pre }: Tokens.Paragraph) {
    return `
    <p class="text-base-accent leading-relaxed text-sm md:text-md">${marked.parseInline(text)}</p>
  `
  },
  heading({ text, depth: level }: Tokens.Heading) {
    let cssClassLevel = '!text-emerald-300 text-lg my-2'

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
  blockquote({ text: quote }: Tokens.Blockquote) {
    return `
    <blockquote class="my-4 border-l-4 border-neutral-200 pl-4">${quote}</blockquote>
  `
  },
  image({ href, title, text }: Tokens.Image) {
    return `
    <img src="${href}" alt="${text}" title="${title}" class="w-full"/>
  `
  },
  strong({ text }: Tokens.Strong) {
    return `
    <strong class="!text-emerald-300 font-semi-bold  my-2.5 text-sm md:text-lg">${text}</strong>
  `
  },
  codespan({ text: code }: Tokens.Codespan) {
    // return `
    //   <pre><div class="mockup-code"><div class="px-4"><code>${code}</code></div></div></pre>
    // `;

    // we'll rather render this like in chatGPT
    return `
    <code class="font-semi-bold my-1">&acute;${code}&acute;</code>
  `
  },
  em({ text }: Tokens.Em) {

    return `
    <em class="font-light my-1 text-sm md:text-md">${text}</em>
  `
  },
  del({ text }: Tokens.Del) {
    return `
    <del class="font-poppins-light my-1 text-sm md:text-md">${text}</del>
  `
  },
  text({ text, type }: Tokens.Text | Tokens.Escape | Tokens.Tag) {
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
</script>

<template>
  <div class="min-h-screen w-full overflow-hidden max-w-4xl mx-auto">
    <div v-if="isChatShare && sharedConversationArray" class="space-y-4 relative">

      <div class="flex flex-col w-full items-center py-6 space-y-2 bg-red-300 sticky top-0  z-40">
        <div class="flex justify-center items-end gap-2 sticky top-0">
          <img src="../../../public/images/justice_scale.png" class="w-12">
          <span class="text-xl text-main-color">Wakili Ai</span>
        </div>
        <div>
          <h1 class="md:!text-4xl !text-2xl font-semibold text-main-color ">{{ sharedConversationArray.title }}</h1>
          <span class="text-main-color">Chat published on:</span>
          <p class="md:!text-xl text-lg text-main-color inline ps-2">{{ formattedDate }}</p>
        </div>
      </div>
      <div
        class="flex justify-center bg-main-color md:mx-auto md:px-6 md:w-fit md:py-6 mx-4 px-2 py-2 rounded-lg gap-2">
        <span class="material-icons-outlined text-white">info</span>
        <p class="text-white">Please double check the responses to be sure they are accurate for Wakili Ai can make
          slight mistakes</p>

      </div>

      <!--    Body of conversation-->
      <ul class="pt-6 px-2">
        <template v-for="(chat, index) in sharedConversationArray.conversations" :key="index">
          <UserBubble v-if="chat.role==='user'"
                      :user-input="chat.content"
                      :is-typing="false"
                      :is-copyable="true"

          />
          <ChatbotBubble v-else
                         :chatbot-message="marked.parse(chat.content) as string"
                         :is-typing="false"
                         :is-copyable="false"
                         :original-message="chat.content"

          />
        </template>
      </ul>
    </div>
  </div>
</template>

<style scoped>

</style>