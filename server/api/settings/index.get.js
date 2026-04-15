import db from '../../utils/db.js'
import { verifyToken, extractToken } from '../../utils/jwt.js'

export default defineEventHandler(async (event) => {
  try {
    // 验证登录
    const token = extractToken(event)
    if (!token) {
      throw createError({
        statusCode: 401,
        message: '请先登录'
      })
    }

    const user = await verifyToken(token)
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Token 无效或已过期'
      })
    }

    // 获取应用设置
    const settings = await db.settings.findOne({ key: 'appSettings' })

    // 获取已删除图片数量
    const deletedCount = await db.images.count({ isDeleted: true })

    // 默认公告配置
    const defaultAnnouncement = {
      enabled: false,
      content: '',
      displayType: 'modal'  // 'modal' | 'banner'
    }

    // 默认 display 设置
    const defaultDisplay = {
      aboutContent: `# 关于 EasyImg\n\nEasyImg 是一个面向个人的简洁图床应用，支持多种上传方式，支持图片管理、批量操作、API 上传等功能。\n\n- 开源地址：[GitHub](https://github.com/chaos-zhu/easyimg)\n- 主要功能：图片上传、管理、API、批量操作、内容审核等。\n- 适合个人或小团队自部署使用。\n`,
      loginInfo: 'EasyImg - 面向个人的图床应用'
    }

    if (!settings) {
      return {
        success: true,
        data: {
          appName: 'easyimg',
          appLogo: '',
          backgroundUrl: '',
          backgroundBlur: 0,
          siteUrl: '',
          deletedImagesCount: deletedCount,
          announcement: defaultAnnouncement,
          display: defaultDisplay
        }
      }
    }

    return {
      success: true,
      data: {
        appName: settings.value.appName || 'easyimg',
        appLogo: settings.value.appLogo || '',
        backgroundUrl: settings.value.backgroundUrl || '',
        backgroundBlur: settings.value.backgroundBlur || 0,
        siteUrl: settings.value.siteUrl || '',
        deletedImagesCount: deletedCount,
        announcement: settings.value.announcement || defaultAnnouncement,
        display: settings.value.display || defaultDisplay
      }
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    console.error('[Settings] 获取应用设置失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取设置失败'
    })
  }
})
