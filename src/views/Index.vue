<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { video, subscription } from "@/api";

const router = useRouter();
const route = useRoute();

// 搜索关键词
const searchKeyword = ref('');

// 标签页切换
const activeTab = ref('all'); // 'all' 或 'subscribed'

watch(searchKeyword, () => {
  fetchVideos();
});

// 节目列表
const videos = ref([]);
// 已订阅节目列表
const subscribedVideos = ref([]);

// 获取节目列表
const fetchVideos = async () => {
  try {
    const res = await video.getList({ wd: searchKeyword.value });
    videos.value = res?.list ?? []
  } catch (error) {
    console.error("获取节目列表失败:", error);
  }
};

// 获取已订阅节目列表
const fetchSubscribedVideos = async () => {
  try {
    const res = await subscription.getSubscriptionList();
    subscribedVideos.value = res.data;
  } catch (error) {
    console.error("获取已订阅节目列表失败:", error);
  }
};

// 过滤后的节目列表
const filteredVideos = computed(() => {
  if (activeTab.value === 'subscribed') {
    return subscribedVideos.value;
  }
  return videos.value;
});

// 已订阅数量
const subscribedCount = computed(() => {
  return subscribedVideos.value.length;
});

// 添加订阅
const addSubscribe = async (videoItem) => {
  const confirmed = confirm(`确定要订阅《${videoItem.vod_name}》吗？`);
  if (!confirmed) {
    return;
  }
  await subscription.subscribe({ vodId: videoItem.vod_id, vodName: videoItem.vod_name });
  await fetchSubscribedVideos();
  await fetchVideos();
};

// 取消订阅
const removeSubscribe = async (videoItem) => {
  const confirmed = confirm(`确定要取消订阅《${videoItem.vod_name}》吗？`);
  if (!confirmed) {
    return;
  }
  await subscription.unsubscribe(videoItem.vod_id);
  await fetchSubscribedVideos();
  await fetchVideos();
}

// 定时器ID
let refreshTimer = null;

onMounted(async () => {
  console.log("节目订阅页面已加载");
  await fetchSubscribedVideos();
  await fetchVideos();

  // 设置定时器，每15秒自动刷新订阅列表
  refreshTimer = setInterval(async () => {
    console.log("自动刷新订阅列表");
    await fetchSubscribedVideos();
  }, 15000);
});

onUnmounted(() => {
  // 清理定时器，防止内存泄漏
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <h1 class="text-2xl font-bold text-gray-900">节目订阅中心</h1>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">已订阅 {{ subscribedCount }} 个节目</span>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 搜索栏 -->
      <div class="mb-8">
        <div class="relative max-w-2xl mx-auto">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索节目"
            class="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <!-- 标签页切换 -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'all'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition',
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              所有节目
              <span class="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100 text-gray-600">
                {{ videos.length }}
              </span>
            </button>
            <button
              @click="activeTab = 'subscribed'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition',
                activeTab === 'subscribed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              已订阅
              <span class="ml-2 py-0.5 px-2 rounded-full text-xs bg-blue-100 text-blue-600">
                {{ subscribedCount }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- 节目列表 -->
      <div v-if="filteredVideos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="video in filteredVideos"
          :key="video.id"
          class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
        >
          <!-- 节目信息 -->
          <div class="p-4">

            <template v-if="video?.type_name">
              <h3 class="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                {{video?.type_name}} - {{ video?.vod_name }}
              </h3>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center space-x-3">
                  <span>ID: {{ video?.vod_id }}</span>
                  <span>{{ video.vod_remarks }}</span>
                </div>
              </div>
              <button
                  @click="addSubscribe(video)"
                  class="mt-2 bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadowmt-4 w-full py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer">
                <span class="flex items-center justify-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  订阅
                </span>
              </button>


            </template>
            <template v-else>
              <h3 class="text-base font-semibold text-gray-900 line-clamp-2 mb-2">
                {{ video?.vod_name }}
              </h3>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center space-x-3">
                  <span>ID: {{ video?.vod_id }}</span>
                  <span>{{ video.current_episode }} 当前集</span>
                  <span>{{ video.download_episode }} 下载集</span>
                </div>
              </div>
              <button
                  @click="removeSubscribe(video)"
                  class="mt-2 bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadowmt-4 w-full py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 cursor-pointer">
                <span class="flex items-center justify-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  取消订阅
                </span>
              </button>
            </template>

          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-16">
        <svg class="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">
          {{ activeTab === 'subscribed' ? '还没有订阅任何节目' : '没有找到相关节目' }}
        </h3>
        <p class="mt-2 text-sm text-gray-500">
          {{ activeTab === 'subscribed' ? '去所有节目中找找感兴趣的内容吧' : '尝试使用不同的关键词搜索' }}
        </p>
        <button
          v-if="activeTab === 'subscribed'"
          @click="activeTab = 'all'"
          class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition"
        >
          浏览所有节目
        </button>
      </div>
    </div>
  </div>
</template>
