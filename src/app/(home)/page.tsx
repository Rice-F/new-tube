import {HydrateClient, trpc} from '@/trpc/server';
import { PageClient } from './client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export default async function Home() {
  // prefetch hello接口的数据
  // void 是为了忽略 Promise 返回值（因为我们只是想执行它，不 care 结果）
  // 这一步发生在SSR-服务器渲染阶段
  void trpc.hello.prefetch({text: 'prefetch data'}); 

  // HydrateClient 组件会在客户端渲染时将服务器端的缓存数据传递给客户端
  // Suspense搭配react query的useSuspenseQuery使用，加载中用fallback，加载后一次性渲染<PageClient/>
  return (
    <div>
      <HydrateClient>
        <Suspense fallback={<p>Loading...</p>}>
          <ErrorBoundary fallback={<p>Something went wrong</p>}>
            <PageClient/> 
          </ErrorBoundary>
        </Suspense>
      </HydrateClient>
    </div>
  );
}
