import React, { useEffect, useRef } from "react";
import {
  ICameraVideoTrack,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { useVideoConferencing } from "@/context/VideoConferencingContext";

type StreamPlayerProps = {
  audioTrack: (ILocalAudioTrack & IMicrophoneAudioTrack) | null;
  videoTrack: (ICameraVideoTrack & ILocalVideoTrack) | null;
  uid?: string | number;
  options?: object;
};

export const StreamPlayer: React.FC<StreamPlayerProps> = ({
  audioTrack,
  videoTrack,
  uid = "",
  options = {}
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isCameraEnabled } = useVideoConferencing();

  useEffect(() => {
    if (!videoTrack || !containerRef.current) return;

    const playVideo = () => {
      if (containerRef.current) {
        videoTrack.play(containerRef.current);
      }
    };

    playVideo();

    return () => {
      videoTrack.stop();
    };
  }, [videoTrack]);

  if (!videoTrack) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
            {typeof uid === 'string' ? uid.charAt(0).toUpperCase() : 'U'}
          </div>
          <p className="text-center text-gray-300">Video Off</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    />
  );
};