"use client";

import {toast} from 'sonner'
import {Loader2Icon, PlusIcon} from 'lucide-react';
import {useRouter} from 'next/navigation';

import {trpc} from "@/trpc/client"

import {Button} from '@/components/ui/button';
import { ResponsiveModal } from '@/components/responsive-modal'
import { StudioUploader } from './studio-uploader';

export const StudioUploadModal = () => {
  const utils = trpc.useUtils()
  const router = useRouter()

  // create是一个mutation对象
  // useMutation 处理数据写操作（create、update、delete）等的Hook
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success('Video created')
      utils.studio.getMany.invalidate() // 使utils.studio.getMany这个查询缓存失效，强制获取最新数据
    },
    onError: (err) => {
      toast.error(err.message)
    }
  });

  const onSuccess = () => {
    if(!create.data?.video.id)  return

    create.reset() // 重置mutation状态
    router.push(`/studio/videos/${create.data.video.id}`) // 跳转到新创建的视频详情页
  }

  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        open={!!create.data?.url} // create.data 是 mutation 返回的数据（比如服务器创建后返回的新视频）
        onOpenChange={() => {create.reset()}} // 关闭时重置mutation状态
      >
        {create.data?.url 
          ? <StudioUploader
              endpoint={create.data.url} 
              onSuccess={onSuccess}
            /> 
          : <Loader2Icon />
        }
      </ResponsiveModal>
      {/* create.isPending 是否请求中，是否正在mutation */}
      <Button
        variant="secondary"
        onClick={() => create.mutate()} // 触发mutation，提交请求
        disabled={create.isPending}
      >
        {create.isPending ? <Loader2Icon className='animate-spin' /> : <PlusIcon />}
        Create
      </Button>
    </>
  )
}