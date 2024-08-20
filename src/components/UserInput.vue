<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue'
import DOMPurify from 'dompurify'


export interface UserInputProps {
  placeholder: string
  disabled: boolean
  isGenerating: boolean

}

const micListening = ref(false)
const props = defineProps<UserInputProps>()
const emits = defineEmits<{
  (event:'userInput', value: string, formatted: string
  ): void
}>()

const formattedUserInput = computed(()=>{
  let purifiedBreak = userInput.value.replace(/\n/g, '<br>')
  purifiedBreak = DOMPurify.sanitize(purifiedBreak, {
    USE_PROFILES: {html: true}, ALLOWED_TAGS: ['br']
  })
  return purifiedBreak
})

const promptPlaceholderText = computed(()=>{
  if(micListening.value){
    return "Listening..."
  }
  else{
    return props.placeholder
  }
})

const hasInput = ref(false)
const userInput = ref<string>('')
const textAreaRef = ref<HTMLTextAreaElement | null>(null)
const maxHeight = ref(200)
const inputHasFocus = ref<boolean>(false)
// compute for the user input
const hasText = computed(()=>{
  return userInput.value.length > 0 && userInput.value.trim().length > 0
})


// adjust the textarea height
const adjustTextAreaHeight = (element: HTMLTextAreaElement) => {
  if(element.scrollHeight > element.clientHeight){
    // element.style.paddingBottom = '44px'
  }
  element.style.height = 'auto'
  // element.style.height =Math.min(element.scrollHeight, maxHeight.value) + 'px
  element.style.height = `${element.scrollHeight}px`
  // console.log(element.scrollHeight)
  // console.log(element.style.height)
}
// check if the user needs more height for more input
watch(userInput, ()=>{
  nextTick(()=>{
    // console.log(textAreaRef.value)
    adjustTextAreaHeight(textAreaRef.value as HTMLTextAreaElement)
  })
})

// add focus to the textarea if textarea is on focus
const addFocus=()=>{
  if(inputHasFocus.value || props.disabled){
    return
  }
  else{
    inputHasFocus.value = true
    textAreaRef.value?.focus()
  }
}

// handle user input
const onTextAreaKeydown =(e: KeyboardEvent)=>{
//   if user presses shift and enter key at ago
  if(e.key === 'Enter' && e.shiftKey){
  // Check if user input is empty
    if(!hasText.value){
      e.preventDefault()
      return
    }
    // if the chatbot is still generating response
    else{
      if(props.isGenerating){
      //   if response is generating do nothing at all
        return
      }
      else{
      //   if response is not generating, emit the user input
        emits('userInput', userInput.value, formattedUserInput.value)
        userInput.value = ''
        adjustTextAreaHeight(textAreaRef.value as HTMLTextAreaElement)
      }
    }
  }

//   if user enter key pressed and input available
  else if(e.key === 'Enter' && hasText.value) {
//       check if chatbot is generating response
    if (props.isGenerating) {
      e.preventDefault()
      return
    } else{
      emits('userInput', userInput.value, formattedUserInput.value)
      userInput.value = ''
      adjustTextAreaHeight(textAreaRef.value as HTMLTextAreaElement)
    }
  }
  // if user presses backspace key and input is empty
  else if(e.key === 'Backspace' && userInput.value.length === 0){
    e.preventDefault()
  return
  }
}

const sendRequest = ()=>{
  if(!hasText.value || props.isGenerating){
    return
  }
  else{
    emits('userInput', userInput.value, formattedUserInput.value)
    userInput.value = ''
    adjustTextAreaHeight(textAreaRef.value as HTMLTextAreaElement)
  }
}


</script>



<template>
  <div
    @click.stop="addFocus"
    :class="[inputHasFocus ? 'ring-2' : '']"
    class="relative  border-2 border-main-color shadow-lg shadow-slate-300/10 rounded-2xl flex flex-row">

    <div class="w-full flex">
        <textarea
          class="px-4 pt-3 overflow-hidden w-full grow bg-transparent border-none focus:outline-none resize-none"
          placeholder="How can Wakili help you today?"
          v-model="userInput"
          ref="textAreaRef"
          @blur="inputHasFocus = false"
          @focus="inputHasFocus = true"
          @keydown="onTextAreaKeydown"
        >
    </textarea>
    </div>

    <div class="absolute bottom-0 right-2 pb-2 lg:pb-4">
      <button class="btn btn-sm btn-ghost btn-circle me-2">
        <span class="material-icons-outlined !text-xl">mic</span>
      </button>
      <button
        class="btn btn-sm btn-ghost normal-case btn-circle"
        :disabled="props.isGenerating || !hasText"
        @click.prevent="sendRequest"
      >
        <span class="material-icons-outlined !text-xl" :class="[hasText && !props.isGenerating? 'text-main-color': '']">send</span>
      </button>
    </div>
  </div>
</template>