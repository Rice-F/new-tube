'use client'

import { trpc } from '@/trpc/client'

import {Suspense, useState} from 'react'
import { ErrorBoundary } from 'react-error-boundary';

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  CopyCheckIcon, 
  CopyIcon, 
  Globe2Icon,
  ImagePlusIcon,
  Loader2Icon,
  LockIcon,
  MoreVerticalIcon, 
  RotateCcwIcon,
  SparklesIcon,
  TrashIcon 
} from 'lucide-react';

import { toast } from 'sonner'

import { snakeCaseToTitle } from '@/lib/utils';

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Form, 
  FormControl,
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage 
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton';

import { ThumbnailUploadModal } from '../components/thumbnail-upload-modal';
import { ThumbnailGenerateModal } from '../components/thumbnail-generate-modal';

import { videosUpdateSchema } from '@/db/schema';

import { VideoPlayer } from '@/modules/videos/ui/components/video-player'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants'

interface FormSectionProps {
  videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error</p>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  )
}

export const FormSectionSkeleton = () => {
  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div className='space-y-2'>
          <Skeleton className='h-7 w-32' />
          <Skeleton className='h-4 w-40' />
        </div>
        <Skeleton className='h-9 w-24' />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'> 
        {/* left */}
        <div className='space-y-8 lg:col-span-3'>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-24' />
            <Skeleton className='h-[220px] w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-[84px] w-[153px]' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
        {/* right */}
        <div className='flex flex-col gap-y-8 lg:col-span-2'>
          <div className='flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden'>
            <Skeleton className='aspect-video' />
            <div className='px-4 py-4 space-y-6'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-5 w-32' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-5 w-32' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-5 w-32' />
              </div>
            </div>
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>
      </div>
    </div>
  )
}

export const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const utils = trpc.useUtils()
  const router = useRouter()

  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId })
  const [categories] = trpc.categories.getMany.useSuspenseQuery()

  const [thumbnailUploadModalOpen, setThumbnailUploadModalOpen] = useState(false)
  const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] = useState(false)
  
  // 更新视频信息
  const update = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate() // 更新成功后，重新获取视频列表
      utils.studio.getOne.invalidate({ id: videoId }) // 更新成功后，重新获取当前视频详情
      toast.success('Video updated successfully')
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  // generate title
  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success('Title generation started', { description: 'This may take a while.' })
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  // generate description
  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success('Description generation started', { description: 'This may take a while.' })
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  // restore thumbnail
  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate() // 更新成功后，重新获取视频列表
      utils.studio.getOne.invalidate({ id: videoId }) // 更新成功后，重新获取当前视频详情
      toast.success('Thumbnail restored')
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  // 删除当前视频
  const remove = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate() // 更新成功后，重新获取视频列表
      toast.success('Video removed')
      router.push('/studio') // 删除成功后，跳转到视频列表页
    },
    onError: () => {
      toast.error('Something went wrong')
    }
  })

  const form = useForm<z.infer<typeof videosUpdateSchema>>({
    resolver: zodResolver(videosUpdateSchema), // 使用videosUpdateSchema验证模式作为表单验证规则
    defaultValues: video // 表单默认值
  })

  const onSubmit = (data: z.infer<typeof videosUpdateSchema>) => {
    update.mutateAsync(data)  // 异步触发函数，返回promise
  }

  const fullUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/videos/${video.id}`

  const [isCopied, setIsCopied] = useState(false)

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }
    , 2000)
  }

  return (
    <>
      <ThumbnailGenerateModal 
        open={ thumbnailGenerateModalOpen }
        videoId={video.id}
        onOpenChange={ setThumbnailGenerateModalOpen }
      />
      <ThumbnailUploadModal 
        open={thumbnailUploadModalOpen}
        videoId={video.id}
        onOpenChange={setThumbnailUploadModalOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* header */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-2xl font-bold'>Video details</h1>
              <p className='text-xs text-muted-foreground'>Manage your video details</p>
            </div>
            <div className='flex items-center gap-x-2'>
              <Button type='submit' disabled={update.isPending || !form.formState.isDirty}>Save</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size="icon">
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => remove.mutate({ id: video.id })}>
                    <TrashIcon className='size-4 mr-2' />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
            {/* left */}
            <div className='space-y-8 lg:col-span-3'>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                    <div className='flex items-center gap-x-2'>
                      Title
                      <Button
                        size="icon"
                        variant="outline"
                        type="button"
                        className='rounded-full size-6 [&_svg]:size-3'
                        onClick={ () => generateTitle.mutate({ id: videoId}) }
                        disabled={ generateTitle.isPending || !video.muxTrackId }
                      >
                        { generateTitle.isPending
                            ? <Loader2Icon className='animate-spin'/>
                            : <SparklesIcon />
                        }
                      </Button>
                    </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Add a title to your video' 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className='flex items-center gap-x-2'>
                        Description
                        <Button
                          size="icon"
                          variant="outline"
                          type="button"
                          className='rounded-full size-6 [&_svg]:size-3'
                          onClick={ () => generateDescription.mutate({ id: videoId}) }
                          disabled={ generateDescription.isPending || !video.muxTrackId}
                        >
                          { generateDescription.isPending
                              ? <Loader2Icon className='animate-spin'/>
                              : <SparklesIcon />
                          }
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value ?? ''}
                        rows={10}
                        className='resize-none pr-10 h-60' 
                        placeholder='Add a description to your video' 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField 
                control={form.control}
                name="thumbnailUrl"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className='p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group duration-300 size-7'>
                        <Image 
                          src={video.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                          fill
                          sizes='153px'
                          alt='Thumbnail'
                          className='object-cover'
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className='bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100'
                            >
                              <MoreVerticalIcon className='text-white' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side='right'>
                            <DropdownMenuItem onClick={() => setThumbnailUploadModalOpen(true)}>
                              <ImagePlusIcon className='size-4 mr-1' />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setThumbnailGenerateModalOpen(true)}>
                              <SparklesIcon className='size-4 mr-1' />
                              AI-generated
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => restoreThumbnail.mutate({ id: video.id })}>
                              <RotateCcwIcon className='size-4 mr-1' />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select a category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* right */}
            <div className='flex flex-col gap-y-8 lg:col-span-2'>
              <div className='flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit'>
                <div className='aspect-video overflow-hidden relative'>
                  <VideoPlayer 
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className='p-4 flex flex-col gap-y-6'>
                  <div className='flex justify-between items-center gap-x-2'>
                    <div className='flex flex-col gap-y-1'>
                      <p className='text-muted-foreground text-xs'>Video link</p>
                      <div className='flex items-center gap-x-2'>
                        <Link href={`/videos/${video.id}`}>
                          <p className='line-clamp-1 text-sm text-blue-500'>
                            { fullUrl }
                          </p>
                        </Link>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='shrink-0'
                          onClick={onCopy}
                          disabled={isCopied}
                        >
                          {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-y-1'>
                      <p className='text-muted-foreground text-xs'>Video status</p>
                      <p className='text-sm'>{snakeCaseToTitle(video.muxStatus || 'preparing')}</p>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-y-1'>
                      <p className='text-muted-foreground text-xs'>Subtitles status</p>
                      <p className='text-sm'>{snakeCaseToTitle(video.muxTrackStatus || 'no_ subtitles')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select visibility' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <div className="flex item">
                            <Globe2Icon className='size-4 mr-2' />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <LockIcon className='size-4 mr-2' />
                            Private
                          </div>
                        </SelectItem> 
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  )
}