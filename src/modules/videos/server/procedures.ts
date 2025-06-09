import {db} from '@/db'
import {mux} from '@/lib/mux'
import {videos, videosUpdateSchema} from '@/db/schema'
import {TRPCError} from '@trpc/server'
import { protectedProcedure, createTRPCRouter } from '@/trpc/init'
import { and, eq } from 'drizzle-orm'

export const videosRouter = createTRPCRouter({
  update: protectedProcedure
    .input(videosUpdateSchema) // 使用videosUpdateSchema作为输入验证规则
    .mutation(async ({ctx, input}) => {
      const {id: userId} = ctx.user

      if(!input.id) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(),
        })
        .where(and(
          eq(videos.id, input.id), // 确保更新的是指定的视频
          eq(videos.userId, userId) // 确保用户只能更新自己的视频
        ))
        .returning()

        if(!updatedVideo) {
          throw new TRPCError({ code: 'NOT_FOUND' })
        }
    }),
  // mutation对应对数据库的增删改，表示会修改数据库数据
  create: protectedProcedure.mutation(async ({ctx}) => {
    const {id: userId} = ctx.user

    // Mux Node.js SDK 提供的：创建一个新的 Direct Upload 接口
    // Direct Upload 表示前端直接将视频文件上传到 Mux，不需要经过自己的服务器
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId, // 传递用户ID到Mux
        playback_policy: ['public'], // 设置播放策略为公开
        // mp4_support: "standard", // 设置MP4支持为标准
        input: [
          {
            generated_subtitles: [
              {
                language_code: 'en',
                name: 'English'
              }
            ]
          }
        ]
      },
      cors_origin: '*', // 允许所有CORS来源
    })

    const [video] = await db
      .insert(videos)
      .values({
        userId,
        title: 'Untitled',
        muxStatus: "waiting",
        muxUploadId: upload.id
      })
      .returning()

    return {
      video,
      url: upload.url, // 提供给前端使用的上传视频的地址
    }
  })
})