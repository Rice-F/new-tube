'use client'

import {trpc} from '@/trpc/client';

export const PageClient = () => {
  // useSuspenseQuery 是一个hook，配合<Suspense></Suspense>使用
  // useSuspenseQuery 只能在客户端组件使用
  // useSuspenseQuery 是react query的Suspense版的查询函数
  // react query的useQuery 是异步的，useSuspenseQuery 是同步的
  const [data] = trpc.hello.useSuspenseQuery({text: 'prefetch data'});

  return (
    <div>Page Client: {data.greeting}</div>
  )
}