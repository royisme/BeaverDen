// components/layout/user-profile.tsx
import React from 'react'
import { UserAvatar } from '@/components/common/user-avatar'
import type { User } from '@/types/user'

interface UserProfileProps {
  user: User
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <UserAvatar user={user} className="bg-gray-400" />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.nickname || user.username}</span>
        <span className="text-xs text-muted-foreground capitalize">{user.accountStatus}</span>
      </div>
    </div>
  )
}
