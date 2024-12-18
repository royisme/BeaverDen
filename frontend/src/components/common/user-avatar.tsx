// components/common/user-avatar.tsx
import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { User } from '@/types/user'

interface UserAvatarProps {
  user: User
  className?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, className }) => {
  const label = user.nickname || user.username
  return (
    <Avatar className={className}>
      <AvatarImage src={user.avatar_path} alt={label} />
      <AvatarFallback>{label.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}