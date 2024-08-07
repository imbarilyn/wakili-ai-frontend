<script lang="ts" setup>
import { useField } from 'vee-validate'
import { useRoute, useRouter } from 'vue-router'
import { reactive, ref, watch } from 'vue'
import { useAuthStore, type LoginPayload, useNotificationsStore } from '@/stores'
import { googleTokenLogin } from 'vue3-google-login'
import { jwtDecode} from 'jwt-decode'
import { set } from '@vueuse/core'

const router = useRouter()


const route = useRoute()
const isLoadingResource = ref(false)
const isLoadingResourceGoogle = ref(false)
const authStore = useAuthStore()
const notification = useNotificationsStore()
const loginData = reactive<LoginPayload>({
  email: '',
  password: '',
})

const emailValidator = (value: string) => {
  if (!value) {
    return 'Email is required'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(value)) {
    return 'Email must be valid'
  }

  if (value.length > 50) {
    return 'Email must be less than 50 characters'
  }

  return true
}

const {
  value: email,
  errorMessage: emailErrorMessage,
  meta: emailMeta
} = useField('email', emailValidator)

watch(
  () => loginData.email,
  (value) => {
    email.value = value
  }
)

const passwordValidator = (value: string) => {
  if (!value) {
    return 'Password is required'
  }

  // if (value.length < 4) {
  //   return 'Password must be at least 4 characters';
  // }

  if (value.length > 50) {
    return 'Password must be less than 50 characters'
  }

  return true
}

const {
  value: password,
  errorMessage: passwordErrorMessage,
  meta: passwordMeta
} = useField('password', passwordValidator)

watch(
  () => loginData.password,
  (value) => {
    password.value = value
  }
)


const onLoginClick = () => {
  if (!emailMeta.valid || !passwordMeta.valid) {
    return
  }

  isLoadingResource.value = true
  authStore
    .loginUser(loginData)
    .then((response) => {
      console.log(response)
      if (response.result === 'ok') {
        isLoadingResource.value = false
        authStore.token = response.token
        const decode: any = jwtDecode(response.token)
        console.log(decode)
        authStore.tokenExpiry = decode.exp.toString()
          authStore.setLoggedIn(true)
        authStore.setUserInfo({
          firstName: decode.first_name,
          lastName: decode.last_name,
          phoneNo: decode.phone_no,
          userId: decode.user_id
        })
        notification.addNotification('Login successful', 'success')
        setTimeout(()=>{
          router.push({ name: 'chat-page'})
        },500)
      }
      else{
        setTimeout(()=>{
          isLoadingResource.value = false
          notification.addNotification('Login failed try again', 'error')
        },500)
      }
    })
    .catch((error) => {
      isLoadingResource.value = false
      notification.addNotification('Login failed try again', 'error')
      console.log(error)
    })
    .finally(() => {
      isLoadingResource.value = false
    })
}
const BASE_URL = import.meta.env.VITE_APP_BASE_URL as string

const loginWithGoogle  = ()=>{
  isLoadingResourceGoogle.value = true
  googleTokenLogin()
    .then((googleResponse)=>{
      console.log('Handle the response', googleResponse)

      fetch(`${BASE_URL}/auth/login/google-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode:'cors',
        body: JSON.stringify({
          access_token: googleResponse.access_token
        })
      })
        .then((resp )=>{
          const response = resp.json()
          response.then((data)=>{
            console.log('data', data)
            if(data.result === 'ok'){
              authStore.token = data.token
              authStore.tokenExpiry = googleResponse.expires_in
              isLoadingResourceGoogle.value = false
              setTimeout(()=>{
                notification.addNotification('Login successful', 'success')
                router.push({name: 'chat-page'})
              }, 1000)
            }
            else{
              console.log('invalid token')
              isLoadingResourceGoogle.value = false
              setTimeout(()=>{
                notification.addNotification('Login failed try again', 'error')
              },500)
              console.log('invalid token')
            }
          })
          // console.log('Handle the response', response)
        })
        .catch((error)=>{
          setTimeout(()=>{
            isLoadingResourceGoogle.value = false
            notification.addNotification('Login failed try again', 'error')
          }, 500)

          console.log('error', error)
        })

    //   get User info
    //   return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    //     method: 'POST',
    //     headers: {
    //       Authorization: `Bearer ${googleResponse.access_token}`
    //     }
    //   })
    //     .then((response)=>{
    //       console.log('Handle the response', response)
    //       return response.json()
    //     })
    //     .then((userInfo)=>{
    //       console.log('User info', userInfo)
    //     })
    })

}
</script>

<template>
  <main class="w-full mx-auto p-6 flex items-center justify-center h-screen">
    <div
      class="w-full md:w-6/12 lg:w-5/12 xl:w-4/12 px-4 md:px-2 lg:px-0 mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="p-4 sm:p-7">
        <div class="text-center">
          <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Already have an account</h1>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Login in here
                        <router-link
                          class="text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                          :to="`/auth/user-signup`"
                        >
                          Create account
                        </router-link>
          </p>
        </div>

        <div class="mt-5">
          <!-- Form -->
          <form class="my-4" @submit.prevent="onLoginClick">
            <div class="grid gap-y-4">
              <div class="flex flex-col space-y-1">
                <div class="flex justify-between items-center">
                  <label class="label font-semibold text-sm" for="email">Email address </label>
                  <!--                  <router-link-->
                  <!--                      class="text-sm text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"-->
                  <!--                      to="forgot-password">Forgot password?-->
                  <!--                  </router-link>-->
                </div>
                <input
                  id="email"
                  v-model="loginData.email"
                  :class="{
                    'input-error': emailMeta.validated && !emailMeta.valid,
                    'input-primary': emailMeta.validated && emailMeta.valid
                  }"
                  class="input input-primary input-bordered w-full text-sm"
                  placeholder="John Doe"
                  required
                  type="email"
                />
                <small
                  v-if="emailMeta.validated && !emailMeta.valid"
                  class="text-sm text-rose-500"
                >
                  {{ emailErrorMessage }}
                </small>
              </div>

              <div class="flex flex-col space-y-1">
                <label class="label font-semibold text-sm" for="password">Password</label>
                <input
                  id="password"
                  v-model="loginData.password"
                  :class="{
                    'input-error': passwordMeta.validated && !passwordMeta.valid,
                    'input-primary': passwordMeta.validated && passwordMeta.valid
                  }"
                  class="input input-primary input-bordered w-full text-sm"
                  placeholder="Phone Number"
                  required
                  type="password"
                />
                <small
                  v-if="passwordMeta.validated && !passwordMeta.valid"
                  class="text-sm text-rose-500"
                >
                  {{ passwordErrorMessage }}
                </small>
              </div>

              <div class="flex flex-col space-y-1 my-1">
                <button
                  :disabled="isLoadingResource"
                  class="btn btn-primary btn-sm md:btn-md normal-case text-xs md:text-sm w-full"
                  type="submit"
                  @click="onLoginClick"
                >
                  <span
                    v-if="isLoadingResource"
                    class="loading loading-md loading-spinner text-neutral-400"
                  ></span>
                  <span>Get Started</span>
                </button>
                <button
                  :disabled="isLoadingResourceGoogle"
                  class="btn btn-primary btn-sm md:btn-md normal-case text-xs md:text-sm w-full"
                  @click="loginWithGoogle"

                >
                  <span
                    v-if="isLoadingResourceGoogle"
                    class="loading loading-md loading-spinner text-neutral-400"
                  ></span>
                  Login with Google
                </button>
              </div>
            </div>
          </form>
          <!-- End Form -->
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
