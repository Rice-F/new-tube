'use client'

import { trpc } from '@/trpc/client'

import {Suspense} from 'react'
import { ErrorBoundary } from 'react-error-boundary';

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { MoreVerticalIcon, TrashIcon } from 'lucide-react';

import { toast } from 'sonner'

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

import { videosUpdateSchema } from '@/db/schema';

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
  return <></>
}

export const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const utils = trpc.useUtils()
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId })
  const [categories] = trpc.categories.getMany.useSuspenseQuery()
  
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

  const form = useForm<z.infer<typeof videosUpdateSchema>>({
    resolver: zodResolver(videosUpdateSchema), // 使用videosUpdateSchema验证模式作为表单验证规则
    defaultValues: video
  })

  const onSubmit = (data: z.infer<typeof videosUpdateSchema>) => {
    update.mutateAsync(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold'>Video details</h1>
            <p className='text-xs text-muted-foreground'>Manage your video details</p>
          </div>
          <div className='flex items-center gap-x-2'>
            <Button type='submit' disabled={update.isPending}>Save</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size="icon">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <TrashIcon className='size-4 mr-2' />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
          <div className='space-y-8 lg:col-span-3'>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value ?? ''}
                      rows={10}
                      className='resize-none pr-10' 
                      placeholder='Add a description to your video' 
                    />
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
        </div>
      </form>
    </Form>
  )
}