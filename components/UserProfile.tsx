'use client'

import { useState } from 'react'
import { getUserAvatar, avatarColorSchemes } from '@/lib/avatar'
import { User, Edit3, Crown, Trophy, Calendar } from 'lucide-react'

interface UserProfileProps {
  user: {
    id: string
    email: string
    username: string
    name: string
    gamesPlayedThisMonth: number
    subscriptionStatus: string | null
    createdAt?: string
  }
  onClose?: () => void
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  const [selectedColorScheme, setSelectedColorScheme] = useState('blue')

  const hasSubscription = user.subscriptionStatus === 'active'
  const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold text-gray-900">Profile</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Avatar Section */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <img
            src={getUserAvatar(user.name, 96)}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-blue-200 shadow-lg"
          />
          {hasSubscription && (
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
              <Crown className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mt-3">{user.name}</h3>
        <p className="text-gray-600">@{user.username}</p>
        
        {hasSubscription && (
          <div className="inline-flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium mt-2">
            <Crown className="w-3 h-3 mr-1" />
            Premium Member
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Trophy className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-900">{user.gamesPlayedThisMonth}</div>
          <div className="text-sm text-blue-600">Games This Month</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-green-900">Member Since</div>
          <div className="text-sm text-green-600">{memberSince}</div>
        </div>
      </div>

      {/* Avatar Color Schemes */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Avatar Style</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(avatarColorSchemes).map(([key, scheme]) => (
            <button
              key={key}
              onClick={() => setSelectedColorScheme(key)}
              className={`relative rounded-lg p-2 border-2 transition-colors ${
                selectedColorScheme === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=32&background=${scheme.background}&color=${scheme.color}&rounded=true&bold=true`}
                alt={`${key} style`}
                className="w-8 h-8 rounded-full mx-auto"
              />
              <div className="text-xs text-gray-600 mt-1 capitalize">{key}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Email</span>
          <span className="text-gray-900">{user.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Username</span>
          <span className="text-gray-900">@{user.username}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Account Type</span>
          <span className={`font-medium ${hasSubscription ? 'text-amber-600' : 'text-gray-600'}`}>
            {hasSubscription ? 'Premium' : 'Free'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-2">
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
          <Edit3 className="w-4 h-4 mr-2" />
          Edit Profile
        </button>
        
        {!hasSubscription && (
          <button className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </button>
        )}
      </div>
    </div>
  )
}