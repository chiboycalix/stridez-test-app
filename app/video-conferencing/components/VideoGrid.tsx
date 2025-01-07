import React from 'react';

const VideoGrid = ({ localUser, remoteUsers, StreamPlayer }: any) => {
  const totalParticipants = Object.keys(remoteUsers || {}).length + 1;

  const getGridLayout = () => {
    switch (totalParticipants) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-2 md:grid-cols-2";
      case 4:
        return "grid-cols-2 md:grid-cols-2";
      default:
        return "grid-cols-2 md:grid-cols-3";
    }
  };

  const getVideoContainerClass = (isLocal: any, index: number) => {
    if (totalParticipants === 1) {
      return "col-span-1 row-span-1 h-full";
    }

    if (totalParticipants === 2) {
      return "col-span-1 h-96";
    }

    if (totalParticipants === 3 && isLocal) {
      return "col-span-2 md:col-span-1 h-96";
    }

    return "col-span-1 h-64 md:h-72";
  };

  return (
    <div className="h-full w-full">
      <div className={`grid ${getGridLayout()} gap-2 p-2 h-full`}>
        {/* Local User Video */}
        <div className={getVideoContainerClass(true, 0)}>
          <div className="relative h-full w-full rounded-lg overflow-hidden">
            <StreamPlayer
              videoTrack={localUser.videoTrack || null}
              audioTrack={localUser.audioTrack || null}
              uid={localUser.uid || ""}
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
              You
            </div>
          </div>
        </div>

        {/* Remote Users */}
        {Object.entries(remoteUsers || {}).map(([uid, user]: any, index) => (
          user.videoTrack && (
            <div key={uid} className={getVideoContainerClass(false, index + 1)}>
              <div className="relative h-full w-full rounded-lg overflow-hidden">
                <StreamPlayer
                  videoTrack={user.videoTrack}
                  audioTrack={user.audioTrack}
                  uid={uid}
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                  {user.name || `User ${index + 1}`}
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