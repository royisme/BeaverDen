// components/common/user-avatar.tsx
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from '@/types/user'
import { generateRandomAvatarPath } from '@/lib/utils'
interface UserAvatarProps {
  user: User
  className?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, className }) => {
  const label = user.nickname || user.username
  const avatarPath = user.avatarPath || generateRandomAvatarPath(user.username)
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarPath} />
      <AvatarFallback>{label.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}