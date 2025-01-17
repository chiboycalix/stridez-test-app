"use client"
import React, { useState } from 'react'
import Input from '@/components/ui/Input'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion';
import { UID } from "agora-rtc-react";
import { Button } from '@/components/Button'
import { useVideoConferencing } from '@/context/VideoConferencingContext'
import { TeamPeople } from '@/public/assets'
import { Check, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext';

interface Options {
  appid?: string | undefined;
  channel?: string;
  rtcToken?: string | null;
  rtmToken?: string | null;
  uid?: UID | null;
  audienceLatency: number;
  role: string;
  proxyMode?: string;
  certificate?: string;
}

export default function VideoConferencing() {
  const router = useRouter();
  const { setChannelName, channelName } = useVideoConferencing();
  const [handleJoinMeeting, setHandleJoinMeeting] = useState(false)
  const [handleCreateMeeting, setHandleCreateMeeting] = useState(false)
  const { currentUser } = useAuth()
  const handleCreate = () => {
    // router.push(`/video-conferencing/waiting-room?channelName=${channelName}`);
  };

  const openJoinModal = () => {
    setHandleJoinMeeting(!handleJoinMeeting)
  }

  const handleJoinWaitingRoom = async () => {
    try {
      router.push(`/video-conferencing/waiting-room/${channelName}?username=${currentUser?.profile?.firstName}`);
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleJCreate = () => {
    setHandleCreateMeeting(!handleCreateMeeting)
  };

  const handleScheduleWithCalendar = () => {
    router.push('/video-conferencing/schedule');
  }

  return (
    <div className='flex flex-col items-center justify-center md:h-[88vh] h-[85vh] bg-white'>
      <div className='max-w-3xl mx-auto'>
        <p className='text-black text-xl'>
          You&apos;re all set! start your streaming now
        </p>
        <div className='w-full border-b my-8'></div>
        <div className='flex flex-col items-center space-x-4 justify-center'>
          <div className='flex items-center space-x-4'>
            <Image src={TeamPeople} alt='TeamPeople' className='w-6' />
            <p>Engage face-to-face in real time.</p>
          </div>
          <div className='mt-4 w-full relative'>
            <Button className='w-full' onClick={handleJCreate}>Create Video Conferencing</Button>
            <AnimatePresence>
              {handleCreateMeeting && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className='overflow-hidden w-full rounded-md shadow-lg mt-4 border border-gray-100 absolute top-8 left-0 z-[100]'
                >
                  <div className='px-4 py-2 bg-white'>
                    <div className='flex items-center gap-2 group hover:bg-primary-600 cursor-pointer px-2 py-1 rounded-sm' onClick={handleCreate}>
                      <div className='w-3 h-3 hidden group-hover:inline-block'>
                        <Check className='text-primary group-hover:bg-white w-3 h-3' />
                      </div>
                      <span className='group-hover:text-white text-sm inline-block'>Start an instant video conference</span>
                    </div>

                    {/* second link */}
                    <div className='group flex items-center gap-2 hover:bg-primary-600 cursor-pointer px-2 py-1 rounded-sm' onClick={handleScheduleWithCalendar}>
                      <div className='w-3 h-3 hidden group-hover:inline-block'>
                        <Check className='text-primary group-hover:bg-white w-3 h-3' />
                      </div>
                      <span className='group-hover:text-white text-sm inline-block'>Schedule with calendar</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className='w-full mt-3 relative'>
            <Button className='w-full' variant="outline" onClick={openJoinModal}>
              <Plus className='w-4 mr-4' />
              Join Video Conferencing
            </Button>
            <AnimatePresence>
              {handleJoinMeeting && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className='overflow-hidden w-full rounded-md shadow-lg mt-4 border border-gray-100 absolute top-8 left-0 z-60'
                >
                  <div className='p-2 bg-white'>
                    <Input placeholder='Enter the meeting code here' value={channelName} onChange={(e) => setChannelName(e.target.value)} />
                    <Button className='w-1/4 mt-2' onClick={handleJoinWaitingRoom}>
                      Join
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
