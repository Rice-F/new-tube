import {categoriesRouter} from '@/modules/categories/server/procedures';

import {createTRPCRouter } from '../init';

// trpc主路由
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;