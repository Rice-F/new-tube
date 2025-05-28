import {db} from '@/db'
import {mux} from '@/lib/mux'
import {videos} from '@/db/schema'
import { protectedProcedure, createTRPCRouter } from '@/trpc/init'

export const videosRouter = createTRPCRouter({
  // mutation对应对数据库的增删改，表示会修改数据库数据
  create: protectedProcedure.mutation(async ({ctx}) => {
    const {id: userId} = ctx.user

    // 创建上传权限
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId, // 传递用户ID到Mux
        playback_policy: ['public'], // 设置播放策略为公开
        // mp4_support: "standard", // 设置MP4支持为标准
      },
      cors_origin: '*', // 允许所有CORS来源
    })

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: 'Untitled',
      })
      .returning()

    return {
      video,
      url: upload.url, // 返回上传URL
    }
  })
})