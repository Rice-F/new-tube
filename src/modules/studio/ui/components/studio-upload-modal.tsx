"use client";

import {toast} from 'sonner'
import {Loader2Icon, PlusIcon} from 'lucide-react';

import {trpc} from "@/trpc/client"
import {Button} from '@/components/ui/button';
import { ResponsiveModal } from '@/components/responsive-modal'

export const StudioUploadModal = () => {
  const utils = trpc.useUtils()

  // create是一个mutation对象
  // useMutation 处理数据写操作（create、update、delete）等的Hook
  const create = trpc.videos.create.useMutation({
    onSuccess: () => {
      toast.success('Video created')
      utils.studio.getMany.invalidate() // 使studio.getMany缓存失效，强制获取最新数据
    },
    onError: (err) => {
      toast.error(err.message)
    }
  });

  return (
    <>
      <ResponsiveModal
        title="Upload a video"
        open={!!create.data} // create.data 是 mutation 返回的数据（比如服务器创建后返回的新视频）
        onOpenChange={() => {create.reset()}} // 关闭时重置mutation状态
      >
        <p>this is upload</p>
      </ResponsiveModal>
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