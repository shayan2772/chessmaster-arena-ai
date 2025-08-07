'use client'

import { useEffect, useState } from 'react'
import { Settings, Save } from 'lucide-react'

export default function AdminConfigPage() {
  const [config, setConfig] = useState({
    freeGamesPerMonth: 1,
    subscriptionEnabled: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage('')
    
    try {
      // Note: This would need a PUT endpoint to actually save changes
      // For now, just show current environment variable values
      setMessage('⚠️ To change these values, update your .env file and restart the server')
    } catch (error) {
      setMessage('❌ Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Settings className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Admin Configuration</h1>
          </div>

          <div className="space-y-6">
            {/* Free Games Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Free Games Per Month
              </label>
              <input
                type="number"
                min="0"
                value={config.freeGamesPerMonth}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  freeGamesPerMonth: parseInt(e.target.value) || 0 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-600 mt-1">
                Number of free games users can play per month before requiring subscription
              </p>
            </div>

            {/* Subscription Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription System
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.subscriptionEnabled}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    subscriptionEnabled: e.target.checked 
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled
                />
                <span className="ml-2 text-sm text-gray-700">
                  Enable subscription system (requires Stripe configuration)
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {config.subscriptionEnabled 
                  ? '✅ Stripe is configured and subscriptions are enabled'
                  : '⚠️ Stripe not configured - subscriptions disabled'
                }
              </p>
            </div>

            {/* Current Environment Variables */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Environment Variables:</h3>
              <div className="space-y-1 text-sm font-mono">
                <div>FREE_GAMES_PER_MONTH = {config.freeGamesPerMonth}</div>
                <div>STRIPE_SECRET_KEY = {config.subscriptionEnabled ? 'configured' : 'not set'}</div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
              
              <a 
                href="/dashboard" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Back to Dashboard
              </a>
            </div>

            {/* Message */}
            {message && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">{message}</p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">💡 How to Change Configuration:</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Update the <code className="bg-blue-100 px-1 rounded">.env</code> file in your project root</li>
              <li>Change <code className="bg-blue-100 px-1 rounded">FREE_GAMES_PER_MONTH=1</code> to your desired value</li>
              <li>Restart the server with <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
              <li>Changes will take effect immediately</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}