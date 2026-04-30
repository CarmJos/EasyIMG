import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    appSettings: {
      appName: 'EasyImg',
      appLogo: '',
      backgroundUrl: '',
      backgroundBlur: 0,
      siteUrl: '',
      deletedImagesCount: 0,
      announcement: {
        enabled: false,
        content: '',
        displayType: 'modal'
      },
      display: {
        // 页面设置
        aboutContent: `# 关于 EasyImg\n\nEasyImg 是一个面向个人的简洁图床应用，支持多种上传方式，支持图片管理、批量操作、API 上传等功能。\n\n- 开源地址：[GitHub](https://github.com/chaos-zhu/easyimg)\n- 主要功能：图片上传、管理、API、批量操作、内容审核等。\n- 适合个人或小团队自部署使用。\n\n## 项目信息\n\n- 项目地址：[https://github.com/chaos-zhu/easyimg](https://github.com/chaos-zhu/easyimg)\n- TG频道：[https://t.me/easynode_notify](https://t.me/easynode_notify)\n\n## 作者其他项目\n\n### [EasyNode](https://github.com/chaos-zhu/easynode)\n一个多功能Linux&win服务器WEB终端面板(webSSH&webSFTP)\n\n### [EasyNavTab](https://github.com/chaos-zhu/easynavtab)\n开源浏览器插件，自定义新标签页\n`,
        loginInfo: 'EasyImg - 面向个人的图床应用'
      }
    },
    publicApiConfig: {
      enabled: true,
      allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      maxFileSize: 10 * 1024 * 1024,
      enableCompression: false,
      compressionQuality: 80,
      convertToWebp: false,
      convertToPng: false,
      rateLimit: 10,
      allowConcurrent: false
    },
    privateApiConfig: {
      maxFileSize: 100 * 1024 * 1024,
      enableCompression: false,
      compressionQuality: 80,
      convertToWebp: false,
      convertToPng: false,
      showOnHomepage: false
    },
    apiKeys: [],
    loading: false
  }),

  actions: {
    // 获取公共应用设置（无需登录）
    async fetchPublicAppSettings() {
      try {
        const response = await $fetch('/api/settings/public')
        if (response.success) {
          this.appSettings.appName = response.data.appName
          this.appSettings.appLogo = response.data.appLogo
          this.appSettings.backgroundUrl = response.data.backgroundUrl
          this.appSettings.backgroundBlur = response.data.backgroundBlur
          this.appSettings.siteUrl = response.data.siteUrl
          this.appSettings.deletedImagesCount = response.data.deletedImagesCount
          this.appSettings.announcement = response.data.announcement || {
            enabled: false,
            content: '',
            displayType: 'modal'
          }
          this.appSettings.display = response.data.display || {
            aboutContent: `# 关于 EasyImg\n\nEasyImg 是一个面向个人的简洁图床应用，支持多种上传方式，支持图片管理、批量操作、API 上传等功能。\n\n- 开源地址：[GitHub](https://github.com/chaos-zhu/easyimg)\n- 主要功能：图片上传、管理、API、批量操作、内容审核等。\n- 适合个人或小团队自部署使用。\n\n## 项目信息\n\n- 项目地址：[https://github.com/chaos-zhu/easyimg](https://github.com/chaos-zhu/easyimg)\n- TG频道：[https://t.me/easynode_notify](https://t.me/easynode_notify)\n\n## 作者其他项目\n\n### [EasyNode](https://github.com/chaos-zhu/easynode)\n一个多功能Linux&win服务器WEB终端面板(webSSH&webSFTP)\n\n### [EasyNavTab](https://github.com/chaos-zhu/easynavtab)\n开源浏览器插件，自定义新标签页\n`,
            loginInfo: 'EasyImg - 面向个人的图床应用'
          }
        }
      } catch (error) {
        console.error('获取公共应用设置失败:', error)
      }
    },

    // 获取应用设置（需要登录）
    async fetchAppSettings() {
      const authStore = useAuthStore()

      try {
        const response = await $fetch('/api/settings', {
          headers: authStore.authHeader
        })

        if (response.success) {
          this.appSettings = response.data
        }
      } catch (error) {
        console.error('获取应用设置失败:', error)
      }
    },

    // 保存应用设置（完整更新，用于设置页面）
    async saveAppSettings(settings) {
      const authStore = useAuthStore()
      try {
        const response = await $fetch('/api/settings', {
          method: 'PUT',
          body: settings,
          headers: authStore.authHeader
        })
        if (response.success) {
          this.appSettings = { ...this.appSettings, ...response.data }
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.data?.message || '保存失败' }
      }
    },

    // 部分更新应用设置（只更新传递的字段，用于快捷操作）
    async updateAppSetting(partialSettings) {
      const authStore = useAuthStore()

      try {
        const response = await $fetch('/api/settings', {
          method: 'PUT',
          body: partialSettings,
          headers: authStore.authHeader
        })

        if (response.success) {
          this.appSettings = { ...this.appSettings, ...response.data }
          return { success: true }
        }

        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.data?.message || '保存失败' }
      }
    },

    // 保存内容显示设置
    async saveDisplaySettings(display) {
      const authStore = useAuthStore()
      try {
        const response = await $fetch('/api/settings', {
          method: 'PUT',
          body: { display },
          headers: authStore.authHeader
        })
        if (response.success) {
          this.appSettings.display = response.data.display
          return { success: true }
        }
        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.data?.message || '保存失败' }
      }
    },

    // 获取公共 API 配置
    async fetchPublicApiConfig() {
      const authStore = useAuthStore()

      try {
        const response = await $fetch('/api/config/public', {
          headers: authStore.authHeader
        })

        if (response.success) {
          this.publicApiConfig = response.data
        }
      } catch (error) {
        console.error('获取公共 API 配置失败:', error)
      }
    },

    // 保存公共 API 配置
    async savePublicApiConfig(config) {
      const authStore = useAuthStore()

      try {
        const response = await $fetch('/api/config/public', {
          method: 'PUT',
          body: config,
          headers: authStore.authHeader
        })

        if (response.success) {
          this.publicApiConfig = response.data
          return { success: true }
        }

        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.data?.message || '保存失败' }
      }
    },

    // 获取私有 API 配置
    async fetchPrivateApiConfig() {
      const authStore = useAuthStore()

      try {
        const response = await $fetch('/api/config/private', {
          headers: authStore.authHeader
        })

        if (response.success) {
          this.privateApiConfig = response.data
        }
      } catch (error) {
        console.error('获取私有 API 配置失败:', error)
      }
    },

    // 保存私有 API 配置
    async savePrivateApiConfig(config) {
      const authStore = useAuthStore()

      try {
        const response = await $fetch('/api/config/private', {
          method: 'PUT',
          body: config,
          headers: authStore.authHeader
        })

        if (response.success) {
          this.privateApiConfig = response.data
          return { success: true }
        }

        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.data?.message || '保存失败' }
      }
    },

    // 获取 ApiKey 列表
    async fetchApiKeys() {
      const authStore = useAuthStore()

      try {
        const response = await $fetch('/api/apikeys', {
          headers: authStore.authHeader
        })

        if (response.success) {
          this.apiKeys = response.data
        }
      } catch (error) {
        console.error('获取 ApiKey 列表失败:', error)
      }
    },

    // 创建 ApiKey
    async createApiKey(name) {
      const authStore = useAuthStore()

      try {
        const response = await $fetch('/api/apikeys', {
          method: 'POST',
          body: { name },
          headers: authStore.authHeader
        })

        if (response.success) {
          this.apiKeys.push(response.data)
          return { success: true, data: response.data }
        }

        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.data?.message || '创建失败' }
      }
    },

    // 更新 ApiKey
    async updateApiKey(id, data) {
      const authStore = useAuthStore()

      try {
        const response = await $fetch(`/api/apikeys/${id}`, {
          method: 'PUT',
          body: data,
          headers: authStore.authHeader
        })

        if (response.success) {
          const index = this.apiKeys.findIndex(k => k.id === id)
          if (index > -1) {
            this.apiKeys[index] = response.data
          }
          return { success: true, data: response.data }
        }

        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.data?.message || '更新失败' }
      }
    },

    // 删除 ApiKey
    async deleteApiKey(id) {
      const authStore = useAuthStore()

      try {
        const response = await $fetch(`/api/apikeys/${id}`, {
          method: 'DELETE',
          headers: authStore.authHeader
        })

        if (response.success) {
          this.apiKeys = this.apiKeys.filter(k => k.id !== id)
          return { success: true }
        }

        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.data?.message || '删除失败' }
      }
    },

    // 硬删除所有软删除的图片
    async hardDeleteImages() {
      const authStore = useAuthStore()

      try {
        const response = await $fetch('/api/settings/hard-delete', {
          method: 'POST',
          headers: authStore.authHeader
        })

        if (response.success) {
          this.appSettings.deletedImagesCount = 0
          return { success: true, message: response.message, count: response.data.deletedCount }
        }

        return { success: false, message: response.message }
      } catch (error) {
        return { success: false, message: error.data?.message || '删除失败' }
      }
    }
  }
})
