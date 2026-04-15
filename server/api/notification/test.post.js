import { verifyToken, extractToken } from '../../utils/jwt.js'
import { testWebhook, testTelegram, testEmail, testServerChan } from '../../utils/notification.js'

export default defineEventHandler(async (event) => {
  try {
    // 验证登录
    const token = extractToken(event)
    if (!token) {
      console.log('[Notification] 未登录，拒绝测试请求')
      throw createError({
        statusCode: 401,
        message: '请先登录'
      })
    }

    const user = await verifyToken(token)
    if (!user) {
      console.log('[Notification] Token 无效或已过期')
      throw createError({
        statusCode: 401,
        message: 'Token 无效或已过期'
      })
    }

    // 获取请求体中的配置
    const body = await readBody(event)
    const { webhook, telegram, email, serverchan, method } = body

    // 根据通知方式测试
    if (method === 'serverchan') {
      if (!serverchan?.sendKey) {
        console.log('[Notification] Server酱 SendKey 缺失')
        throw createError({
          statusCode: 400,
          message: '请提供 Server酱 SendKey'
        })
      }
      const result = await testServerChan({ sendKey: serverchan.sendKey })
      if (!result.success) {
        console.log('[Notification] Server酱测试失败:', result.error)
        return { success: false, message: result.error || '测试失败' }
      }
      return { success: true, message: '测试通知发送成功' }
    } else if (method === 'email') {
      if (!email?.SMTP_HOST || !email?.SMTP_PORT || !email?.SMTP_USER || !email?.SMTP_PASSWORD) {
        console.log('[Notification] 邮箱配置缺失')
        throw createError({
          statusCode: 400,
          message: '请提供完整的邮件配置（SMTP_HOST、SMTP_PORT、SMTP_USER、SMTP_PASSWORD）'
        })
      }
      console.log('[Notification] 开始测试邮件发送:', email.SMTP_HOST, email.SMTP_USER)
      const result = await testEmail(email)
      if (!result.success) {
        console.log('[Notification] 邮件测试失败:', result.error)
        return { success: false, message: result.error || '测试失败' }
      }
      console.log('[Notification] 邮件测试发送成功')
      return { success: true, message: '测试通知发送成功' }
    } else if (method === 'telegram') {
      if (!telegram?.token || !telegram?.chatId) {
        console.log('[Notification] Telegram Token 或 Chat ID 缺失')
        throw createError({
          statusCode: 400,
          message: '请提供 Telegram Token 和 Chat ID'
        })
      }
      const result = await testTelegram({ token: telegram.token, chatId: telegram.chatId })
      if (!result.success) {
        console.log('[Notification] Telegram 测试失败:', result.error)
        return { success: false, message: result.error || '测试失败' }
      }
      return { success: true, message: '测试通知发送成功' }
    } else {
      if (!webhook?.url) {
        console.log('[Notification] Webhook URL 缺失')
        throw createError({
          statusCode: 400,
          message: '请提供 Webhook URL'
        })
      }
      const result = await testWebhook({
        url: webhook.url,
        method: webhook.method || 'POST',
        contentType: webhook.contentType || 'application/json',
        headers: webhook.headers || {},
        bodyTemplate: webhook.bodyTemplate || JSON.stringify({
          type: '{{type}}',
          title: '{{title}}',
          message: '{{message}}',
          timestamp: '{{timestamp}}',
          data: '{{data}}'
        }, null, 2)
      })
      if (!result.success) {
        console.log('[Notification] Webhook 测试失败:', result.error)
        return { success: false, message: result.error || '测试失败' }
      }
      return { success: true, message: '测试通知发送成功' }
    }
  } catch (error) {
    if (error.statusCode) {
      console.log('[Notification] 测试接口捕获异常:', error.message)
      throw error
    }
    console.error('[Notification] 测试通知接口异常:', error)
    throw createError({
      statusCode: 500,
      message: '测试失败: ' + (error.message || error)
    })
  }
})