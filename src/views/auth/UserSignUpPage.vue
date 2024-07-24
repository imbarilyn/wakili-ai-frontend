
  <script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue'
  import { useField } from 'vee-validate'
  import { useRouter } from 'vue-router'
  import {type CreateAccountPayload, useAuthStore, useNotificationsStore} from '@/stores'
  import { googleTokenLogin} from 'vue3-google-login'
  import { set } from '@vueuse/core'

  const router = useRouter()
  const authStore = useAuthStore()
  const notification = useNotificationsStore()
  const isLoadingResource = ref(false)
  const isLoadingResourceGoogle = ref(false)



  const signUpData = reactive<CreateAccountPayload>({
    userName:'',
    email: '',
    phoneNo: '',
    password: '',
    confirmPassword: '',
  })

  const phoneNoValidator = (value: string) => {
    if (!value) {
      return 'Phone NUmber required'
    }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneNoRegex = /^[0-9]{10}$/

    if (!phoneNoRegex.test(value)) {
      return 'Phone number must be valid'
    }

    if (value.length > 10 && value.length < 10) {
      return 'Phone number must be 10 digits'
    }

    return true
  }

  const {
    value: phoneNo,
    errorMessage: phoneNoErrorMessage,
    meta: phoneNoMeta
  } = useField('phoneNo', phoneNoValidator)

  watch(
    () => signUpData.phoneNo,
    (value) => {
      phoneNo.value = value
    }
  )


  const userNameValidator = (value:string)=> {
    if (!value) {
      return 'User name is required'
    }

    if (value.length < 4) {
      return 'User name must be at least 4 characters'
    }

    if (value.length > 50) {
      return 'User name must be less than 50 characters'

    }
    return  true
  }

  const {
      value: userName,
      errorMessage: userNameErrorMessage,
      meta: userNameMeta
    } = useField('userName', userNameValidator)


  watch(()=>signUpData.userName,(value)=>{
    if(value){
      userName.value = value
    }
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
      () => signUpData.email,
      (value) => {
        if (value) email.value = value
      }
    )

    const passwordValidator = (value: string) => {
      if (!value) {
        return 'Password is required'
      }

      if (value.length < 4) {
        return 'Password must be at least 4 characters';
      }

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
      () => signUpData.password,
      (value) => {
        password.value = value
      }
    )

    const confirmPasswordValidator = (value: string) => {
      if (!value) {
        return 'Confirm password is required'
      }

      if (value !== password.value) {
        return 'Confirm password does not match password'
      }

      return true
    }

    const {
      value: confirmPassword,
      errorMessage: confirmPasswordErrorMessage,
      meta: confirmPasswordMeta
    } = useField('confirmPassword', confirmPasswordValidator)

    watch(
      () => signUpData.confirmPassword,
      (value) => {
        confirmPassword.value = value
      }
    )

    const everythingIsValid = computed(() => {
      return (
        emailMeta.validated &&
        emailMeta.valid &&
        passwordMeta.validated &&
        passwordMeta.valid &&
        confirmPasswordMeta.validated &&
        confirmPasswordMeta.valid
      )
    })

  const onSubmit = () => {
    if(everythingIsValid.value) {
      console.log(signUpData)
      isLoadingResource.value = true
      authStore.createAccount(signUpData)
        .then((res) => {
          console.log(res)
          if (res.result === 'ok') {
            isLoadingResource.value =false
            notification.addNotification('Account created successfully kindly login', 'success')
            setTimeout(()=>{
              router.push({
                name: 'user-login',
              })
            }, 1000)
          }
           if(res.result === 'fail' && res.message === 'User already exists.'){
            setTimeout(()=>{
              isLoadingResource.value = false
              notification.addNotification('Account already exist kindly login ', 'error')
            },500)
          }
        })
        .catch((err) => {
          setTimeout(()=>{
            isLoadingResource.value = false
            notification.addNotification('Account creation failed try again', 'error')
          },500)
          console.error(err)

        })
        .finally(()=>{
          setTimeout(()=>{
            isLoadingResource.value = false
          },1000)
        })
    }
    else{
      return
    }
  }
  const BASE_URL = import.meta.env.VITE_APP_BASE_URL as string
  const signUpwithGoogle = () => {
    isLoadingResourceGoogle.value = true
    googleTokenLogin()
      .then((googleResponse)=>{
        console.log('sign uo google', googleResponse)
          fetch(`${BASE_URL}/auth/login/google-login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              access_token: googleResponse.access_token
            })
          })
            .then((response)=>{
              console.log('backend resp', response)
              const resp = response.json()
                resp.then((res)=>{
                  if(res.result === 'ok'){
                    authStore.token = res.token
                    authStore.tokenExpiry = googleResponse.expires_in
                    isLoadingResourceGoogle.value = false
                    notification.addNotification('Account created successful', 'success')
                    setTimeout(()=>{
                      router.push({
                        name: 'chat-page',
                      })
                    },500)
                  }
                  else{
                    setTimeout(()=>{
                      isLoadingResourceGoogle.value = false
                      notification.addNotification('Account creation failed try again', 'error')
                    },500)
                    console.log('invalid token')
                  }
                })
            })
            .catch((error)=>{
              console.log('error', error)
              isLoadingResourceGoogle.value = false
              setTimeout(()=>{
                notification.addNotification('Account creation failed try again', 'error')
              }, 500)

            })
      })
  }
  </script>

  <template>
    <main class="w-full  mx-auto p-6 flex items-center justify-center">
      <div
        class="w-full md:w-6/12 lg:w-5/12 xl:w-4/12 px-4 md:px-2 lg:px-0 mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700"
      >
        <div class="p-4 sm:p-7">
          <div class="text-center">
            <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Sign up</h1>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?
              <router-link
                class="text-blue-600 decoration-2 hover:underline font-medium dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                to="/auth/user-login"
              >
                Login here
              </router-link>
            </p>
          </div>

          <div class="mt-5">
                      <form @submit.prevent="onSubmit">
                        <div class="grid gap-y-4">

                          <!-- Email -->
                          <div class="flex flex-col space-y-1">
                            <div class="flex flex-col space-y-1">
                              <label class="label font-semibold text-sm" for="username"> full Names </label>
                              <input
                                id="username"
                                v-model="signUpData.userName"
                                :class="{
                                'input-error': userNameMeta.validated && !userNameMeta.valid,
                                'input-primary': userNameMeta.validated && userNameMeta.valid
                              }"
                                class="input input-primary input-bordered text-sm w-full"
                                placeholder="full names"
                                type="text"
                              />
                              <small v-if="userNameMeta.validated && !userNameMeta.valid" class="text-sm text-rose-500">
                                {{ userNameErrorMessage }}
                              </small>
                            </div>
                            <label class="label font-semibold text-sm" for="email"> Email </label>
                            <input
                              id="email"
                              v-model="signUpData.email"
                              :class="{
                                'input-error': emailMeta.validated && !emailMeta.valid,
                                'input-primary': emailMeta.validated && emailMeta.valid
                              }"
                              class="input input-primary input-bordered text-sm w-full"
                              placeholder="Email"
                              type="text"
                            />
                            <small v-if="emailMeta.validated && !emailMeta.valid" class="text-sm text-rose-500">
                              {{ emailErrorMessage }}
                            </small>
                          </div>
                          <div class="flex flex-col space-y-1">
                            <label class="label font-semibold text-sm" for="password">Phone Number</label>
                            <input
                              id="phoneNumber"
                              v-model="signUpData.phoneNo"
                              :class="{
                    'input-error': phoneNoMeta.validated && !phoneNoMeta.valid,
                    'input-primary': phoneNoMeta.validated && phoneNoMeta.valid
                  }"
                              class="input input-primary input-bordered w-full text-sm"
                              placeholder="Phone Number"
                              required
                              type="text"
                            />
                            <small
                              v-if="phoneNoMeta.validated && !phoneNoMeta.valid"
                              class="text-sm text-rose-500"
                            >
                              {{ phoneNoErrorMessage }}
                            </small>
                          </div>

                          <!-- Password -->
                          <div class="flex flex-col space-y-1">
                            <label class="label font-semibold text-sm" for="password"> Password </label>
                            <input
                              id="password"
                              v-model="signUpData.password"
                              :class="{
                                'input-error': passwordMeta.validated && !passwordMeta.valid,
                                'input-primary': passwordMeta.validated && passwordMeta.valid
                              }"
                              class="input input-primary input-bordered w-full text-sm"
                              placeholder="Password"
                              type="password"
                            />
                            <small
                              v-if="passwordMeta.validated && !passwordMeta.valid"
                              class="text-sm text-rose-500"
                            >
                              {{ passwordErrorMessage }}
                            </small>
                          </div>

                          <!-- Confirm Password -->

                          <div class="flex flex-col space-y-1">
                            <label class="label font-semibold text-sm" for="confirmPassword">
                              Confirm Password
                            </label>
                            <input
                              id="confirmPassword"
                              v-model="signUpData.confirmPassword"
                              :class="{
                                'input-error': confirmPasswordMeta.validated && !confirmPasswordMeta.valid,
                                'input-primary': confirmPasswordMeta.validated && confirmPasswordMeta.valid
                              }"
                              class="input input-primary input-bordered w-full text-sm"
                              placeholder="Confirm Password"
                              type="password"
                            />
                            <small
                              v-if="confirmPasswordMeta.validated && !confirmPasswordMeta.valid"
                              class="text-sm text-rose-500"
                            >
                              {{ confirmPasswordErrorMessage }}
                            </small>
                          </div>
                          <button
                            class="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                            type="submit"
                          >
                              <span
                                v-if="isLoadingResource"
                                class="loading loading-md loading-spinner text-neutral-400"
                              ></span>
                            <span v-else>Sign up</span>

                          </button>
                          <button
                            :disabled="isLoadingResourceGoogle"
                            class="btn btn-primary btn-sm md:btn-md normal-case text-xs md:text-sm w-full"
                            @click="signUpwithGoogle"
                          >
                            <span
                              v-if="isLoadingResourceGoogle"
                              class="loading loading-md loading-spinner text-neutral-400"
                            ></span>
                            Sign up with Google
                          </button>
                        </div>
                      </form>
          </div>
        </div>
      </div>
    </main>
  </template>

  <style scoped></style>

