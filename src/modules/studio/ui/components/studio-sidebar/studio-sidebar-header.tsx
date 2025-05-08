import {useUser} from '@clerk/nextjs'

import {SidebarHeader} from '@/components/ui/sidebar'
import Link from 'next/link'
import {UserAvatar} from '@/components/user-avatar'

export const StudioSidebarHeader = () => {
  const {user} = useUser();

  if(!user) return null;

  return (
    <SidebarHeader className='flex items-center justify-center pb-4'>
      <Link href="/users/current">
        <UserAvatar
          imageUrl={user?.imageUrl || ''}
          name={user?.fullName || ''}
          size="lg"
          className="size-[112px] hover:opacity-80 transition-opacity"
        />
      </Link>
    </SidebarHeader>
  )
}