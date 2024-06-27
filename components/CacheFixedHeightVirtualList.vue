<script setup>
import { ref, onMounted, getCurrentInstance, computed } from 'vue'
import { getVirtualList } from '../api/index.js'
import { useWindowSize } from '@vueuse/core'

const instance = getCurrentInstance()

// 总数据源
const dataList = ref([])

// 容器高度
const screenHeight = ref(400)

// 容器偏移量
const scrollOffset = ref(0)

// 每项高度
const itemSize = ref(30)

// 列表开始索引偏移量
const screenStart = ref(0)

// 列表结束索引偏移量
const screenEnd = ref(screenHeight.value / itemSize.value)

// 前后缓存数
const cacheCount = ref(150)

// 虚拟列表
const visibleData = computed(() => {
  return dataList.value.slice(screenStart.value, screenEnd.value)
})

// 容器滚动事件

const cotentScroll = (e) => {
  const { scrollTop } = e.target

  if (scrollOffset.value === scrollTop) return

  screenStart.value = Math.floor(scrollTop / itemSize.value)

  screenEnd.value =
    screenStart.value + screenHeight.value / itemSize.value + cacheCount.value

  if (screenStart.value > cacheCount.value) {
    screenStart.value = screenStart.value - cacheCount.value
  }

  // 偏移量
  scrollOffset.value = scrollTop - (scrollTop % itemSize.value)
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
  <div
    class="overflow-auto"
    :style="{ height: screenHeight + 'px' }"
    @scroll="cotentScroll"
  >
    <div
      class="flex flex-col bg-#fff c-#333"
      :style="{
        height: `${itemSize * (dataList.length + cacheCount)}px`,
      }"
    >
      <div
        :style="{
          willChange: 'transform',
          transform: `translateY(${scrollOffset}px)`,
        }"
      >
        <div
          class="flex flex-items-center"
          v-for="(item, index) in visibleData"
          :key="index"
          :style="{ height: itemSize + 'px' }"
        >
          <!-- <img
            :src="item.img"
            class="w-100px h-100px m-r-15px"
            alt=""
            srcset=""
          /> -->
          <div class="flex flex-col">
            <div class="flex-1 m-b-10px">
              {{ item.text }}
            </div>
            <div class="flex-1">{{ item.address }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
