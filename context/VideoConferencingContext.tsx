"use client"
import { ILocalTrack, Options } from '@/types';
import { createContext, useContext, useState, ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { agoraGetAppData } from '@/lib';
import {
  ICameraVideoTrack,
  ILocalAudioTrack,
  ILocalVideoTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
} from "agora-rtc-sdk-ng";
import AgoraRTM, { RtmChannel, RtmClient } from "agora-rtm-sdk";
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

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
  isScreenSharing: boolean;
  toggleScreenShare: () => Promise<void>;
  screenShareRef: React.RefObject<HTMLDivElement>;
  createTrackAndPublish: () => void;
  handleJoin: () => void;
  setStage: (stage: string) => void;
  setChannelName: (stage: string) => void;
  channelName: string;
  stage: string;
  remoteUsers: Record<string, any>;
  joinRoom: boolean;
  remoteUsersRef: any;
  setUsername: (username: string) => void;
  setJoinRoom: (join: boolean) => void;
  username: string;
}

let rtcClient: IAgoraRTCClient;
let rtmClient: RtmClient;
let rtmChannel: RtmChannel;
let rtcScreenShareClient: IAgoraRTCClient;


const VideoConferencingContext = createContext<VideoConferencingContextContextType | undefined>(undefined);

export function VideoConferencingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [roomId, setRoomId] = useState('');
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const [stage, setStage] = useState("prepRoom");
  const [showStepJoinSuccess, setShowStepJoinSuccess] = useState(false);
  const [joinDisabled, setJoinDisabled] = useState(false);
  const [leaveDisabled, setLeaveDisabled] = useState(true);
  const [remoteUsers, setRemoteUsers] = useState<Record<string, any>>({});
  const [username, setUsername] = useState("")
  const [channelName, setChannelName] = useState("")
  const [localUserTrack, setLocalUserTrack] = useState<ILocalTrack | undefined | any>(undefined);
  const screenShareRef = useRef<HTMLDivElement>(null) as any;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteUsersRef = useRef(remoteUsers);

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

  const handleConfigureWaitingArea = async () => {
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
    // try {
    //   // First cleanup Agora tracks
    //   if (localUserTrack?.videoTrack) {
    //     localUserTrack.videoTrack.stop();
    //     await localUserTrack.videoTrack.close();
    //   }
    //   if (localUserTrack?.audioTrack) {
    //     localUserTrack.audioTrack.stop();
    //     await localUserTrack.audioTrack.close();
    //   }
    //   if (localUserTrack?.screenTrack) {
    //     localUserTrack.screenTrack.stop();
    //     await localUserTrack.screenTrack.close();
    //   }

    //   setIsScreenSharing(false);

    //   // Then explicitly stop all media tracks using browser API
    //   const streams = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    //   streams.getTracks().forEach(track => {
    //     track.stop();
    //   });

    //   // Also get all active media tracks and stop them
    //   const allTracks = document.querySelectorAll('video, audio');
    //   allTracks.forEach(element => {
    //     const mediaElement = element as HTMLMediaElement;
    //     if (mediaElement.srcObject instanceof MediaStream) {
    //       const stream = mediaElement.srcObject;
    //       stream.getTracks().forEach(track => {
    //         track.stop();
    //       });
    //       mediaElement.srcObject = null;
    //     }
    //   });

    //   setLocalUserTrack(undefined);
    //   setIsVideoOn(true);
    //   setIsAudioOn(true);
    // } catch (error) {
    //   console.error("Error cleaning up tracks:", error);
    // }
  };

  const toggleAudio = async () => {
    if (localUserTrack && localUserTrack.audioTrack) {
      try {
        const isLocalTrack = "setEnabled" in localUserTrack.audioTrack;
        if (isLocalTrack) {
          const localAudioTrack = localUserTrack.audioTrack as ILocalAudioTrack;
          const newState = !isAudioOn;
          await localAudioTrack.setEnabled(newState);

          // Notify other users through RTM channel
          if (rtmChannel) {
            await rtmChannel.sendMessage({
              text: JSON.stringify({
                type: 'audio-state',
                uid: options.uid,
                enabled: newState
              })
            });
          }

          setIsAudioOn(newState);
        }
      } catch (error) {
        console.error("Error toggling audio:", error);
      }
    }
  };

  const toggleVideo = async () => {
    try {
      if (isVideoOn) {
        if (localUserTrack?.videoTrack) {
          // First unpublish
          if (rtcClient) {
            await rtcClient.unpublish(localUserTrack.videoTrack);
          }
          // Then close
          await localUserTrack.videoTrack.close();

          setLocalUserTrack((prev: any) => ({
            ...prev,
            videoTrack: null
          }));

          // Notify other users through RTM channel
          if (rtmChannel) {
            await rtmChannel.sendMessage({
              text: JSON.stringify({
                type: 'video-state',
                uid: options.uid,
                enabled: false
              })
            });
          }
        }
      } else {
        // Create new video track
        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 360,
            frameRate: 30,
          }
        });

        // Publish the new track if connected
        if (rtcClient) {
          await rtcClient.publish(videoTrack);
        }

        setLocalUserTrack((prev: any) => ({
          ...prev,
          videoTrack
        }));

        // Notify other users through RTM channel
        if (rtmChannel) {
          await rtmChannel.sendMessage({
            text: JSON.stringify({
              type: 'video-state',
              uid: options.uid,
              enabled: true
            })
          });
        }
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

  useEffect(() => {
    if (channelName && username) {
      const fetchAgoraData = async () => {
        try {
          const { rtcOptions, rtmOptions } = await agoraGetAppData(channelName);

          setOptions((prev) => ({
            ...prev,
            appid: rtcOptions?.appId,
            rtcToken: rtcOptions?.token.tokenWithUid,
            rtmToken: rtmOptions?.token,
            certificate: rtcOptions?.appCertificate,
            uid: rtcOptions?.uid,
            channel: rtcOptions?.channelName,
          }));
        } catch (error) {
          console.error("Error fetching Agora data:", error);
        }
      };

      fetchAgoraData();
      setJoinDisabled(false);
    }
  }, [channelName, username]);

  const handleMemberJoined = async (MemberId: string) => {
    const { name, userRtcUid, userAvatar } =
      await rtmClient.getUserAttributesByKeys(MemberId, [
        "name",
        "userRtcUid",
      ]);
    console.log("rtm clients........", name, userRtcUid, userAvatar);
  };

  const initRtm = async (name: string) => {
    rtmClient = AgoraRTM.createInstance(options.appid!);
    await rtmClient.login({
      uid: String(options.uid!),
      token: options.rtmToken!,
    });
    console.log("checking for error after login...", rtmClient);

    const channel = rtmClient.createChannel(options.channel!);
    rtmChannel = channel;
    await channel.join();

    await rtmClient.addOrUpdateLocalUserAttributes({
      name: name,
      userRtcUid: String(options.uid!),
    });
    getChannelMembers();

    window.addEventListener("beforeunload", leaveRtmChannel);

    channel.on("MemberJoined", handleMemberJoined);
    channel.on("MemberLeft", handleMemberLeft);
    channel.on("ChannelMessage", async ({ text }: any) => {
      const message = JSON.parse(text);
      if (message.type === 'video-state') {
        const uid = String(message.uid);
        setRemoteUsers((prevUsers) => ({
          ...prevUsers,
          [uid]: {
            ...prevUsers[uid],
            videoTrack: message.enabled ? prevUsers[uid]?.videoTrack : null
          },
        }));
      }

      if (message.type === 'audio-state') {
        const uid = String(message.uid);
        setRemoteUsers((prevUsers) => ({
          ...prevUsers,
          [uid]: {
            ...prevUsers[uid],
            audioEnabled: message.enabled
          },
        }));
      }
    });
  };

  const handleUserPublished = (user: any, mediaType: "audio" | "video") => {
    subscribe(user, mediaType);
  };

  const join = async () => {
    rtcClient = AgoraRTC.createClient({
      mode: "live",
      codec: "vp8",
    });
    AgoraRTC.setLogLevel(4);
    AgoraRTC.enableLogUpload();
    rtcClient.on("user-published", handleUserPublished);

    rtcClient.on("user-unpublished", handleUserUnpublished);
    rtcClient.on("user-left", handleUserLeft);


    const mode = options?.proxyMode ?? 0;
    if (mode !== 0 && !isNaN(parseInt(mode))) {
      rtcClient.startProxyServer(parseInt(mode));
    }

    if (options?.role === "audience") {
      rtcClient.setClientRole(options.role, { level: options.audienceLatency });
    } else if (options.role === "host") {
      rtcClient.setClientRole(options.role);
    }

    options.uid = await rtcClient.join(
      options.appid || "",
      options.channel || "",
      options.rtcToken || null,
      options.uid || null
    );
    await initRtm(username!);
  };

  const handleUserUnpublished = (user: any, mediaType: "audio" | "video") => {
    const uid = String(user.uid);
    setRemoteUsers((prevUsers) => ({
      ...prevUsers,
      [uid]: {
        ...prevUsers[uid],
        [mediaType]: null,
        ...(mediaType === 'audio' ? { audioEnabled: false } : {})
      },
    }));
  };

  const createTrackAndPublish = async () => {
    if (
      localUserTrack &&
      localUserTrack.audioTrack &&
      localUserTrack.videoTrack
    ) {
      await rtcClient.publish([
        localUserTrack.audioTrack,
        localUserTrack.videoTrack,
      ]);
    }
  };

  const handleUserLeft = async (user: any) => {
    const uid = String(user.uid);
    const updatedUsers = { ...remoteUsersRef.current };
    delete updatedUsers[uid];
    remoteUsersRef.current = updatedUsers;
    setRemoteUsers(updatedUsers);
  };

  const leaveRtmChannel = async () => {
    await rtmChannel.leave();
    await rtmClient.logout();
    (rtmChannel as any) = null;
  };

  const getChannelMembers = async () => {
    const members = await rtmChannel.getMembers();

    for (let i = 0; members.length > i; i++) {
      console.log("showing members...", members);
      const { name, userRtcUid, userAvatar } =
        await rtmClient!.getUserAttributesByKeys(members[i], [
          "name",
          "userRtcUid",
          // "userAvatar",
        ]);

      console.log("rtm clients........", name, userRtcUid, userAvatar);
    }
  };

  const handleMemberLeft = async () => {
    // document.getElementById(MemberId).remove();
  };

  const handleJoin = async () => {
    try {
      if (!options) return;
      setJoinRoom(true);
      setStage("joinRoom");
      await join();
      setOptions(options);
      setShowStepJoinSuccess(true);
      setJoinDisabled(true);
      setLeaveDisabled(false);
      await createTrackAndPublish();
    } catch (error: any) {
      console.log(error, "error joining");
    }

  };

  const subscribe = async (user: any, mediaType: "audio" | "video") => {
    await rtcClient.subscribe(user, mediaType);
    const uid = String(user.uid);

    if (mediaType === "video") {
      const videoTrack = user.videoTrack;
      setRemoteUsers((prevUsers) => ({
        ...prevUsers,
        [uid]: {
          ...prevUsers[uid],
          videoTrack,
        },
      }));
    }
    if (mediaType === "audio") {
      const audioTrack = user.audioTrack;
      setRemoteUsers((prevUsers) => ({
        ...prevUsers,
        [uid]: {
          ...prevUsers[uid],
          audioTrack,
          audioEnabled: true
        },
      }));
      audioTrack.play();
    }
  };

  useLayoutEffect(() => {
    if (videoRef.current !== null && localUserTrack && localUserTrack.videoTrack) {
      localUserTrack.videoTrack.play(videoRef.current, options);
    }

    return () => {
      if (localUserTrack && localUserTrack.videoTrack) {
        // Just unplay/remove from DOM
        localUserTrack.videoTrack.close();
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
        isScreenSharing,
        toggleScreenShare,
        screenShareRef,
        handleJoin,
        createTrackAndPublish,
        setStage,
        stage,
        setChannelName,
        channelName,
        remoteUsers,
        joinRoom,
        remoteUsersRef,
        setUsername,
        username,
        setJoinRoom
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