import { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const VideoMutedDisplay = ({ username }: { username: string }) => {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-800">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl text-white">
          {username?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <p className="mt-2 text-white">{username || 'User'}</p>
        <p className="text-sm text-gray-400">Video Off</p>
      </div>
    </div>
  );
};
export default VideoMutedDisplay;