import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/LiveUpdate.css";
import "../../styles/Muted.css";
import Audio from "../../assets/Audio.png";
import AudioLess from "../../assets/AudioLess.png";
import Camera from "../../assets/Camera.png";
import CameraLess from "../../assets/CameraLess.png";
import SettingBar from "../../assets/SettingBar.png";
import Chip from "../../assets/Chip.png";
import List from "../../assets/List.png";
import SideBar from "../Explore/SideBar";
import { useAuth } from "../../Providers/AuthProvider";
import io from "socket.io-client";
import { iceServers } from "./IceSevers";
import { useNavigate } from "react-router-dom";

const StartLive = () => {
  const [allowAudio, setAllowAudio] = useState(true);
  const [requestPermissionCard, setRequestPermissionCard] = useState(true);
  const [allowCamera, setAllowCamera] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const { setAuth, getCurrentUser, getAuth } = useAuth();
  const remoteVideoRefs = useRef({});
  const socketIdRef = useRef(null);

  const localVideoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnections = useRef({});
  const navigate = useNavigate();

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: allowCamera,
        audio: allowAudio,
      });
      streamRef.current = stream;
      localVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error accessing webcam: ", err);
    }
  }, [allowCamera, allowAudio]);

  const stopVideo = () => {
    // Stop and clean up the local video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      localVideoRef.current.srcObject = null;
      streamRef.current = null;
    }

    // Notify other participants that the current user is leaving
    socketRef.current.emit("user-disconnected", {
      userId: socketIdRef.current,
      roomId: "live-room",
    });

    // Clean up the peer connection
    const peerConnection = peerConnections.current[socketIdRef.current];
    if (peerConnection) {
      peerConnection.getSenders().forEach((sender) => {
        if (sender.track) {
          sender.track.stop();
        }
      });
      peerConnection.close();
      delete peerConnections.current[socketIdRef.current];
    }

    // Navigate away after stopping the stream
    navigate("/Live");
  };

  const toggleMicrophone = useCallback(async () => {
    startVideo();
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack && audioTrack.enabled) {
        audioTrack.stop();
        await streamRef.current.removeTrack(audioTrack);
        setAllowAudio(false);
      } else {
        audioTrack.enabled = true;
        setAllowAudio(true);
      }
      startVideo();
    }
  }, [startVideo]);

  const toggleCamera = useCallback(() => {
    if (streamRef.current) {
      console.log("Stream found:", streamRef.current);

      const videoTracks = streamRef.current.getVideoTracks();
      console.log("Video tracks:", videoTracks);

      if (videoTracks.length > 0) {
        const videoTrack = videoTracks[0];
        console.log("Current video track:", videoTrack);

        if (videoTrack.enabled) {
          videoTrack.enabled = false;
          allowCamera ? setAllowCamera(false) : setAllowCamera(true);
        } else {
          videoTrack.enabled = true;
          allowCamera ? setAllowCamera(false) : setAllowCamera(true);
        }
      } else {
        console.log("No video track available");
      }
    } else {
      console.log("No media stream available");
    }
  }, [allowCamera]);

  const handleDismiss = () => {
    setRequestPermissionCard(false);
    setAllowCamera(true);
    setAllowAudio(true);
  };

  const createPeerConnection = useCallback(
    async (userId) => {
      await startVideo();

      if (!streamRef.current) {
        console.error("Local stream is not available");
        return null;
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: iceServers,
      });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, streamRef.current);
        });
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate,
            userId,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        setTimeout(() => {
          setRemoteStreams((prevStreams) => {
            const existingStream = prevStreams.find(
              (stream) => stream.userId === userId
            );
            if (!existingStream) {
              return [...prevStreams, { userId, stream: event.streams[0] }];
            }
            return prevStreams;
          });

          console.log("remoteVideoRefs.........", remoteVideoRefs);
          if (remoteVideoRefs > 0 && remoteVideoRefs.current[userId]) {
            remoteVideoRefs.current[userId].srcObject = event.streams[0];
          } else {
            console.error(`Ref for user ${userId} is not initialized`);
          }
        }, 600);
      };

      peerConnections.current[userId] = peerConnection;
      return peerConnection;
    },
    [startVideo]
  );

  // Refactored socket event functions
  const onConnect = () => {
    console.log("Connected to signaling server");
    socketIdRef.current = socketRef.current.id;
  };

  const onUserCount = (count) => {
    setUserCount(count);
  };

  const onReceiveIceCandidate = (candidate, userId) => {
    const peerConnection = peerConnections.current[userId];
    if (peerConnection) {
      peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const onOffer = useCallback(
    async (offer, userId) => {
      const peerConnection = await createPeerConnection(userId);
      if (!peerConnection) return;

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socketRef.current.emit("answer", answer, userId);
    },
    [createPeerConnection]
  );

  const onAnswer = useCallback(
    async (answer, userId) => {
      let peerConnection = await peerConnections.current[userId];
      if (!peerConnection) {
        peerConnection = await createPeerConnection(userId);
      }
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    },
    [createPeerConnection]
  );

  const onUserConnected = useCallback(
    async ({ userName, userId }) => {
      if (userId) {
        await startVideo();
        const peerConnection = await createPeerConnection(userId);

        if (!peerConnection) return;

        peerConnections.current[userId] = peerConnection;
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socketRef.current.emit("offer", offer, userId);
      }
    },
    [createPeerConnection, startVideo]
  );

  const onUserDisconnected = useCallback(
    ({ userId }) => {
      console.log(`User ${userId} is disconnected`);

      // Close the peer connection for the disconnected user
      const peerConnection = peerConnections.current[userId];
      if (peerConnection) {
        peerConnection.getSenders().forEach((sender) => {
          if (sender.track) {
            sender.track.stop();
          }
        });
        peerConnection.close();
        delete peerConnections.current[userId];
      }

      // Remove the video element for the disconnected user
      if (remoteVideoRefs.current[userId]) {
        remoteVideoRefs.current[userId].srcObject = null;
        delete remoteVideoRefs.current[userId];
      }

      socketIdRef.current = null;
      streamRef.current = null;

      // Update the remoteStreams state to remove the disconnected user
      setRemoteStreams((prevStreams) =>
        prevStreams.filter((stream) => stream.userId !== userId)
      );

      startVideo();
    },
    [startVideo]
  );

  useEffect(() => {
    if (allowCamera) toggleCamera();
  }, [allowCamera, toggleCamera]);

  useEffect(() => {
    if (allowAudio) toggleMicrophone();
  }, [allowAudio, toggleMicrophone]);

  useEffect(() => {
    const user = getCurrentUser();
    if (user?.firstName) {
      if (allowAudio || allowCamera) {
        startVideo();
      }

      // socketRef.current = io("http://localhost:4000");
      socketRef.current = io("https://banji-stridez.onrender.com");
      socketRef.current.on("connect", onConnect);

      socketRef.current.emit("join-room", "live-room", {
        userName: user?.id,
      });

      socketRef.current.on("user-count", onUserCount);
      socketRef.current.on("ice-candidate", onReceiveIceCandidate);
      socketRef.current.on("offer", onOffer);
      socketRef.current.on("answer", onAnswer);
      socketRef.current.on("user-connected", onUserConnected);
      socketRef.current.on("user-disconnected", onUserDisconnected);

      return () => {
        if (socketRef.current) {
          // PC.onaddstream = null
          socketRef.current.off("offer", onOffer);
          socketRef.current.off("answer", onAnswer);
          socketRef.current.off("user-connected", onUserConnected);
          socketRef.current.disconnect();
        }
        // stopVideo();
      };
    }
  }, [
    startVideo,
    allowAudio,
    allowCamera,
    getCurrentUser,
    createPeerConnection,
    onAnswer,
    onOffer,
    onUserConnected,
    onUserDisconnected,
  ]);

  useEffect(() => {
    console.log("Remote streams updated:", remoteStreams);
    console.log("Remote video refs:", remoteVideoRefs.current);
  }, [remoteStreams]);

  return (
    <div className="relative">
      <div className="fixed top-0 left-0 z-20 w-1/5 bg-white text-white h-screen">
        <SideBar auth={getAuth()} setAuth={setAuth} user={getCurrentUser()} />
      </div>

      {requestPermissionCard && (
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 py-10 ml-[20rem] border shadow min-h-screen">
        <div className="p-6 rounded-2xl bg-black h-full overflow-x-hidden overflow-y-scroll flex flex-col">
          <div className="flex-1 mt-4">
            <div
              className={`grid gap-4 h-full ${
                remoteStreams.length > 0
                  ? remoteStreams.length <= 2
                    ? "grid-cols-2"
                    : remoteStreams.length <= 4
                    ? "grid-cols-2"
                    : "grid-cols-3"
                  : "h-full"
              }`}
            >
              {/* Local video */}
              <div className="rounded-3xl bg-black border-2 border-white h-full w-full">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="rounded-3xl h-full w-full"
                />
              </div>

              {/* Remote videos */}
              {remoteStreams.length > 0 &&
                remoteStreams.map(({ userId, stream }) => (
                  <video
                    key={userId}
                    ref={(el) => {
                      if (el) {
                        remoteVideoRefs.current[userId] = el;
                        el.srcObject = stream;
                      }
                    }}
                    id={userId}
                    autoPlay
                    playsInline
                    className="h-full w-full rounded-3xl bg-black border-2 border-white"
                  />
                ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-x-4 mt-4">
            <p
              onClick={toggleMicrophone}
              className="p-3 hover:cursor-pointer rounded-lg bg-blue-600 hover:bg-purple-700"
            >
              mute audio
            </p>
            <p
              onClick={toggleMicrophone}
              className="p-3 hover:cursor-pointer rounded-lg bg-blue-600  hover:bg-purple-700"
            >
              unmute audio
            </p>

            <img
              src={allowAudio ? Audio : AudioLess}
              alt="Audio Toggle"
              onClick={toggleMicrophone}
              className="w-10 h-10 cursor-pointer"
            />
            <img
              src={allowCamera ? Camera : CameraLess}
              alt="Camera Toggle"
              onClick={toggleCamera}
              className="w-10 h-10 cursor-pointer"
            />
            <img src={SettingBar} alt="Settings" className="w-10 h-10" />
            <img src={List} alt="List" className="w-10 h-10" />
            <button
              className="bg-red-600 px-4 py-2 rounded-md text-white"
              onClick={stopVideo}
            >
              End
            </button>
          </div>

          <span className="text-gray-400 mt-2 block text-center">
            Users connected: {userCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StartLive;
