'use client'

import {cn} from '@/lib/utils';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import {Badge} from '@/components/ui/badge';

interface FilterCarouselProps {
  value?: string | null;
  isLoading?: boolean;
  onSelect?: (value: string) => void;
  data?: {
    value: string;
    label: string;
  }[];
}

export const FilterCarousel = ({
  value,
  isLoading,
  onSelect,
  data,
}: FilterCarouselProps) => {
  return (
    <div className='relative w-full'>
      {/* Left Fade */}
      <div
        className={cn(
          'absolute left-12 top-0 bottom-0 z-1 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none',
          false && 'hidden'
        )}
      ></div>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className='w-full px-12'
      >
        <CarouselContent className='-ml-3'>
          {/* All */}
          <CarouselItem className='pl-3 basis-auto'>
            <Badge
              variant={value === null ? "default" : "secondary"}
              className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
            >All</Badge>
          </CarouselItem>
          {/* Other */}
          {!isLoading && data?.map(item => (
            <CarouselItem key={item.value} className='pl-3 basis-auto'>
              <Badge
                variant={value === item.value ? "default" : "secondary"}
                className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
              >
                {item.label}
              </Badge>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-0 z-20'/>
        <CarouselNext className='right-0 z-20'/>
      </Carousel>
      {/* Right Fade */}
      <div
        className={cn(
          'absolute right-12 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none',
          false && 'hidden'
        )}
      ></div>
    </div>
  )
}