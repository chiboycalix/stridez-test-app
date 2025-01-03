import * as React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";

import { useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  const [uid, setUid] = useState("");
  const [uName, setUname] = useState("");
  const [error, setError] = useState("");
  const [Loading, setLoading] = useState(false);
  const { getAuth, getCurrentUser } = useAuth();
  const [meetingCode, setMeetingCode] = useState("");
  const [meetingType, setMeetingType] = useState("");
  const [userRole, setUserRole] = useState(ZegoUIKitPrebuilt.Audience);

  const baseUrl = "https://www.cloud.stridez.ca/api/v1";

  const handleSetPermissions = useCallback(
    (meeting) => {
      const { roomType, userId, room } = meeting;
      if (roomType === "instant") {
        if (userId === uid) {
          setUserRole(ZegoUIKitPrebuilt.Host);
        } else {
          setUserRole(ZegoUIKitPrebuilt.Cohost);
        }
      } else {
        room &&
          room.meetingSubscribers &&
          room.meetingSubscribers.forEach((subscriber) => {
            if (subscriber && subscriber.userId === uid) {
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
    async (meetingCode) => {
      try {
        const response = await fetch(
          `${baseUrl}/rooms/instant/${meetingCode}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch schedules");

        const data = await response.json();
        setMeetingType(data.data.roomType);
        handleSetPermissions(data.data);
        setLoading(false);
      } catch (error) {
        setError(error.message || "An error occurred");
        setLoading(false);
      }
    },
    [handleSetPermissions]
  );

  const getUrlParams = useCallback(() => {
    const urlSegments = window.location.href.split("/");
    const lastSegment = urlSegments[urlSegments.length - 1];
    setMeetingCode(lastSegment);
    return lastSegment;
  }, []);

  const fetchUser = useCallback(() => {
    const user = getCurrentUser();
    setUid(user?.id);
    setUname(user?.username);
  }, [getCurrentUser]);

  useEffect(() => {
    if (!getAuth()) {
      navigate("/auth");
      return;
    }

    fetchUser();

    const meetingCodeFromUrl = getUrlParams();
    if (meetingCodeFromUrl) {
      handlefetchMeeting(meetingCodeFromUrl);
    }
  }, [fetchUser, getAuth, navigate, handlefetchMeeting, getUrlParams]);

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

  let myMeeting = async (element) => {
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    // Start the call
    zp &&
      zp.joinRoom({
        container: element,
        scenario: {
          mode: ZegoUIKitPrebuilt.LiveStreaming,
          config: {
            userRole,
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
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div
        className="myCallContainer"
        ref={myMeeting}
        // style={{ width: '100vw', height: '100vh' }}
      ></div>
    </div>
  );
}
