import { cn } from "@/lib/utils";
import { LivePhoto } from "@/public/assets";
import { MicOff, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "framer-motion"

type Participant = {
  id: string;
  name: string;
  isHost?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
  hasVideo?: boolean;
  isScreenSharing?: boolean;
};

export const ParticipantVideo = ({ participant, className }: { participant: Participant; className?: string }) => (
  <div className={cn(
    "relative aspect-video bg-gray-900 rounded-lg overflow-hidden",
    "w-full max-w-full",
    className
  )}>
    <Image
      src={LivePhoto}
      alt={participant.name}
      className="h-full w-full object-cover"
      priority
    />
    {/* Bottom controls overlay */}
    <div className="absolute inset-0 flex flex-col justify-between p-2 md:p-3">
      {/* Top controls */}
      <div className="flex justify-end">
        {participant.isScreenSharing && (
          <div className="bg-gray-900/50 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-md">
            Screen sharing
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-2">
          <span className="text-white text-xs md:text-sm truncate max-w-[120px] md:max-w-[200px]">
            {participant.name}
          </span>
          {participant.isHost && (
            <span className="bg-primary-500 text-white text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded">
              Host
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {participant.isMuted && (
            <MicOff className="w-3 h-3 md:w-4 md:h-4 text-white" />
          )}
          {participant.isSpeaking && (
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full" />
          )}
        </div>
      </div>
    </div>
  </div>
);

// Add this component for the side list of additional participants

export const ParticipantsList = ({
  participants,
  isOpen,
  onClose,
  className
}: {
  participants: Participant[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null) as any;
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        ref={sidebarRef}
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed right-0 top-0 h-full bg-gray-900 rounded-l-lg overflow-y-auto",
          "w-60 lg:w-72",
          "border-l border-gray-800",
          "z-50",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-white text-sm font-medium">
            Participants ({participants.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2 p-2">
          {participants.map(participant => (
            <div
              key={participant.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
            >
              <div className="w-8 h-8 bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={LivePhoto}
                  alt={participant.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-white text-sm truncate">{participant.name}</span>
                  {participant.isSpeaking && (
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                  )}
                </div>
              </div>
              {participant.isMuted && (
                <MicOff className="w-4 h-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
}