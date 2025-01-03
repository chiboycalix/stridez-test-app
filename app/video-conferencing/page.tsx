"use client"
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image'
import { Button } from '@/components/Button'
import { useVideoConferencing, VideoConferencingProvider } from '@/context/VideoConferencingContext'
import { TeamPeople } from '@/public/assets'
import { Check, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import Input from '@/components/ui/Input'


export default function VideoConferencing() {
  const router = useRouter();
  const { setStep } = useVideoConferencing();
  const [handleJoinMeeting, setHandleJoinMeeting] = useState(false)
  const [handleCreateMeeting, setHandleCreateMeeting] = useState(false)

  const handleCreate = () => {
    router.push('/video-conferencing/waiting-room');
  };

  const handleJoin = () => {
    setStep(1);
    setHandleJoinMeeting(!handleJoinMeeting)
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
            <Button className='w-full' variant="outline" onClick={handleJoin}>
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
                    <Input placeholder='Enter the meeting code here' />
                    <Button className='w-1/4 mt-2'>
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
