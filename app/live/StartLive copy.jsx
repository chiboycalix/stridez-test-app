import React, { useEffect, useRef, useState } from "react";
import "../../styles/LiveUpdate.css";
import "../../styles/Muted.css";
// import Chip from "../../assets/Chip.png";
import Audio from "../../assets/Audio.png";
import AudioLess from "../../assets/AudioLess.png";
import Camera from "../../assets/Camera.png";
import CameraLess from "../../assets/CameraLess.png";
import SettingBar from "../../assets/SettingBar.png";
import List from "../../assets/List.png";
import { useNavigate } from "react-router-dom";
import SideBar from "../Explore/SideBar";
import { useAuth } from "../../Providers/AuthProvider";
import io from "socket.io-client";

const StartLive = () => {
  // const [activeMode, setActiveMode] = useState("live");
  const [allowAudio, setAllowAudio] = useState(true);
  const [allowCamera, setAllowCamera] = useState(true);
  const [showBeneathImage, setShowBeneathImage] = useState(false);
  const { auth, setAuth, getCurrentUser, getAuth } = useAuth();
  const [userInitial, setUserInitial] = useState("");
  const [userName, setUserName] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [joinRequests, setJoinRequests] = useState([]);
  const user = getCurrentUser();

  const navigate = useNavigate();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnections = useRef({});

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: allowCamera,
        audio: allowAudio,
      });
      localVideoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      console.error("Error accessing webcam: ", err);
    }
  };

  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());

      // Stop all audio tracks (optional, de pending on what you want)
      streamRef.current.getVideoTracks().forEach((track) => track.stop());
      streamRef.current.getAudioTracks().forEach((track) => track.stop());

      if (localVideoRef.current && localVideoRef.current.srcObject) {
        localVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        localVideoRef.current.srcObject = null;
      }

      if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
        remoteVideoRef.current.srcObject
          .getTracks()
          .forEach((track) => track.stop());
        remoteVideoRef.current.srcObject = null;
      }

      streamRef.current = null;
    }

    // Close all peer connections and clear references
    Object.values(peerConnections.current).forEach((peerConnection) => {
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnection.close();
    });
    peerConnections.current = {};
  };

  useEffect(() => {
    const user = getCurrentUser();
    setUserInitial(`${user?.firstName[0]}${user?.lastName[0]}`);
    setUserName(`${user?.firstName}`);
    if (allowCamera || allowAudio) {
      startVideo();
    } else {
      stopVideo();
    }

    if (user?.firstName) {
      socketRef.current = io("http://localhost:4000");
      // socketRef.current = io("https://banji-stridez.onrender.com");

      socketRef.current.on("connect", async () => {
        console.log("Connected to signaling server");

        // Join the room
        socketRef.current.emit("join-room", "live-room", {
          userName: user?.firstName,
        });

        // Listen for join requests if the current user is the host
        socketRef.current.on("user-requested-to-join", async (data) => {
          if (user?.email === "timothyedibo@gmail.com") {
            setJoinRequests((prevRequests) => [...prevRequests, data]);
          }
        });

        // Handle user count updates
        socketRef.current.on("user-count", (count) => {
          setUserCount(count);
        });

        // Handle incoming ICE candidates
        socketRef.current.on("receive-ice-candidate", (candidate, userId) => {
          console.log("ICE candidate received:", candidate);
          const peerConnection = peerConnections.current[userId];
          if (peerConnection) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          }
        });

        // Handle incoming offers
        socketRef.current.on("offer", async (offer, userId) => {
          console.log("Offer received:", offer);
          const peerConnection = createPeerConnection(userId);
          try {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(offer)
            );
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            socketRef.current.emit("answer", answer, userId);
          } catch (err) {
            console.error("Error handling offer:", err);
          }
        });

        // Handle incoming answers
        socketRef.current.on("answer", async (answer, userId) => {
          console.log("Answer received:", answer);
          const peerConnection = peerConnections.current[userId];
          if (peerConnection) {
            try {
              await peerConnection.setRemoteDescription(
                new RTCSessionDescription(answer)
              );
            } catch (err) {
              console.error("Error setting remote description:", err);
            }
          }
        });

        // Handle new user joining
        socketRef.current.on("user-connected", async (userId) => {
          console.log("New user connected:", userId);
          const peerConnection = createPeerConnection(userId);
          peerConnections.current[userId] = peerConnection;
          try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socketRef.current.emit("offer", offer, userId);
          } catch (err) {
            console.error("Error handling new user connection:", err);
          }
        });

        // Handle user disconnected
        socketRef.current.on("user-disconnected", (userId) => {
          console.log("User disconnected:", userId);
          const peerConnection = peerConnections.current[userId];
          if (peerConnection) {
            peerConnection.close();
          }
          delete peerConnections.current[userId];
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
        // Close all peer connections
        Object.values(peerConnections.current).forEach((peerConnection) => {
          peerConnection.close();
        });
        peerConnections.current = {};
      };
    }
  }, [allowCamera, allowAudio]);

  const createPeerConnection = (userId) => {
    if (!streamRef.current) {
      console.error("Local stream is not available");
      return;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
          ],
        },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
        },
        // { urls: "stun:stun.relay.metered.ca:80" }, // This line is commented out, but it's fine to include if needed
        {
          urls: "turn:global.relay.metered.ca:80",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
        },
        {
          urls: "turn:global.relay.metered.ca:80?transport=tcp",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
        },
        {
          urls: "turn:global.relay.metered.ca:443",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
        },
        {
          urls: "turns:global.relay.metered.ca:443?transport=tcp",
          username: "c844747b0360e6c61b60415c",
          credential: "9Vo1barr6KRVsj87",
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
        {
          urls: "turn:192.158.29.39:3478?transport=udp",
          credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
          username: "28224511:1379330808",
        },
        {
          urls: "turn:192.158.29.39:3478?transport=tcp",
          credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
          username: "28224511:1379330808",
        },
        {
          urls: "turn:turn.bistri.com:80",
          credential: "homeo",
          username: "homeo",
        },
        {
          urls: "turn:turn.anyfirewall.com:443?transport=tcp",
          credential: "webrtc",
          username: "webrtc",
        },
      ],
    });

    peerConnection.onicecandidate = async (event) => {
      if (event.candidate) {
        console.log("Local ICE candidate:", event.candidate);
        // Ensure the peer connection is open
        if (peerConnection.signalingState !== "closed") {
          socketRef.current.emit("send-ice-candidate", {
            candidate: event.candidate,
            userId,
          });
        }
      }
    };

    const localStream = streamRef.current;
    if (localStream) {
      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));
    } else {
      console.error("Local stream is null or undefined");
    }

    peerConnection.ontrack = (event) => {
      console.log("Remote track received:", event.streams[0]);
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    peerConnections.current[userId] = peerConnection;
    return peerConnection;
  };

  const endCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("leave-room", "live-room");
      socketRef.current.disconnect();
    }
    stopVideo();
    navigate("/");
  };

  const toggleSetAudio = () => {
    setAllowAudio((prev) => {
      const newValue = !prev;
      if (streamRef.current) {
        streamRef.current
          .getAudioTracks()
          .forEach((track) => (track.enabled = newValue));
      }
      return newValue;
    });
  };

  const toggleSetCamera = () => {
    setAllowCamera((prev) => {
      const newValue = !prev;
      if (streamRef.current) {
        streamRef.current
          .getVideoTracks()
          .forEach((track) => (track.enabled = newValue));
      }
      return newValue;
    });
  };

  const approveRequest = (userId) => {
    if (socketRef.current) {
      socketRef.current.emit("approve-request", { userId });
      setJoinRequests((prevRequests) =>
        prevRequests.filter((req) => req.userId !== userId)
      );

      socketRef.current.emit("join-approved", {
        roomName: "live-room",
        userId: userId,
      });
    } else {
      console.error("Socket is not initialized");
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 z-20 w-1/5 bg-white text-white h-screen">
        <SideBar auth={getAuth()} setAuth={setAuth} user={getCurrentUser()} />
      </div>

      <div className="ml-1/5 p-6">
        <div className="relative flex justify-center items-center">
          <div className="md:col-span-3 grid grid-cols rounded bg-gray-50 gap-4 pl-10">
            <div className="min-h-screen flex flex-col justify-center items-center gap-y-4 pt-4">
              <div className="flex justify-between w-full px-4">
                <h1 className="text-2xl text-gray-900">Live Stream</h1>
                <div className="flex gap-x-2 items-center">
                  <div className="flex items-center gap-x-2">
                    <div className="relative">
                      <img
                        src={allowAudio ? Audio : AudioLess}
                        alt="Audio Icon"
                        className="w-22 h-16 cursor-pointer"
                        onClick={toggleSetAudio}
                      />
                      {allowAudio && showBeneathImage && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-1 text-xs rounded mt-1">
                          Audio is On
                        </div>
                      )}
                    </div>
                    <div className="relative gap-x-6">
                      <img
                        src={allowCamera ? Camera : CameraLess}
                        alt="Camera Icon"
                        className="w-22 h-16 cursor-pointer"
                        onClick={toggleSetCamera}
                      />
                      {allowCamera && showBeneathImage && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white p-1 text-xs rounded mt-1">
                          Camera is On
                        </div>
                      )}
                    </div>
                    <button
                      onClick={endCall}
                      className="bg-red-500 text-white py-1 px-4 rounded"
                    >
                      End Call
                    </button>

                    <img
                      src={SettingBar}
                      alt="Settings Icon"
                      className="w-16 h-16 cursor-pointer"
                    />
                  </div>
                  <img
                    src={List}
                    alt="List Icon"
                    className="w-6 h-6 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-y-1">
                    <div className="bg-gray-900 text-white p-2 rounded-full flex items-center justify-center w-8 h-8">
                      {userInitial}
                    </div>
                    <span className="text-xs text-gray-500">{userName}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-full max-w-screen-md">
                <div className="w-[40rem] h-[30rem] border rounded-lg my-4   bg-black">
                  {allowCamera ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="h-full w-full"
                    />
                  ) : (
                    <div className="flex justify-center items-center text-center w-full h-full border border-red-50  text-8xl font-bold text-purple-700">
                      <p> {userInitial}</p>
                    </div>
                  )}
                </div>

                <div className="w-[40rem] h-[30rem] border rounded-lg my-4   bg-black">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full"
                  />
                </div>
              </div>

              {/* Display join requests for the host */}
              {user?.email === "timothyedibo@gmail.com" && joinRequests.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg text-white">Join Requests:</h3>
                  <ul>
                    {joinRequests.map((request) => (
                      <li key={request.userId} className="flex justify-between">
                        <span className="text-white">{request.userName}</span>
                        <button
                          onClick={() => approveRequest(request.userId)}
                          className="bg-green-500 text-white py-1 px-4 rounded"
                        >
                          Approve
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow">
              <span className="text-gray-700">
                Users connected: {userCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartLive;
