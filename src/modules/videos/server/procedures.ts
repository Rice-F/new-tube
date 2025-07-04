import { db } from '@/db'
import { videos, videosUpdateSchema } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

import { z } from 'zod'

import { TRPCError } from '@trpc/server'
import { protectedProcedure, createTRPCRouter } from '@/trpc/init'

import { UTApi } from "uploadthing/server";

import { mux } from '@/lib/mux'
import { workflow } from '@/lib/workflow'

export const videosRouter = createTRPCRouter({
  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.id }, 
      }) 

      return workflowRunId
    }),
  generateTitle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user

      const { workflowRunId } = await workflow.trigger({
        // workflow的地址
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.id }, 
      }) 

      // workflow 运行标识
      return workflowRunId
    }),
  generateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user

      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
        body: { userId, videoId: input.id }, 
      }) 

      return workflowRunId
    }),
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // 输入验证规则，确保id是字符串
    .mutation(async ({ ctx, input }) => {
      const {id: userId} = ctx.user
      
      const [exitingVideo] = await db
        .select()
        .from(videos)
        .where(and(
          eq(videos.id, input.id), // 确保查询的是指定的视频
          eq(videos.userId, userId) // 确保用户只能操作自己的视频
        ))
      if(!exitingVideo) throw new TRPCError({ code: 'NOT_FOUND' })

      if (exitingVideo.thumbnailKey) {
        const utApi = new UTApi(); 
        await utApi.deleteFiles(exitingVideo.thumbnailKey); // 清除uploadthing旧的thumbnail
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null }) // 清除数据库中旧的thumbnail
          .where(
            and(
              eq(videos.id, input.id),
              eq(videos.userId, userId)
            )
          );
      }

      if(!exitingVideo.muxPlaybackId) throw new TRPCError({ code: 'BAD_REQUEST' })

      const tempThumbnailUrl = `https://image.mux.com/${exitingVideo.muxPlaybackId}/thumbnail.jpg`

      const utApi = new UTApi(); 
      const uploadThumbnail = await utApi.uploadFilesFromUrl(tempThumbnailUrl)
      if(!uploadThumbnail.data) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })
      }
      const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadThumbnail.data
    
      const [updateVideo] = await db
        .update(videos)
        .set({ thumbnailUrl, thumbnailKey })
        .where(and(
          eq(videos.id, input.id), // 确保更新的是指定的视频
          eq(videos.userId, userId) // 确保用户只能更新自己的视频
        ))
        .returning()
      
      return updateVideo
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // 输入验证规则，确保id是字符串
    .mutation(async ({ ctx, input }) => {
      const {id: userId} = ctx.user

      const [removedVideo] = await db
        .delete(videos)
        .where(and(
          eq(videos.id, input.id), // 确保删除的是指定的视频
          eq(videos.userId, userId) // 确保用户只能删除自己的视频
        ))
        .returning()
      if(!removedVideo) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

    return removedVideo
    }), 
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

      return updatedVideo
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