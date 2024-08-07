import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { set, useStorage } from '@vueuse/core'
import { jwtDecode} from 'jwt-decode'
import moment from 'moment'

export  interface CreateAccountPayload {
  userName: string
  email:string
  phoneNo: string
  password: string
  confirmPassword: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  result: string
  message: string
  token: string
}

export interface UserInfo{
  firstName: string
  lastName: string
  phoneNo: string
  userId: string
}
const BASE_URL = import.meta.env.VITE_APP_BASE_URL as string

export const useAuthStore = defineStore('authStore', ()=>{

  // setters
  const isLoggedIn = ref<boolean>(false)
  const token  = useStorage('token', '')
  const tokenExpiry =useStorage('tokenExpiry', '')
  const user = useStorage('user', '')




    //   getters
    const getIsLoggedIn = computed(() => isLoggedIn.value)
    const getToken = computed(() => token.value)
    const userIsLoggedIn = computed(() => {
      const expiry = moment.unix(Number(tokenExpiry.value)).utc()
      const now = moment().utc()
      // setLoggedIn(isValid)
      // if token is not valid log user
      // if (!isValid) {
      //   logout()
      // }
      return Boolean(token.value) && expiry.isAfter(now)
    })


    // actions
    async function createAccount(payLoad: CreateAccountPayload) {
      try {
        const response = await fetch(`${BASE_URL}/auth/user/sign-up/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify(payLoad)
        })
        const resp = await response.json()
        console.log(resp)
        if (resp.result === 'ok') {
          console.log('Account created successfully')
          return resp
        } else {
          console.log(resp)
          console.log('Account not created')
          return resp
        }
        // return resp
      } catch (error) {
        console.log(error)
      } finally {
        setTimeout(() => {
          console.log('finally block')
        }, 500)
      }
    }

  async function loginUser(payLoad: LoginPayload) {
    try {
        const response = await fetch(`${BASE_URL}/auth/user/sign-in/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify(payLoad)
        })

      const resp = await response.json()
      if (resp.result === 'ok') {
        console.log('Account created successfully')
        return resp
      } else {
        console.log('error logging in')
        return resp
      }
    }
    catch(error){
      console.log(error)
    }
    finally {
      setTimeout(() => {
        console.log('finally block')
      }, 500)
    }
  }

    async function setUserData(resp: { token: string }) {
      // setToken(resp.token)
      token.value = resp.token

      // console.log('stored token value ', authStore.token)
      isEverLoggedIn.value = true

      const decode: any = jwtDecode(resp.token)

      console.log('user data ', decode)

      tokenExpiry.value = decode.exp.toString()

      setUserInfo({
        firstName: decode.firstName,
        lastName: decode.lastName,
        phoneNo: decode.phoneNo,
        userId: decode.userId,
        picture: decode.picture,
        email: decode.email
      })

      return {
        result: 'ok',
        message: 'User logged in successfully'
      }
    }

    function setUserInfo(usr: UserInfo) {
      user.value = JSON.stringify({
        firstName: usr.firstName,
        lastName: usr.lastName,
        phoneNo: usr.phoneNo,
        userId: usr.userId
      })
    }

    function getUserInfo(){
    try{
      return JSON.parse(user.value) as UserInfo
    }
    catch{
      return null
    }
    }

  function setLoggedIn(value: boolean){
    isLoggedIn.value = value
  }

  function logout(){
    isLoggedIn.value =false
    token.value = null
  }

  return{
    createAccount,
    loginUser,
    logout,
    isLoggedIn,
    setLoggedIn,
    token,
    tokenExpiry,
    getToken,
    getIsLoggedIn,
    userIsLoggedIn,
    setUserInfo,
    getUserInfo

  }
}
)