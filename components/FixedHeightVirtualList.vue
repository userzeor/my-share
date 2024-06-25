<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { getVirtualList } from '../api/index.js'

const instance = getCurrentInstance()

const props = defineProps({
  count: {
    default: 0,
  },
})

const getList = async () => {
  const res = await getVirtualList()
}

onMounted(() => {
  console.log('instance?.proxy.$slidev')

  getList()
})
</script>

<template>
  <div class="flex flex-col">
    <div class="flex h-50px"></div>
  </div>
</template>
