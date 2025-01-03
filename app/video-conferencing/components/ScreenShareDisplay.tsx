import { useVideoConferencing } from "@/context/VideoConferencingContext";
import { useEffect } from "react";

export function ScreenShareDisplay() {
  const {
    screenShareRef,
    isScreenSharing,
    localUserTrack
  } = useVideoConferencing();

  useEffect(() => {
    if (localUserTrack?.screenTrack && screenShareRef.current) {
      localUserTrack.screenTrack.screenAudioTrack?.play()
      localUserTrack.screenTrack.screenVideoTrack?.play(screenShareRef.current)
    }

    return () => {
      if (localUserTrack?.screenTrack) {
        localUserTrack.screenTrack.screenAudioTrack?.stop()
        localUserTrack.screenTrack.screenVideoTrack?.stop()
      }
    };
  }, [localUserTrack?.screenTrack]);

  if (!isScreenSharing) return null;

  return (
    <div className="relative w-full h-full">
      <div
        ref={screenShareRef}
        className="w-full h-full bg-black rounded-lg overflow-hidden"
      />
    </div>
  );
}