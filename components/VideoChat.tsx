'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Video, VideoOff, Phone } from 'lucide-react'

interface VideoChatProps {
  roomUrl: string
  onLeave: () => void
}

export default function VideoChat({ roomUrl, onLeave }: VideoChatProps) {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const callFrameRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const initializeDaily = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const DailyIframe = (await import('@daily-co/daily-js')).default
        
        if (containerRef.current) {
          callFrameRef.current = DailyIframe.createFrame(containerRef.current, {
            iframeStyle: {
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '12px',
            },
            showLeaveButton: false,
            showFullscreenButton: false,
          })

          callFrameRef.current
            .on('joined-meeting', () => setIsConnected(true))
            .on('left-meeting', () => {
              setIsConnected(false)
              onLeave()
            })
            .on('error', (error: any) => {
              console.error('Daily error:', error)
            })

          await callFrameRef.current.join({ url: roomUrl })
        }
      } catch (error) {
        console.error('Failed to initialize video chat:', error)
      }
    }

    initializeDaily()

    return () => {
      if (callFrameRef.current) {
        callFrameRef.current.destroy()
      }
    }
  }, [roomUrl, onLeave])

  const toggleVideo = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalVideo(!isVideoOn)
      setIsVideoOn(!isVideoOn)
    }
  }

  const toggleAudio = () => {
    if (callFrameRef.current) {
      callFrameRef.current.setLocalAudio(!isAudioOn)
      setIsAudioOn(!isAudioOn)
    }
  }

  const leaveCall = () => {
    if (callFrameRef.current) {
      callFrameRef.current.leave()
    }
  }

  return (
    <div className="video-container bg-gray-900 relative">
      <div ref={containerRef} className="w-full h-64" />
      
      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <button
          onClick={toggleAudio}
          className={`p-2 rounded-full ${
            isAudioOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {isAudioOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-2 rounded-full ${
            isVideoOn ? 'bg-gray-700 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        
        <button
          onClick={leaveCall}
          className="p-2 rounded-full bg-red-600 text-white"
        >
          <Phone size={20} />
        </button>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Connecting to video chat...</p>
          </div>
        </div>
      )}
    </div>
  )
}