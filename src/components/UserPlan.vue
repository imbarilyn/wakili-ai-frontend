<script lang="ts" setup>

interface UserPlan {
  subscription: string;
  price: string;
  duration: string;
}

const props =withDefaults(defineProps<UserPlan>(),{
  subscription: 'No Subscription',
  price: 'Kes. 0',
  duration: '0'
})

</script>


<template>

    <div class="grid lg:grid-cols-4  grid-cols-2 w-full gap-3 pt-4">
      <div class="bg-main-color text-white rounded-lg p-4 flex">
        <div class="pe-4 flex items-center">
          <span class="material-icons-outlined">subscriptions</span>
        </div>
        <div>
          <p class="lg:!text-xl text-sm">Subscription</p>
          <h2 class="lg:text-xl text-sm">Weekly Plan</h2>
        </div>
      </div>
      <div class="bg-main-color text-white rounded-lg flex p-4" >
        <div class="pe-4 flex items-center">
          <span class="material-icons-outlined">work_outline</span>
        </div>
        <div>
          <p class="lg:!text-xl text-sm">Limit</p>
          <h2  class="lg:text-xl text-sm">7 Days</h2>
        </div>


      </div>
      <div class="bg-main-color text-white rounded-lg flex p-4 items-center" >
        <div class="pe-4 flex items-center">
          <span class="material-icons-outlined">payments</span>
        </div>
        <div class="">
          <p class="lg:!text-xl text-sm">Plan Cost</p>
          <h2 class="lg:text-xl text-sm">Kes.300</h2>
        </div>


      </div>
      <div class="bg-main-color text-white rounded-lg flex p-4" >
        <div class="pe-4 flex items-center">
          <span class="material-icons-outlined">schedule</span>
        </div>
        <div>
          <p  class="lg:!text-xl text-sm">Subscription Date</p>
          <h2 class="lg:text-xl text-sm" >19 Feb 2020</h2>
        </div>


      </div>
    </div>

</template>