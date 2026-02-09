import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import streamer, { StreamInfo, StreamOptions } from '../services/streamer'

interface StreamContextType {
  streamInfo: StreamInfo
  startStream: (options: StreamOptions) => Promise<void>
  stopStream: () => void
  pauseStream: () => void
  resumeStream: () => void
  isStreaming: boolean
}

const StreamContext = createContext<StreamContextType | undefined>(undefined)

export const useStream = () => {
  const context = useContext(StreamContext)
  if (!context) {
    throw new Error('useStream must be used within StreamProvider')
  }
  return context
}

interface StreamProviderProps {
  children: ReactNode
}

export const StreamProvider = ({ children }: StreamProviderProps) => {
  const [streamInfo, setStreamInfo] = useState<StreamInfo>(streamer.getStreamInfo())
  const [isStreaming, setIsStreaming] = useState(false)

  useEffect(() => {
    // Subscribe to stream updates
    const unsubscribe = streamer.subscribe((info) => {
      setStreamInfo(info)
      setIsStreaming(info.state !== 'stopped')
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const startStream = async (options: StreamOptions) => {
    try {
      console.log('StreamContext: Starting stream with options:', options)
      setIsStreaming(true)
      await streamer.start(options)
      console.log('StreamContext: Stream started successfully')
    } catch (error) {
      console.error('Failed to start stream:', error)
      setIsStreaming(false)
      throw error
    }
  }

  const stopStream = () => {
    streamer.stop()
    setIsStreaming(false)
  }

  const pauseStream = () => {
    streamer.pause()
  }

  const resumeStream = () => {
    streamer.resume()
  }

  const value: StreamContextType = {
    streamInfo,
    startStream,
    stopStream,
    pauseStream,
    resumeStream,
    isStreaming
  }

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
}
