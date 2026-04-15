<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <template v-if="aboutContent && aboutContent.trim()">
      <div class="space-y-6">
        <!-- 动态渲染 Markdown 内容 -->
        <div>
          <div class="prose dark:prose-invert max-w-none">
            <vue-markdown :source="aboutContent"/>
          </div>
        </div>

        <!-- 版本信息（仅登录后显示） -->
        <!-- <div v-if="authStore.isAuthenticated" class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Icon name="heroicons:information-circle" class="w-5 h-5 text-primary-500" />
            版本信息
          </h2>

          <div class="space-y-4">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-gray-700 dark:text-gray-300">当前版本:</span>
              <span class="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                v{{ versionInfo.currentVersion }}
              </span>

              <template v-if="loading">
                <span class="flex items-center gap-1 text-gray-500 text-sm">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                  检测中...
                </span>
              </template>
              <template v-else-if="versionInfo.error">
                <span class="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium flex items-center gap-1">
                  <Icon name="heroicons:exclamation-triangle" class="w-3 h-3" />
                  检测失败
                </span>
              </template>
              <template v-else-if="versionInfo.hasUpdate">
                <span class="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">
                  有新版本
                </span>
              </template>
              <template v-else-if="versionInfo.latestVersion">
                <span class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                  最新
                </span>
              </template>
            </div>

            <div v-if="versionInfo.hasUpdate && versionInfo.latestVersion" class="flex items-center gap-3 flex-wrap">
              <span class="text-gray-700 dark:text-gray-300">最新版本:</span>
              <span class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                v{{ versionInfo.latestVersion }}
              </span>
              <a
                href="https://github.com/chaos-zhu/easyimg/releases"
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 dark:text-primary-400 hover:underline text-sm flex items-center gap-1"
              >
                <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
                前往更新
              </a>
            </div>

            <div v-if="versionInfo.error" class="text-sm text-yellow-600 dark:text-yellow-400">
              {{ versionInfo.error }}
            </div>

            <div class="pt-2">
              <button
                @click="checkVersion"
                :disabled="loading"
                class="btn-secondary text-sm flex items-center gap-2"
              >
                <Icon name="heroicons:arrow-path" class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                {{ loading ? '检测中...' : '检查更新' }}
              </button>
            </div>
          </div>
        </div> -->
      </div>
    </template>
  </div>
</template>

<script setup>
import {onMounted, reactive, ref} from 'vue'
import {useAuthStore} from '~/stores/auth'
import {useSettingsStore} from '~/stores/settings'
import VueMarkdown from 'vue-markdown-render'

// 页面元数据
definePageMeta({
  title: '关于'
})

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// 版本信息
const versionInfo = reactive({
  currentVersion: '1.0.0',
  latestVersion: null,
  hasUpdate: false,
  error: null
})

const loading = ref(false)
const aboutContent = ref('')

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await settingsStore.fetchAppSettings()
  } else {
    await settingsStore.fetchPublicAppSettings()
  }
  aboutContent.value = settingsStore.appSettings.display?.aboutContent || ''

  // if (authStore.isAuthenticated) {
  //   checkVersion()
  // }
})
</script>