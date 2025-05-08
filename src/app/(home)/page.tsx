import {HydrateClient, trpc} from '@/trpc/server';
import {HomeView} from '@/modules/home/ui/views/home-view';

// 动态渲染 dynamic rendering
// 强制每次都获取实时数据
export const dynamic = 'force-dynamic'; 

// Next.js 13+中app目录下的searchParams，是从 URL 中自动解析出来的
interface PageProps {
  searchParams: Promise<{
    categoryId?: string; // 可选参数
  }>
}

const Page = async ({searchParams}: PageProps) => {
  const {categoryId} = await searchParams;
 
  void trpc.categories.getMany.prefetch(); 

  return (
    <div>
      <HydrateClient>
        <HomeView categoryId={categoryId}/>
      </HydrateClient>
    </div>
  );
}

export default Page;
