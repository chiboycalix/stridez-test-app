"use client"
import './globals.css'
import MainLayout from '@/components/layouts/MainLayout'
import { AuthProvider } from '@/context/AuthContext'
import { PostProvider } from '@/context/PostContext'
import { VideoConferencingProvider } from '@/context/VideoConferencingContext'
import { VideoPlaybackProvider } from '@/context/VideoPlaybackContext'
import { WebSocketProvider } from '@/context/WebSocket'
import { Manrope } from 'next/font/google'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
import { initAgoraLogging } from '@/lib/agora/initAgoraLogging'

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
})

initAgoraLogging();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  return (
    <html lang="en">
      <body
        className={manrope.className}
      >
        <AuthProvider>
          <WebSocketProvider>
            <MainLayout>
              <PostProvider>
                <AgoraRTCProvider client={client}>
                  <VideoConferencingProvider>
                    <VideoPlaybackProvider>{children}</VideoPlaybackProvider>
                  </VideoConferencingProvider>
                </AgoraRTCProvider>
              </PostProvider>
            </MainLayout>
          </WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
