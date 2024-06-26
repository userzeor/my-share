<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { getVirtualList } from '../api/index.js'

const instance = getCurrentInstance()

// 总数据源
const dataList = ref([])

// 虚拟列表
const visibleData = ref([])

// 容器高度
const screenHeight = ref(400)

// 容器偏移量
const screenTop = ref(0)

// 容器底部偏移量
const screenBottom = ref(0)

// 容器顶部偏移量
const screenStart = ref(0)

// 容器底部偏移量
const screenEnd = ref(0)

// 每项高度
const itemSize = ref(100)

// 容器滚动事件

const cotentScroll = (e) => {
  screenTop.value = e.target.scrollTop
  screenBottom.value = e.target.scrollTop + screenHeight.value
  screenStart.value = Math.floor(screenTop.value / itemSize.value)
  screenEnd.value = Math.ceil(screenBottom.value / itemSize.value)
  visibleData.value = dataList.value.slice(screenStart.value, screenEnd.value)
}

const getList = async () => {
  const res = await getVirtualList()
  dataList.value = res.data.data
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="overflow-auto" :style="{ height: screenHeight + 'px' }" @scroll="cotentScroll">
    <div class="flex flex-col bg-#fff c-#333">
      <div class="flex flex-items-center" v-for="(item, index) in visibleData" :key="index" :style="{ height: itemSize + 'px' }">
        <img :src="item.img" class="w-100px h-100px m-r-15px" alt="" srcset="">
        <div class="flex flex-col">
          <div class="flex-1 m-b-10px">{{ item.text }}</div>
          <div class="flex-1">{{ item.address }}</div>
        </div>
      </div>
    </div>
  </div>
</template>