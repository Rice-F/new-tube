import {categoriesRouter} from '@/modules/categories/server/procedures';
import {studioRouter} from '@/modules/studio/server/procedures';
import { videosRouter } from '@/modules/videos/server/procedures';

import {createTRPCRouter } from '../init';

// trpc主路由
export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  studio: studioRouter,
  videos: videosRouter
});

export type AppRouter = typeof appRouter;