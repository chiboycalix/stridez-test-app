import { useState, useCallback } from "react";
import "../../styles/LiveUpdate.css";
import FluentPeople from "../../assets/FluentPeople.png";
import ScheduleModal from "./ScheduleFormModal";
import { useAuth } from "../../Providers/AuthProvider";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const Live = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal state
  const router = useRouter();
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const baseUrl = "https://www.cloud.stridez.ca/api/v1";

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
  }, [router.push]);

  return (
    <>
      <div className="w-full min-h-[90vh] bg-white rounded flex flex-col justify-center items-center gap-4">
        <div className="flex flex-col items-center">
          <h3 className="east">You're all set! Start your streaming now</h3>
        </div>
        <hr className="horizontal-rule" />
        <div className="flex flex-col items-center gap-y-4">
          <h3 className="flex gap-2">
            <img src={FluentPeople} alt="FluentPeople" />
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
};

export default Live;
