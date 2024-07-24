import { createRouter, createWebHistory } from 'vue-router'



  const routes: any =[
    {
      name: 'auth',
      path: '/auth',
      component: () => import('../views/auth/UsersPage.vue'),
      children: [
        {
          name: 'user-login',
          path: 'user-login',
          component: () => import('../views/auth/UserLoginPage.vue')
        },
        {
          name: 'user-signup',
          path: 'user-signup',
          component: () => import('../views/auth/UserSignUpPage.vue')
        },
        {
          name: 'user-forgot-password',
          path: 'user-forgot-password',
          component: () => import('../views/auth/ForgotPassword.vue')
        },
        {
          name: 'user-reset-password',
          path: 'user-reset-password',
          component: () => import('../views/auth/ResetPassword.vue')
        }
      ]
    },
    {
      name: 'chat-page',
      path: '/chat',
      component: () => import('../views/chatbot/ChatPage.vue'),
      children: [
        {
          name: 'new-chat',
          path: '/new-chat',
          component: () => import('../views/chatbot/NewChatPage.vue')
        }
      ]
    },
    {
      path: '/:notFound(.*)*',
      name: 'not-found',
      component: () => import('../views/errors/NotFoundPage.vue')
    }

  ] as any []
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
} as any)

router.beforeEach((to, _from, next)=>{

})


export default router
