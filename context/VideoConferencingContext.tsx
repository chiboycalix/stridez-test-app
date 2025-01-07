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
  currentStep: number;
  setCurrentStep: (currentStep: number) => void;
  meetingRoomId: string;
  setMeetingRoomId: (id: string) => void;
  isMicrophoneEnabled: boolean;
  isCameraEnabled: boolean;
  toggleMicrophone: () => void;
  toggleCamera: () => void;
  localUserTrack: ILocalTrack | undefined
  meetingConfig: Options;
  videoRef: any;
  initializeLocalMediaTracks: () => void;
  setLocalUserTrack: any
  releaseMediaResources: () => void
  isScreenShareActive: boolean;
  toggleScreenSharing: () => Promise<void>;
  screenShareDisplayRef: React.RefObject<HTMLDivElement>;
  publishLocalMediaTracks: () => void;
  joinMeetingRoom: () => void;
  setMeetingStage: (meetingStage: string) => void;
  setChannelName: (meetingStage: string) => void;
  channelName: string;
  meetingStage: string;
  remoteParticipants: Record<string, any>;
  hasJoinedMeeting: boolean;
  remoteUsersRef: any;
  setUsername: (username: string) => void;
  setHasJoinedMeeting: (join: boolean) => void;
  username: string;
}

let rtcClient: IAgoraRTCClient;
let rtmClient: RtmClient;
let rtmChannel: RtmChannel;
let rtcScreenShareClient: IAgoraRTCClient;


const VideoConferencingContext = createContext<VideoConferencingContextContextType | undefined>(undefined);

export function VideoConferencingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [meetingRoomId, setMeetingRoomId] = useState('');
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenShareActive, setIsScreenShareActive] = useState(false);
  const [hasJoinedMeeting, setHasJoinedMeeting] = useState(false);
  const [meetingStage, setMeetingStage] = useState("prepRoom");
  const [showStepJoinSuccess, setShowStepJoinSuccess] = useState(false);
  const [isJoinDisabled, setIsJoinDisabled] = useState(false);
  const [leaveDisabled, setIsLeaveDisabled] = useState(true);
  const [remoteParticipants, setRemoteParticipants] = useState<Record<string, any>>({});
  const [username, setUsername] = useState("")
  const [channelName, setChannelName] = useState("")
  const [localUserTrack, setLocalUserTrack] = useState<ILocalTrack | undefined | any>(undefined);
  const screenShareDisplayRef = useRef<HTMLDivElement>(null) as any;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteUsersRef = useRef(remoteParticipants);

  const [meetingConfig, setMeetingConfig] = useState<Options>({
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

  const initializeLocalMediaTracks = async () => {
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

  const releaseMediaResources = async () => {
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

    //   setIsScreenShareActive(false);

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
    //   setIsCameraEnabled(true);
    //   setIsMicrophoneEnabled(true);
    // } catch (error) {
    //   console.error("Error cleaning up tracks:", error);
    // }
  };

  const toggleMicrophone = async () => {
    if (localUserTrack && localUserTrack.audioTrack) {
      try {
        const isLocalTrack = "setEnabled" in localUserTrack.audioTrack;
        if (isLocalTrack) {
          const localAudioTrack = localUserTrack.audioTrack as ILocalAudioTrack;
          const newState = !isMicrophoneEnabled;
          await localAudioTrack.setEnabled(newState);

          // Notify other users through RTM channel
          if (rtmChannel) {
            await rtmChannel.sendMessage({
              text: JSON.stringify({
                type: 'audio-state',
                uid: meetingConfig.uid,
                enabled: newState
              })
            });
          }

          setIsMicrophoneEnabled(newState);
        }
      } catch (error) {
        console.error("Error toggling audio:", error);
      }
    }
  };

  const toggleCamera = async () => {
    try {
      if (isCameraEnabled) {
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
                uid: meetingConfig.uid,
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
              uid: meetingConfig.uid,
              enabled: true
            })
          });
        }
      }

      setIsCameraEnabled(!isCameraEnabled);
    } catch (error) {
      console.error("Error toggling video:", error);
    }
  };

  const toggleScreenSharing = async () => {
    try {
      if (isScreenShareActive) {
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
              setIsScreenShareActive(false);
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

      setIsScreenShareActive(!isScreenShareActive);
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  const onParticipantJoined = async (MemberId: string) => {
    const { name, userRtcUid, userAvatar } =
      await rtmClient.getUserAttributesByKeys(MemberId, [
        "name",
        "userRtcUid",
      ]);
    console.log("rtm clients........", name, userRtcUid, userAvatar);
  };

  const initializeRealtimeMessaging = async (name: string) => {
    rtmClient = AgoraRTM.createInstance(meetingConfig.appid!);
    await rtmClient.login({
      uid: String(meetingConfig.uid!),
      token: meetingConfig.rtmToken!,
    });
    console.log("checking for error after login...", rtmClient);

    const channel = rtmClient.createChannel(meetingConfig.channel!);
    rtmChannel = channel;
    await channel.join();

    await rtmClient.addOrUpdateLocalUserAttributes({
      name: name,
      userRtcUid: String(meetingConfig.uid!),
    });
    fetchActiveMeetingParticipants();

    window.addEventListener("beforeunload", disconnectFromMessaging);

    channel.on("MemberJoined", onParticipantJoined);
    channel.on("MemberLeft", onMemberDisconnected);
    channel.on("ChannelMessage", async ({ text }: any) => {
      const message = JSON.parse(text);
      if (message.type === 'video-state') {
        const uid = String(message.uid);
        setRemoteParticipants((prevUsers) => ({
          ...prevUsers,
          [uid]: {
            ...prevUsers[uid],
            videoTrack: message.enabled ? prevUsers[uid]?.videoTrack : null
          },
        }));
      }

      if (message.type === 'audio-state') {
        const uid = String(message.uid);
        setRemoteParticipants((prevUsers) => ({
          ...prevUsers,
          [uid]: {
            ...prevUsers[uid],
            audioEnabled: message.enabled
          },
        }));
      }
    });
  };

  const onMediaStreamPublished = (user: any, mediaType: "audio" | "video") => {
    subscribeToParticipantMedia(user, mediaType);
  };

  const connectToMeetingRoom = async () => {
    rtcClient = AgoraRTC.createClient({
      mode: "live",
      codec: "vp8",
    });
    AgoraRTC.setLogLevel(4);
    AgoraRTC.enableLogUpload();
    rtcClient.on("user-published", onMediaStreamPublished);

    rtcClient.on("user-unpublished", onMediaStreamUnpublished);
    rtcClient.on("user-left", onParticipantLeft);


    const mode = meetingConfig?.proxyMode ?? 0;
    if (mode !== 0 && !isNaN(parseInt(mode))) {
      rtcClient.startProxyServer(parseInt(mode));
    }

    if (meetingConfig?.role === "audience") {
      rtcClient.setClientRole(meetingConfig.role, { level: meetingConfig.audienceLatency });
    } else if (meetingConfig.role === "host") {
      rtcClient.setClientRole(meetingConfig.role);
    }

    meetingConfig.uid = await rtcClient.join(
      meetingConfig.appid || "",
      meetingConfig.channel || "",
      meetingConfig.rtcToken || null,
      meetingConfig.uid || null
    );
    await initializeRealtimeMessaging(username!);
  };

  const onMediaStreamUnpublished = (user: any, mediaType: "audio" | "video") => {
    const uid = String(user.uid);
    setRemoteParticipants((prevUsers) => ({
      ...prevUsers,
      [uid]: {
        ...prevUsers[uid],
        [mediaType]: null,
        ...(mediaType === 'audio' ? { audioEnabled: false } : {})
      },
    }));
  };

  const publishLocalMediaTracks = async () => {
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

  const onParticipantLeft = async (user: any) => {
    const uid = String(user.uid);
    const updatedUsers = { ...remoteUsersRef.current };
    delete updatedUsers[uid];
    remoteUsersRef.current = updatedUsers;
    setRemoteParticipants(updatedUsers);
  };

  const disconnectFromMessaging = async () => {
    await rtmChannel.leave();
    await rtmClient.logout();
    (rtmChannel as any) = null;
  };

  const fetchActiveMeetingParticipants = async () => {
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

  const onMemberDisconnected = async () => {
    // document.getElementById(MemberId).remove();
  };

  const joinMeetingRoom = async () => {
    try {
      if (!meetingConfig) return;
      setHasJoinedMeeting(true);
      setMeetingStage("hasJoinedMeeting");
      await connectToMeetingRoom();
      setMeetingConfig(meetingConfig);
      setShowStepJoinSuccess(true);
      setIsJoinDisabled(true);
      setIsLeaveDisabled(false);
      await publishLocalMediaTracks();
    } catch (error: any) {
      console.log(error, "error joining");
    }

  };

  const subscribeToParticipantMedia = async (user: any, mediaType: "audio" | "video") => {
    await rtcClient.subscribe(user, mediaType);
    const uid = String(user.uid);

    if (mediaType === "video") {
      const videoTrack = user.videoTrack;
      setRemoteParticipants((prevUsers) => ({
        ...prevUsers,
        [uid]: {
          ...prevUsers[uid],
          videoTrack,
        },
      }));
    }
    if (mediaType === "audio") {
      const audioTrack = user.audioTrack;
      setRemoteParticipants((prevUsers) => ({
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

  useEffect(() => {
    if (channelName && username) {
      const fetchAgoraData = async () => {
        try {
          const { rtcOptions, rtmOptions } = await agoraGetAppData(channelName);

          setMeetingConfig((prev) => ({
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
      setIsJoinDisabled(false);
    }
  }, [channelName, username]);

  useLayoutEffect(() => {
    if (videoRef.current !== null && localUserTrack && localUserTrack.videoTrack) {
      localUserTrack.videoTrack.play(videoRef.current, meetingConfig);
    }

    return () => {
      if (localUserTrack && localUserTrack.videoTrack) {
        // Just unplay/remove from DOM
        localUserTrack.videoTrack.close();
      }
    };
  }, [localUserTrack, meetingConfig]);

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
        currentStep, setCurrentStep,
        meetingRoomId, setMeetingRoomId,
        isMicrophoneEnabled,
        isCameraEnabled,
        toggleMicrophone,
        toggleCamera,
        localUserTrack,
        meetingConfig,
        videoRef,
        initializeLocalMediaTracks,
        setLocalUserTrack,
        releaseMediaResources,
        isScreenShareActive,
        toggleScreenSharing,
        screenShareDisplayRef,
        joinMeetingRoom,
        publishLocalMediaTracks,
        setMeetingStage,
        meetingStage,
        setChannelName,
        channelName,
        remoteParticipants,
        hasJoinedMeeting,
        remoteUsersRef,
        setUsername,
        username,
        setHasJoinedMeeting
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