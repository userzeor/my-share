---
# You can also start simply with 'default'
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://cover.sli.dev
# some information about your slides (markdown enabled)
title: 虚拟滚动原理与实践
info: |
  ## 虚拟滚动原理与实践
# apply unocss classes to the current slide
class: text-center
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# https://sli.dev/guide/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/guide/syntax#mdc-syntax
mdc: true
# aspectRatio: 1:1
# canvasWidth: 1980
---

# 虚拟滚动原理与实践

技术分享

<div class="pt-12">
  <span @click="$slidev.nav.next" class="px-2 py-1 rounded cursor-pointer" hover="bg-white bg-opacity-10">
    开始吧 <carbon:arrow-right class="inline"/>
  </span>
</div>

<div class="abs-br m-6 flex gap-2">
  <button @click="$slidev.nav.openInEditor()" title="Open in Editor" class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon:edit />
  </button>
  <a href="https://github.com/userzeor/my-share" target="_blank" alt="GitHub" title="Open in GitHub"
    class="text-xl slidev-icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---
transition: fade-out
---

# 什么是虚拟滚动?

虚拟滚动是一种技术，它允许在滚动容器中只渲染可视区域内的数据，而非一次性渲染整个列表。当用户滚动时，虚拟滚动技术动态计算并渲染新的可视数据，从而实现大数据量的流畅滚动。这种技术对于优化大量数据的渲染非常有效，因为它减少了DOM的复杂性和内存的使用。

## 虚拟滚动的优势
<br>

- 📝 减少渲染量、节约内存、提升渲染性能
- 🎨 支持长列表显示
- 🧑 支持大数据量实时交互
- 🤹 支持大面积实时刷新
- 🎥 支持锚点，滚动定位
- 📤 可以将渲染出来得数据缓存，更加高效
<br>
<br>

<style>
h1 {
  padding-bottom: 20px;
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}
</style>

---
transition: fade-out
---

# 什么场景适合使用虚拟滚动?

1. 当需要一次性渲染大量数据从而造成大量dom的渲染（例如：实时聊天框，表格，长列表等）
2. 需要做一些性能优化时

# 虚拟滚动原理

虚拟滚动其实就是综合数据分页和无限滚动的方法，在有限的视口中只渲染我们所能看到的数据，超出视口之外的数据就不进行渲染，可以通过计算可视范围内的单元格，保证每一次滚动渲染的DOM元素都是可以控制的，不会担心像数据分页一样一次性渲染过多，也不会发生像无限滚动方案那样会存在数据堆积，是一种很好的解决办法。

假设实际开发中服务端一次响应20万条列表数据，此时设备屏幕只允许容纳20条，那么用户理论上只可以看见20条数据，其他的数据不会进行渲染加载。如果前端将20万条数据全部渲染成DOM元素，可能造成程序卡顿，占用较大资源，非常影响用户体验，那么虚拟滚动技术就完美的解决了这一问题。

<style>
h1 {
  padding: 20px 0;
}
p{
  color: #fff;
}
</style>

---
transition: fade-out
---
<div grid="~ cols-2 gap-4" class="h-full">

  <div>

  # 原理示例图
  <img src="/images/1.png" class="m-0 w-full rounded shadow" />

  了解虚拟滚动之前，需要先知道几个概念性的知识：可视区域，列表区域，非可视区域。

  1. 可视区域：当前固定高度所能看见的区域，决定列表每次展示的数量。
  2. 列表区域：列表数据区域，决定总的高度。
  3. 非可视区域：列表数据区域减去可视区域后不可见的区域。
  </div>

  <div class="flex flex-items-center flex-justify-center">
    <RenderWhen context="main">
      <FixedHeightVirtualList class="flex-1" />
    </RenderWhen>
  </div>

</div>

---
transition: fade-out
---

# 虚拟滚动定高实现方式

<div grid="~ cols-2 gap-4" class="h-full">

  <div>
  
  <div class="h-400px overflow-auto">

  ```vue {all} twoslash
  <script lang="ts" setup>
  import { ref, onMounted, getCurrentInstance, computed } from 'vue'
  import { getVirtualList } from './api/index.js'
  import { useWindowSize } from '@vueuse/core'
  import type { ComputedRef } from "vue";

  type Item = {
    img: string;
    text: string;
    address: string;
  };

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
    return dataList.value.slice(screenStart.value, screenEnd.value) as Item[]
  })

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
            :key="index"
            :style="{ height: itemSize + 'px' }"
          >
            <img
              :src="item.img"
              class="w-100px h-100px m-r-15px"
              alt=""
              srcset=""
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
  ```

  </div>
  </div>
  <div>
    <RenderWhen context="main">
      <FixedHeightVirtualList />
    </RenderWhen>
  </div>
</div>

---
transition: fade-out
---

<div class="bg flex w-full h-full flex-items-center flex-justify-center text-32px">
  <div>分享结束，谢谢</div>
</div>

<style>
  .bg{
    background-image: url('https://cover.sli.dev');
    background-size: 100% 100%;
  }
</style>