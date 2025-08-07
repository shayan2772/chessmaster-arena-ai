// Custom WebRTC implementation for peer-to-peer video chat

export interface WebRTCConfig {
    iceServers: RTCIceServer[]
}

export interface PeerConnection {
    id: string
    connection: RTCPeerConnection
    localStream?: MediaStream
    remoteStream?: MediaStream
}

export class WebRTCManager {
    private peerConnections: Map<string, PeerConnection> = new Map()
    private localStream: MediaStream | null = null
    private config: WebRTCConfig
    private socket: any // Socket.io instance
    public onRemoteStreamReady?: (peerId: string, stream: MediaStream) => void

    constructor(socket: any, config?: WebRTCConfig) {
        this.socket = socket
        this.config = config || {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ]
        }

        this.setupSocketListeners()
    }

    private setupSocketListeners() {
        this.socket.on('webrtc-offer', this.handleOffer.bind(this))
        this.socket.on('webrtc-answer', this.handleAnswer.bind(this))
        this.socket.on('webrtc-ice-candidate', this.handleIceCandidate.bind(this))
        this.socket.on('user-disconnected', this.handleUserDisconnected.bind(this))
    }

    async initializeLocalStream(constraints: MediaStreamConstraints = { video: true, audio: true }) {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints)
            return this.localStream
        } catch (error) {
            console.error('Error accessing media devices:', error)
            throw error
        }
    }

    async createPeerConnection(peerId: string): Promise<RTCPeerConnection> {
        console.log('🔗 Creating peer connection for:', peerId)
        const peerConnection = new RTCPeerConnection(this.config)

        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                console.log('📤 Adding local track:', track.kind)
                peerConnection.addTrack(track, this.localStream!)
            })
        }

        // Handle remote stream
        const remoteStream = new MediaStream()
        peerConnection.ontrack = (event) => {
            console.log('📥 Received remote track:', event.track.kind)
            event.streams[0].getTracks().forEach(track => {
                remoteStream.addTrack(track)
            })
            // Trigger callback when remote stream is ready
            this.onRemoteStreamReady?.(peerId, remoteStream)
        }

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log('🔄 Connection state:', peerConnection.connectionState)
        }

        peerConnection.oniceconnectionstatechange = () => {
            console.log('🧊 ICE connection state:', peerConnection.iceConnectionState)
        }

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('🧊 Sending ICE candidate')
                this.socket.emit('webrtc-ice-candidate', {
                    candidate: event.candidate,
                    targetId: peerId
                })
            }
        }

        // Store peer connection
        this.peerConnections.set(peerId, {
            id: peerId,
            connection: peerConnection,
            localStream: this.localStream || undefined,
            remoteStream
        })

        return peerConnection
    }

    async createOffer(peerId: string): Promise<void> {
        const peerConnection = await this.createPeerConnection(peerId)

        try {
            const offer = await peerConnection.createOffer()
            await peerConnection.setLocalDescription(offer)

            this.socket.emit('webrtc-offer', {
                offer,
                targetId: peerId
            })
        } catch (error) {
            console.error('Error creating offer:', error)
        }
    }

    private async handleOffer(data: { offer: RTCSessionDescriptionInit, senderId: string }) {
        const peerConnection = await this.createPeerConnection(data.senderId)

        try {
            await peerConnection.setRemoteDescription(data.offer)
            const answer = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(answer)

            this.socket.emit('webrtc-answer', {
                answer,
                targetId: data.senderId
            })
        } catch (error) {
            console.error('Error handling offer:', error)
        }
    }

    private async handleAnswer(data: { answer: RTCSessionDescriptionInit, senderId: string }) {
        const peer = this.peerConnections.get(data.senderId)
        if (peer) {
            try {
                await peer.connection.setRemoteDescription(data.answer)
            } catch (error) {
                console.error('Error handling answer:', error)
            }
        }
    }

    private async handleIceCandidate(data: { candidate: RTCIceCandidate, senderId: string }) {
        const peer = this.peerConnections.get(data.senderId)
        if (peer) {
            try {
                await peer.connection.addIceCandidate(data.candidate)
            } catch (error) {
                console.error('Error adding ICE candidate:', error)
            }
        }
    }

    private handleUserDisconnected(userId: string) {
        const peer = this.peerConnections.get(userId)
        if (peer) {
            peer.connection.close()
            this.peerConnections.delete(userId)
        }
    }

    getRemoteStream(peerId: string): MediaStream | null {
        const peer = this.peerConnections.get(peerId)
        return peer?.remoteStream || null
    }

    toggleVideo(enabled: boolean) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach(track => {
                track.enabled = enabled
            })
        }
    }

    toggleAudio(enabled: boolean) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled
            })
        }
    }

    disconnect() {
        // Close all peer connections
        this.peerConnections.forEach(peer => {
            peer.connection.close()
        })
        this.peerConnections.clear()

        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop())
            this.localStream = null
        }
    }
}