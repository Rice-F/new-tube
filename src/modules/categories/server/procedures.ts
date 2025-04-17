import {db} from '@/db'
import {categories} from '@/db/schema'
import { baseProcedure, createTRPCRouter } from '@/trpc/init'

export const categoriesRouter = createTRPCRouter({
  // 无参数查询
  getMany: baseProcedure.query(async () => {
    const data = await db
      .select()
      .from(categories)
    return data
  })
})