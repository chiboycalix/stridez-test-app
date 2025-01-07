import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useVideoConferencing } from "@/context/VideoConferencingContext";

const VideoMutedDisplay = ({ participant }: any) => {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-800 rounded-lg">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-xl text-white">
          {participant.name?.[0]?.toUpperCase() || participant.isLocal ? 'Y' : 'U'}
        </div>
        <p className="mt-2 text-white text-sm">
          {participant.isLocal ? 'You' : participant.name || `User ${participant.uid}`}
        </p>
      </div>
    </div>
  );
};

const VideoGrid = ({ localUser, remoteUsers, StreamPlayer }: any) => {
  const { isAudioOn } = useVideoConferencing();
  const totalParticipants = Object.keys(remoteUsers || {}).length + 1;

  const getGridLayout = () => {
    switch (totalParticipants) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-2";
      case 3:
        return "grid-cols-4";
      case 4:
        return "grid-cols-2 md:grid-cols-2";
      default:
        return "grid-cols-2 md:grid-cols-3";
    }
  };

  const getAudioState = (participant: any) => {
    if (participant.isLocal) {
      return isAudioOn;
    }
    // Check both audioEnabled flag and audioTrack state
    return participant.audioEnabled !== false && participant.audioTrack?.enabled !== false;
  };

  const getVideoContainerClass = (isLocal: boolean, index: number, totalParticipants: number) => {
    if (totalParticipants === 1) {
      return "col-span-1 row-span-1 h-full";
    }

    if (totalParticipants === 2) {
      return "col-span-1 h-80";
    }

    if (totalParticipants === 3) {
      if (index < 2) {
        return "col-span-2 h-80";
      }
      return "col-span-2 col-start-2 h-80";
    }

    return "col-span-1 h-64 md:h-72";
  };

  const remoteUsersArray = Object.entries(remoteUsers || {}).map(([uid, user]: any) => ({
    ...user,
    uid
  }));

  const allParticipants = [
    { ...localUser, isLocal: true },
    ...remoteUsersArray
  ];

  return (
    <div className="h-full w-full">
      <div className={`grid ${getGridLayout()} gap-2 p-2 h-full ${totalParticipants === 2 ? 'items-center' : ''}`}>
        {allParticipants.map((participant, index) => (
          <div
            key={participant.uid}
            className={getVideoContainerClass(participant.isLocal, index, totalParticipants)}
          >
            <div className="relative h-full w-full rounded-lg overflow-hidden">
              {!participant.videoTrack ? (
                <VideoMutedDisplay participant={participant} />
              ) : (
                <StreamPlayer
                  videoTrack={participant.videoTrack}
                  audioTrack={participant.audioTrack}
                  uid={participant.uid}
                />
              )}

              {/* Controls Overlay */}
              <div className="absolute top-0 right-0 p-2 flex flex-col gap-2">
                <div className="bg-black/50 p-1.5 rounded-lg">
                  {getAudioState(participant) ? (
                    <Mic size={16} className="text-white" />
                  ) : (
                    <MicOff size={16} className="text-red-500" />
                  )}
                </div>
              </div>

              {/* User Label */}
              <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                {participant.isLocal ? 'You' : participant.name || `User ${index}`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;