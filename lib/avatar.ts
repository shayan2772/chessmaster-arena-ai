// Avatar generation utilities using UI Avatars service

export interface AvatarOptions {
  name: string
  size?: number
  background?: string
  color?: string
  rounded?: boolean
  bold?: boolean
  format?: 'svg' | 'png'
}

export function generateAvatarUrl(options: AvatarOptions): string {
  const {
    name,
    size = 128,
    background = '3B82F6', // Blue-500
    color = 'FFFFFF', // White
    rounded = true,
    bold = true,
    format = 'svg'
  } = options

  // Extract first name or use full name if single word
  const displayName = getDisplayName(name)
  
  const params = new URLSearchParams({
    name: displayName,
    size: size.toString(),
    background: background.replace('#', ''),
    color: color.replace('#', ''),
    format,
    ...(rounded && { rounded: 'true' }),
    ...(bold && { bold: 'true' }),
  })

  return `https://ui-avatars.com/api/?${params.toString()}`
}

export function getDisplayName(fullName: string): string {
  if (!fullName) return 'User'
  
  // Split name and take first name, or first two words if available
  const nameParts = fullName.trim().split(' ')
  
  if (nameParts.length === 1) {
    return nameParts[0]
  }
  
  // Use first name + last initial if available
  if (nameParts.length >= 2) {
    return `${nameParts[0]} ${nameParts[1].charAt(0)}`
  }
  
  return nameParts[0]
}

// Predefined color schemes for different player types
export const avatarColorSchemes = {
  white: {
    background: 'F3F4F6', // Gray-100
    color: '1F2937', // Gray-800
  },
  black: {
    background: '1F2937', // Gray-800
    color: 'F9FAFB', // Gray-50
  },
  blue: {
    background: '3B82F6', // Blue-500
    color: 'FFFFFF',
  },
  green: {
    background: '10B981', // Emerald-500
    color: 'FFFFFF',
  },
  purple: {
    background: '8B5CF6', // Violet-500
    color: 'FFFFFF',
  },
  orange: {
    background: 'F59E0B', // Amber-500
    color: 'FFFFFF',
  },
}

export function getPlayerAvatar(
  name: string, 
  playerColor: 'white' | 'black', 
  size: number = 64
): string {
  const colorScheme = avatarColorSchemes[playerColor]
  
  return generateAvatarUrl({
    name,
    size,
    background: colorScheme.background,
    color: colorScheme.color,
    rounded: true,
    bold: true,
  })
}

export function getUserAvatar(name: string, size: number = 64): string {
  return generateAvatarUrl({
    name,
    size,
    background: avatarColorSchemes.blue.background,
    color: avatarColorSchemes.blue.color,
    rounded: true,
    bold: true,
  })
}