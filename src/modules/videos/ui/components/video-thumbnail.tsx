import Image from 'next/image'
import { formatDuration } from '@/lib/utils'

interface VideoThumbnailProps {
  imageUrl?: string | null,
  previewUrl?: string | null,
  title: string,
  duration: number,
}

export const VideoThumbnail = ({
  imageUrl,
  previewUrl,
  title,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      {/* wrapper */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        {/* 缩略图 */}
        <Image
          src={imageUrl ?? "/placeholder.svg"}
          alt={title}
          fill 
          className='h-full w-full object-cover group-hover:opacity-0'
        />
        {/* 预览gif */}
        <Image
          src={previewUrl ?? "/placeholder.svg"}
          alt={title}
          unoptimized // gif
          fill 
          className='h-full w-full object-cover opacity-0 group-hover:opacity-100'
        />
      </div>

      {/* video duration */}
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
        {formatDuration(duration)}
      </div>
    </div>
  )
}