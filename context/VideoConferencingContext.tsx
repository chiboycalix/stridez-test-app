"use client"
import { ILocalTrack, Options } from '@/types';
import { createContext, useContext, useState, ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import AgoraRTM from "agora-rtm-sdk";
import AgoraRTC from "agora-rtc-sdk-ng";
import { agoraGetAppData } from '@/lib';
import {
  ICameraVideoTrack,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";

interface VideoConferencingContextContextType {
  step: number;
  setStep: (step: number) => void;
  roomId: string;
  setRoomId: (id: string) => void;
  isAudioOn: boolean;
  isVideoOn: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  localUserTrack: ILocalTrack | undefined
  options: Options;
  videoRef: any;
  handleConfigureWaitingArea: () => void;
  setLocalUserTrack: any
  cleanupTracks: () => void
  showPermissionPopup: boolean;
  hasPermissions: boolean;
  handleAllowPermissions: () => void;
  handleDismissPermissions: () => void;
  isScreenSharing: boolean;
  toggleScreenShare: () => Promise<void>;
  screenShareRef: React.RefObject<HTMLDivElement>;
}

const VideoConferencingContext = createContext<VideoConferencingContextContextType | undefined>(undefined);

export function VideoConferencingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [roomId, setRoomId] = useState('');
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showPermissionPopup, setShowPermissionPopup] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const screenShareRef = useRef<HTMLDivElement>(null) as any;

  const [localUserTrack, setLocalUserTrack] = useState<ILocalTrack | undefined | any>(
    undefined
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);


  const [options, setOptions] = useState<Options>({
    channel: "",
    appid: "d9b1d4e54b9e4a01aac1de9833d83752",
    rtcToken: "",
    rtmToken: "",
    proxyMode: "",
    audienceLatency: 1,
    uid: null,
    role: "host",
    certificate: "",
  });

  const handleAllowPermissions = async () => {
    try {
      // Request permissions
      await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: true }),
        navigator.mediaDevices.getUserMedia({ audio: true })
      ]);

      setHasPermissions(true);
      setShowPermissionPopup(false);

      if (hasPermissions) {
        await handleConfigureWaitingArea()
      }
    } catch (error) {
      console.error('Error getting permissions:', error);
    }
  };

  const handleDismissPermissions = () => {
    setShowPermissionPopup(false);
  };

  const handleConfigureWaitingArea = async () => {
    await AgoraRTC.setLogLevel(4);
    try {
      if (localUserTrack?.videoTrack) {
        localUserTrack.videoTrack.stop();
        await localUserTrack.videoTrack.close();
      }
      if (localUserTrack?.audioTrack) {
        localUserTrack.audioTrack.stop();
        await localUserTrack.audioTrack.close();
      }

      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: "music_standard" }),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      setLocalUserTrack({
        audioTrack,
        videoTrack,
        screenTrack: null,
      });

    } catch (error) {
      console.error("Error configuring waiting area:", error);
    }
  };

  const cleanupTracks = async () => {
    try {
      // First cleanup Agora tracks
      if (localUserTrack?.videoTrack) {
        localUserTrack.videoTrack.stop();
        await localUserTrack.videoTrack.close();
      }
      if (localUserTrack?.audioTrack) {
        localUserTrack.audioTrack.stop();
        await localUserTrack.audioTrack.close();
      }
      if (localUserTrack?.screenTrack) {
        localUserTrack.screenTrack.stop();
        await localUserTrack.screenTrack.close();
      }

      setIsScreenSharing(false);

      // Then explicitly stop all media tracks using browser API
      const streams = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streams.getTracks().forEach(track => {
        track.stop();
      });

      // Also get all active media tracks and stop them
      const allTracks = document.querySelectorAll('video, audio');
      allTracks.forEach(element => {
        const mediaElement = element as HTMLMediaElement;
        if (mediaElement.srcObject instanceof MediaStream) {
          const stream = mediaElement.srcObject;
          stream.getTracks().forEach(track => {
            track.stop();
          });
          mediaElement.srcObject = null;
        }
      });

      setLocalUserTrack(undefined);
      setIsVideoOn(true);
      setIsAudioOn(true);
    } catch (error) {
      console.error("Error cleaning up tracks:", error);
    }
  };

  const toggleAudio = async () => {
    if (localUserTrack && localUserTrack.audioTrack) {
      const isLocalTrack = "setEnabled" in localUserTrack.audioTrack;
      if (isLocalTrack) {
        const localAudioTrack = localUserTrack.audioTrack as ILocalAudioTrack;
        const newState = !isAudioOn;
        await localAudioTrack.setEnabled(newState);
        setIsAudioOn(newState);
      } else {
        const remoteAudioTrack = localUserTrack && localUserTrack.audioTrack as IRemoteAudioTrack;
        if (isAudioOn) {
          remoteAudioTrack.setVolume(100);
        } else {
          remoteAudioTrack.setVolume(0);
        }
        setIsAudioOn(!isAudioOn);
      }
    }
  };

  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        if (localUserTrack?.videoTrack) {
          await localUserTrack.videoTrack.setEnabled(false);
          localUserTrack.videoTrack.stop();
          await localUserTrack.videoTrack.close();

          setLocalUserTrack((prev: any) => ({
            ...prev,
            videoTrack: null
          }));
        }
      } else {
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 360,
            frameRate: 30,
          }
        });

        setLocalUserTrack((prev: any) => ({
          ...prev,
          videoTrack
        }));
      }

      setIsVideoOn(!isVideoOn);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (localUserTrack?.screenTrack) {
          await localUserTrack.screenTrack.screenAudioTrack.stop();
          await localUserTrack.screenTrack.screenVideoTrack.close();

          setLocalUserTrack((prev: any) => ({
            ...prev,
            screenTrack: null
          }));
        }
      } else {
        try {
          const screenTrack = await AgoraRTC.createScreenVideoTrack(
            {
              encoderConfig: "1080p_1",
              optimizationMode: "detail"

            },
            "auto"
          );

          if ('on' in screenTrack) {
            screenTrack.on("track-ended", () => {
              setIsScreenSharing(false);
              if (localUserTrack?.screenTrack) {
                localUserTrack.screenTrack.screenAudioTrack.stop();
                localUserTrack.screenTrack.screenVideoTrack.close();
              }
              setLocalUserTrack((prev: any) => ({
                ...prev,
                screenTrack: null
              }));
            });
          }

          setLocalUserTrack((prev: any) => ({
            ...prev,
            screenTrack
          }));
          await AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }).publish(screenTrack);
        } catch (error: any) {
          console.error("Error creating screen track:", error);
          if (error.message === "Permission denied" || error.message === "Permission denied by system") {
            console.log("User denied screen share permission");
            return;
          }
          throw error;
        }
      }

      setIsScreenSharing(!isScreenSharing);
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  useLayoutEffect(() => {
    if (videoRef.current !== null && localUserTrack && localUserTrack.videoTrack) {
      localUserTrack.videoTrack.play(videoRef.current, options);
    }

    return () => {
      if (localUserTrack && localUserTrack.videoTrack) {
        localUserTrack.videoTrack.stop();
      }
    };
  }, [localUserTrack, options]);

  useLayoutEffect(() => {
    if (localUserTrack && localUserTrack.audioTrack) {
      localUserTrack.audioTrack.play();
    }

    return () => {
      if (localUserTrack && localUserTrack.audioTrack) {
        localUserTrack.audioTrack.stop();
      }
    };
  }, [localUserTrack]);

  return (
    <VideoConferencingContext.Provider
      value={{
        step, setStep,
        roomId, setRoomId,
        isAudioOn,
        isVideoOn,
        toggleAudio,
        toggleVideo,
        localUserTrack,
        options,
        videoRef,
        handleConfigureWaitingArea,
        setLocalUserTrack,
        cleanupTracks,
        showPermissionPopup,
        hasPermissions,
        handleAllowPermissions,
        handleDismissPermissions,
        isScreenSharing,
        toggleScreenShare,
        screenShareRef
      }}>
      {children}
    </VideoConferencingContext.Provider>
  );
}

export function useVideoConferencing() {
  const context = useContext(VideoConferencingContext);
  if (context === undefined) {
    throw new Error('useVideoConferencing must be used within a VideoProvider');
  }
  return context;
}