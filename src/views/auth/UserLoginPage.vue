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
        notification.addNotification(response.message ?? 'Login Successful', 'success')
        setTimeout(() => {
          router.push({
            name: 'new-chat',
            params: {chat: 'new-chat'}
          })
        }, 500)
      } else {
        setTimeout(() => {
          isLoadingResource.value = false
          notification.addNotification('Login failed try again', 'error')
        }, 500)
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

const loginWithGoogle = () => {
  isLoadingResourceGoogle.value = true
  googleTokenLogin()
    .then((googleResponse) => {
      console.log('Handle the response', googleResponse)

      return fetch(`${BASE_URL}/auth/login/google-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          access_token: googleResponse.access_token
        })
      })
    })
    .then((resp) => {
      return resp.json()
    })
    .then((data) => {
      console.log('data', data)
      if (data.result === 'ok') {
        return  authStore.setUserData(data)
      } else {
        console.log('invalid token')
        isLoadingResourceGoogle.value = false
        setTimeout(() => {
          notification.addNotification('Login failed try again', 'error')
        }, 500)
        console.log('invalid token')
      }
    })
    .then((data) => {
      if (data && data.result === 'ok') {
        // console.log('token', data.token)
        // authStore.setToken(data.token)
        // authStore.isEverLoggedIn = true
        // authStore.tokenExpiry = googleResponse.expires_in
        isLoadingResourceGoogle.value = false
        setTimeout(() => {
          notification.addNotification('Login successful', 'success')
          router.push({
            name: 'new-chat',
            params: {chat: 'new-chat'}
          })
        }, 1000)
      } else {
        console.log('invalid token')
        isLoadingResourceGoogle.value = false
        setTimeout(() => {
          notification.addNotification('Login failed try again', 'error')
        }, 500)
        console.log('invalid token')
      }
    })
    // console.log('Handle the response', response)

    .catch((error) => {
      setTimeout(() => {
        isLoadingResourceGoogle.value = false
        notification.addNotification('Login failed try again', 'error')
      }, 500)

      console.log('error', error)
    })

  // get User info
  // return fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
  //   method: 'POST',
  //   headers: {
  //     Authorization: `Bearer ${googleResponse.access_token}`
  //   }
  // })
  //   .then((response) => {
  //     console.log('Handle the response', response)
  //     return response.json()
  //
  //   })
  //   .then((userInfo) => {
  //     console.log('User info', userInfo)
  //     authStore.setUserInfo({
  //       firstName: userInfo.given_name,
  //       lastName: userInfo.family_name,
  //       email: userInfo.email,
  //       userId: userInfo.sub,
  //       picture: userInfo.picture
  //     })
  //   })

}
</script>

<template>
  <main class="w-full h-screen grid grid-cols-2 md:items-center">
    <div class="md:col-span-1 col-span-2 flex flex-col justify-center">
      <div class="md:hidden flex items-end gap-2 justify-center w-full text-center bg-white ">
        <img src="../../../public/images/justice_scale.png" class="w-10 inline-block">
        <span class="text-main-color text-2xl">Wakili Ai</span>
      </div>
      <div class="w-6/12 md:w-10/12 lg:11/12  mx-auto">
        <img src="../../../public/images/loginpage.jpg" class="">
      </div>
    </div>
    <div
      class="col-span-2 md:col-span-1 w-full md:w-9/12 items-end "
    >
      <div class="p-4 md:p-7">
        <div class="md:flex hidden items-end gap-2 justify-center w-full text-center pb-2">
          <img src="../../../public/images/justice_scale.png" class="w-10 inline-block">
          <span class="text-main-color !text-2xl font-bold">Wakili Ai</span>
        </div>
        <div class="text-center">
          <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Login</h1>
          <p class="md:mt-2 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
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
          <form class="md:my-4" @submit.prevent="onLoginClick">
            <div class="grid gap-y-4">
              <div class="flex flex-col md:space-y-1">
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
                    'input-bordered border-main-color': emailMeta.validated && emailMeta.valid
                  }"
                  class="input input-bordered border-main-color w-full text-sm"
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

              <div class="flex flex-col md:space-y-1">
                <label class="label font-semibold text-sm" for="password">Password</label>
                <input
                  id="password"
                  v-model="loginData.password"
                  :class="{
                    'input-error': passwordMeta.validated && !passwordMeta.valid,
                    'input-primary': passwordMeta.validated && passwordMeta.valid
                  }"
                  class="input  input-bordered border-main-color w-full text-sm"
                  placeholder="Password"
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

              <div class="flex flex-col md:space-y-1 md:my-1">
                <button
                  :disabled="isLoadingResource"
                  class="btn bg-main-color text-white hover:text-main-color btn-sm md:btn-md normal-case text-xs md:text-sm w-full"
                  type="submit"
                  @click="onLoginClick"
                >
                  <span
                    v-if="isLoadingResource"
                    class="loading loading-md loading-spinner text-neutral-400 "
                  ></span>
                  <span class="">Get Started</span>
                </button>
                <div class="flex items-center justify-center space-x-2">
                  <hr class="w-6/12" />
                  <span class="">Or</span>
                  <hr class="w-6/12 text-main-color"/>
                </div>
                <button
                  :disabled="isLoadingResourceGoogle"
                  class="btn bg-main-color btn-sm hover:text-main-color md:btn-md normal-case text-xs text-white md:text-sm w-full"
                  @click="loginWithGoogle"
                >
                  <span class=""><img src="../../../public/images/googleicon.png" class="md:w-11 w-8"></span>
                  <span
                    v-if="isLoadingResourceGoogle"
                    class="loading loading-md loading-spinner text-neutral-400"
                  ></span>
                  <span v-else>Login with Google</span>
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
