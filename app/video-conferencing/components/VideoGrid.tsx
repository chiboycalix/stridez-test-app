import React from 'react';

const VideoGrid = ({ localUser, remoteUsers, StreamPlayer }: any) => {
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
          participant.videoTrack && (
            <div
              key={participant.uid}
              className={getVideoContainerClass(participant.isLocal, index, totalParticipants)}
            >
              <div className="relative h-full w-full rounded-lg overflow-hidden">
                <StreamPlayer
                  videoTrack={participant.videoTrack}
                  audioTrack={participant.audioTrack}
                  uid={participant.uid}
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                  {participant.isLocal ? 'You' : participant.name || `User ${index}`}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;