'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Video, VideoOff, Phone, Users } from 'lucide-react'

interface SimpleVideoChatProps {
  socket: any
  roomId: string
  userId: string
  onLeave: () => void
}

export default function SimpleVideoChat({ socket, roomId, userId, onLeave }: SimpleVideoChatProps) {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('Initializing...')
  const [remoteUserConnected, setRemoteUserConnected] = useState(false)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    initializeVideo()
    
    return () => {
      cleanup()
    }
  }, [socket, roomId, userId])

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  const initializeVideo = async () => {
    try {
      console.log('🎥 Initializing video for user:', userId)
      setConnectionStatus('Getting camera access...')
      
      // Get local media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: true
      })
      
      localStreamRef.current = stream
      
      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
      
      console.log('📹 Local stream obtained')
      setConnectionStatus('Ready - Waiting for peer...')
      
      // Setup WebRTC
      setupWebRTC()
      
      // Setup socket listeners
      setupSocketListeners()
      
      // Notify room that we're ready
      socket.emit('video-ready', { roomId, userId })
      
    } catch (error) {
      console.error('❌ Failed to get camera access:', error)
      setConnectionStatus('Camera access denied')
    }
  }

  const setupWebRTC = () => {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    }
    
    peerConnectionRef.current = new RTCPeerConnection(config)
    const pc = peerConnectionRef.current
    
    // Add local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }
    
    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('📥 Received remote stream')
      const remoteStream = event.streams[0]
      remoteStreamRef.current = remoteStream
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
      
      setConnectionStatus('Video call active')
    }
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', {
          candidate: event.candidate,
          targetId: 'peer' // Simple peer targeting
        })
      }
    }
    
    // Connection state logging
    pc.onconnectionstatechange = () => {
      console.log('🔄 Connection state:', pc.connectionState)
    }
  }

  const setupSocketListeners = () => {
    socket.on('peer-joined', async (data: { peerId: string }) => {
      console.log('👥 Peer joined, creating offer')
      setRemoteUserConnected(true)
      setConnectionStatus('Peer joined - Connecting...')
      
      if (peerConnectionRef.current) {
        try {
          const offer = await peerConnectionRef.current.createOffer()
          await peerConnectionRef.current.setLocalDescription(offer)
          
          socket.emit('webrtc-offer', {
            offer,
            targetId: data.peerId
          })
        } catch (error) {
          console.error('❌ Error creating offer:', error)
        }
      }
    })
    
    socket.on('webrtc-offer', async (data: { offer: RTCSessionDescriptionInit, senderId: string }) => {
      console.log('📨 Received offer')
      setRemoteUserConnected(true)
      setConnectionStatus('Received offer - Answering...')
      
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(data.offer)
          const answer = await peerConnectionRef.current.createAnswer()
          await peerConnectionRef.current.setLocalDescription(answer)
          
          socket.emit('webrtc-answer', {
            answer,
            targetId: data.senderId
          })
        } catch (error) {
          console.error('❌ Error handling offer:', error)
        }
      }
    })
    
    socket.on('webrtc-answer', async (data: { answer: RTCSessionDescriptionInit }) => {
      console.log('📨 Received answer')
      
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(data.answer)
        } catch (error) {
          console.error('❌ Error handling answer:', error)
        }
      }
    })
    
    socket.on('webrtc-ice-candidate', async (data: { candidate: RTCIceCandidate }) => {
      console.log('🧊 Received ICE candidate')
      
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(data.candidate)
        } catch (error) {
          console.error('❌ Error adding ICE candidate:', error)
        }
      }
    })
    
    socket.on('peer-left', () => {
      console.log('👋 Peer left')
      setRemoteUserConnected(false)
      setConnectionStatus('Peer disconnected')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null
      }
    })
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
        setIsVideoOn(!isVideoOn)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn
        setIsAudioOn(!isAudioOn)
      }
    }
  }

  const leaveCall = () => {
    cleanup()
    onLeave()
  }

  return (
    <div className="bg-black/50 backdrop-blur-sm overflow-hidden relative">
      {/* Video Container */}
      <div className="relative h-48">
        {/* Remote Video (Main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-full h-full object-cover bg-gray-900"
        />
        
        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-3 right-3 w-16 h-12 bg-gray-800 rounded-lg overflow-hidden border border-white/20">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* No Remote User Placeholder */}
        {!remoteUserConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center text-white">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Waiting for opponent...</p>
            </div>
          </div>
        )}
        
        {/* Connection Status */}
        <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
          {connectionStatus}
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-3 bg-black/70 backdrop-blur-sm flex justify-center space-x-2">
        <button
          onClick={toggleAudio}
          className={`p-2 rounded-lg transition-all ${
            isAudioOn 
              ? 'bg-white/20 text-white hover:bg-white/30' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          title={isAudioOn ? 'Mute' : 'Unmute'}
        >
          {isAudioOn ? <Mic size={14} /> : <MicOff size={14} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-2 rounded-lg transition-all ${
            isVideoOn 
              ? 'bg-white/20 text-white hover:bg-white/30' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? <Video size={14} /> : <VideoOff size={14} />}
        </button>
        
        <button
          onClick={leaveCall}
          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
          title="Leave call"
        >
          <Phone size={14} />
        </button>
      </div>
    </div>
  )
}