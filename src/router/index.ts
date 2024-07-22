import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'chat-page',
      path: '/chat',
      component: () => import('../views/chatbot/ChatPage.vue')
    }

  ]
})

export default router
