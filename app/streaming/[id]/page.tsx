"use client";

import { useEffect, useState, useCallback, useRef, JSX } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuth } from "@/context/AuthContext";
import { baseUrl } from "@/utils/constant";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Streaming(): JSX.Element {
  const router = useRouter();
  const [uid, setUid] = useState<string>("");
  const [uName, setUname] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { getAuth, getCurrentUser } = useAuth();
  const [meetingCode, setMeetingCode] = useState<string>("");
  const [meetingType, setMeetingType] = useState<string>("");
  const [userRole, setUserRole] = useState<any>(ZegoUIKitPrebuilt.Audience);
  const callContainerRef = useRef<HTMLDivElement | null>(null);

  interface Meeting {
    roomType: string;
    userId: string;
    room: {
      meetingSubscribers: {
        userId: string;
        isOwner?: boolean;
        isCoHost?: boolean;
      }[];
    };
  }

  const handleSetPermissions = useCallback(
    (meeting: Meeting): void => {
      const { roomType, userId, room } = meeting;
      if (roomType === "instant") {
        if (userId === uid) {
          setUserRole(ZegoUIKitPrebuilt.Host);
        } else {
          setUserRole(ZegoUIKitPrebuilt.Cohost);
        }
      } else if (room?.meetingSubscribers) {
        room.meetingSubscribers.forEach((subscriber) => {
          if (subscriber.userId === uid) {
            if (subscriber.isOwner) {
              setUserRole(ZegoUIKitPrebuilt.Host);
            } else if (subscriber.isCoHost) {
              setUserRole(ZegoUIKitPrebuilt.Cohost);
            } else {
              setUserRole(ZegoUIKitPrebuilt.Audience);
            }
          }
        });
      }
    },
    [uid]
  );

  const handlefetchMeeting = useCallback(
    async (meetingCode: string): Promise<void> => {
      try {
        setLoading(true);
        const response = await fetch(
          `${baseUrl}/rooms/instant/${meetingCode}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch schedules");

        const data = await response.json();
        setMeetingType(data.data.roomType);
        handleSetPermissions(data.data);
      } catch (error: any) {
        setError(error.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [handleSetPermissions]
  );

  const getUrlParams = useCallback((): string => {
    const urlSegments = window.location.href.split("/");
    const lastSegment = urlSegments[urlSegments.length - 1];
    setMeetingCode(lastSegment);
    return lastSegment;
  }, []);

  const fetchUser = useCallback((): void => {
    const user = getCurrentUser();
    setUid(user?.id || "");
    setUname(user?.username || "");
  }, [getCurrentUser]);

  useEffect(() => {
    if (!getAuth()) {
      router.push("/auth?tab=signin");
      return;
    }

    fetchUser();

    const meetingCodeFromUrl = getUrlParams();
    if (meetingCodeFromUrl) {
      handlefetchMeeting(meetingCodeFromUrl);
    }
  }, [fetchUser, getAuth, router, handlefetchMeeting, getUrlParams]);

  const meetingLink =
    meetingType === "instant"
      ? `${window.location.protocol}//${window.location.host}${window.location.pathname}${meetingType}`
      : `${window.location.protocol}//${window.location.host}${window.location.pathname}`;

  // Generate Kit Token
  const appID = 765531498;
  const serverSecret = "d85ddf83026dbc01f64d27e9d3254fd6";
  const meetingData = {
    appID,
    serverSecret,
    roomID: meetingCode,
    userID: uid?.toString(),
    userName: uName,
    ExpirationSeconds: 1800,
  };

  const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
    meetingData.appID,
    meetingData.serverSecret,
    meetingData.roomID,
    meetingData.userID,
    meetingData.userName,
    meetingData.ExpirationSeconds
  );

  const myMeeting = useCallback(
    async (element: HTMLDivElement | null): Promise<void> => {
      if (!element) return;

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      // Start the call
      zp?.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.LiveStreaming,
          config: {
            role: userRole,
          },
        },
        sharedLinks: [{ name: "Join", url: meetingLink }],
        turnOnCameraWhenJoining: false,
        turnOnMicrophoneWhenJoining: false,
        showRoomTimer: true,
        showRemoveUserButton: userRole === ZegoUIKitPrebuilt.Host,
        showAudioVideoSettingsButton:
          userRole === ZegoUIKitPrebuilt.Host ||
          userRole === ZegoUIKitPrebuilt.Cohost,
        showRequestToCohostButton: userRole === ZegoUIKitPrebuilt.Audience,
        showInviteToCohostButton: userRole === ZegoUIKitPrebuilt.Host,
        showRemoveCohostButton: userRole === ZegoUIKitPrebuilt.Host,
      });
    },
    [kitToken, meetingLink, userRole]
  );

  useEffect(() => {
    if (callContainerRef.current) {
      myMeeting(callContainerRef.current);
    }
  }, [myMeeting]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="myCallContainer" ref={callContainerRef}></div>
    </div>
  );
}
