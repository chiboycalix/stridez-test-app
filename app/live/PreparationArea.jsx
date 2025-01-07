import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/LiveUpdate.css";
import "../../styles/Muted.css";
import Chip from "../../assets/Chip.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Providers/AuthProvider";
import { io } from "socket.io-client";

const PreparationArea = () => {
  const { setAuth, getCurrentUser, getAuth } = useAuth();
  const [requestPermissionCard, setRequestPermissionCard] = useState(true);
  const [allowAudio, setAllowAudio] = useState(false);
  const [allowCamera, setAllowCamera] = useState(false);
  const [user, setUser] = useState("");
  const [userName, setUserName] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const socket = io("http://localhost:4000");

  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: allowCamera,
        audio: allowAudio,
      });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      console.error("Error accessing webcam: ", err);
    }
  }, [allowAudio, allowCamera]);

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (!socket) {
      console.error("Socket is not initialized");
      return;
    }

    console.log("Socket initialized with ID:", socket);

    const user = getCurrentUser();
    if (user) {
      setUserName(user.firstName);
      setUser(user);
    }

    socket?.on("requester", (data) => {
      socket.emit("approve-join-request", {
        roomName: "live-room",
        userId: data.userId,
      });
      console.log("data.......approved", data);
      navigate("/StartLive");
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (allowCamera || allowAudio) {
      startVideo();
    } else {
      stopVideo();
    }
  }, [allowCamera, allowAudio, startVideo]);

  const handleDismiss = () => {
    setRequestPermissionCard(false);
    setAllowCamera(true);
    setAllowAudio(true);
  };

  const requestToJoinLive = () => {
    const user = getCurrentUser();

    if (user) {
      socket.emit("request-to-join", {
        userName: user.firstName,
        userId: socket.id,
        roomName: "live-room",
      });
      setIsRequesting(true);
    }
  };

  const handleJoin = () => {
    if (user.email === "timothyedibo@gmail.com") {
      navigate("/StartLive");
    } else {
      requestToJoinLive();
    }
  };

  return (
    <div className="relative">
      <div className="ml-1/5 p-6">
        <div className="relative flex justify-center items-center">
          <div className="md:col-span-3 grid grid-cols rounded bg-gray-50 gap-4 pl-10">
            <div className="min-h-screen flex flex-col justify-center items-center gap-y-4 pt-4">
              <div className="flex flex-col items-center">
                <h1 className="pro">Get Started</h1>
                <h3 className="east">
                  Setup your audio and video before going live
                </h3>
              </div>
              <div className="flex flex-col items-center space-y-4 mt-6">
                <img src={Chip} alt="Chip" />
                {requestPermissionCard && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity z-10">
                    <div className="bg-[#03011A] p-8 rounded-lg shadow-lg text-center w-80 h-60 flex flex-col justify-center items-center">
                      <h1 className="text-xl mb-2 text-white">
                        Allow to use your microphone and camera
                      </h1>
                      <h3 className="mb-4 text-gray-300 text-sm">
                        Access to Microphone and Camera is required. Enable
                        permissions for Microphone and Camera by clicking
                        “Allow” on the pop-up.
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleDismiss}
                          className="py-2 px-4 bg-black text-white border border-white rounded hover:bg-yellow-600"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={handleDismiss}
                          className="py-2 px-4 bg-[#37169C] text-white rounded hover:bg-blue-300 hover:cursor-pointer"
                        >
                          Allow
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="relative w-[800px] h-[450px] bg-gray-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  ></video>
                </div>
              </div>
              <div className="flex mt-6 space-x-4 w-full justify-center">
                <button className="Ore p-2">{userName}</button>
                <button
                  onClick={handleJoin}
                  className="Aisha text-white p-2"
                  disabled={isRequesting}
                >
                  {isRequesting
                    ? "Request Sent"
                    : user.email === "timothyedibo@gmail.com"
                    ? "Join Live"
                    : "Request to Join"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreparationArea;
