'use client'

import {trpc} from '@/trpc/client'
import { DEFAULT_LIMIT } from '@/constants';
import {Suspense} from 'react'
import { ErrorBoundary } from 'react-error-boundary';
import { InfiniteScroll } from '@/components/infinite-scroll';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import Link from 'next/link'

import { VideoThumbnail } from '@/modules/videos/ui/components/video-thumbnail'

export const VideosSection = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <VideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  )
}

const VideosSectionSuspense = () => {

  const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
    // 接口定义的参数
    {
      limit: DEFAULT_LIMIT,
    },
    // React Query的配置项
    // lastPage 指返回的分页数据
    // nextCursor 下一次分页请求需要发送的标记
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      <div>
        <div className='border-y'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='pl-6 w-[510px]'>Video</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className='text-right'>Views</TableHead>
                <TableHead className='text-right'>Comments</TableHead>
                <TableHead className='text-right pr-6'>Likes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.pages.flatMap(page => page.items).map(video => (
                <Link
                  href={`/studio/videos/${video.id}`}
                  key={video.id}
                  legacyBehavior // 启用旧版行为实现跳转，无法使用asChild，因为TableRow不能使用ref
                >
                  <TableRow
                    className='cursor-pointer'
                    key={video.id}
                  >
                    <TableCell>
                      <div className='flex items-center gap-4'>
                        <div className='relative aspect-video w-36 shrink-0'>
                          <VideoThumbnail
                            imageUrl={video.thumbnailUrl} 
                            previewUrl={video.previewUrl}
                            title={video.title}
                            duration={video.duration || 0}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </Link>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <InfiniteScroll
        hasNextPage = {query.hasNextPage}
        isFetchingNextPage = {query.isFetchingNextPage}
        fetchNextPage = {query.fetchNextPage}
      />
    </div>
  )
}