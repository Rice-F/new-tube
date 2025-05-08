'use client'

import {trpc} from '@/trpc/client'

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useRouter } from 'next/navigation';

import { FilterCarousel } from '@/components/filter-carousel';

interface CategoriesSectionProps {
  categoryId?: string;
}

export const CategoriesSection = ({categoryId}: CategoriesSectionProps) => {
  return (
    // fallback 是加载时的占位符
    <Suspense fallback={<CategoriesSkeleton/>}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <CategoriesSectionSuspense categoryId={categoryId}/>
      </ErrorBoundary>
    </Suspense>
  )
}

// isLoading 等价于 isLoading={true}
const CategoriesSkeleton = () => {
  return <FilterCarousel isLoading onSelect={() => {}} data={[]}/>
}

const CategoriesSectionSuspense = ({categoryId}: CategoriesSectionProps) => {
  const router = useRouter();
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const data = categories.map(({name, id}) => (
    {
      value: id,
      label: name,
    }
  ))

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);

    if(value) {
      url.searchParams.set('categoryId', value);
    }else {
      url.searchParams.delete('categoryId');
    }

    router.push(url.toString());
  }

  return <FilterCarousel onSelect={onSelect} value={categoryId} data={data}/>
}