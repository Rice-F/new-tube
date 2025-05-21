import { DEFAULT_LIMIT } from '@/constants';
import {HydrateClient, trpc} from '@/trpc/server';

import {StudioView} from '@/modules/studio/ui/views/studio-view';

const Page = async () => {
  // 无限加载场景通常使用 prefetchInfinite
  void trpc.studio.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT,
  });
  return (
    <HydrateClient>
      <StudioView />  
    </HydrateClient>
  )
}

export default Page;