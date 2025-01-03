"use client"

import { useState, useCallback } from "react";
import "../../styles/LiveUpdate.css";
import ScheduleModal from "../schedule/[id]/_components/ScheduleFormModal";
import { useAuth } from "@/context/AuthContext";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { baseUrl } from "@/utils/constant";

export default function Live() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();

  const handleStartInstantLive = useCallback(async () => {
    try {
      const response = await fetch(`${baseUrl}/rooms/instant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${Cookies.get("accessToken")}`,
        },
        body: JSON.stringify({ roomType: "instant" }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/streaming/${data.data.roomCode}`);
      }
    } catch (error) {
      console.log(String(error));
    }
  }, [router]);

  return (
    <>
      <div className="w-full min-h-[90vh] bg-white rounded flex flex-col justify-center items-center gap-4">
        <div className="flex flex-col items-center">
          <h3 className="east">You&apos;re all set! Start your streaming now</h3>
        </div>
        <hr className="horizontal-rule" />
        <div className="flex flex-col items-center gap-y-4">
          <h3 className="flex gap-2">
            <img src={"/assets/FluentPeople.png"} alt="FluentPeople" />
            <span>Engage face-to-face in real time.</span>
          </h3>
          <div className="flex flex-col gap-4">
            <button onClick={handleStartInstantLive} className="reason">
              Start an instant Live
            </button>
            <button onClick={() => setIsModalOpen(true)} className="reason">
              Schedule with Calendar
            </button>
          </div>
        </div>
      </div>
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={user}
      />
    </>
  );
}
