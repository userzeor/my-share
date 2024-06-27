<script setup>
import {
  ref,
  onMounted,
  getCurrentInstance,
  computed,
  onUpdated,
  nextTick,
} from 'vue'
import { getDynamicVirtualList } from '../api/index.js'
import { useWindowSize } from '@vueuse/core'

const instance = getCurrentInstance()

// 总数据源
const dataList = ref([])

// 容器高度
const screenHeight = ref(400)

// 容器偏移量
const scrollOffset = ref(0)

// 每项高度
const itemSize = ref(100)

// 列表开始索引偏移量
const screenStart = ref(0)

// 列表结束索引偏移量
const screenEnd = ref(screenHeight.value / itemSize.value)

// 虚拟列表
const visibleData = computed(() => {
  return dataList.value.slice(screenStart.value, screenEnd.value)
})

// 虚拟列表refList
let virtualListRef = ref([])

// 容器滚动事件
const cotentScroll = (e) => {
  const { scrollTop } = e.target

  if (scrollOffset.value === scrollTop) return

  screenStart.value = Math.floor(scrollTop / itemSize.value)

  screenEnd.value = screenStart.value + screenHeight.value / itemSize.value

  // 偏移量
  scrollOffset.value = scrollTop - (scrollTop % itemSize.value)
}

const getList = async () => {
  const res = await getDynamicVirtualList()
  dataList.value = res.data.data
}

// 推入ref
const setItemRef = (el) => {
  virtualListRef.value.push(el)
}

// 渲染完获取实际高度更新索引
const updateIndex = () => {
  // console.log(virtualListRef.value)
}

// 图片渲染完成事件
const imgLoad = (e, item, index) => {
  // console.log(e, item, index)
  const nodeInfo = virtualListRef.value[index].getBoundingClientRect()
  console.log(nodeInfo)
}

onUpdated(() => {
  updateIndex()
})

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
        height: `${itemSize * dataList.length}px`,
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
          :ref="setItemRef"
          :key="index"
          :style="{ height: item.itemSize + 'px' }"
        >
          <img
            :src="item.img"
            class="w-100px m-r-15px"
            alt=""
            srcset=""
            @load="
              (e) => {
                imgLoad(e, item, index)
              }
            "
          />
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
