/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import IconButton from './IconButton';
import Input from '@/components/ui/Input';
import CallOptionsMenu from './CallOptionsMenu';
import VolumeControlPopup from './VolumeControlPopup';
import JoinRequestNotification from './JoinRequestNotification';
import EndCallScreen from './EndCallScreen';
import EmojiPopup from './EmojiPopup';
import { X, Mic, MoreVertical, Copy, Plus, StopCircleIcon, Dot, MicOff, Video, Share, MessageSquare, Menu, Users, Smile, SquareArrowOutUpRight, Send, PinIcon, ChevronRight, VideoOff, MonitorOff } from 'lucide-react';
import { ChatEmpty, LivePhoto } from '@/public/assets';
import { Button } from '@/components/Button';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/Checkbox';
import { AnimatePresence, motion } from 'framer-motion';
import { useVideoConferencing } from '@/context/VideoConferencingContext';
import { useSearchParams } from 'next/navigation';
import { generalHelpers } from '@/helpers';
import { StreamPlayer } from './StreamPlayer';

type User = {
  id: string;
  name: string;
  email: string;
};

type Message = {
  id: string;
  user: {
    name: string;
    initials: string;
  };
  content: string;
  timestamp: string;
  isPinned?: boolean;
  reactions?: { emoji: string; count: number }[];
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-4 text-gray-400">
    <div className="mb-6">
      <Image src={ChatEmpty} alt="ChatEmpty" />
    </div>
    <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
    <p className="text-sm text-gray-500">
      There are no Question here yet. Start engaging your participant by sending a message.
    </p>
  </div>
);

const MessageComponent = ({ message }: { message: Message }) => (
  <div className="space-y-1">
    {message.isPinned && (
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <PinIcon className="w-3 h-3" />
        <span>PINNED</span>
      </div>
    )}
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm text-white">
        {message.user.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-gray-200">{message.user.name}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{message.timestamp}</span>
            <button className="text-gray-400 hover:text-gray-300">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-gray-300 break-words">{message.content}</p>
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {message.reactions.map((reaction, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-800 rounded-full px-2 py-1">
                <span>{reaction.emoji}</span>
                <span className="text-sm text-gray-400">{reaction.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const ChatComponent = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      user: { name: 'Karen A', initials: 'KA' },
      content: 'Can we discuss how the data is being provided to the clients on an "as is" and "where-is" basis.',
      timestamp: '2:12 PM',
      isPinned: true
    },
    {
      id: '2',
      user: { name: 'Karen A', initials: 'KA' },
      content: 'Thank you\nits clear enough now',
      timestamp: '2:12 PM',
      reactions: [{ emoji: '👍', count: 2 }]
    },
    {
      id: '3',
      user: { name: 'John D', initials: 'JD' },
      content: 'I have some concerns about the timeline. Can we review the project milestones?',
      timestamp: '2:15 PM'
    },
    {
      id: '4',
      user: { name: 'Sarah M', initials: 'SM' },
      content: 'The latest updates look promising. I particularly like the new features we discussed in the last meeting.',
      timestamp: '2:18 PM',
      reactions: [{ emoji: '🎉', count: 3 }]
    },
    {
      id: '5',
      user: { name: 'Karen A', initials: 'KA' },
      content: 'Lets schedule a follow-up meeting to address these points in detail.',
      timestamp: '2:20 PM'
    },
    {
      id: '6',
      user: { name: 'Mike R', initials: 'MR' },
      content: 'Has anyone reviewed the latest documentation? Ive added some important updates regarding the API changes.',
      timestamp: '2:25 PM'
    },
    {
      id: '7',
      user: { name: 'Emma L', initials: 'EL' },
      content: 'The QA team has completed the initial testing phase. Here are our findings...',
      timestamp: '2:30 PM',
      reactions: [{ emoji: '👀', count: 4 }]
    },
    {
      id: '8',
      user: { name: 'Karen A', initials: 'KA' },
      content: 'Great progress everyone! Lets make sure we document all these changes properly.',
      timestamp: '2:35 PM'
    },
    {
      id: '9',
      user: { name: 'John D', initials: 'JD' },
      content: 'Ill prepare a summary report by end of day.',
      timestamp: '2:38 PM',
      reactions: [{ emoji: '👍', count: 5 }]
    },
    {
      id: '10',
      user: { name: 'Sarah M', initials: 'SM' },
      content: 'Dont forget we have the client presentation tomorrow at 10 AM.',
      timestamp: '2:40 PM'
    },
    {
      id: '11',
      user: { name: 'Karen A', initials: 'KA' },
      content: 'Thanks for the reminder, Sarah. All materials are ready for review.',
      timestamp: '2:42 PM'
    },
    {
      id: '12',
      user: { name: 'Mike R', initials: 'MR' },
      content: 'Just pushed the latest code changes. Please review when you can.',
      timestamp: '2:45 PM',
      reactions: [{ emoji: '💻', count: 2 }]
    }
  ]);

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute right-0 top-0 h-full w-full md:w-96 bg-[#1A1C1D] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="bg-gray-800 px-3 py-1 rounded-md">
          <h2 className="text-white">Questions</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length !== 0 ? (
          <EmptyState />
        ) : (
          <div className="p-4 space-y-6">
            {messages.map(message => (
              <MessageComponent key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-md text-white text-sm flex items-center gap-2">
            <span>To</span>
            <div className="flex items-center gap-1 bg-blue-600 px-2 py-1 rounded-sm cursor-pointer">
              <div className="w-4 h-4 rounded-sm flex items-center justify-center">
                <Users className="w-3 h-3" />
              </div>
              <div className='flex items-center gap-4'>
                <span className='text-sm'>Everyone</span>
                <ChevronRight size={16} />
              </div>

            </div>
          </div>
        </div>
        <div className="relative mt-2">
          <input
            placeholder="Send a message..."
            className="w-full bg-gray-800 text-white rounded-md px-4 py-3 pr-20 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-700"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white">
              <Smile className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white">
              <Send className="w-5 h-5 rotate-45" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InvitePeopleTab = () => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com' },
    { id: '3', name: 'Mike Johnson', email: 'mike.johnson@example.com' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah.wilson@example.com' },
    { id: '5', name: 'Alex Brown', email: 'alex.brown@example.com' },
  ];

  const handleUserToggle = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId));
  };

  return (
    <Tabs defaultValue="following" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-white">
        <TabsTrigger
          value="following"
          className="bg-white rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-900"
        >
          Following
        </TabsTrigger>
        <TabsTrigger
          value="followers"
          className="bg-white rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-900"
        >
          Followers
        </TabsTrigger>
        <TabsTrigger
          value="email"
          className="bg-white rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary-900"
        >
          Email
        </TabsTrigger>
      </TabsList>

      <TabsContent value="following">
        <div className="space-y-4">
          <Input variant='search' placeholder='Search' className='border bg-transparent' />

          {/* Selected Users Badges */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-1 bg-primary-100 text-primary-900 px-2 py-1 rounded-full text-sm"
                >
                  <span>{user.name}</span>
                  <button
                    onClick={() => removeUser(user.id)}
                    className="hover:bg-primary-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedUsers.some(u => u.id === user.id)}
                    onCheckedChange={() => handleUserToggle(user)}
                    className="h-5 w-5"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Send Invite Button */}
        {selectedUsers.length > 0 && (
          <div className="mt-6">
            <Button
              className="w-full bg-primary-900 text-white hover:bg-primary-800"
              onClick={() => console.log('Sending invites to:', selectedUsers)}
            >
              Send Invite ({selectedUsers.length})
            </Button>
          </div>
        )}
      </TabsContent>

      <TabsContent value="followers">
        Followers
      </TabsContent>

      <TabsContent value="email">
        Email
      </TabsContent>
    </Tabs>
  );
};


type JoinRequest = {
  id: string;
  name: string;
};

const LiveStreamInterface = () => {
  const [showInviteModal, setShowInviteModal] = useState(true);
  const [showInvitePeople, setShowInvitePeople] = useState(false);
  const [hasEndedCall, setHasEndedCall] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [optionsAnchorRect, setOptionsAnchorRect] = useState<DOMRect | null>(null);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [emojiAnchorRect, setEmojiAnchorRect] = useState<DOMRect | null>(null);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [volumeAnchorRect, setVolumeAnchorRect] = useState<DOMRect | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isParticipantListOpen, setIsParticipantListOpen] = useState(false);
  const { isAudioOn, videoRef, setJoinRoom, setStage, remoteUsersRef, isVideoOn, remoteUsers, stage, joinRoom, toggleScreenShare, isScreenSharing, toggleAudio, toggleVideo, localUserTrack, handleConfigureWaitingArea, options } = useVideoConferencing();

  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const newRequest = {
    id: 'unique-id',
    name: 'Matthew'
  } as any;


  useEffect(() => {
    if (newRequest) {
      setJoinRequests((requests: any) => [...requests, newRequest]);
    }
  }, []);

  // useEffect(() => {
  //   remoteUsersRef.current = remoteUsers;
  // }, [remoteUsers]);


  useEffect(() => {
    handleConfigureWaitingArea();
    setStage("joinRoom")
    setJoinRoom(true);
  }, []);

  const handleAllow = (requesterId: string) => {
    console.log('Allowing user:', requesterId);
    setJoinRequests((requests: any) =>
      requests.filter((request: any) => request.id !== requesterId)
    );
  };

  const handleDeny = (requesterId: string) => {
    console.log('Denying user:', requesterId);
    setJoinRequests((requests: any) =>
      requests.filter((request: any) => request.id !== requesterId)
    );
  };


  const handleVolumeControlClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setVolumeAnchorRect(buttonRect);
    setShowVolumePopup(!showVolumePopup);
  };

  const handleEndCall = () => {
    setHasEndedCall(true);
    setShowInviteModal(false);
    setShowInvitePeople(false);
  };

  const handleRejoin = () => {
    setHasEndedCall(false);
    setShowInviteModal(true);
  };

  const handleOptionsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setOptionsAnchorRect(buttonRect);
    setShowOptionsMenu(true);
  };

  const handleEmojiClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setEmojiAnchorRect(buttonRect);
    setShowEmojiPopup(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    console.log('Selected emoji:', emoji);
  };

  console.log({ stage, remoteUsers, joinRoom })
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[150] bg-white">
      <div className="w-full h-full flex flex-col max-w-[1440px] mx-auto p-2 md:p-4 lg:p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <div className="w-6 md:w-8 lg:w-12" />
          <div className="bg-black flex items-center gap-1.5 md:gap-2 rounded-md p-2">
            <div className="text-white flex items-center gap-0.5 md:gap-1">
              <Dot className="text-red-600 w-3 h-3 md:w-4 md:h-4 lg:w-6 lg:h-6" />
              <span className="text-xs md:text-sm lg:text-base">LIVE 1:23</span>
            </div>
            <div className="text-white flex items-center gap-1 md:gap-2">
              <StopCircleIcon className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
              <span className="hidden md:inline text-xs md:text-sm lg:text-base">Record</span>
            </div>
          </div>
        </div>

        {/* Main Video Area */}
        <div className={cn(
          "relative flex-1 bg-black rounded-md overflow-hidden",
          showInvitePeople && "blur-sm"
        )}>

          {hasEndedCall ? (
            <EndCallScreen />
          ) : (
            <>
              <div className="text-white flex h-full">
                {/* Left Side */}
                <div className="w-8 md:w-12 lg:w-28 flex flex-col justify-end p-2">
                  <span className="text-xs md:text-sm lg:text-base">{generalHelpers.convertFromSlug(username!)}</span>
                </div>

                {/* Center - Video */}
                <div className="flex-1">
                  <div className="relative h-full">
                    <StreamPlayer
                      videoTrack={localUserTrack?.videoTrack || null}
                      audioTrack={localUserTrack?.audioTrack || null}
                      uid={options?.uid || ""}
                    />
                  </div>

                  <div className="flex-1 p-2 flex items-center justify-center h-full">
                    {/* <div className={cn(
                      "h-full overflow-y-auto",
                      "p-2 md:p-0 place-content-center"
                    )}>
                      <div className={cn(
                        "grid gap-4 place-content-center",
                        "grid-cols-1 auto-rows-[300px]",
                        "md:grid-cols-2 md:auto-rows-[250px]",
                        mainGridParticipants.length === 1 && "lg:grid-cols-1",
                        mainGridParticipants.length === 2 && "lg:grid-cols-2",
                        mainGridParticipants.length >= 3 && "lg:grid-cols-3",
                        "lg:auto-rows-[200px]",
                        "place-items-center"
                      )}>
                        {mainGridParticipants.map(participant => (
                          <ParticipantVideo
                            key={participant.id}
                            participant={participant}
                            className="w-full h-full"
                          />
                        ))}
                      </div>
                    </div> */}


                    {/* Remote Stream */}
                    <section className="border rounded shadow-md w-full lg:w-1/2">
                      {
                        joinRoom && remoteUsers &&
                        Object.keys(remoteUsers).map((uid) => {
                          const user = remoteUsers[uid];
                          console.log("remote user", user);
                          if (
                            user.videoTrack
                          ) {
                            return (
                              <>
                                <div className="p-4">
                                  <div
                                    id="remote-playerlist"
                                    className="min-h-[220px] w-full"
                                  >
                                    <div className="bg-gray-100 text-gray-700 font-semibold px-2 py-2 border-b">
                                      Remote Stream
                                    </div>
                                    <StreamPlayer
                                      key={uid}
                                      videoTrack={user.videoTrack || undefined}
                                      audioTrack={user.audioTrack || undefined}
                                      // screenTrack={user.screenTrack || undefined}
                                      uid={uid}
                                    />
                                  </div>
                                </div>
                              </>
                            );
                          }
                          return null;
                        })}
                    </section>
                  </div>
                </div>

                {/* Right Side */}
                <div className="w-8 md:w-12 lg:w-28 flex flex-col justify-between items-end p-2">
                  <div
                    className="cursor-pointer hover:bg-gray-800/50 p-1 md:p-1.5 lg:p-2 rounded-lg transition-colors"
                  >
                    {isAudioOn ?
                      <Mic className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" /> :
                      <MicOff className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    }
                  </div>
                  <div
                    onClick={handleVolumeControlClick}
                    className={cn(
                      "cursor-pointer hover:bg-gray-800/50 p-1 md:p-1.5 lg:p-2 rounded-lg transition-colors",
                      showVolumePopup && "bg-gray-800/50"
                    )}
                  >
                    <MoreVertical className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                  </div>
                </div>
              </div>


              <AnimatePresence>
                {showChat && (
                  <ChatComponent onClose={() => setShowChat(false)} />
                )}
              </AnimatePresence>
            </>
          )}

          {/* Invite Modal */}
          {showInviteModal && !hasEndedCall && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white rounded-lg p-2 md:p-3 lg:p-4 w-[90%] md:w-96 max-w-[95vw] md:max-w-md">
              <div className="flex justify-between items-center mb-2 md:mb-3">
                <h3 className="font-semibold text-sm md:text-base">You&apos;re set!</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="hover:bg-gray-100 p-1 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">
                Use this meeting code to invite others to join.
              </p>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-2 md:mb-3">
                <div className="flex-1 bg-primary-100 rounded-lg p-2 text-xs md:text-sm break-all">
                  adewale.stridez.com/instant
                </div>
                <button className="flex items-center justify-center gap-1 text-xs md:text-sm bg-primary-100 px-2 py-2 rounded-lg hover:bg-primary-200 transition-colors">
                  <Copy className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Copy link</span>
                </button>
              </div>
              <Button
                onClick={() => setShowInvitePeople(true)}
                className="w-1/3 flex items-center justify-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs md:text-sm hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4 bg-white text-primary" />
                Invite
              </Button>
            </div>
          )}
        </div>

        {/* Request to Join Call */}
        {joinRequests.map(request => (
          <JoinRequestNotification
            key={request.id}
            requesterName={request.name}
            onAllow={() => handleAllow(request.id)}
            onDeny={() => handleDeny(request.id)}
            onClose={() =>
              setJoinRequests(requests =>
                requests.filter(r => r.id !== request.id)
              )
            }
          />
        ))}

        {/* Invite People Modal */}
        {showInvitePeople && !hasEndedCall && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg w-[90%] md:w-[560px] max-h-[80vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Invite People</h2>
                <button
                  onClick={() => setShowInvitePeople(false)}
                  className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div>
                <InvitePeopleTab />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className={cn(
          "mt-4 md:mt-8",
          showInvitePeople && "blur-sm"
        )}>
          <div className="overflow-x-auto pb-4 md:pb-0">
            <div className="flex items-center justify-between min-w-[640px] md:min-w-0 gap-4 md:grid md:grid-cols-3 md:gap-2 lg:gap-4">
              <div className="flex items-center gap-1 md:gap-2">
                <IconButton
                  leftIcon={isAudioOn ? <Mic size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" /> : <MicOff size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />}
                  showDivider
                  onLeftClick={toggleAudio}
                  onRightClick={() => { }}
                  className=""
                  tooltip="Toggle microphone"
                  rightTooltip="Microphone settings"
                />
                <IconButton
                  leftIcon={isVideoOn ? <Video size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" /> : <VideoOff size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />}
                  showDivider
                  onLeftClick={toggleVideo}
                  onRightClick={() => { }}
                  className=""
                  tooltip="Toggle Video"
                  rightTooltip="Microphone settings"
                />
              </div>

              {/* Center section */}
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <IconButton
                  leftIcon={<Share size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />}
                  showDivider
                  onLeftClick={() => { }}
                  onRightClick={() => { }}
                  className=""
                  tooltip="Toggle Video"
                  rightTooltip="Microphone settings"
                />
                <IconButton
                  leftIcon={!isScreenSharing ? <SquareArrowOutUpRight size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" /> : <MonitorOff className="w-5 h-5" />}
                  onLeftClick={toggleScreenShare}
                  className=""
                  tooltip="Share screen"
                  rightTooltip="Share screen settings"
                />
                <IconButton
                  leftIcon={<Smile size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />}
                  onLeftClick={handleEmojiClick}
                  className={cn(
                    showEmojiPopup && "bg-gray-100"
                  )}
                  tooltip="Reactions"
                />
                <IconButton
                  leftIcon={<Share size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5 -rotate-90" />}
                  showDivider
                  onLeftClick={handleEndCall}
                  className="bg-red-600 text-white hover:bg-red-600"
                  iconClass="hover:bg-red-700 text-white"
                  tooltip="End call"
                  rightTooltip="End call options"
                />
              </div>

              {/* Right section */}
              <div className="flex items-center justify-end gap-1 md:gap-2">
                <IconButton
                  leftIcon={<MessageSquare size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />}
                  onLeftClick={() => setShowChat(!showChat)}
                  className={cn(showChat && "bg-primary-100 text-primary-900")}
                  tooltip="Toggle chat"
                />
                <IconButton
                  leftIcon={<Users size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />}
                  showDivider
                  rightIcon={5}
                  onLeftClick={() => setIsParticipantListOpen(!isParticipantListOpen)}
                  onRightClick={() => setIsParticipantListOpen(!isParticipantListOpen)}
                  className={cn(isParticipantListOpen && "bg-gray-100")}
                  tooltip="Toggle participants list"
                  rightTooltip="Show all participants"
                />
                <IconButton
                  leftIcon={<Menu size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />}
                  onLeftClick={handleOptionsClick}
                  className={cn(
                    showOptionsMenu && "bg-gray-100"
                  )}
                  tooltip="More options"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <CallOptionsMenu
        isOpen={showOptionsMenu}
        onClose={() => setShowOptionsMenu(false)}
        anchorRect={optionsAnchorRect}
      />
      <EmojiPopup
        isOpen={showEmojiPopup}
        onClose={() => setShowEmojiPopup(false)}
        onEmojiSelect={handleEmojiSelect}
        anchorRect={emojiAnchorRect}
      />
      <VolumeControlPopup
        isOpen={showVolumePopup}
        onClose={() => setShowVolumePopup(false)}
        anchorRect={volumeAnchorRect}
      />
    </div>
  );
};

export default LiveStreamInterface;