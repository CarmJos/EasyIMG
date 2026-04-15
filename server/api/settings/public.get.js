import db from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const settings = await db.settings.findOne({ key: 'appSettings' })
    const deletedCount = await db.images.count({ isDeleted: true })
    const defaultAnnouncement = {
      enabled: false,
      content: '',
      displayType: 'modal'
    }
    const defaultDisplay = {
      aboutContent: `# 关于 EasyImg\n\nEasyImg 是一个面向个人的简洁图床应用，支持多种上传方式，支持图片管理、批量操作、API 上传等功能。\n\n- 开源地址：[GitHub](https://github.com/chaos-zhu/easyimg)\n- 主要功能：图片上传、管理、API、批量操作、内容审核等。\n- 适合个人或小团队自部署使用。\n\n## 项目信息\n\n- 项目地址：[https://github.com/chaos-zhu/easyimg](https://github.com/chaos-zhu/easyimg)\n- TG频道：[https://t.me/easynode_notify](https://t.me/easynode_notify)\n\n## 作者其他项目\n\n### [EasyNode](https://github.com/chaos-zhu/easynode)\n一个多功能Linux&win服务器WEB终端面板(webSSH&webSFTP)\n\n### [EasyNavTab](https://github.com/chaos-zhu/easynavtab)\n开源浏览器插件，自定义新标签页\n` ,
      loginInfo: 'EasyImg - 面向个人的图床应用'
    }
    return {
      success: true,
      data: {
        appName: settings?.value?.appName || 'easyimg',
        appLogo: settings?.value?.appLogo || '',
        backgroundUrl: settings?.value?.backgroundUrl || '',
        backgroundBlur: settings?.value?.backgroundBlur || 0,
        siteUrl: settings?.value?.siteUrl || '',
        deletedImagesCount: deletedCount,
        announcement: settings?.value?.announcement || defaultAnnouncement,
        display: settings?.value?.display || defaultDisplay
      }
    }
  } catch (error) {
    console.error('[Settings] 获取公共应用设置失败:', error)
    throw createError({
      statusCode: 500,
      message: '获取设置失败'
    })
  }
})