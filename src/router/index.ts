import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'




  const routes: any =[
    {
      name: 'home',
      path: '/',
      redirect: '/new-chat'
    },
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
      name: 'chat-subscription',
      path: '/chatId/chat-subscription',
      component: ()=>import('../views/chatbot/SubscriptionPage.vue'),
    },
    {
      name: 'chat-page',
      path: '/new-page',
      component: () => import('../views/chatbot/ChatPage.vue'),
      children: [
        {
          name: 'new-chat',
          path: '/:chat',
          component: () => import('../views/chatbot/NewChatPage.vue'),
          props: (route: any)=>{
            return{
              chat: route.params.chat
            }
          }
        },
        {
          name: 'chat-history',
          path: '/:chat',
          component: ()=>import('../views/chatbot/ChatHistory.vue'),
          props: (route: any)=>{
            return{
              chat: route.params.chat
            }
          }

        },
      ],
      beforeEach(to: any, from: any, next: any){
        const authStore = useAuthStore()
        if(authStore.getUserInfo()){
          console.log(to.name)
          next()
        }
        else{
          next({name: 'user-login'})
        }
      }

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
  const authStore = useAuthStore()
  const excludedRoutes = [
    'user-forgot-password',
    'user-reset-password',
    'not-found',
    'new-chat',
    'chat',
    'home',
    'chat-page',
    'sign-up',
    'chat-subscription'
  ]
  const isExcludedRoute = excludedRoutes.includes(to.name as string)
  console.log(authStore.isLoggedIn)
  console.log(to.name)
  if(!authStore.userIsLoggedIn){
    console.log(isExcludedRoute)
    if(isExcludedRoute){
      console.log(isExcludedRoute)
      console.log("you are not logged in")
      console.log('going to', to.name)
      next({name: 'user-login'})
    }
    else{
      console.log(to.name)
      next()
    }
  }
  console.log(to.name)
  next()
})


export default router
