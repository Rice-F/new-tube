import {eq, and, or, lt, desc} from 'drizzle-orm'
import {z} from 'zod'

import {db} from '@/db'
import {videos} from '@/db/schema'
import { protectedProcedure, createTRPCRouter } from '@/trpc/init'
import { TRPCError } from '@trpc/server'

export const studioRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      z.object({
        // 视频id，必须是uuid格式
        id: z.string().uuid(),
      })
    )
    .query(async ({ctx, input}) => {
      const {id: userId} = ctx.user
      const {id} = input

      const [video] = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.id, id), // 视频id
            eq(videos.userId, userId) // 只查询当前用户的视频
          )
        )

      if (!video) {
        throw new TRPCError({ code: 'NOT_FOUND'})
      }

      return video
    }),
  getMany: protectedProcedure
    // 接口参数，使用zod进行验证
    .input(
      z.object({
        // 可选游标参数，上一次的最后一条数据，首次请求可不传
        cursor: 
          z.object({ 
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(),
        // 每页数据条数限制
        limit: z.number().min(1).max(100), 
      })
    )
    .query(async ({ctx, input}) => { 
      const {cursor, limit} = input
      const {id: userId} = ctx.user
      // const userId = '5e4cc060-3571-4c53-9bf7-8597a71311ac'

      const data = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId), // 只查询当前用户的视频
            cursor ? or(
              lt(videos.updatedAt, cursor.updatedAt), // 如果有游标参数，则查询比游标参数更新的记录
              and(
                eq(videos.updatedAt, cursor.updatedAt), // 如果更新时间相同，则查询id小于游标参数的记录
                lt(videos.id, cursor.id) 
              )
            ) : undefined,
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id)) // 按照更新时间和id降序排列，也就是最新的视频在前面
        .limit(limit + 1) // 多取一条数据，用于判断是否还有下一页

        const hasMore = data.length > limit // 判断是否还有下一页
        const items = hasMore ? data.slice(0, -1) : data // 如果还有下一页，则去掉最后一条数据
        const lastItem = items[items.length - 1] // 获取最后一条数据，用于生成下一页的游标
        // 生成下一页的cursor
        const nextCursor = hasMore ? { 
          id: lastItem.id,
          updatedAt: lastItem.updatedAt,
        } : null

      return {
        items,
        nextCursor, // 是一个对象，包含了id和updatedAt两个字段
        
      }
    })
})