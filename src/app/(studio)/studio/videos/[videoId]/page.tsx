import {HydrateClient, trpc} from '@/trpc/server';

import {VideoView} from '@/modules/studio/ui/views/video-view';

export const dynamic = 'force-dynamic'; // 强制动态渲染

interface VideoIdPageProps {
  params: Promise<{videoId: string}>;
}

const Page = async ({ params }: VideoIdPageProps) => {
  const { videoId } = await params;

  void trpc.studio.getOne.prefetch({ id: videoId });

  return (
    <HydrateClient>
      <VideoView videoId = {videoId} />
    </HydrateClient>
  )
}

export default Page;