'use client'

import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary';

import { Skeleton } from '@/components/ui/skeleton';
import { VideoPlayer } from '../components/video-player';
import { VideoBanner } from '../components/video-banner';

import { trpc } from '@/trpc/client'

import { cn } from '@/lib/utils'

interface VideoSectionProps {
  videoId: string;
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={ <VideoSectionSkeleton /> }>
      <ErrorBoundary fallback={ <p>Error</p> }>
        <VideoSectionSuspense videoId={ videoId } />
      </ErrorBoundary>
    </Suspense>
  )
}

export const VideoSectionSkeleton = () => {
  return (
    <div></div>
  )
}

export const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId })

  return <>
    {/* aspect-video 保持视频宽高比 */}
    {/* cn() 动态样式 */}
    <div className={cn(
      'aspect-video bg-black rounded-lg overflow-hidden relative',
      video.muxStatus !== 'ready' && 'rounded-b-none'
    )}>
      <VideoPlayer
        playbackId={video.muxPlaybackId}
        thumbnailUrl={video.thumbnailUrl}
        autoPlay
        onPlay={() => {
          // 这里可以添加播放事件的处理逻辑
          console.log('Video is playing')
        }}
      />
    </div>
    <VideoBanner status={video.muxStatus} />
  </>
}