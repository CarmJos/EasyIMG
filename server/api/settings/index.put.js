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

    // 获取请求体
    const body = await readBody(event)
    if (!body || typeof body !== 'object' || !body.display) {
      throw createError({
        statusCode: 400,
        message: '缺少 display 字段'
      })
    }

    // 只允许保存 display 字段
    const update = {
      $set: {
        'value.display': body.display,
        updatedAt: new Date().toISOString()
      }
    }
    await db.settings.update(
      { key: 'appSettings' },
      update,
      { upsert: true }
    )

    // 返回最新 display 字段
    const settings = await db.settings.findOne({ key: 'appSettings' })
    return {
      success: true,
      message: '关于内容已保存',
      data: {
        display: settings.value.display
      }
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    console.error('[Settings] 保存 display 失败:', error)
    throw createError({
      statusCode: 500,
      message: '保存 display 失败'
    })
  }
})

