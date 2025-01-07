import React, { useEffect } from "react";
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

  const { videoRef, isVideoOn, remoteUsersRef } = useVideoConferencing();

  useEffect(() => {
    if (videoTrack && videoRef.current && isVideoOn) {
      videoTrack.play(videoRef.current);
    }

    return () => {
      if (videoTrack) {
        videoTrack.stop();
      }
    };
  }, [videoTrack, isVideoOn, videoRef]);

  return (
    <div className="w-full h-full">
      {videoTrack && isVideoOn ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-center text-gray-500">Camera Off</p>
        </div>
      )}
    </div>
  );
};
