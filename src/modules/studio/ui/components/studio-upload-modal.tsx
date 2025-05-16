"use client";

import {toast} from 'sonner'
import {Button} from '@/components/ui/button';
import {Loader2Icon, PlusIcon} from 'lucide-react';

import {trpc} from "@/trpc/client"

export const StudioUploadModal = () => {
  const utils = trpc.useUtils()

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
    <Button
      variant="secondary"
      onClick={() => create.mutate()} // 触发mutation
      disabled={create.isPending}
    >
      {create.isPending ? <Loader2Icon className='animate-spin' /> : <PlusIcon />}
      Create
    </Button>
  )
}