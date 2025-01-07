'use client';
import VideoInterface from "../../components/VideoInterface";
import PermissionModal from "@/app/video-conferencing/components/PermissionModal";
import { useEffect, useState } from "react";
import { useVideoConferencing } from "@/context/VideoConferencingContext";
import { useParams, useSearchParams } from "next/navigation";

export default function WaitingRoom() {
  const { initializeLocalMediaTracks } = useVideoConferencing();
  const [showPermissionPopup, setShowPermissionPopup] = useState(true);
  const [hasPermissions, setHasPermissions] = useState(false);
  const params = useParams()
  const searchParams = useSearchParams();
  const username = searchParams.get("username");

  const handleAllowPermissions = async () => {
    try {
      await Promise.all([
        navigator.mediaDevices.getUserMedia({ video: true }),
        navigator.mediaDevices.getUserMedia({ audio: true })
      ]);
      setHasPermissions(true);
      setShowPermissionPopup(false);
    } catch (error) {
      console.log('Error getting permissions:', error);
    }
  };

  const handleDismissPermissions = () => {
    setShowPermissionPopup(false);
  };

  useEffect(() => {
    if (hasPermissions) {
      initializeLocalMediaTracks();
    }
  }, [hasPermissions]);

  return (
    <div className="p-8 bg-white">
      {
        showPermissionPopup && <PermissionModal
          onDismiss={handleDismissPermissions}
          onAllow={handleAllowPermissions}
        />
      }

      <VideoInterface
        allowMicrophoneAndCamera={hasPermissions}
        channelName={params.channelName! as string}
        username={username!}
      />
      <div className="h-[18vh]">

      </div>
    </div>
  );
}